"use client";

import { motion, useScroll } from "motion/react";

// Thin orange bar at the top of the page that fills as you scroll. Follows the scroll, never drives it.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-primary"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
