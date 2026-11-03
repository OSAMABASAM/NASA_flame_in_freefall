// A white glass card with a colored icon, springing in, with an optional curved arrow to a point on screen.
import type { LucideIcon } from "lucide-react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, SHADOW, tint } from "../theme";

type Props = {
  icon: LucideIcon;
  color: string;
  title: string;
  sub?: string;
  x: number;
  y: number;
  from: number;
  to: number;
  anchor?: { x: number; y: number };
  side?: "left" | "right" | "top" | "bottom";
};

export function Callout({ icon: Icon, color, title, sub, x, y, from, to, anchor }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from - 1 || frame > to + 12) return null;
  const s = spring({ frame: frame - from, fps, config: { damping: 14, stiffness: 160, mass: 0.8 } });
  const out = interpolate(frame, [to, to + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = Math.min(1, s * 1.4) * out;
  const arrow = interpolate(frame - from, [6, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      {anchor && <Arrow x={x} y={y} anchor={anchor} p={arrow} o={out} color={color} />}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * s}) translateY(${(1 - s) * 18}px)`,
          opacity: o,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: sub ? "16px 26px 16px 16px" : "14px 28px 14px 14px",
          borderRadius: 22,
          background: "rgb(255 255 255 / 0.94)",
          backdropFilter: "blur(14px)",
          boxShadow: SHADOW + `, 0 0 0 1px ${C.border}`,
          fontFamily: FONT,
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ width: 52, height: 52, borderRadius: 15, background: tint(color), display: "grid", placeItems: "center" }}>
          <Icon size={30} color={color} strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.4, color: C.ink }}>{title}</div>
          {sub && <div style={{ fontSize: 21, color: C.muted, marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
    </>
  );
}

function Arrow({ x, y, anchor, p, o, color }: { x: number; y: number; anchor: { x: number; y: number }; p: number; o: number; color: string }) {
  const dx = anchor.x - x, dy = anchor.y - y;
  const cx = x + dx * 0.5 + dy * 0.18, cy = y + dy * 0.5 - dx * 0.18;
  const d = `M${x} ${y} Q${cx} ${cy} ${anchor.x} ${anchor.y}`;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: o, overflow: "visible" }}>
      <path d={d} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <circle cx={anchor.x} cy={anchor.y} r={9 * p} fill={color} stroke="#fff" strokeWidth={3} />
    </svg>
  );
}
