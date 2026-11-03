// Custom scene transitions: zoom-through and blur-dissolve (slide and wipe come from @remotion/transitions).
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { AbsoluteFill } from "remotion";

type P = Record<string, never>;
function ZoomThrough({ children, presentationDirection, presentationProgress: p }: TransitionPresentationComponentProps<P>) {
  const style =
    presentationDirection === "exiting"
      ? { transform: `scale(${1 + p * 0.5})`, opacity: 1 - p, filter: `blur(${p * 12}px)` }
      : { transform: `scale(${0.88 + 0.12 * p})`, opacity: p, filter: `blur(${(1 - p) * 8}px)` };
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
}
function BlurDissolve({ children, presentationDirection, presentationProgress: p }: TransitionPresentationComponentProps<P>) {
  const style = presentationDirection === "exiting" ? { filter: `blur(${p * 16}px)` } : { opacity: p, filter: `blur(${(1 - p) * 16}px)` };
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
}
export const zoomThrough = (): TransitionPresentation<P> => ({ component: ZoomThrough, props: {} });
export const blurDissolve = (): TransitionPresentation<P> => ({ component: BlurDissolve, props: {} });
