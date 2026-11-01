"use client";

import { useEffect, useRef } from "react";

// Scroll progress bar and hero parallax. globals.css drives both with scroll-driven animations; this is the
// fallback for browsers without them.
export function ScrollEffects() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (CSS.supports("animation-timeline: scroll()")) return;
    const drifts = [...document.querySelectorAll<HTMLElement>(".drift")];
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const draw = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.current!.style.scale = `${max > 0 ? scrollY / max : 0} 1`;
      if (still) return;
      const t = Math.min(scrollY, 600) / 600;
      for (const d of drifts) d.style.translate = `0 ${-t * Number(d.style.getPropertyValue("--drift"))}px`;
    };
    const onScroll = () => (frame ||= requestAnimationFrame(draw));
    draw();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return <div ref={bar} aria-hidden className="scroll-progress fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-primary" />;
}
