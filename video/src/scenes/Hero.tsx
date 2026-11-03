// Scene 3: the hero stat cards. Gentle zoom on the cards; icons for the problem pop in, then fly together.
import { Database, EyeOff, type LucideIcon } from "lucide-react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CUE } from "../cues";
import { Screen } from "../components/Screen";
import { C, FONT, SHADOW, tint } from "../theme";
import { SCENES } from "../timeline";

function Chip({ icon: Icon, color, text, x, y, at, gather }: { icon: LucideIcon; color: string; text: string; x: number; y: number; at: number; gather: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 150, mass: 0.7 } });
  const g = spring({ frame: frame - gather, fps, config: { damping: 200 }, durationInFrames: 24 });
  if (frame < at - 1) return null;
  const px = x + (960 - x) * g, py = y + (540 - y) * g;
  return (
    <div
      style={{
        position: "absolute",
        left: px,
        top: py,
        transform: `translate(-50%,-50%) scale(${(0.6 + 0.4 * s) * (1 - 0.55 * g)})`,
        opacity: Math.min(1, s * 1.5) * (1 - g * 0.9),
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "16px 30px 16px 16px",
        borderRadius: 24,
        background: "rgb(255 255 255 / 0.95)",
        boxShadow: SHADOW + `, 0 0 0 1px ${C.border}`,
        fontFamily: FONT,
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ width: 64, height: 64, borderRadius: 18, background: tint(color), display: "grid", placeItems: "center" }}>
        <Icon size={36} color={color} strokeWidth={2.2} />
      </div>
      <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, color: C.ink }}>{text}</div>
    </div>
  );
}

export function Hero() {
  const { zoomIn, icon1, icon2, gather, zoomOut } = CUE.hero;
  return (
    <Screen
      segments={SCENES[2].segments!}
      cam={[
        { at: zoomIn, dur: 45, z: 1.2, x: 1258, y: 455 },
        { at: zoomOut, dur: 30, z: 1.05, x: 1258, y: 455 },
      ]}
    >
      {() => (
        <>
          <Chip icon={Database} color={C.blue} text="Combustion experiments in microgravity" x={600} y={300} at={icon1} gather={gather} />
          <Chip icon={EyeOff} color={C.violet} text="Hard to read" x={430} y={720} at={icon2} gather={gather} />
        </>
      )}
    </Screen>
  );
}
