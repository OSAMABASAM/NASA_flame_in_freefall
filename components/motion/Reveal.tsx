"use client";

import type { HTMLMotionProps } from "motion/react";
import * as m from "motion/react-m";
import { EASE_OUT } from "./MotionProvider";

// Fade in and rise the first time an element enters the screen. Spread reveal() onto a motion element directly
// when a wrapper div would break the layout (sticky, list items).
export const reveal = (index = 0, rise = 16) => ({
  initial: { opacity: 0, y: rise },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "0px 0px -40px 0px" },
  transition: { duration: 0.4, delay: index * 0.06, ease: EASE_OUT },
});

// fadeOnly skips the transform, which would offset the network graph's drag math.
export function Reveal({ index, fadeOnly, ...props }: HTMLMotionProps<"div"> & { index?: number; fadeOnly?: boolean }) {
  return <m.div {...reveal(index, fadeOnly ? 0 : 16)} {...props} />;
}
