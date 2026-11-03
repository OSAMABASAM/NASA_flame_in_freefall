// Renders stills at the given frames (default: the middle of every scene and every callout moment) for checking.
// Usage: node scripts/stills.mjs [outDir] [frame ...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const out = process.argv[2] ?? "out/stills";
mkdirSync(out, { recursive: true });
const browserExecutable = process.env.BROWSER ?? "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: join(import.meta.dirname, "../src/index.ts"), publicDir: join(import.meta.dirname, "../public") });
const comp = await selectComposition({ serveUrl, id: "Main", inputProps: { captions: true, sound: false }, browserExecutable });
const frames = process.argv.slice(3).map(Number);
for (const frame of frames) {
  await renderStill({ serveUrl, composition: comp, frame, output: join(out, `f${String(frame).padStart(4, "0")}.png`), inputProps: { captions: true, sound: false }, browserExecutable, scale: 0.5 });
  console.log("still", frame);
}
