"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import type { ReactNode } from "react";
import { CountUp } from "@/components/motion/CountUp";
import { reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

export type HeroNumbers = {
  total: number;
  withOxygen: number;
  sourced: number;
  byArea: { label: string; value: number; science?: boolean }[];
};

const pct = (k: number, n: number) => (n ? Math.round((k / n) * 100) : 0);

// Light parallax: each card drifts up a different amount (at most 20px) over the first 600px of scroll.
function useDrift(depth: number) {
  const { scrollY } = useScroll();
  return useTransform(scrollY, [0, 600], [0, -depth], { clamp: true });
}

type TileProps = { drift?: MotionValue<number>; index: number; span?: string; surface: string; compact?: boolean; children: ReactNode };

function Tile({ drift, index, span, surface, compact, children }: TileProps) {
  return (
    <motion.div style={drift ? { y: drift } : undefined} className={span}>
      <motion.div {...reveal(index)} className={cn("glow flex h-full flex-col rounded-2xl p-5", !compact && "min-h-44", surface)}>
        {children}
      </motion.div>
    </motion.div>
  );
}

// Hero bento row. Every number is counted from data/investigations.json at build time.
export function HeroStats({ total, withOxygen, sourced, byArea }: HeroNumbers) {
  const reduced = useReducedMotion();
  const drifts = [useDrift(8), useDrift(12), useDrift(14), useDrift(20)].map((d) => (reduced ? undefined : d));
  const max = Math.max(1, ...byArea.map((a) => a.value));

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:mt-7">
      <Tile drift={drifts[0]} index={0} surface="bg-card">
        <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1.5">
          <p className="card-label">Investigations</p>
          <span className="pill bg-charcoal text-charcoal-foreground">NASA PSI</span>
        </div>
        <p className="mt-auto pt-6 text-6xl leading-none font-bold tracking-tighter tabular-nums">
          <CountUp value={total} />
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Microgravity fire experiments</p>
      </Tile>

      <Tile drift={drifts[1]} index={1} surface="bg-fire text-fire-foreground">
        <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1.5">
          <p className="card-label">Oxygen data</p>
          <span className="pill bg-charcoal text-charcoal-foreground">{pct(withOxygen, total)}%</span>
        </div>
        <p className="mt-auto pt-6 text-6xl leading-none font-bold tracking-tighter tabular-nums">
          <CountUp value={withOxygen} />
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-fire-muted/20">
          <div className="h-full rounded-full bg-fire-foreground" style={{ width: `${pct(withOxygen, total)}%` }} />
        </div>
        <p className="mt-2 text-xs text-fire-muted">of {total} state an oxygen range</p>
      </Tile>

      <Tile drift={drifts[2]} index={2} span="col-span-2" surface="bg-charcoal text-charcoal-foreground">
        <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1.5">
          <p className="card-label">Investigations per safety area</p>
          <span className="pill bg-card text-foreground">{total} total</span>
        </div>
        <ul className="mt-5 grid grid-cols-4 gap-3">
          {byArea.map((a, i) => (
            <li key={a.label} className="flex min-w-0 flex-col items-start">
              <span className="text-2xl leading-none font-bold tabular-nums">{a.value}</span>
              <span className="relative mt-2 block h-24 w-7 overflow-hidden rounded-full bg-charcoal-raised">
                <motion.span
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
                  className={cn("absolute inset-x-0 bottom-0 origin-bottom rounded-full", a.science ? "bg-charcoal-muted" : "bg-fire")}
                  style={{ height: `${(a.value / max) * 100}%` }}
                />
              </span>
              <span className="mt-2 w-full truncate text-[11px] text-charcoal-muted">{a.label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-charcoal-muted">One investigation can cover two areas.</p>
      </Tile>

      <Tile drift={drifts[3]} index={3} span="col-span-2" surface="bg-sun text-sun-foreground" compact>
        <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1.5">
          <p className="card-label">Linked to a source</p>
          <span className="pill bg-charcoal text-charcoal-foreground">{pct(sourced, total)}%</span>
        </div>
        <div className="mt-3 flex items-end gap-3">
          <p className="text-5xl leading-none font-bold tracking-tighter tabular-nums">
            <CountUp value={sourced} />
          </p>
          <p className="pb-1 text-xs text-sun-muted">of {total} link to a NASA page</p>
        </div>
      </Tile>
    </div>
  );
}
