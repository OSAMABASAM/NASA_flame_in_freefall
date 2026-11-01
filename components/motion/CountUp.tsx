"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

// Counts from 0 to the real value the first time it is seen. Screen readers get the final value at once.
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const count = useMotionValue(0);
  const text = useTransform(count, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (!seen) return;
    if (reduced) return count.set(value);
    const run = animate(count, value, { duration: 0.45, ease: [0.2, 0, 0, 1] });
    return () => run.stop();
  }, [seen, reduced, value, count]);

  return (
    <>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      <motion.span ref={ref} aria-hidden>
        {text}
      </motion.span>
    </>
  );
}
