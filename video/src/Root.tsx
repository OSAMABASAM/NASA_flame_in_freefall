import "@fontsource-variable/inter";
import { useEffect, useState } from "react";
import { cancelRender, Composition, continueRender, delayRender } from "remotion";
import { CaptionsOnly, Main, type MainProps } from "./Main";
import { FPS, H, TOTAL, W } from "./timeline";

// Wait for Inter before the first frame is taken.
function useFonts() {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    document.fonts.load('700 40px "Inter Variable"').then(() => document.fonts.ready).then(() => continueRender(handle)).catch(cancelRender);
  }, [handle]);
}
function WithFonts<P extends object>({ C, ...p }: { C: React.ComponentType<P> } & P) {
  useFonts();
  return <C {...(p as P)} />;
}
const MainWithFonts = (p: MainProps) => <WithFonts C={Main} {...p} />;
const CaptionsWithFonts = () => <WithFonts C={CaptionsOnly} />;

export const Root = () => (
  <>
    <Composition id="Main" component={MainWithFonts} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{ captions: true, sound: true }} />
    <Composition id="Captions" component={CaptionsWithFonts} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
  </>
);
