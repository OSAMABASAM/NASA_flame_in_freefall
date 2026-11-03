// Karaoke captions: the voice line word by word, bottom center, white pill, at most 2 lines.
// Lines are split into chunks at punctuation so a chunk always fits.
import { interpolate, useCurrentFrame } from "remotion";
import { C, FONT, SHADOW } from "../theme";
import { FPS, LINES, voiceStart, type Word } from "../timeline";

const MAX_CHARS = 58;
type Chunk = { words: (Word & { at: number; endAt: number })[]; from: number; to: number };

function chunks(): Chunk[] {
  const out: Chunk[] = [];
  LINES.forEach((line, i) => {
    const base = voiceStart(i);
    const ws = line.words.map((w) => ({ ...w, at: base + Math.round(w.start * FPS), endAt: base + Math.round(w.end * FPS) }));
    let cur: typeof ws = [];
    const flush = () => cur.length && (out.push({ words: cur, from: cur[0].at - 4, to: cur.at(-1)!.endAt + 8 }), (cur = []));
    for (const w of ws) {
      const len = [...cur, w].map((x) => x.w).join(" ").length;
      if (cur.length && len > MAX_CHARS) flush();
      cur.push(w);
      // Break after a sentence end when the chunk is already long enough to read.
      if (/[.?!]$/.test(w.w) && cur.map((x) => x.w).join(" ").length > 24) flush();
    }
    flush();
  });
  // A chunk leaves when the next one starts.
  for (let i = 0; i < out.length - 1; i++) out[i].to = Math.min(out[i].to, out[i + 1].from);
  return out;
}
const CHUNKS = chunks();

export function Captions() {
  const frame = useCurrentFrame();
  const c = CHUNKS.find((k) => frame >= k.from && frame < k.to);
  if (!c) return null;
  const o = interpolate(frame, [c.from, c.from + 4, c.to - 4, c.to], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 58, display: "flex", justifyContent: "center", opacity: o }}>
      <div
        style={{
          maxWidth: 1300,
          padding: "14px 30px",
          borderRadius: 26,
          background: "rgb(255 255 255 / 0.96)",
          boxShadow: SHADOW + `, 0 0 0 1px ${C.border}`,
          fontFamily: FONT,
          fontSize: 38,
          lineHeight: 1.3,
          fontWeight: 600,
          letterSpacing: -0.3,
          textAlign: "center",
          transform: `translateY(${(1 - o) * 8}px)`,
        }}
      >
        {c.words.map((w, i) => {
          const spoken = frame >= w.at;
          const now = spoken && (i === c.words.length - 1 ? frame < w.endAt : frame < c.words[i + 1].at);
          return (
            <span key={i}>
              <span
                style={{
                  color: spoken ? C.ink : "#a4a8af",
                  background: now ? "#ffede4" : "transparent",
                  boxShadow: now ? "0 0 0 4px #ffede4" : "none",
                  borderRadius: 8,
                }}
              >
                {w.w}
              </span>
              {i < c.words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
}
