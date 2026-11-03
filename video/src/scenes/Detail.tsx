// Scene 5: open one card (drawer), short zoom on its details, then compare three side by side.
import { Columns3, FileText } from "lucide-react";
import { interpolate, useCurrentFrame } from "remotion";
import { CUE } from "../cues";
import { Callout } from "../components/Callout";
import { Panel } from "../components/Panel";
import { Screen, toScreen } from "../components/Screen";
import { C } from "../theme";
import { SCENES } from "../timeline";

// The Objective row of the drawer, in page pixels (drawer is the right 576 px).
const OBJECTIVE = { x: 1532, y: 150 };

export function Detail() {
  const frame = useCurrentFrame();
  const { open, plain, cut, side } = CUE.detail;
  const sc = SCENES[4];
  // A quick blur-dissolve hides the cut from the drawer to the compare table.
  const cutBlur = interpolate(frame, [cut - 5, cut, cut + 6], [0, 10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, filter: cutBlur > 0.1 ? `blur(${cutBlur}px)` : undefined }}>
      <Screen
        segments={sc.segments!}
        cam={[
          { at: open + 2, dur: 30, z: 1.3, x: 1700, y: 260 },
          { at: cut - 14, dur: 14, z: 1, x: 1700, y: 260 },
          { at: cut + 8, dur: 50, z: 1.08, x: 960, y: 470 },
          { at: sc.dur - 30, dur: 25, z: 1, x: 960, y: 470 },
        ]}
      >
        {(v) => (
          <>
            <Callout icon={FileText} color={C.fire} title="Plain language" x={900} y={250} from={plain} to={cut - 8} anchor={toScreen(v, { x: OBJECTIVE.x - 14, y: OBJECTIVE.y })} />
            <Panel side="left" top={430} width={330} from={side} to={sc.dur - 6} rows={[{ icon: Columns3, color: C.violet, text: "Side by side", at: side + 4 }]} />
          </>
        )}
      </Screen>
    </div>
  );
}
