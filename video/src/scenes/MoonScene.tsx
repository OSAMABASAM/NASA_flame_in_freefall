// Scene 2: the Moon turns slowly in its glow, then a zoom-through into the site's first screen and a side panel.
import { Flame as FlameIcon, Moon as MoonIcon } from "lucide-react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { CUE } from "../cues";
import { Embers } from "../components/Embers";
import { Moon } from "../components/Moon";
import { Panel } from "../components/Panel";
import { Screen } from "../components/Screen";
import { SCENES } from "../timeline";
import { C } from "../theme";

const STARS = Array.from({ length: 140 }, (_, i) => ({ x: random(`sx${i}`) * 1920, y: random(`sy${i}`) * 1080, r: 0.6 + random(`sr${i}`) * 1.8, p: random(`sp${i}`) * 6 }));

export function MoonScene() {
  const frame = useCurrentFrame();
  const { through, heroIn, panel, panelOut } = CUE.moon;
  const zoom = interpolate(frame, [through - 10, heroIn + 4], [1, 7], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * t });
  const spaceO = interpolate(frame, [heroIn - 4, heroIn + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const heroScale = interpolate(frame, [heroIn - 4, heroIn + 20], [1.35, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) });
  const heroBlur = interpolate(frame, [heroIn - 4, heroIn + 14], [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const drift = interpolate(frame, [0, through], [1, 1.06]);
  return (
    <AbsoluteFill style={{ background: "#050608" }}>
      {frame >= heroIn - 6 && (
        <AbsoluteFill style={{ transform: `scale(${heroScale})`, filter: `blur(${heroBlur}px)` }}>
          <Screen segments={SCENES[1].segments!} cam={[]} />
        </AbsoluteFill>
      )}
      {spaceO > 0 && (
        <AbsoluteFill style={{ opacity: spaceO, background: "radial-gradient(ellipse at 50% 50%, #12151c 0%, #040507 75%)" }}>
          {STARS.map((s, i) => (
            <div key={i} style={{ position: "absolute", left: s.x, top: s.y, width: s.r * 2, height: s.r * 2, borderRadius: "50%", background: "#fff", opacity: 0.35 + 0.45 * Math.abs(Math.sin(frame / 18 + s.p)) }} />
          ))}
          <AbsoluteFill style={{ display: "grid", placeItems: "center", transform: `scale(${drift * zoom})` }}>
            <Moon r={300} />
          </AbsoluteFill>
          <Embers count={24} />
        </AbsoluteFill>
      )}
      <Panel
        side="right"
        top={330}
        width={600}
        from={panel}
        to={panelOut}
        rows={[
          { icon: MoonIcon, color: C.violet, text: "Back to the Moon", at: panel + 4 },
          { icon: FlameIcon, color: C.fire, text: "Fire behaves differently without gravity", at: panel + 10 },
        ]}
      />
    </AbsoluteFill>
  );
}
