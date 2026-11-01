// Browser test for the network graph: every dot can be dragged on its own, and a click opens the drawer.
// Usage: start the app (npm run dev, or npm run build && npm start), then: node tests/e2e/network-drag.cjs [url]
// Uses the Playwright that is installed globally (not a project dependency).
/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script, so the global Playwright loads with require */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const { join } = require("node:path");
const { tmpdir } = require("node:os");

const URL = process.argv[2] ?? "http://localhost:3000";
const DRAG = 60; // screen pixels

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.locator("#network").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => window.__networkGraph?.nodes.every((n) => Number.isFinite(n.x)));
  await page.waitForTimeout(1500); // let the layout settle and fit

  // Screen position (viewport pixels) of every node, read with the library's graph2ScreenCoords.
  const positions = () =>
    page.evaluate(() => {
      const { graph, nodes } = window.__networkGraph;
      const box = document.querySelector("#network canvas").getBoundingClientRect();
      return Object.fromEntries(
        nodes.map((n) => {
          const p = graph.graph2ScreenCoords(n.x, n.y);
          return [n.id, { x: box.left + p.x, y: box.top + p.y }];
        }),
      );
    });
  const canvasBox = await page.locator("#network canvas").first().boundingBox();
  const ids = Object.keys(await positions());
  assert.equal(ids.length, 20, "expected 20 nodes");

  const results = [];
  for (const id of ids) {
    const before = await positions();
    const p = before[id];
    // Drag toward the middle of the canvas, so the drop point stays inside it.
    const dx = p.x < canvasBox.x + canvasBox.width / 2 ? DRAG : -DRAG;
    await page.mouse.move(p.x, p.y);
    await page.waitForTimeout(250); // a person pauses on a dot before grabbing it
    await page.mouse.down();
    await page.mouse.move(p.x + dx, p.y, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(1200); // neighbors settle
    const after = await positions();
    const moved = Math.hypot(after[id].x - p.x - dx, after[id].y - p.y);
    const others = ids.filter((o) => o !== id).map((o) => Math.hypot(after[o].x - before[o].x, after[o].y - before[o].y));
    results.push({
      id,
      draggedPx: Math.round(Math.hypot(after[id].x - p.x, after[id].y - p.y)),
      offTargetPx: Math.round(moved),
      othersMaxPx: Math.round(Math.max(...others)),
      othersMeanPx: +(others.reduce((a, b) => a + b, 0) / others.length).toFixed(1),
    });
  }
  console.table(results);
  const failed = results.filter((r) => r.draggedPx < DRAG - 10 || r.offTargetPx > 10);
  assert.equal(failed.length, 0, `nodes that did not follow the drag: ${failed.map((r) => r.id).join(", ")}`);

  // A click (no drag) opens the detail drawer for that node.
  const first = ids[0];
  const p = (await positions())[first];
  await page.mouse.move(p.x, p.y);
  await page.waitForTimeout(250);
  await page.mouse.click(p.x, p.y);
  const drawer = page.locator("dialog[open]");
  await drawer.waitFor({ timeout: 3000 });
  const text = await drawer.innerText();
  assert.ok(text.includes(first), `drawer should show ${first}`);
  console.log(`click on ${first}: drawer opened`);

  assert.deepEqual(errors, [], "page errors");
  await page.screenshot({ path: process.env.SHOT ?? join(tmpdir(), "network-after-drags.png"), clip: canvasBox });
  console.log(`PASS: ${results.length} nodes dragged, drawer opens on click`);
  await browser.close();
})().catch((e) => {
  console.error("FAIL:", e.message);
  process.exit(1);
});
