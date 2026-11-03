// Audio prep for the demo video, ffmpeg only (no downloads, no music).
// - Voice: docs/demo/voice.mp3, light cleanup (80 Hz high-pass, gentle de-ess), cut into the 9 lines listed in
//   src/data/lines.json (from/to in seconds, found at the pauses), each with 10 ms fades.
// - Fire: docs/demo/fire.mp3, a 75 s stretch converted to 48 kHz for the bed.
// - Space rumble: brown noise, low-pass ~120 Hz.
// - Sound effects synthesised with ffmpeg: whoosh, click, pop, riser, boom, spark, shimmer.
// Usage: npm run audio. Output: public/audio/.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const repo = join(root, "..");
const out = join(root, "public", "audio");
mkdirSync(join(out, "sfx"), { recursive: true });
const ff = (...args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);

// Voice: clean once, then cut.
const clean = join(out, "voice-clean.wav");
ff("-i", join(repo, "docs/demo/voice.mp3"), "-af", "highpass=f=80,deesser=i=0.25:m=0.5:f=0.5,aresample=48000", "-ac", "1", clean);
const lines = JSON.parse(readFileSync(join(root, "src/data/lines.json"), "utf8"));
for (const l of lines) {
  const d = l.to - l.from;
  ff("-ss", String(l.from), "-t", d.toFixed(3), "-i", clean, "-af", `afade=t=in:d=0.01,afade=t=out:st=${(d - 0.01).toFixed(3)}:d=0.01`,
    join(out, `line${l.line}.wav`));
}

// Fire bed and rumble (levels and ducking are set in the edit).
ff("-ss", "20", "-t", "75", "-i", join(repo, "docs/demo/fire.mp3"), "-af", "aresample=48000,afade=t=in:d=1", "-ac", "2", join(out, "fire.wav"));
ff("-f", "lavfi", "-i", "anoisesrc=d=75:c=brown:a=0.9:seed=7", "-af", "lowpass=f=120,lowpass=f=120,volume=6dB,aresample=48000", "-ac", "2", join(out, "rumble.wav"));

// A noise band whose centre moves through the given frequencies over time (asendcmd steps the bandpass).
const sweep = (d, freqs, extra) => {
  const cmds = freqs.map((f, i) => `${((i / (freqs.length - 1)) * d).toFixed(3)} bandpass f ${f}`).join(";");
  return `asendcmd=c='${cmds}',bandpass=f=${freqs[0]}:width_type=o:w=1.2,${extra}`;
};
const sfx = {
  whoosh: ["-f", "lavfi", "-i", "anoisesrc=d=0.4:c=pink:a=0.9:seed=3",
    "-af", sweep(0.4, Array.from({ length: 24 }, (_, i) => Math.round(350 * Math.pow(9, Math.sin((Math.PI * i) / 23)))),
      "afade=t=in:d=0.16:curve=qsin,afade=t=out:st=0.18:d=0.22:curve=qsin,volume=6dB")],
  click: ["-f", "lavfi", "-i", "aevalsrc='0.7*sin(2*PI*2600*t)*exp(-t*260)+0.35*(random(0)*2-1)*exp(-t*700)':d=0.045:s=48000",
    "-af", "highpass=f=900"],
  pop: ["-f", "lavfi", "-i", "aevalsrc='0.6*sin(2*PI*(480+520*exp(-t*35))*t)*exp(-t*20)*min(1,t*400)':d=0.25:s=48000"],
  riser: ["-f", "lavfi", "-i", "anoisesrc=d=1.0:c=pink:a=0.8:seed=5",
    "-af", sweep(1.0, Array.from({ length: 30 }, (_, i) => Math.round(200 * Math.pow(25, i / 29))), "afade=t=in:d=0.95:curve=exp,afade=t=out:st=0.95:d=0.05,volume=3dB")],
  boom: ["-f", "lavfi", "-i", "aevalsrc='0.9*sin(2*PI*(40+45*exp(-t*9))*t)*exp(-t*2.6)*min(1,t*200)':d=1.6:s=48000",
    "-af", "lowpass=f=220"],
  spark: ["-f", "lavfi", "-i", "aevalsrc='(gt(random(0),0.955)*(random(1)*2-1)*0.9+0.12*(random(2)*2-1))*exp(-t*7)':d=0.45:s=48000",
    "-af", "highpass=f=1800,lowpass=f=9000"],
  shimmer: ["-f", "lavfi", "-i",
    "aevalsrc='0.16*(sin(2*PI*3520*t)+0.7*sin(2*PI*4186*t)+0.5*sin(2*PI*5274*t)+0.4*sin(2*PI*6272*t))*sin(PI*t/0.9)*(0.6+0.4*sin(2*PI*13*t))':d=0.9:s=48000",
    "-af", "aecho=0.8:0.6:60:0.35"],
};
for (const [name, args] of Object.entries(sfx)) ff(...args, "-ac", "2", "-ar", "48000", join(out, "sfx", `${name}.wav`));
console.log(`audio ready in ${out}`);
