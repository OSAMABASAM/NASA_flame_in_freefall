// Scene 4: "Flame in Freefall" card gathers the problem icons, then Rank: Moon Base, oxygen dragged up, cards glide.
import { Database, EyeOff, Info, TrendingUp } from "lucide-react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CUE } from "../cues";
import { Callout } from "../components/Callout";
import { Screen, toScreen } from "../components/Screen";
import { C, FONT, SHADOW, tint } from "../theme";
import { mark, SCENES } from "../timeline";

function BrandCard() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { card, cut } = CUE.rank;
  const s = spring({ frame: frame - card, fps, config: { damping: 13, stiffness: 110 } });
  const out = interpolate(frame, [cut - 6, cut + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (out >= 1) return null;
  const icon = (i: number) => spring({ frame: frame - card - 10 - i * 5, fps, config: { damping: 11, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ display: "grid", placeItems: "center", opacity: 1 - out, transform: `scale(${1 + out * 0.7})`, filter: `blur(${out * 10}px)` }}>
      <div
        style={{
          transform: `scale(${0.55 + 0.45 * s})`,
          opacity: Math.min(1, s * 1.6),
          padding: "48px 72px",
          borderRadius: 40,
          background: "#fff",
          boxShadow: SHADOW + `, 0 0 0 1px ${C.border}, 0 0 80px rgb(255 106 31 / 0.18)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
          fontFamily: FONT,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <Img src={staticFile("brand/space-apps-logo.svg")} style={{ height: 110 }} />
          <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: -2.5, color: C.ink }}>Flame in Freefall</div>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          {[
            [Database, C.blue],
            [EyeOff, C.violet],
          ].map(([I, color], i) => {
            const Icon = I as typeof Database;
            const k = icon(i);
            return (
              <div key={i} style={{ width: 62, height: 62, borderRadius: 18, background: tint(color as string), display: "grid", placeItems: "center", transform: `scale(${k})` }}>
                <Icon size={34} color={color as string} strokeWidth={2.2} />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

export function Rank() {
  const frame = useCurrentFrame();
  const { cut, drag, dragEnd, live, why } = CUE.rank;
  const sc = SCENES[3];
  const slider = mark("rank", "slider");
  const w = mark("rank", "why");
  const rankIn = interpolate(frame, [cut - 6, cut + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const end = sc.dur;
  return (
    <AbsoluteFill style={{ background: "#ebedf0" }}>
      {/* Behind the card: the hero, blurred and dimmed. */}
      {rankIn < 1 && (
        <AbsoluteFill style={{ filter: "blur(18px) brightness(0.92)", transform: "scale(1.08)" }}>
          <Screen segments={[{ clip: "hero", at: 0, from: 11.3, to: 14.2 }]} cam={[]} />
        </AbsoluteFill>
      )}
      {frame >= cut - 6 && (
        <AbsoluteFill style={{ opacity: rankIn, transform: `scale(${1.12 - 0.12 * rankIn})` }}>
          <Screen
            segments={sc.segments!}
            cam={[
              { at: drag - 16, dur: 22, z: 1.7, x: slider.x + slider.w / 2, y: slider.y + 8 },
              { at: dragEnd + 2, dur: 28, z: 1, x: slider.x + slider.w / 2, y: slider.y + 8 },
            ]}
          >
            {(v) => {
              const a = toScreen(v, { x: w.x + w.w / 2, y: w.y + w.h });
              return (
                <>
                  <Callout icon={TrendingUp} color={C.green} title="Re-ranks live" x={560} y={820} from={live} to={why - 6} />
                  <Callout icon={Info} color={C.blue} title="Each one shows why" x={560} y={820} from={why} to={end - 8} anchor={a} />
                </>
              );
            }}
          </Screen>
        </AbsoluteFill>
      )}
      <BrandCard />
    </AbsoluteFill>
  );
}
