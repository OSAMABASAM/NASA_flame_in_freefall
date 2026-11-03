// Scene 1: black, a spark lights the flame, the title springs in letter by letter.
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CUE } from "../cues";
import { Embers } from "../components/Embers";
import { Flame } from "../components/Flame";
import { FONT } from "../theme";

const TITLE = "Flame in Freefall";

export function Title() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { spark, titleIn } = CUE.title;
  const grow = spring({ frame: frame - spark - 4, fps, config: { damping: 12, stiffness: 60 } });
  const lift = spring({ frame: frame - titleIn + 8, fps, config: { damping: 200 }, durationInFrames: 30 });
  const burst = frame - spark;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, #1a1210 0%, #050505 70%)" }}>
      <Embers count={30} opacity={interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {/* Spark: a bright point with a few flying bits. */}
      {burst >= 0 && burst < 18 && (
        <div style={{ position: "absolute", left: 960, top: 560 - lift * 150 }}>
          <div style={{ position: "absolute", width: 16, height: 16, left: -8, top: -8, borderRadius: "50%", background: "#fff6d6", opacity: 1 - burst / 18, boxShadow: "0 0 40px 18px rgb(255 170 60 / 0.8)" }} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = random(`a${i}`) * Math.PI * 2, d = burst * (6 + random(`d${i}`) * 10);
            return <div key={i} style={{ position: "absolute", left: Math.cos(a) * d, top: Math.sin(a) * d + burst * burst * 0.25, width: 4, height: 4, borderRadius: 2, background: "#ffd27a", opacity: 1 - burst / 18 }} />;
          })}
        </div>
      )}
      <div style={{ position: "absolute", left: 960 - 110, top: 560 - 246 - lift * 150, opacity: grow > 0.01 ? 1 : 0 }}>
        <Flame size={220} grow={grow} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: FONT, fontSize: 132, fontWeight: 800, letterSpacing: -4, color: "#fff" }}>
        {TITLE.split("").map((ch, i) => {
          const s = spring({ frame: frame - titleIn - i * 2, fps, config: { damping: 13, stiffness: 140, mass: 0.7 } });
          return (
            <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 40}px)`, filter: `blur(${(1 - Math.min(1, s)) * 8}px)` }}>
              {ch}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
