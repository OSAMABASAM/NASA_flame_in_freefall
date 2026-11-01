"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Investigation } from "@/lib/data";
import { cn } from "@/lib/utils";

// Sections below the first screen download and mount only when the reader scrolls near them.
const NetworkView = dynamic(() => import("@/components/network/NetworkView").then((m) => m.NetworkView));
const GapsView = dynamic(() => import("@/components/gaps/GapsView").then((m) => m.GapsView));

// Mounts its children once the spot comes within 800px of the screen. Until then an empty box of the measured
// section height (--h, per screen width) holds the place, so nothing jumps, and the id keeps the header links
// working. Once mounted, the browser still skips layout and paint for the section while it is off screen
// (content-visibility), so moving the slider far above it does not redraw it; it keeps its last real size.
// content-visibility also clips what is drawn outside the box, so 4rem of empty room at the bottom (padding,
// taken back with a negative margin) keeps the hover glow of the last cards whole.
function LazySection({ id, height, children }: { id: string; height: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "800px 0px" });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      id={id}
      className={cn(
        "-mb-16 scroll-mt-16 pb-16 [contain-intrinsic-size:auto_var(--h)] [content-visibility:auto]",
        height,
        !near && "h-[calc(var(--h)+4rem)]",
      )}
    >
      {near && children}
    </div>
  );
}

export const LazyNetwork = ({ investigations }: { investigations: Investigation[] }) => (
  <LazySection id="network" height="[--h:1080px] sm:[--h:937px] md:[--h:913px]">
    <NetworkView investigations={investigations} />
  </LazySection>
);

export const LazyGaps = ({ investigations }: { investigations: Investigation[] }) => (
  <LazySection id="gaps" height="[--h:3540px] sm:[--h:2646px] md:[--h:2428px] lg:[--h:1850px] xl:[--h:1729px]">
    <GapsView investigations={investigations} />
  </LazySection>
);
