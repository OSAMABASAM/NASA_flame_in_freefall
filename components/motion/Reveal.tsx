"use client";

import type { HTMLMotionProps } from "motion/react";
import * as m from "motion/react-m";

const EASE_OUT = [0.2, 0, 0, 1] as const;

// Fade in and rise 16px the first time an element enters the screen. index staggers siblings by 60ms.
// Spread reveal() straight onto a motion element when a wrapper would break the layout (sticky, list items).
export const reveal = (index = 0, rise = 16) => ({
  initial: { opacity: 0, y: rise },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "0px 0px -40px 0px" },
  transition: { duration: 0.4, delay: index * 0.06, ease: EASE_OUT },
});

// fadeOnly: opacity without a transform, for the network graph (a transform would offset its drag math).
export function Reveal({ index, fadeOnly, ...props }: HTMLMotionProps<"div"> & { index?: number; fadeOnly?: boolean }) {
  return <m.div {...reveal(index, fadeOnly ? 0 : 16)} {...props} />;
}
