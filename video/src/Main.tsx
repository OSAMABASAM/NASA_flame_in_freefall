import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { springTiming, TransitionSeries, type TransitionPresentation } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { Fragment } from "react";
import { AbsoluteFill } from "remotion";
import { Captions } from "./components/Captions";
import { Progress } from "./components/Progress";
import { Sound } from "./components/Sound";
import { Ask } from "./scenes/Ask";
import { Detail } from "./scenes/Detail";
import { End } from "./scenes/End";
import { Gaps } from "./scenes/Gaps";
import { Hero } from "./scenes/Hero";
import { MoonScene } from "./scenes/MoonScene";
import { Network } from "./scenes/Network";
import { Rank } from "./scenes/Rank";
import { Title } from "./scenes/Title";
import { SCENES, T } from "./timeline";
import { blurDissolve, zoomThrough } from "./transitions";

const VIEWS = [Title, MoonScene, Hero, Rank, Detail, Network, Ask, Gaps, End];
// Transition into scene i+1.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const INTO: TransitionPresentation<any>[] = [blurDissolve(), fade(), zoomThrough(), slide({ direction: "from-right" }), wipe({ direction: "from-left" }), zoomThrough(), slide({ direction: "from-bottom" }), blurDissolve()];
const timing = springTiming({ config: { damping: 200 }, durationInFrames: T });

export type MainProps = { captions: boolean; sound: boolean };

export function Main({ captions, sound }: MainProps) {
  return (
    <AbsoluteFill style={{ background: "#ebedf0" }}>
      <TransitionSeries>
        {SCENES.map((s, i) => {
          const View = VIEWS[i];
          return (
            <Fragment key={s.id}>
              <TransitionSeries.Sequence durationInFrames={s.dur}>
                <View />
              </TransitionSeries.Sequence>
              {i < SCENES.length - 1 && <TransitionSeries.Transition presentation={INTO[i]} timing={timing} />}
            </Fragment>
          );
        })}
      </TransitionSeries>
      <Progress />
      {captions && <Captions />}
      {sound && <Sound />}
    </AbsoluteFill>
  );
}

// Captions alone on a transparent background, for the overlay render.
export function CaptionsOnly() {
  return (
    <AbsoluteFill>
      <Captions />
    </AbsoluteFill>
  );
}
