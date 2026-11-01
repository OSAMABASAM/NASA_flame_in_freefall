// Saves AI answers for the example questions in data/demo-answers.json, so the demo chips answer instantly.
// Usage: npm run cache. Runs on every Vercel build. It never fails the build.
// - Data unchanged since an answer was saved (same data_hash)? The answer is kept as it is: no AI call.
// - Data changed? The question is asked again. The new answer replaces the old one only if it passes the
//   checks in lib/ask.ts (ids exist, numbers and names match the cited record). If the AI is busy or fails the
//   checks, the old answer is kept while it still passes the checks against the new data; otherwise it is
//   removed and the site asks the AI live for that question.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const OUT = "data/demo-answers.json";
// Groq's free tier allows 8,000 tokens a minute and one question uses about 5,000, so space the questions out.
const GAP_MS = 45_000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  const { askModel, checkAnswer, EXAMPLE_QUESTIONS } = await import("../lib/ask.ts");
  const rows = JSON.parse(readFileSync("data/investigations.json", "utf8")).items;
  const hash = createHash("sha256").update(JSON.stringify(rows)).digest("hex").slice(0, 12);
  const cache = JSON.parse(readFileSync(OUT, "utf8"));
  const keys = { groq: process.env.GROQ_API_KEY, gemini: process.env.GEMINI_API_KEY };
  let asked = 0;
  for (const q of EXAMPLE_QUESTIONS) {
    if (cache[q]?.data_hash === hash) {
      console.log(`kept (data unchanged): ${q}`);
      continue;
    }
    if (asked++) await sleep(GAP_MS);
    try {
      cache[q] = { ...(await askModel(q, rows, keys, { maxWaitMs: 65_000 })), data_hash: hash };
      console.log(`cached (${cache[q].provider}): ${q}`);
    } catch (e) {
      const old = cache[q];
      const problems = old ? checkAnswer(old.answer, q, rows) : ["no old answer"];
      if (problems.length) {
        delete cache[q];
        console.warn(`WARNING: no cached answer for "${q}" (${problems.join("; ")}); the site will ask live. ${e.message}`);
      } else console.warn(`WARNING: kept the old answer for "${q}": ${e.message}`);
    }
  }
  for (const q of Object.keys(cache)) if (!EXAMPLE_QUESTIONS.includes(q)) delete cache[q];
  writeFileSync(OUT, JSON.stringify(cache, null, 2) + "\n");
} catch (e) {
  console.warn(`WARNING: answer cache not updated: ${e.message}`);
}
