// Scene 9: end card on white. Each element springs in with a pop, timed to the words.
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CUE } from "../cues";
import { Embers } from "../components/Embers";
import { Flame } from "../components/Flame";
import { C, FONT } from "../theme";

function In({ at, children, y = 30 }: { at: number; children: React.ReactNode; y?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 130, mass: 0.8 } });
  return <div style={{ opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * y}px) scale(${0.85 + 0.15 * s})` }}>{children}</div>;
}

export function End() {
  const { name, title, logo, link } = CUE.end;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 35%, #ffffff 0%, #f4f5f7 60%, #ebedf0 100%)", fontFamily: FONT, alignItems: "center" }}>
      <Embers count={26} opacity={0.7} />
      <div style={{ position: "absolute", top: 70, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <In at={title}>
          <Flame size={150} />
        </In>
        <In at={title + 3}>
          <div style={{ marginTop: 10, fontSize: 112, fontWeight: 800, letterSpacing: -3.5, color: C.ink }}>Flame in Freefall</div>
        </In>
        <In at={name}>
          <div style={{ marginTop: 8, fontSize: 46, fontWeight: 600, color: C.muted, letterSpacing: -0.5 }}>Osama Saleh</div>
        </In>
        <In at={link}>
          <div style={{ marginTop: 28, padding: "14px 30px", borderRadius: 999, background: C.fireSoft, color: C.fireText, fontSize: 36, fontWeight: 650, letterSpacing: -0.3 }}>
            https://flame-in-freefall-five.vercel.app
          </div>
        </In>
        <In at={logo}>
          <Img src={staticFile("brand/space-apps-logo.svg")} style={{ marginTop: 34, height: 112 }} />
        </In>
      </div>
    </AbsoluteFill>
  );
}
