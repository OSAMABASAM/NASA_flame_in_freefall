"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// One place for motion timing. reducedMotion="user": no movement when the OS asks for reduced motion.
const EASE_OUT = [0.2, 0, 0, 1] as const;
// The animation engine (about 30 KB) downloads beside the page instead of inside it, so it never delays the first
// screen; the download starts as soon as this file runs. Everything it animates (m.* components) sits below the
// first screen. strict: a stray motion.* import fails loudly.
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
