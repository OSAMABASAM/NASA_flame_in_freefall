// A simple SVG Moon: shaded sphere, craters drifting across (slow rotation) and a soft glow.
import { random, useCurrentFrame } from "remotion";

const CRATERS = Array.from({ length: 26 }, (_, i) => ({ u: random(`cu${i}`), v: 0.12 + random(`cv${i}`) * 0.76, r: 8 + random(`cr${i}`) * 34 }));

export function Moon({ r = 300 }: { r?: number }) {
  const f = useCurrentFrame();
  return (
    <svg width={r * 2.6} height={r * 2.6} viewBox={`${-r * 1.3} ${-r * 1.3} ${r * 2.6} ${r * 2.6}`}>
      <defs>
        <radialGradient id="mglow" r="50%">
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mbody" cx="38%" cy="34%" r="75%">
          <stop offset="0%" stopColor="#f2f2f0" />
          <stop offset="60%" stopColor="#c9cacb" />
          <stop offset="100%" stopColor="#8d8f93" />
        </radialGradient>
        <radialGradient id="mshade" cx="25%" cy="30%" r="95%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
        <clipPath id="mclip">
          <circle r={r} />
        </clipPath>
      </defs>
      <circle r={r * 1.28} fill="url(#mglow)" />
      <circle r={r} fill="url(#mbody)" />
      <g clipPath="url(#mclip)">
        {CRATERS.map((c, i) => {
          const u = ((c.u + f * 0.0016) % 1) * 2 - 1; // -1..1 across the face
          const x = Math.sin((u * Math.PI) / 2) * r;
          const y = (c.v * 2 - 1) * r;
          const squash = Math.cos((u * Math.PI) / 2);
          return (
            <ellipse key={i} cx={x} cy={y} rx={c.r * Math.max(0.05, squash)} ry={c.r} fill="#9a9c9f" opacity={0.55 * squash} stroke="#e9e9e7" strokeOpacity={0.5 * squash} strokeWidth={2} />
          );
        })}
      </g>
      <circle r={r} fill="url(#mshade)" />
    </svg>
  );
}
