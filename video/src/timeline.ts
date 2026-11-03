// One timeline for picture and sound. Every scene length follows its voice line; times in frames at 30 fps.
import clipsJson from "../public/clips/clips.json";
import linesJson from "./data/lines.json";

export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const T = 12; // transition length between scenes

export type Word = { w: string; start: number; end: number };
export type Line = { line: number; duration: number; text: string; words: Word[] };
export const LINES = linesJson as Line[];

type Box = { t: number; x: number; y: number; w: number; h: number };
type Clip = { duration: number; clicks: { t: number; x: number; y: number }[]; marks: Record<string, Box & Record<string, unknown>> };
export const CLIPS = (clipsJson as unknown as { clips: Record<string, Clip> }).clips;

const f = (s: number) => Math.round(s * FPS);
export const voiceFrames = (i: number) => f(LINES[i].duration);

// A screen segment plays clip seconds [from, to) at `rate`, starting at scene frame `at`.
export type Segment = { clip: string; at: number; from: number; to: number; rate?: number };
export const segFrames = (s: Segment) => Math.round(((s.to - s.from) * FPS) / (s.rate ?? 1));

export type SceneDef = { id: string; dur: number; voiceAt: number; segments?: Segment[] };

const ask = (() => {
  const a: Segment = { clip: "ask", at: 0, from: 0.9, to: 1.73 };
  const b: Segment = { clip: "ask", at: segFrames(a), from: 1.73, to: 5.59, rate: 1.6 };
  const c: Segment = { clip: "ask", at: segFrames(a) + segFrames(b), from: 5.59, to: 11.09 };
  return [a, b, c];
})();

export const SCENES: SceneDef[] = [
  { id: "title", dur: 143, voiceAt: 27 },
  { id: "moon", dur: 140, voiceAt: 15, segments: [{ clip: "hero", at: 45, from: 0.2, to: 0.2 + (140 - 45) / FPS }] },
  { id: "hero", dur: 235, voiceAt: 9, segments: [{ clip: "hero", at: 0, from: 0.2 + (140 - T - 45) / FPS, to: 0.2 + (140 - T - 45) / FPS + 235 / FPS }] },
  { id: "rank", dur: 282, voiceAt: 6, segments: [{ clip: "rank", at: 87, from: 1.2, to: 7.7 }] },
  {
    id: "detail",
    dur: 235,
    voiceAt: 9,
    segments: [
      { clip: "detail", at: 0, from: 0.9, to: 5.3 },
      { clip: "detail", at: 132, from: 9.7, to: 13.2 },
    ],
  },
  { id: "network", dur: 250, voiceAt: 9, segments: [{ clip: "network", at: 0, from: 0, to: 8.4 }] },
  { id: "ask", dur: 262, voiceAt: 9, segments: ask },
  { id: "gaps", dur: 177, voiceAt: 9, segments: [{ clip: "gaps", at: 0, from: 0.3, to: 6.3 }] },
  { id: "end", dur: 292, voiceAt: 15 },
];

export const START = SCENES.map((_, i) => SCENES.slice(0, i).reduce((a, s) => a + s.dur, 0) - i * T);
export const TOTAL = START.at(-1)! + SCENES.at(-1)!.dur;
export const sceneIndex = (id: string) => SCENES.findIndex((s) => s.id === id);
export const sceneStart = (id: string) => START[sceneIndex(id)];
export const voiceStart = (i: number) => START[i] + SCENES[i].voiceAt;

// Clip time (seconds) -> scene frame, through the scene's segments.
export function clipToScene(id: string, t: number): number | null {
  const sc = SCENES[sceneIndex(id)];
  for (const s of sc.segments ?? []) if (t >= s.from && t < s.to) return s.at + ((t - s.from) * FPS) / (s.rate ?? 1);
  return null;
}
// Scene frame at which a word of the scene's line starts.
export const wordAt = (id: string, word: string, nth = 0) => {
  const i = sceneIndex(id);
  const hits = LINES[i].words.filter((w) => w.w.replace(/[^\w']/g, "").toLowerCase() === word.toLowerCase());
  return SCENES[i].voiceAt + f(hits[nth].start);
};
// Scene frame of the moment a mark was taken in the scene's clip.
export const markAt = (id: string, clip: string, key: string) => clipToScene(id, CLIPS[clip].marks[key].t) ?? 0;
export const mark = (clip: string, key: string) => CLIPS[clip].marks[key];

// Sound effects in absolute frames.
export type Sfx = { name: string; at: number; gain: number };
export const SFX_GAIN: Record<string, number> = {
  whoosh: 0.4,
  click: 0.28,
  pop: 0.32,
  riser: 1,
  boom: 0.5,
  spark: 0.5,
  shimmer: 0.6,
};
const sfxList: Sfx[] = [];
export const sfx = (name: string, at: number) => sfxList.push({ name, at: Math.round(at), gain: SFX_GAIN[name] });
// Transitions between scenes, each with a whoosh.
for (let i = 1; i < SCENES.length; i++) sfx("whoosh", START[i] - 2);
// Every recorded click in a clip that is on screen gets a click sound.
for (let i = 0; i < SCENES.length; i++) {
  const seen = new Set<string>();
  for (const s of SCENES[i].segments ?? []) {
    if (seen.has(s.clip)) continue;
    seen.add(s.clip);
    for (const c of CLIPS[s.clip].clicks) {
      const at = clipToScene(SCENES[i].id, c.t);
      if (at !== null && at < SCENES[i].dur - 4) sfx("click", START[i] + at);
    }
  }
}
export const SFX = sfxList;

// Voice is active (for ducking) from each line's start to its end.
export const VOICE_SPANS = LINES.map((_, i) => [voiceStart(i), voiceStart(i) + voiceFrames(i)] as const);
