// Browser test for the network graph. Usage: start the app (npm run dev, or npm run build && npm start), then
//   npm run test:e2e -- [url]        (ONLY=phone runs one scenario; default http://localhost:3000; also works on a Vercel preview or the live site)
// For each of the 20 dots: hover shows its info line, a drag moves only that dot, a click opens the drawer.
// Also: keyboard Enter opens a dot, dots stay inside the frame, phone touch drag + tap + page scroll, no console
// errors, no long freezes. Uses the Playwright that is installed globally (not a project dependency).
/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script, so the global Playwright loads with require */
const { chromium } = require("playwright");
const { join } = require("node:path");
const { tmpdir } = require("node:os");

const URL = process.argv[2] ?? "http://localhost:3000";
const SHOTS = process.env.SHOT_DIR ?? tmpdir();
const DESKTOP = { viewport: { width: 1280, height: 900 } };
const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 };
const LONG_TASK_MS = 200; // a frozen page shows up as one long task
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

async function openGraph(browser, opts) {
  const context = await browser.newContext(opts);
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.addInitScript(() => {
    window.__longTasks = [];
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__longTasks.push(Math.round(e.duration)))).observe({
      type: "longtask",
      buffered: true,
    });
  });
  await page.goto(URL, { waitUntil: "load" });
  await page.locator("#network").scrollIntoViewIfNeeded();
  await page.locator("#network svg g[data-id]").first().waitFor();
  await page.locator("#network svg").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.evaluate(() => (window.__longTasks = [])); // count freezes from here on, not page load

  // Every dot's center in viewport pixels, and whether the dot and its label fit inside the frame.
  const read = () =>
    page.evaluate(() => {
      const svg = document.querySelector("#network svg").getBoundingClientRect();
      const dots = {};
      for (const g of document.querySelectorAll("#network svg g[data-id]")) {
        const c = g.querySelector("circle").getBoundingClientRect();
        const t = g.querySelector("text").getBoundingClientRect();
        const r = +g.dataset.r;
        const inside = [c, t].every((b) => b.left >= svg.left - 1 && b.right <= svg.right + 1 && b.top >= svg.top - 1 && b.bottom <= svg.bottom + 1);
        dots[g.dataset.id] = { x: c.left + c.width / 2, y: c.top + c.height / 2, r, inside, dim: g.getAttribute("opacity") !== "1" };
      }
      return { dots, box: { x: svg.left, y: svg.top, w: svg.width, h: svg.height, cx: svg.left + svg.width / 2, cy: svg.top + svg.height / 2 } };
    });
  const finish = async (name) => {
    const longTasks = await page.evaluate(() => window.__longTasks);
    await page.locator("#network svg").scrollIntoViewIfNeeded();
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

// Other dots that moved (they must stay still while one dot is dragged).
const othersMoved = (id, before, after) => Object.keys(before).filter((o) => o !== id && dist(before[o], after[o]) > 0.5);

// A dot counts as dragged when it lands on the drop point, or near it when another dot already sat there.
const landed = (q, target, before, id) =>
  dist(q, target) <= 2 || (dist(q, target) < 40 && Object.entries(before).some(([o, d]) => o !== id && dist(d, target) < d.r * 2 + 12));

const openedDrawer = (page, id) =>
  page.locator("dialog[open]").filter({ hasText: id }).waitFor({ timeout: 3000 }).then(() => true, () => false);
const closeDrawer = async (page) => {
  await page.keyboard.press("Escape");
  await page.locator("dialog[open]").waitFor({ state: "detached" });
  await page.waitForTimeout(200); // focus returns to the dot that opened the drawer
};

const outside = async (g) => Object.entries((await g.read()).dots).filter(([, d]) => !d.inside).map(([id]) => id);
const stacked = async (g) => {
  const d = Object.entries((await g.read()).dots);
  return d.flatMap(([a, p], i) => d.slice(i + 1).filter(([, q]) => dist(p, q) < p.r + q.r).map(([b]) => `${a}+${b}`));
};

const scenarios = {
  async "desktop: hover, drag and click each of the 20 dots, keyboard, edges"(browser) {
    const g = await openGraph(browser, DESKTOP);
    const info = g.page.locator("#network p[aria-live]");
    const { dots: first } = await g.read();
    const ids = Object.keys(first);
    const hoverFail = [], dragFail = [], still = [], clickFail = [];
    for (const [i, id] of ids.entries()) {
      const { dots, box } = await g.read();
      const p = dots[id];
      // Hover: info line names the dot, and if it has non-neighbors they fade.
      await g.page.mouse.move(p.x, p.y);
      await g.page.waitForTimeout(30);
      const text = await info.textContent();
      if (!text.includes(id)) hoverFail.push(`${id} (info: "${text.slice(0, 40)}")`);
      // Drag: only this dot moves.
      const [dx, dy] = toward(i, p, box, 60);
      await g.page.mouse.down();
      await g.page.mouse.move(p.x + dx, p.y + dy, { steps: 8 });
      await g.page.mouse.up();
      await g.page.waitForTimeout(30);
      const after = (await g.read()).dots;
      if (!landed(after[id], { x: p.x + dx, y: p.y + dy }, dots, id)) dragFail.push(`${id} (moved ${Math.round(dist(p, after[id]))}px)`);
      const moved = othersMoved(id, dots, after);
      if (moved.length) still.push(`${id} moved ${moved.join(" ")}`);
      // Click: opens the drawer for this dot.
      const q = after[id];
      await g.page.mouse.click(q.x, q.y);
      if (await openedDrawer(g.page, id)) await closeDrawer(g.page);
      else clickFail.push(id);
    }
    // Keyboard: Tab onto a dot, Enter opens it.
    await g.page.locator(`#network g[data-id="${ids[0]}"]`).focus();
    await g.page.keyboard.press("Enter");
    const keyOk = await openedDrawer(g.page, ids[0]);
    if (keyOk) await closeDrawer(g.page);
    // Edges: drag every dot 600px outward; each stays inside the frame.
    for (const id of ids) {
      const { dots, box } = await g.read();
      const p = dots[id];
      const [dx, dy] = toward(ids.indexOf(id), p, box, -600);
      await g.page.mouse.move(p.x, p.y);
      await g.page.mouse.down();
      await g.page.mouse.move(p.x + dx, p.y + dy, { steps: 6 });
      await g.page.mouse.up();
    }
    await g.page.mouse.move(0, 0);
    const out = await outside(g);
    const stack = await stacked(g);
    return {
      ...(await g.finish("desktop")),
      checks: {
        "hover shows the info line": hoverFail,
        "all 20 dots dragged": dragFail,
        "other dots stay still": still,
        "click opens the drawer": clickFail,
        "Enter opens the drawer": keyOk ? [] : [ids[0]],
        "dots or labels outside the frame": out,
        "dots on top of each other": stack,
      },
    };
  },
  async "phone: touch scroll, drag each dot, tap opens"(browser) {
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

    // A finger on empty space in the graph scrolls the page. Pick the visible spot farthest from every dot.
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
    await g.page.locator("#network svg").scrollIntoViewIfNeeded();
    await g.page.waitForTimeout(400);

    // A finger on a dot drags it, and does not scroll the page.
    const fail = [], still = [];
    const ids = Object.keys(dots);
    for (const [i, id] of ids.entries()) {
      const { dots: now, box: b } = await g.read();
      const p = now[id];
      const [dx, dy] = toward(i % 2, p, b, 50);
      const before = await scrollY();
      await swipe(p.x, p.y, dx, dy);
      await g.page.waitForTimeout(50);
      const after = (await g.read()).dots;
      const pageMoved = (await scrollY()) - before;
      if (!landed(after[id], { x: p.x + dx, y: p.y + dy }, now, id) || pageMoved)
        fail.push(`${id} (moved ${Math.round(dist(p, after[id]))}px, page scrolled ${pageMoved}px)`);
      const moved = othersMoved(id, now, after);
      if (moved.length) still.push(`${id} moved ${moved.join(" ")}`);
    }
    const out = await outside(g);
    const stack = await stacked(g);

    // A tap on a dot opens the drawer.
    const p = (await g.read()).dots[ids[0]];
    await g.page.touchscreen.tap(p.x, p.y);
    const opened = await openedDrawer(g.page, ids[0]);
    if (opened) await closeDrawer(g.page);
    return {
      ...(await g.finish("phone")),
      checks: {
        "page scrolls from empty graph space": scrolled > 150 ? [] : [`page moved ${scrolled}px`],
        "all 20 dots dragged by touch": fail,
        "other dots stay still": still,
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
  for (const [name, run] of Object.entries(scenarios).filter(([n]) => !process.env.ONLY || n.startsWith(process.env.ONLY))) {
    let timer;
    const timeout = new Promise((_, reject) => (timer = setTimeout(() => reject(new Error("timed out after 180 s")), 180000)));
    try {
      const { checks, errors, longTasks } = await Promise.race([run(browser), timeout]);
      checks["console and page errors"] = errors;
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
