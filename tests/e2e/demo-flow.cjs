// Browser test for the whole demo (spec section 2), on desktop and on a phone. Usage: start the app, then
//   npm run test:demo -- [url]        (default http://localhost:3000; also works on a Vercel preview or the live site)
// Steps: first screen, example question with citations, rank (habitat, oxygen, safety area), detail drawer,
// compare 3, network, research gaps, footer. Also checks: no console errors, no layout shift while scrolling
// (the lazy sections keep their place), and that the lazy sections are not loaded before they are needed.
// The graph drag itself (all 20 dots) is tested by tests/e2e/network-drag.cjs. Uses the global Playwright.
/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script, so the global Playwright loads with require */
const { chromium } = require("playwright");
const { join } = require("node:path");
const { tmpdir } = require("node:os");

const URL = process.argv[2] ?? "http://localhost:3000";
const SHOTS = process.env.SHOT_DIR ?? tmpdir();
const DEVICES = {
  desktop: { viewport: { width: 1366, height: 900 } },
  phone: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 },
};

async function run(browser, device) {
  const context = await browser.newContext(DEVICES[device]);
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  // A server without AI keys (a local build: data/demo-answers.json is filled only by the Vercel build) answers
  // example questions with 503. That step is then skipped, not failed, and its one console error is expected.
  let noAi = false;
  page.on("response", (r) => r.url().endsWith("/api/ask") && r.status() === 503 && (noAi = true));
  await page.addInitScript(() => {
    window.__shift = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (window.__shift += e.value))).observe({
      type: "layout-shift",
      buffered: true,
    });
  });
  const checks = {};
  const skipped = {};
  const check = async (name, fn) => {
    try {
      const problem = await fn();
      checks[name] = problem ? [problem] : [];
    } catch (e) {
      checks[name] = [e.message.split("\n")[0]];
    }
    if (noAi && checks[name].length && name.startsWith("2 ")) {
      delete checks[name];
      skipped[name] = "this server has no AI keys and no cached answers (fine locally; the Vercel build fills the cache)";
    }
  };
  const shot = (name) => page.screenshot({ path: join(SHOTS, `demo-${device}-${name}.png`) });

  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(600);

  // 1. First screen: headline, ask box, 3 example chips. Network and gaps are not built yet.
  await check("1 first screen: headline, ask box, 3 chips", async () => {
    await page.getByRole("heading", { level: 1 }).waitFor();
    await page.getByLabel("Your question").waitFor();
    const chips = await page.locator('section[aria-label="Ask the fire data"] .mt-3 button').count();
    if (chips !== 3) return `${chips} chips`;
  });
  await check("1 network and gaps wait until scrolled near", async () => {
    const built = await page.evaluate(() => [!!document.querySelector("#network section"), !!document.querySelector("#gaps section")]);
    if (built.some(Boolean)) return `built on load: network ${built[0]}, gaps ${built[1]}`;
  });
  await shot("1-first-screen");

  // 2. Example question: cited answer appears; a citation chip jumps to that investigation's card.
  await check("2 example question gives a cited answer", async () => {
    await page.getByRole("button", { name: "Which experiments matter most for a Moon Base at 30% oxygen?" }).click();
    await page.getByText("AI answer").waitFor();
    const cite = page.locator('[aria-live="polite"] a[href^="#inv-"]').first();
    await cite.waitFor();
    await shot("2-answer");
    const id = (await cite.getAttribute("href")).slice(1);
    await cite.click();
    await page.waitForTimeout(600);
    if (!(await page.locator(`#${CSS_escape(id)}`).isVisible())) return `${id} card not on screen after the jump`;
  });

  // 3. Rank: Moon Base, oxygen 21% -> 30%, safety area prevention. The order and reasons follow.
  await check("3 rank follows habitat, oxygen and safety area", async () => {
    const order = () => page.locator("#rank ol > li").evaluateAll((els) => els.map((e) => e.id));
    const before = await order();
    await page.locator("#rank select").selectOption("moon_base");
    const slider = page.locator('#rank input[type="range"]');
    await slider.focus();
    for (let i = 0; i < 9; i++) await page.keyboard.press("ArrowRight");
    if ((await slider.inputValue()) !== "30") return `slider at ${await slider.inputValue()}`;
    await page.locator("#rank").getByRole("button", { name: "prevention" }).click();
    await page.waitForTimeout(500);
    const after = await order();
    if (after.length !== 20) return `${after.length} cards`;
    if (before.join() === after.join()) return "order did not change";
    if (!(await page.locator("#rank ol > li").first().getByText(/30% oxygen/).count())) return "top card reason does not mention 30% oxygen";
  });
  await page.locator("#rank ol > li").first().scrollIntoViewIfNeeded();
  await shot("3-rank");

  // 4. Detail drawer opens from a card, shows the fields, closes, and focus goes back to the button.
  await check("4 detail drawer opens, closes, gives focus back", async () => {
    const details = page.locator("#rank ol > li").first().getByRole("button", { name: "Details" });
    await details.click();
    const dialog = page.locator("dialog[open]");
    await dialog.getByText("Objective").waitFor();
    await page.waitForTimeout(300);
    await shot("4-drawer");
    await dialog.getByRole("button", { name: "Close" }).click();
    await dialog.waitFor({ state: "detached" });
    if (!(await details.evaluate((b) => b === document.activeElement))) return "focus did not return to Details";
  });

  // 5. Compare 3: tick three cards, open the table; rows that differ are tinted; Esc closes it.
  await check("5 compare 3 investigations", async () => {
    const boxes = page.locator('#rank ol > li input[type="checkbox"]');
    for (let i = 0; i < 3; i++) await boxes.nth(i).check();
    await page.getByText("3 of 3 picked:").waitFor();
    await page.getByRole("button", { name: "Compare", exact: true }).click();
    const table = page.locator("dialog[open] table");
    await table.waitFor();
    const cols = await table.locator("thead th").count();
    const differs = await table.locator("tr[data-differs]").count();
    await page.waitForTimeout(300);
    await shot("5-compare");
    await page.keyboard.press("Escape");
    await page.locator("dialog[open]").waitFor({ state: "detached" });
    if (cols !== 4) return `${cols - 1} columns`;
    if (!differs) return "no row marked as different";
  });

  // 6. Network graph, research gaps and footer appear when scrolled to, without pushing the page around.
  await check("6 network graph loads when scrolled to", async () => {
    await page.locator("#network").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => window.__networkGraph?.nodes.every((n) => Number.isFinite(n.x)));
    await page.locator("#network canvas").first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await shot("6-network");
  });
  await check("6 header link jumps to research gaps", async () => {
    if (device === "desktop") await page.getByRole("link", { name: "Gaps" }).click();
    else await page.evaluate(() => (location.hash = "#gaps"));
    await page.getByRole("heading", { name: "Research gaps" }).waitFor();
    await page.waitForTimeout(800);
    const top = await page.getByRole("heading", { name: "Research gaps" }).evaluate((h) => h.getBoundingClientRect().top);
    await shot("6-gaps");
    if (top < 0 || top > 400) return `heading ${Math.round(top)}px from the top after the jump`;
  });
  await check("6 footer: back on Earth and coming next", async () => {
    await page.getByText("Back on Earth").scrollIntoViewIfNeeded();
    await page.getByText("LUCI and FM2 data").waitFor();
    await page.waitForTimeout(500);
    await shot("6-footer");
  });

  await check("layout shift under 0.1", async () => {
    const shift = await page.evaluate(() => window.__shift);
    if (shift >= 0.1) return `CLS ${shift.toFixed(3)}`;
  });
  checks["no console errors"] = noAi ? errors.filter((e) => !e.includes("503")) : errors;
  await context.close();
  return { checks, skipped };
}

// Investigation ids can contain characters that need escaping in a CSS selector.
const CSS_escape = (s) => s.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);

(async () => {
  const browser = await chromium.launch();
  let failed = 0;
  for (const device of Object.keys(DEVICES)) {
    const { checks, skipped } = await run(browser, device);
    const bad = Object.values(checks).filter((v) => v.length).length;
    failed += bad ? 1 : 0;
    console.log(`${bad ? "FAIL" : "PASS"}  ${device}`);
    for (const [name, problems] of Object.entries(checks))
      console.log(`      ${problems.length ? "x " : "ok"} ${name}${problems.length ? ": " + problems.join(", ") : ""}`);
    for (const [name, why] of Object.entries(skipped)) console.log(`      -- ${name}: skipped, ${why}`);
  }
  await browser.close();
  console.log(failed ? `\n${failed} device(s) failed` : `\nDemo flow passed on desktop and phone. Screenshots in ${SHOTS}`);
  process.exit(failed ? 1 : 0);
})();
