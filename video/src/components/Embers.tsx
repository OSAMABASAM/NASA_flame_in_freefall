// Slow floating embers: small orange particles drifting up.
import { random, useCurrentFrame } from "remotion";

export function Embers({ count = 36, opacity = 1 }: { count?: number; opacity?: number }) {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity }}>
      {Array.from({ length: count }, (_, i) => {
        const speed = 0.6 + random(`s${i}`) * 1.1;
        const size = 3 + random(`z${i}`) * 6;
        const y = 1120 - ((frame * speed + random(`o${i}`) * 1200) % 1240);
        const x = random(`x${i}`) * 1920 + Math.sin(frame / (38 + 20 * random(`p${i}`)) + i) * 26;
        const flick = 0.45 + 0.55 * Math.abs(Math.sin(frame / (7 + random(`f${i}`) * 9) + i));
        const hue = random(`h${i}`) > 0.6 ? "255 210 90" : "255 120 40";
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%", background: `rgb(${hue})`, opacity: flick * (y / 1100) * 0.9, boxShadow: `0 0 ${size * 2.5}px rgb(${hue} / 0.9)` }} />
        );
      })}
    </div>
  );
}
