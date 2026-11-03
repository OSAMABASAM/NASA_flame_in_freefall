import { useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";

export function Progress() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return <div style={{ position: "absolute", left: 0, bottom: 0, height: 6, width: `${(frame / (durationInFrames - 1)) * 100}%`, background: C.fire, boxShadow: "0 0 12px rgb(255 106 31 / 0.6)" }} />;
}
