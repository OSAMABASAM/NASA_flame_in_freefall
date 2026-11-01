"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

export const EASE_OUT = [0.2, 0, 0, 1] as const;

// The animation engine (about 30 KB) downloads beside the page, not inside it, so it never delays the first screen.
// Everything it animates sits below the first screen. strict makes a stray motion.* import fail loudly.
const loading = import("./features").then((m) => m.default);
const features = () => loading;

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={features} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.2, ease: EASE_OUT }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
