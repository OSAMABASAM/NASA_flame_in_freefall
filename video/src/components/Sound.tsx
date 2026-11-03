// All sound: voice lines, fire crackle and space rumble beds (ducked under the voice), and short effects.
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { ALL_SFX } from "../cues";
import { LINES, sceneStart, TOTAL, VOICE_SPANS, voiceStart } from "../timeline";

const db = (d: number) => Math.pow(10, d / 20);
// 0 when silent, 1 while the voice speaks, with short ramps.
const speaking = (f: number) =>
  Math.max(0, ...VOICE_SPANS.map(([a, b]) => interpolate(f, [a - 6, a, b, b + 9], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

export function Sound() {
  const endAt = sceneStart("end");
  const loud = (f: number) => (f < 140 ? 1 : interpolate(f, [endAt, endAt + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const fire = (f: number) => {
    const base = db(-7.2) + (db(-3.2) - db(-7.2)) * loud(f);
    const fades = interpolate(f, [0, 20, TOTAL - 50, TOTAL - 1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return base * (1 - 0.5 * speaking(f)) * fades;
  };
  const rumble = (f: number) =>
    db(-27) * (1 - 0.5 * speaking(f)) * interpolate(f, [0, 90, TOTAL - 120, TOTAL - 40], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Audio src={staticFile("audio/fire.wav")} volume={fire} />
      <Audio src={staticFile("audio/rumble.wav")} volume={rumble} />
      {LINES.map((l, i) => (
        <Sequence key={i} from={voiceStart(i)} layout="none">
          <Audio src={staticFile(`audio/line${l.line}.wav`)} />
        </Sequence>
      ))}
      {ALL_SFX.map((s, i) => (
        <Sequence key={`s${i}`} from={Math.max(0, s.at)} layout="none">
          <Audio src={staticFile(`audio/sfx/${s.name}.wav`)} volume={s.gain} />
        </Sequence>
      ))}
    </>
  );
}
