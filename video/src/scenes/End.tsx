// Scene 9: end card on white. Each element springs in with a pop, timed to the words.
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { siGithub } from "simple-icons";
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

// LinkedIn is not in simple-icons, so a plain "in" badge stands in for its icon.
const LinkedIn = () => (
  <span style={{ width: 26, height: 26, borderRadius: 6, background: "#0a66c2", color: "#fff", fontSize: 17, fontWeight: 800, display: "inline-grid", placeItems: "center", letterSpacing: -0.5 }}>in</span>
);
const GitHub = () => (
  <svg width={26} height={26} viewBox="0 0 24 24">
    <path d={siGithub.path} fill={C.ink} />
  </svg>
);

export function End() {
  const { name, title, logo, link } = CUE.end;
  const social = link + 14;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 35%, #ffffff 0%, #f4f5f7 60%, #ebedf0 100%)", fontFamily: FONT, alignItems: "center" }}>
      <Embers count={26} opacity={0.7} />
      <div style={{ position: "absolute", top: 40, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <In at={title}>
          <Flame size={120} />
        </In>
        <In at={title + 3}>
          <div style={{ marginTop: 10, fontSize: 112, fontWeight: 800, letterSpacing: -3.5, color: C.ink }}>Flame in Freefall</div>
        </In>
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 26 }}>
          <In at={name} y={0}>
            <Img src={staticFile("brand/me.png")} style={{ width: 140, height: 140, borderRadius: "50%", objectFit: "cover", border: "4px solid #fff", boxShadow: "0 6px 22px rgb(0 0 0 / 0.14)" }} />
          </In>
          <div>
            <In at={name + 4}>
              <div style={{ fontSize: 46, fontWeight: 650, color: C.ink, letterSpacing: -0.5 }}>Osama Saleh</div>
            </In>
            <In at={social} y={12}>
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12, fontSize: 25, fontWeight: 500, color: C.muted }}>
                <LinkedIn /> Osama Basam <span style={{ margin: "0 8px", color: "#b9bcc2" }}>·</span> <GitHub /> OSAMABASAM
              </div>
            </In>
          </div>
        </div>
        <In at={link}>
          <div style={{ marginTop: 30, padding: "14px 32px", borderRadius: 999, background: C.fireSoft, color: C.fireText, fontSize: 40, fontWeight: 700, letterSpacing: -0.3 }}>
            https://flame-in-freefall-five.vercel.app
          </div>
        </In>
        <In at={logo}>
          <Img src={staticFile("brand/space-apps-logo.svg")} style={{ marginTop: 26, height: 92 }} />
        </In>
      </div>
    </AbsoluteFill>
  );
}
