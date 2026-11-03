// The flame mark, drawn in SVG, flickering with layered sine motion.
import { useCurrentFrame } from "remotion";

const OUTER = "M60 4 C70 30 100 46 100 84 C100 112 82 130 60 130 C38 130 20 112 20 84 C20 62 34 52 40 34 C46 48 50 52 54 56 C56 38 54 22 60 4 Z";
const MID = "M60 40 C66 58 86 70 86 92 C86 112 74 122 60 122 C46 122 34 112 34 94 C34 80 44 72 48 62 C52 72 54 74 57 76 C58 64 56 54 60 40 Z";
const CORE = "M60 74 C64 86 74 94 74 104 C74 114 68 120 60 120 C52 120 46 114 46 104 C46 96 52 90 55 84 C57 88 58 90 59 90 C60 84 58 80 60 74 Z";

export function Flame({ size = 240, grow = 1, glow = true }: { size?: number; grow?: number; glow?: boolean }) {
  const f = useCurrentFrame();
  const fl = (a: number, b: number) => Math.sin(f * a + b);
  const sy = 1 + 0.05 * fl(0.9, 0) + 0.025 * fl(2.3, 1);
  const sk = 2.5 * fl(0.55, 2) + 1.2 * fl(1.7, 0.4);
  return (
    <svg width={size} height={size * 1.12} viewBox="0 0 120 134" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="glow" cx="50%" cy="70%" r="60%">
          <stop offset="0%" stopColor="#ff8a3d" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ff6a1f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="outer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff8a2a" />
          <stop offset="100%" stopColor="#ff5a12" />
        </linearGradient>
      </defs>
      <g transform={`translate(60 130) scale(${grow}) translate(-60 -130)`}>
        {glow && <ellipse cx="60" cy="96" rx={70 + 6 * fl(0.7, 1)} ry={64 + 5 * fl(0.8, 2)} fill="url(#glow)" />}
        <g transform={`translate(60 130) skewX(${sk}) scale(1 ${sy}) translate(-60 -130)`}>
          <path d={OUTER} fill="url(#outer)" />
          <g transform={`translate(60 128) skewX(${sk * 0.6}) scale(1 ${1 + 0.06 * fl(1.3, 3)}) translate(-60 -128)`}>
            <path d={MID} fill="#ffb238" />
            <path d={CORE} fill="#fff1b8" transform={`translate(60 122) scale(1 ${1 + 0.08 * fl(1.9, 5)}) translate(-60 -122)`} />
          </g>
        </g>
      </g>
    </svg>
  );
}
