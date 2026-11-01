"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

// Scroll motion: the block glides up a little and fades in once, when it enters the screen.
// Same 500 ms glide as the hero; MotionConfig reducedMotion="user" drops the movement.
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}
