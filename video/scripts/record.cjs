// Records the screen clips for the demo video from a running production build of the site.
// Usage: in the repo root `npm run build && npm start`, then here `npm run record [-- url]`.
// One browser session, one CDP screencast per clip, so state carries over (Moon Base and 30% oxygen stay set).
// Output: public/clips/<name>.mp4 (2880x1620, 30 fps) and public/clips/clips.json (click times and element boxes,
// in seconds from the clip start and CSS pixels of the 1920x1080 viewport).
/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require(require.resolve("playwright", { paths: [process.env.PLAYWRIGHT_PATH ?? "/opt/node-tools/node_modules"] }));
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const URL = process.argv[2] ?? "http://localhost:3000";
const OUT = path.join(__dirname, "..", "public", "clips");
const RAW = path.join(__dirname, "..", ".raw");
const W = 1920, H = 1080, DSF = 2;
const QUESTION = "Which experiments matter most for a Moon Base at 30% oxygen?";

// Visible cursor (dark arrow, soft shadow) and an orange ring on every click. Page time of each click is logged.
const CURSOR = `
(() => {
  const add = () => {
    const c = document.createElement("div");
    c.id = "__cursor";
    c.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24"><path d="M4 2.5l15.5 9.2-6.9 1.4 4 7.6-3 1.5-4-7.7-5.6 4.5z" fill="#17181a" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, { position: "fixed", left: 0, top: 0, zIndex: 2147483647, pointerEvents: "none",
      transform: "translate(-200px,-200px)", filter: "drop-shadow(0 3px 5px rgba(0,0,0,.35))", willChange: "transform" });
    const st = document.createElement("style");
    st.textContent = "@keyframes __ring{from{transform:translate(-50%,-50%) scale(.2);opacity:.95}to{transform:translate(-50%,-50%) scale(1);opacity:0}}" +
      ".__ring{position:fixed;width:64px;height:64px;border-radius:50%;border:3px solid #ff6a1f;box-shadow:0 0 18px rgba(255,106,31,.55);" +
      "pointer-events:none;z-index:2147483646;animation:__ring 520ms cubic-bezier(.2,0,0,1) forwards}";
    document.documentElement.append(st, c);
    window.__clicks = [];
    addEventListener("mousemove", (e) => (c.style.transform = "translate(" + (e.clientX - 5) + "px," + (e.clientY - 3) + "px)"), true);
    addEventListener("mousedown", (e) => {
      window.__clicks.push({ t: Date.now(), x: e.clientX, y: e.clientY });
      const r = document.createElement("div");
      r.className = "__ring";
      r.style.left = e.clientX + "px";
      r.style.top = e.clientY + "px";
      document.documentElement.append(r);
      setTimeout(() => r.remove(), 600);
    }, true);
  };
  if (document.documentElement) add(); else addEventListener("DOMContentLoaded", add);
})();`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

async function main() {
  fs.rmSync(RAW, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DSF });
  await context.addInitScript(CURSOR);
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  const cdp = await context.newCDPSession(page);
  let mouse = { x: W + 60, y: H * 0.7 };

  // Smooth cursor move along a gentle arc with ease-in-out, driven in real time.
  async function moveTo(x, y, ms = 700) {
    const from = { ...mouse };
    const dx = x - from.x, dy = y - from.y;
    const bend = Math.min(80, Math.hypot(dx, dy) * 0.15);
    const ctrl = { x: from.x + dx / 2 - (dy / (Math.hypot(dx, dy) || 1)) * bend, y: from.y + dy / 2 + (dx / (Math.hypot(dx, dy) || 1)) * bend };
    const t0 = Date.now();
    for (;;) {
      const t = Math.min(1, (Date.now() - t0) / ms), e = ease(t), u = 1 - e;
      const p = { x: u * u * from.x + 2 * u * e * ctrl.x + e * e * x, y: u * u * from.y + 2 * u * e * ctrl.y + e * e * y };
      await page.mouse.move(p.x, p.y);
      if (t >= 1) break;
      await sleep(8);
    }
    mouse = { x, y };
  }
  async function click() {
    await page.mouse.down();
    await sleep(90);
    await page.mouse.up();
  }
  async function center(locator) {
    const b = await locator.boundingBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  }
  const rect = async (locator) => {
    const b = await locator.boundingBox();
    return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
  };
  // Eased scroll in the page, one step per animation frame.
  const scrollTo = (y, ms) =>
    page.evaluate(
      ([y, ms]) =>
        new Promise((done) => {
          const y0 = scrollY, t0 = performance.now();
          const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
          const step = (now) => {
            const t = Math.min(1, (now - t0) / ms);
            scrollTo(0, y0 + (y - y0) * ease(t));
            t < 1 ? requestAnimationFrame(step) : done();
          };
          requestAnimationFrame(step);
        }),
      [y, ms],
    );
  const docY = (sel) => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, sel);

  // Screencast: every compositor frame is saved with its timestamp; ffmpeg turns them into constant 30 fps.
  const clips = {};
  let rec = null;
  cdp.on("Page.screencastFrame", (f) => {
    cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
    if (!rec) return;
    const file = path.join(rec.dir, String(rec.frames.length).padStart(5, "0") + ".jpg");
    fs.writeFileSync(file, Buffer.from(f.data, "base64"));
    rec.frames.push({ file, ts: f.metadata.timestamp });
  });
  async function start(name) {
    const dir = path.join(RAW, name);
    fs.mkdirSync(dir, { recursive: true });
    await page.evaluate(() => (window.__clicks = []));
    rec = { name, dir, frames: [], marks: {}, t0: Date.now() / 1000 };
    await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: W * DSF, maxHeight: H * DSF, everyNthFrame: 1 });
    // Nudge one repaint so the first frame arrives at once.
    await page.evaluate(() => document.documentElement.style.setProperty("--rec", String(Math.random())));
    await sleep(150);
  }
  const mark = (key, value) => (rec.marks[key] = { t: +(Date.now() / 1000 - rec.t0).toFixed(3), ...value });
  async function stop() {
    await sleep(200);
    const tEnd = Date.now() / 1000;
    await cdp.send("Page.stopScreencast");
    const clicks = (await page.evaluate(() => window.__clicks)).map((c) => ({ t: +(c.t / 1000 - rec.t0).toFixed(3), x: c.x, y: c.y }));
    const { name, frames, dir } = rec;
    rec = null;
    // Frame timestamps are wall-clock seconds; clip time 0 is rec.t0 (when start() ran).
    const first = frames[0].ts;
    const list = frames.map((f, i) => `file '${f.file}'\nduration ${((frames[i + 1]?.ts ?? tEnd) - f.ts).toFixed(5)}`).join("\n");
    fs.writeFileSync(path.join(dir, "list.txt"), list + `\nfile '${frames.at(-1).file}'\n`);
    const out = path.join(OUT, name + ".mp4");
    execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", path.join(dir, "list.txt"),
      "-vf", "scale=2880:1620:flags=lanczos,fps=30", "-c:v", "libx264", "-preset", "veryfast", "-crf", "15", "-pix_fmt", "yuv420p", out]);
    const gaps = frames.slice(1).map((f, i) => f.ts - frames[i].ts);
    // Clicks and marks are measured from rec.t0; the video starts at the first frame, so shift by (first - t0).
    const shift = first - clips_t0[name];
    clips[name] = {
      duration: +(tEnd - first).toFixed(3),
      clockShift: +shift.toFixed(3),
      frames: frames.length,
      maxGap: +Math.max(...gaps).toFixed(3),
      clicks: clicks.map((c) => ({ ...c, t: +(c.t - shift).toFixed(3) })),
      marks: Object.fromEntries(Object.entries(marksOf[name]).map(([k, v]) => [k, { ...v, t: +(v.t - shift).toFixed(3) }])),
    };
    console.log(`${name}: ${frames.length} frames, ${clips[name].duration}s, max gap ${clips[name].maxGap}s, clicks ${clicks.length}`);
  }
  const clips_t0 = {};
  const marksOf = {};
  const begin = async (name) => {
    await start(name);
    clips_t0[name] = rec.t0;
    marksOf[name] = rec.marks;
  };

  // ---- hero: the first screen loads (rise-in and count-up), then holds for the stat-card zoom.
  await page.goto("about:blank");
  await page.evaluate(() => (document.documentElement.style.background = "#ebedf0"));
  await begin("hero");
  await page.goto(URL, { waitUntil: "load" });
  mark("loaded", {});
  await sleep(1200);
  mark("stats", await rect(page.locator("main section").first().locator("> div").nth(1)));
  mark("ask", await rect(page.locator('section[aria-label="Ask the fire data"]')));
  await sleep(13000);
  await stop();

  // ---- rank: Moon Base, drag oxygen from 21 to 30, cards glide.
  const rankTop = await docY("#rank");
  await page.evaluate((y) => scrollTo(0, y), rankTop + 60);
  await sleep(1800);
  await begin("rank");
  const select = page.locator("#rank select");
  await sleep(400);
  const s = await center(select);
  await moveTo(s.x, s.y, 900);
  await sleep(150);
  await click();
  await select.selectOption("moon_base");
  mark("select", await rect(select));
  await sleep(700);
  const slider = page.locator('#rank input[type="range"]');
  const sb = await slider.boundingBox();
  const thumb = (v) => sb.x + 8 + ((v - 15) / 25) * (sb.width - 16);
  await moveTo(thumb(21), sb.y + sb.height / 2, 750);
  mark("slider", await rect(slider));
  await sleep(120);
  await page.mouse.down();
  mark("dragStart", {});
  const ys = sb.y + sb.height / 2;
  const t0 = Date.now(), dragMs = 1700;
  for (;;) {
    const t = Math.min(1, (Date.now() - t0) / dragMs);
    const x = thumb(21) + (thumb(30) - thumb(21)) * ease(t);
    await page.mouse.move(x, ys);
    mouse = { x, y: ys };
    if (t >= 1) break;
    await sleep(12);
  }
  await page.mouse.up();
  mark("dragEnd", { value: await slider.inputValue() });
  await sleep(500);
  const firstCard = page.locator("#rank ol > li").first();
  await moveTo(mouse.x + 40, mouse.y + 160, 900);
  await sleep(1300);
  mark("topCard", { ...(await rect(firstCard)), id: await firstCard.getAttribute("id") });
  mark("why", await rect(firstCard.getByText("Why:").locator("..")));
  mark("cards", await rect(page.locator("#rank ol")));
  await sleep(2600);
  await stop();

  // ---- detail: open the top card, then compare three.
  await begin("detail");
  await sleep(300);
  const details = firstCard.getByRole("button", { name: "Details" });
  let c = await center(details);
  await moveTo(c.x, c.y, 800);
  await sleep(120);
  await click();
  const dialog = page.locator("dialog[open]");
  await dialog.getByText("Objective").waitFor();
  await moveTo(c.x - 60, c.y + 120, 700);
  await sleep(500);
  mark("drawer", await rect(dialog));
  await sleep(1700);
  const close = dialog.getByRole("button", { name: "Close" });
  c = await center(close);
  await moveTo(c.x, c.y, 700);
  await sleep(100);
  await click();
  await dialog.waitFor({ state: "detached" });
  await sleep(300);
  const boxes = page.locator('#rank ol > li input[type="checkbox"]');
  for (let i = 0; i < 3; i++) {
    c = await center(boxes.nth(i));
    await moveTo(c.x, c.y, i ? 520 : 750);
    await sleep(80);
    await click();
    await sleep(160);
  }
  const compare = page.getByRole("button", { name: "Compare", exact: true });
  await compare.waitFor();
  c = await center(compare);
  await moveTo(c.x, c.y, 750);
  await sleep(120);
  await click();
  const table = page.locator("dialog[open] table");
  await table.waitFor();
  await moveTo(W - 140, H - 120, 900);
  mark("table", await rect(page.locator("dialog[open]")));
  await sleep(3000);
  await stop();
  await page.keyboard.press("Escape");
  await page.locator("dialog[open]").waitFor({ state: "detached" });
  // Clear the picks so the sticky compare bar does not sit over the next clips.
  await page.getByRole("button", { name: "Clear", exact: true }).click();

  // ---- network: hover a node, its neighbors light up; then a second node.
  await page.evaluate(() => document.getElementById("network").scrollIntoView());
  await page.locator("#network svg g[data-id]").first().waitFor();
  await sleep(800);
  const graph = page.locator("#network svg").first();
  await page.evaluate((y) => scrollTo(0, y), (await docY("#network")) + 230);
  await sleep(1800);
  await begin("network");
  mark("graph", await rect(graph));
  await sleep(400);
  const node = (id) => page.locator(`#network svg g[data-id="${id}"]`);
  c = await center(node("SAME"));
  await moveTo(c.x, c.y, 1000);
  mark("hover1", { ...c, id: "SAME" });
  await sleep(2400);
  c = await center(node("FLEX"));
  await moveTo(c.x, c.y, 1000);
  mark("hover2", { ...c, id: "FLEX" });
  await sleep(2600);
  await stop();
  await page.mouse.move(W - 10, H - 10);

  // ---- ask: type the Moon Base question, cited answer, click the first citation.
  await page.evaluate(() => scrollTo(0, 0));
  await sleep(1200);
  await begin("ask");
  const input = page.getByLabel("Your question");
  mark("askBox", await rect(page.locator('section[aria-label="Ask the fire data"] form')));
  await sleep(300);
  c = await center(input);
  await moveTo(c.x - 120, c.y, 800);
  await sleep(100);
  await click();
  await sleep(250);
  mark("typeStart", {});
  for (const ch of QUESTION) {
    await page.keyboard.type(ch);
    await sleep(34 + Math.round(Math.abs(Math.sin(ch.charCodeAt(0) * 12.9898)) * 30));
  }
  mark("typeEnd", {});
  const askBtn = page.locator('section[aria-label="Ask the fire data"] form button');
  c = await center(askBtn);
  await moveTo(c.x, c.y, 550);
  await sleep(100);
  await click();
  await page.getByText("AI answer").waitFor();
  mark("answer", await rect(page.locator('[aria-live="polite"] > div')));
  await sleep(500);
  const cite = page.locator('[aria-live="polite"] a[href^="#inv-"]').first();
  mark("cite", { ...(await rect(cite)), id: (await cite.getAttribute("href")).slice(1) });
  await sleep(1700);
  c = await center(cite);
  await moveTo(c.x, c.y, 800);
  await sleep(250);
  await click();
  mark("jumped", {});
  await sleep(700);
  const target = page.locator(`#${(await cite.getAttribute("href")).slice(1)}`);
  mark("target", await rect(target));
  await moveTo(mouse.x + 220, mouse.y + 140, 900);
  await sleep(1600);
  await stop();

  // ---- gaps: the headline card, then a slow pan to the orange Moon cells.
  await page.evaluate(() => (document.getElementById("__cursor").style.display = "none"));
  await page.evaluate(() => document.getElementById("gaps").scrollIntoView());
  await page.getByRole("heading", { name: "Research gaps" }).waitFor();
  await sleep(1500);
  const gapsTop = await docY("#gaps");
  await page.evaluate((y) => scrollTo(0, y), gapsTop + 60);
  await sleep(1800);
  await begin("gaps");
  mark("headline", await rect(page.locator("#gaps .bg-charcoal").first()));
  await sleep(1800);
  mark("panStart", {});
  await scrollTo(gapsTop + 520, 1900);
  mark("panEnd", {});
  await sleep(300);
  const moon = page.locator("#gaps .rounded-2xl.bg-card").filter({ has: page.getByText("Moon", { exact: true }) }).first();
  mark("moonCard", await rect(moon));
  await sleep(4200);
  await stop();

  fs.writeFileSync(path.join(OUT, "clips.json"), JSON.stringify({ viewport: { w: W, h: H }, scale: 2880 / W, clips, errors }, null, 1));
  console.log(errors.length ? `page errors: ${errors.join(" | ")}` : "no page errors");
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
