"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// One place for motion timing. reducedMotion="user": no movement when the OS asks for reduced motion.
const EASE_OUT = [0.2, 0, 0, 1] as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.2, ease: EASE_OUT }}>
      {children}
    </MotionConfig>
  );
}
