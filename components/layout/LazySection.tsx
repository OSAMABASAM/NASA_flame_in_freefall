"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Investigation } from "@/lib/data";
import { cn } from "@/lib/utils";

const NetworkView = dynamic(() => import("@/components/network/NetworkView").then((m) => m.NetworkView));
const GapsView = dynamic(() => import("@/components/gaps/GapsView").then((m) => m.GapsView));

// Downloads and mounts the section only when it comes within 800px of the screen. Until then a box of the measured
// height (--h, per breakpoint) holds its place so nothing jumps. content-visibility skips rendering it while off
// screen, but also clips at the box edge, so pb-16/-mb-16 leaves room for the hover glow of the last cards.
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
