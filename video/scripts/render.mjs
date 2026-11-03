// Renders the demo video and writes the three outputs to docs/demo/.
// 1. Main composition without captions (H.264) plus its mixed audio as WAV.
// 2. Captions alone on transparent ProRes 4444.
// 3. ffmpeg: loudness to -14 LUFS with true peak under -1 dBTP (two-pass loudnorm), then
//    final-no-captions.mp4 (video copied) and final.mp4 (captions overlaid), AAC 48 kHz, faststart.
// 4. thumbnail-frame.png from the title moment.
// Usage: npm run render   (after npm run audio; the clips are in public/clips)
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const out = join(root, "out");
const docs = join(root, "..", "docs", "demo");
mkdirSync(out, { recursive: true });
const browserExecutable = process.env.BROWSER ?? "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const only = process.argv[2]; // optional: "video", "captions", "mux" or "thumb" to run one step (the video step also writes the audio)
const step = (name) => !only || only === name;
const ff = (...a) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...a], { stdio: ["ignore", "inherit", "inherit"] });
const log = (s) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${s}`);

const serveUrl = await bundle({ entryPoint: join(root, "src/index.ts"), publicDir: join(root, "public") });
const props = { captions: false, sound: true };
const main = await selectComposition({ serveUrl, id: "Main", inputProps: props, browserExecutable });
let last = 0;
const progress = ({ progress: p }) => {
  if (p - last >= 0.1 || p === 1) (last = p), log(`  ${Math.round(p * 100)}%`);
};

if (step("video")) {
  log("render main video and audio");
  last = 0;
  await renderMedia({
    serveUrl, composition: main, inputProps: props, browserExecutable, codec: "h264", crf: 18, x264Preset: "veryfast",
    pixelFormat: "yuv420p", outputLocation: join(out, "main.mp4"), separateAudioTo: join(out, "mix.wav"), concurrency: 4, onProgress: progress,
  });
}
if (step("captions")) {
  log("render captions overlay");
  last = 0;
  const cap = await selectComposition({ serveUrl, id: "Captions", browserExecutable });
  await renderMedia({
    serveUrl, composition: cap, browserExecutable, codec: "prores", proResProfile: "4444", imageFormat: "png", pixelFormat: "yuva444p10le",
    outputLocation: join(out, "captions.mov"), muted: true, concurrency: 4, onProgress: progress,
  });
}
if (step("mux")) {
  log("loudness and mux");
  // Aim a little above -14: the peak limiter after loudnorm takes about 0.4 LU back.
  const target = "I=-13.6:TP=-2:LRA=11";
  const err = execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${join(out, "mix.wav")}" -af loudnorm=${target}:print_format=json -f null - 2>&1`]).toString();
  const m = JSON.parse(err.slice(err.lastIndexOf("{"), err.lastIndexOf("}") + 1));
  const second = `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
  ff("-i", join(out, "mix.wav"), "-af", `${second},aresample=192000,alimiter=limit=0.7:attack=1:release=60:level=false,aresample=48000`, "-c:a", "pcm_s16le", join(out, "mix-norm.wav"));
  const audio = ["-c:a", "aac", "-b:a", "192k", "-ar", "48000"];
  const x264 = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-r", "30", "-pix_fmt", "yuv420p", "-color_range", "tv"];
  ff("-i", join(out, "main.mp4"), "-i", join(out, "mix-norm.wav"), "-map", "0:v", "-map", "1:a", ...x264, ...audio, "-movflags", "+faststart", "-shortest",
    join(docs, "final-no-captions.mp4"));
  ff("-i", join(out, "main.mp4"), "-i", join(out, "captions.mov"), "-i", join(out, "mix-norm.wav"), "-filter_complex", "[0:v][1:v]overlay=format=auto,format=yuv420p[v]",
    "-map", "[v]", "-map", "2:a", ...x264, ...audio, "-movflags", "+faststart", "-shortest", join(docs, "final.mp4"));
}
if (step("thumb")) {
  log("thumbnail");
  await renderStill({ serveUrl, composition: main, inputProps: { captions: false, sound: false }, browserExecutable, frame: 120, output: join(docs, "thumbnail-frame.png") });
}
log("done");
