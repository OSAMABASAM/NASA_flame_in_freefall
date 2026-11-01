// Browser test for the network graph. Usage: start the app (npm run dev, or npm run build && npm start), then
//   npm run test:e2e -- [url]        (default http://localhost:3000; also works on a Vercel preview or the live site)
// Scenarios: slow drags, fast drags, drags past the edge, phone touch (scroll + drag + tap), click opens the drawer,
// and no long freezes. Uses the Playwright that is installed globally (not a project dependency).
/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script, so the global Playwright loads with require */
const { chromium } = require("playwright");
const { join } = require("node:path");
const { tmpdir } = require("node:os");

const URL = process.argv[2] ?? "http://localhost:3000";
const SHOTS = process.env.SHOT_DIR ?? tmpdir();
const DESKTOP = { viewport: { width: 1280, height: 900 } };
const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 };
const LONG_TASK_MS = 200; // a frozen page shows up as one long task

async function openGraph(browser, opts) {
  const context = await browser.newContext(opts);
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    window.__longTasks = [];
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__longTasks.push(Math.round(e.duration)))).observe({
      type: "longtask",
      buffered: true,
    });
  });
  await page.goto(URL, { waitUntil: "load" });
  await page.locator("#network").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => window.__networkGraph?.nodes.every((n) => Number.isFinite(n.x)));
  await page.waitForTimeout(1500); // layout settles and fits the frame
  await page.evaluate(() => (window.__longTasks = [])); // count freezes from here on, not page load

  // Every dot in viewport pixels (read with the library's graph2ScreenCoords), plus whether it and its label fit the frame.
  const read = () =>
    page.evaluate(() => {
      const { graph, nodes } = window.__networkGraph;
      const c = document.querySelector("#network canvas").getBoundingClientRect();
      const k = graph.zoom();
      const dots = Object.fromEntries(
        nodes.map((n) => {
          const s = graph.graph2ScreenCoords(n.x, n.y);
          const r = (4 + Math.sqrt(n.degree) * 1.8) * k, half = Math.max(r, n.id.length * 3.4);
          const inside = s.x - half >= -1 && s.x + half <= c.width + 1 && s.y - r >= -1 && s.y + r + 16 <= c.height + 1;
          return [n.id, { x: c.left + s.x, y: c.top + s.y, r, inside, pinned: n.fx != null }];
        }),
      );
      return { dots, box: { x: c.left, y: c.top, w: c.width, h: c.height, cx: c.left + c.width / 2, cy: c.top + c.height / 2 } };
    });
  const finish = async (name) => {
    const longTasks = await page.evaluate(() => window.__longTasks);
    await page.screenshot({ path: join(SHOTS, `network-${name}.png`) });
    await context.close();
    return { errors, longTasks };
  };
  return { page, context, read, finish };
}

// Drag directions cycle through horizontal, vertical and diagonal, pointing toward the middle of the frame.
const toward = (i, p, box, distance) => {
  const sx = Math.sign(box.cx - p.x) || 1, sy = Math.sign(box.cy - p.y) || 1;
  const [ux, uy] = [[1, 0], [0, 1], [Math.SQRT1_2, Math.SQRT1_2]][i % 3];
  return [ux * sx * distance, uy * sy * distance];
};
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

async function mouseDrag(page, p, dx, dy, pause) {
  await page.mouse.move(p.x, p.y);
  if (pause) await page.waitForTimeout(pause);
  await page.mouse.down();
  await page.mouse.move(p.x + dx, p.y + dy, { steps: 8 });
  await page.mouse.up();
}

// A dot counts as dragged when it lands on the drop point, or, if a pinned dot already sits there, when it moved
// and now sits clear of every dot (the graph slides it to the nearest free spot).
const dragged = (id, before, after, target) => {
  const [p, q] = [before[id], after[id]];
  if (dist(q, target) <= 10) return true;
  const others = Object.entries(after).filter(([o]) => o !== id).map(([, d]) => d);
  const taken = Object.entries(before).some(([o, d]) => o !== id && d.pinned && dist(d, target) < p.r + d.r + 4);
  return taken && dist(p, q) > 10 && others.every((d) => dist(d, q) >= d.r + q.r);
};

// Drags all 20 dots one by one; returns the ids that were not dragged, and those that moved after release.
async function dragAll(g, { distance, pause, settle, outward = false }) {
  const missed = [], drifted = [];
  const ids = Object.keys((await g.read()).dots);
  for (const [i, id] of ids.entries()) {
    const { dots, box } = await g.read();
    const p = dots[id];
    let [dx, dy] = toward(i, p, box, distance);
    if (outward) [dx, dy] = [-dx, -dy];
    await mouseDrag(g.page, p, dx, dy, pause);
    await g.page.waitForTimeout(50);
    const dropped = (await g.read()).dots[id];
    await g.page.waitForTimeout(settle);
    const after = (await g.read()).dots, q = after[id];
    // Outward drags are stopped by the frame, so there the dot only has to move.
    const ok = outward ? dist(p, q) > 20 : dragged(id, dots, after, { x: p.x + dx, y: p.y + dy });
    if (!ok) missed.push(`${id} (moved ${Math.round(dist(p, q))}px)`);
    else if (dist(dropped, q) > 3) drifted.push(`${id} (drifted ${Math.round(dist(dropped, q))}px)`);
  }
  return { ids, missed, drifted };
}

// Pairs of dots drawn on top of each other: the lower one could not be grabbed.
const stacked = async (g) => {
  const d = Object.entries((await g.read()).dots);
  return d.flatMap(([a, p], i) => d.slice(i + 1).filter(([, q]) => dist(p, q) < p.r + q.r).map(([b]) => `${a}+${b}`));
};

const outside = async (g) => Object.entries((await g.read()).dots).filter(([, d]) => !d.inside).map(([id]) => id);

const scenarios = {
  async "desktop, slow drags + click opens drawer"(browser) {
    const g = await openGraph(browser, DESKTOP);
    const { ids, missed, drifted } = await dragAll(g, { distance: 60, pause: 250, settle: 1200 });
    const out = await outside(g);
    const stack = await stacked(g);
    const p = (await g.read()).dots[ids[0]];
    await g.page.mouse.move(p.x, p.y);
    await g.page.waitForTimeout(250);
    await g.page.mouse.click(p.x, p.y);
    const opened = await g.page.locator("dialog[open]").filter({ hasText: ids[0] }).waitFor({ timeout: 3000 }).then(() => true, () => false);
    return {
      ...(await g.finish("desktop-slow")),
      checks: {
        "all 20 dots dragged": missed,
        "each dot stays where it was dropped": drifted,
        "dots outside the frame": out,
        "dots on top of each other": stack,
        "click opens drawer": opened ? [] : [ids[0]],
      },
    };
  },
  async "desktop, fast drags (0.1 s apart)"(browser) {
    const g = await openGraph(browser, DESKTOP);
    const { missed } = await dragAll(g, { distance: 60, pause: 0, settle: 100 });
    await g.page.waitForTimeout(1200);
    const stack = await stacked(g);
    return { ...(await g.finish("desktop-fast")), checks: { "all 20 dots dragged": missed, "dots on top of each other": stack } };
  },
  async "desktop, drags 500px past the edge"(browser) {
    const g = await openGraph(browser, DESKTOP);
    const first = await dragAll(g, { distance: 500, pause: 0, settle: 400, outward: true });
    await g.page.waitForTimeout(1200);
    const out = await outside(g);
    const stack = await stacked(g);
    const again = await dragAll(g, { distance: 60, pause: 0, settle: 300 });
    return {
      ...(await g.finish("desktop-edges")),
      checks: {
        "all 20 dots moved": first.missed,
        "dots or labels outside the frame": out,
        "dots on top of each other": stack,
        "all 20 can be dragged again": again.missed,
      },
    };
  },
  async "phone, touch scroll + drag + tap"(browser) {
    const g = await openGraph(browser, PHONE);
    const cdp = await g.context.newCDPSession(g.page);
    const touch = (type, x, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y }] });
    const swipe = async (x, y, dx, dy) => {
      await touch("touchStart", x, y);
      for (let s = 1; s <= 10; s++) {
        await touch("touchMove", x + (dx * s) / 10, y + (dy * s) / 10);
        await g.page.waitForTimeout(16);
      }
      await touch("touchEnd");
    };
    const scrollY = () => g.page.evaluate(() => window.scrollY);

    // 1) A finger on empty space in the graph scrolls the page. Pick the visible spot farthest from every dot.
    const { dots, box } = await g.read();
    let empty = null;
    for (let x = box.x + 10; x < box.x + box.w - 10; x += 10)
      for (let y = Math.max(box.y, 0) + 10; y < Math.min(box.y + box.h, 834); y += 10) {
        const gap = Math.min(...Object.values(dots).map((d) => dist(d, { x, y })));
        if (!empty || gap > empty.gap) empty = { x, y, gap };
      }
    const y0 = await scrollY();
    await swipe(empty.x, empty.y, 0, -250);
    await g.page.waitForTimeout(600);
    const scrolled = (await scrollY()) - y0;
    await g.page.locator("#network").scrollIntoViewIfNeeded();
    await g.page.waitForTimeout(600);

    // 2) A finger on a dot drags it (horizontal and vertical) and does not scroll the page.
    const missed = [];
    const ids = Object.keys(dots);
    for (const [i, id] of ids.entries()) {
      const { dots: now, box: b } = await g.read();
      const p = now[id];
      const [dx, dy] = toward(i % 2, p, b, 50);
      const before = await scrollY();
      await swipe(p.x, p.y, dx, dy);
      await g.page.waitForTimeout(300);
      const after = (await g.read()).dots, q = after[id];
      const pageMoved = (await scrollY()) - before;
      if (!dragged(id, now, after, { x: p.x + dx, y: p.y + dy }) || pageMoved) missed.push(`${id} (moved ${Math.round(dist(p, q))}px, page scrolled ${pageMoved}px)`);
    }
    const out = await outside(g);
    const stack = await stacked(g);

    // 3) A tap on a dot opens the drawer.
    const p = (await g.read()).dots[ids[0]];
    await g.page.touchscreen.tap(p.x, p.y);
    const opened = await g.page.locator("dialog[open]").filter({ hasText: ids[0] }).waitFor({ timeout: 3000 }).then(() => true, () => false);
    return {
      ...(await g.finish("phone")),
      checks: {
        "page scrolls from empty graph space": scrolled > 150 ? [] : [`page moved ${scrolled}px`],
        "all 20 dots dragged by touch": missed,
        "dots outside the frame": out,
        "dots on top of each other": stack,
        "tap opens drawer": opened ? [] : [ids[0]],
      },
    };
  },
};

(async () => {
  const browser = await chromium.launch();
  let failed = 0;
  for (const [name, run] of Object.entries(scenarios)) {
    let timer;
    const timeout = new Promise((_, reject) => (timer = setTimeout(() => reject(new Error("timed out after 180 s")), 180000)));
    try {
      const { checks, errors, longTasks } = await Promise.race([run(browser), timeout]);
      checks["page errors"] = errors;
      checks[`freezes over ${LONG_TASK_MS} ms`] = longTasks.filter((t) => t > LONG_TASK_MS).map((t) => `${t}ms`);
      const bad = Object.values(checks).filter((v) => v.length);
      failed += bad.length ? 1 : 0;
      console.log(`${bad.length ? "FAIL" : "PASS"}  ${name}  (longest task ${Math.max(0, ...longTasks)} ms)`);
      for (const [check, problems] of Object.entries(checks))
        console.log(`      ${problems.length ? "x " : "ok"} ${check}${problems.length ? ": " + problems.join(", ") : ""}`);
    } catch (e) {
      failed++;
      console.log(`FAIL  ${name}: ${e.message.split("\n")[0]}`);
    } finally {
      clearTimeout(timer);
    }
  }
  await browser.close();
  console.log(failed ? `\n${failed} scenario(s) failed` : `\nAll scenarios passed. Screenshots in ${SHOTS}`);
  process.exit(failed ? 1 : 0);
})();
