// Scene 7: zoom toward the ask box, type the Moon Base question, cited answer, click one citation.
import { Quote } from "lucide-react";
import { CUE } from "../cues";
import { Callout } from "../components/Callout";
import { Screen, toScreen } from "../components/Screen";
import { C } from "../theme";
import { mark, SCENES } from "../timeline";

export function Ask() {
  const { zoom, answer, source, jump } = CUE.ask;
  const sc = SCENES[6];
  const box = mark("ask", "askBox"), cite = mark("ask", "cite"), target = mark("ask", "target");
  return (
    <Screen
      segments={sc.segments!}
      cam={[
        { at: zoom, dur: 34, z: 1.4, x: box.x + box.w / 2, y: box.y + box.h / 2 },
        { at: answer + 2, dur: 30, z: 1.12, x: 686, y: 700 },
        { at: jump + 2, dur: 22, z: 1.15, x: target.x + target.w / 2, y: target.y + target.h / 2 },
      ]}
    >
      {(v) => (
        <Callout icon={Quote} color={C.fire} title="Every claim has a source" x={1300} y={700} from={source} to={jump - 16} anchor={toScreen(v, { x: cite.x + cite.w / 2, y: cite.y - 2 })} />
      )}
    </Screen>
  );
}
