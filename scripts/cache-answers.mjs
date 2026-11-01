// Saves AI answers for the example questions in data/demo-answers.json, so the demo chips answer instantly.
// Usage: npm run cache. Runs on every Vercel build. It never fails the build:
// if a question cannot be answered, the old cached answer is kept and a warning is printed.
import { readFileSync, writeFileSync } from "node:fs";

const OUT = "data/demo-answers.json";
try {
  const { askModel, EXAMPLE_QUESTIONS } = await import("../lib/ask.ts");
  const rows = JSON.parse(readFileSync("data/investigations.json", "utf8")).items;
  const cache = JSON.parse(readFileSync(OUT, "utf8"));
  const keys = { groq: process.env.GROQ_API_KEY, gemini: process.env.GEMINI_API_KEY };
  for (const q of EXAMPLE_QUESTIONS) {
    try {
      cache[q] = await askModel(q, rows, keys);
      console.log(`cached (${cache[q].provider}): ${q}`);
    } catch (e) {
      console.warn(`WARNING: kept the old answer for "${q}": ${e.message}`);
    }
  }
  for (const q of Object.keys(cache)) if (!EXAMPLE_QUESTIONS.includes(q)) delete cache[q];
  writeFileSync(OUT, JSON.stringify(cache, null, 2) + "\n");
} catch (e) {
  console.warn(`WARNING: answer cache not updated: ${e.message}`);
}
