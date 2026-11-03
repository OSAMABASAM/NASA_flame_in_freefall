// A recorded clip (or several cut together) under a spring camera. Camera keys zoom toward a point of the page.
import type { ReactNode } from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CLIPS, FPS, H, segFrames, W, type Segment } from "../timeline";

export type Cam = { at: number; dur?: number; z: number; x: number; y: number };
export type View = { z: number; x: number; y: number };

export function cameraAt(frame: number, keys: Cam[], fps = FPS): View {
  let v: View = { z: 1, x: W / 2, y: H / 2 };
  for (const k of keys) {
    const p = spring({ frame: frame - k.at, fps, config: { damping: 200 }, durationInFrames: k.dur ?? 30 });
    v = { z: v.z + (k.z - v.z) * p, x: v.x + (k.x - v.x) * p, y: v.y + (k.y - v.y) * p };
  }
  return v;
}
// Where a page point lands on screen under the camera.
export const toScreen = (v: View, p: { x: number; y: number }) => ({ x: v.x + (p.x - v.x) * v.z, y: v.y + (p.y - v.y) * v.z });

function Clip({ s }: { s: Segment }) {
  const len = segFrames(s);
  const clipLen = CLIPS[s.clip].duration;
  const playable = Math.min(len, Math.floor(((clipLen - s.from - 0.05) * FPS) / (s.rate ?? 1)));
  const video = (
    <OffthreadVideo
      src={staticFile(`clips/${s.clip}.mp4`)}
      trimBefore={Math.round(s.from * FPS)}
      playbackRate={s.rate ?? 1}
      muted
      style={{ width: W, height: H }}
    />
  );
  return (
    <>
      <Sequence from={s.at} durationInFrames={playable} layout="none">
        {video}
      </Sequence>
      {playable < len && (
        <Sequence from={s.at + playable} durationInFrames={len - playable} layout="none">
          <Freeze frame={playable - 1}>{video}</Freeze>
        </Sequence>
      )}
    </>
  );
}

export function Screen({ segments, cam, children }: { segments: Segment[]; cam: Cam[]; children?: (v: View) => ReactNode }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = cameraAt(frame, cam, fps);
  return (
    <AbsoluteFill style={{ background: "#ebedf0" }}>
      <AbsoluteFill style={{ transformOrigin: `${v.x}px ${v.y}px`, transform: `scale(${v.z})` }}>
        {segments.map((s, i) => (
          <AbsoluteFill key={i}>
            <Clip s={s} />
          </AbsoluteFill>
        ))}
      </AbsoluteFill>
      {children?.(v)}
    </AbsoluteFill>
  );
}
