// Scene 6: hover a node, its neighbors light up; a soft pulse ring marks the hovered node.
import { Share2 } from "lucide-react";
import { useCurrentFrame } from "remotion";
import { CUE } from "../cues";
import { Callout } from "../components/Callout";
import { Screen, toScreen } from "../components/Screen";
import { C } from "../theme";
import { mark, SCENES } from "../timeline";

function Pulse({ x, y, from, to }: { x: number; y: number; from: number; to: number }) {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return (
    <>
      {[0, 1].map((k) => {
        const t = (((frame - from) / 36 + k / 2) % 1);
        return (
          <div key={k} style={{ position: "absolute", left: x, top: y, width: 140, height: 140, marginLeft: -70, marginTop: -70, borderRadius: "50%", border: `4px solid ${C.fire}`, transform: `scale(${0.25 + t * 0.9})`, opacity: (1 - t) * 0.8, boxShadow: "0 0 24px rgb(255 106 31 / 0.5)" }} />
        );
      })}
    </>
  );
}

export function Network() {
  const { zoom, hover1, hover2, connect } = CUE.network;
  const sc = SCENES[5];
  const n1 = mark("network", "hover1"), n2 = mark("network", "hover2");
  return (
    <Screen
      segments={sc.segments!}
      cam={[
        { at: zoom, dur: 45, z: 1.28, x: 960, y: 330 },
        { at: sc.dur - 34, dur: 28, z: 1, x: 960, y: 330 },
      ]}
    >
      {(v) => {
        const p1 = toScreen(v, n1), p2 = toScreen(v, n2);
        return (
          <>
            <Pulse x={p1.x} y={p1.y} from={hover1 + 8} to={hover2 + 4} />
            <Pulse x={p2.x} y={p2.y} from={hover2 + 24} to={sc.dur} />
            <Callout icon={Share2} color={C.blue} title="See how they connect" x={1660} y={330} from={connect} to={sc.dur - 10} />
          </>
        );
      }}
    </Screen>
  );
}
