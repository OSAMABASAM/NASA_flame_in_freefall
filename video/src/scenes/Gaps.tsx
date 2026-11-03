// Scene 8: research gaps. Zoom on the headline card, pan to the orange Moon cells, a box draws itself around them.
import { AlertTriangle } from "lucide-react";
import { interpolate, useCurrentFrame } from "remotion";
import { CUE } from "../cues";
import { Callout } from "../components/Callout";
import { Screen, toScreen } from "../components/Screen";
import { C } from "../theme";
import { mark, SCENES } from "../timeline";

// The Moon cells (after the pan), in page pixels: from the moon card box, without its title row and row labels.
const cellsOf = (m: { x: number; y: number; w: number; h: number }) => ({ x: m.x + 112, y: m.y + 110, w: m.w - 126, h: m.h - 134 });

export function Gaps() {
  const frame = useCurrentFrame();
  const { pan, box, missing } = CUE.gaps;
  const sc = SCENES[7];
  const head = mark("gaps", "headline");
  const cells = cellsOf(mark("gaps", "moonCard"));
  const cx = cells.x + cells.w / 2, cy = cells.y + cells.h / 2;
  const draw = interpolate(frame, [box, box + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) });
  return (
    <Screen
      segments={sc.segments!}
      cam={[
        { at: 2, dur: 34, z: 1.25, x: head.x + head.w / 2, y: head.y + head.h / 2 },
        { at: pan, dur: 55, z: 1.12, x: cx, y: cy },
        { at: sc.dur - 26, dur: 24, z: 1, x: cx, y: cy },
      ]}
    >
      {(v) => {
        const a = toScreen(v, cells), b = toScreen(v, { x: cells.x + cells.w, y: cells.y + cells.h });
        const pad = 10;
        return (
          <>
            {frame >= box && (
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                <rect x={a.x - pad} y={a.y - pad} width={b.x - a.x + pad * 2} height={b.y - a.y + pad * 2} rx={24} fill="none" stroke={C.amber} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} style={{ filter: "drop-shadow(0 0 10px rgb(217 142 4 / 0.5))" }} />
              </svg>
            )}
            <Callout icon={AlertTriangle} color={C.amber} title="What's missing" x={620} y={430} from={missing} to={sc.dur - 6} anchor={{ x: a.x - pad - 4, y: (a.y + b.y) / 2 }} />
          </>
        );
      }}
    </Screen>
  );
}
