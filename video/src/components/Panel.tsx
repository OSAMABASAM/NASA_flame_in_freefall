// A glass side panel that slides in with rows of icon + text, then slides out.
import type { LucideIcon } from "lucide-react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, SHADOW, tint } from "../theme";

export type Row = { icon: LucideIcon; color: string; text: string; at: number };

export function Panel({ side, rows, from, to, top = 300, width = 560 }: { side: "left" | "right"; rows: Row[]; from: number; to: number; top?: number; width?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from - 1 || frame > to + 20) return null;
  const s = spring({ frame: frame - from, fps, config: { damping: 18, stiffness: 120 } });
  const out = spring({ frame: frame - to, fps, config: { damping: 200 }, durationInFrames: 18 });
  const shift = (1 - s + out) * (width + 120) * (side === "right" ? 1 : -1);
  return (
    <div
      style={{
        position: "absolute",
        top,
        [side]: 70,
        width,
        transform: `translateX(${shift}px)`,
        padding: 26,
        borderRadius: 28,
        background: "rgb(255 255 255 / 0.93)",
        backdropFilter: "blur(16px)",
        boxShadow: SHADOW + `, 0 0 0 1px ${C.border}`,
        fontFamily: FONT,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {rows.map((r, i) => {
        const rs = spring({ frame: frame - r.at, fps, config: { damping: 13, stiffness: 170, mass: 0.7 } });
        const o = interpolate(rs, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, opacity: o, transform: `translateY(${(1 - rs) * 16}px)` }}>
            <div style={{ flex: "none", width: 60, height: 60, borderRadius: 17, background: tint(r.color), display: "grid", placeItems: "center", transform: `scale(${0.6 + 0.4 * rs})` }}>
              <r.icon size={33} color={r.color} strokeWidth={2.2} />
            </div>
            <div style={{ fontSize: 30, fontWeight: 650, letterSpacing: -0.4, color: C.ink, lineHeight: 1.2 }}>{r.text}</div>
          </div>
        );
      })}
    </div>
  );
}
