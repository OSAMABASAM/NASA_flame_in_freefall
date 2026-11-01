"use client";

import { motion } from "motion/react";
import { useCallback, useDeferredValue, useState } from "react";
import { CompareTable } from "@/components/compare/CompareTable";
import { DetailDrawer } from "@/components/detail/DetailDrawer";
import { Reveal, reveal } from "@/components/motion/Reveal";
import { HowItWorks } from "@/components/rank/HowItWorks";
import { RankCard } from "@/components/rank/RankCard";
import { Button } from "@/components/ui/button";
import type { Investigation } from "@/lib/data";
import { AREAS, HABITATS, rank, type Area, type Habitat } from "@/lib/score";

const label = "card-label text-charcoal-muted";

export function RankView({ investigations }: { investigations: Investigation[] }) {
  const [habitat, setHabitat] = useState<Habitat>("spacecraft");
  const [oxygen, setOxygen] = useState(21);
  const [area, setArea] = useState<Area>("all");
  const [detail, setDetail] = useState<Investigation | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  // The slider and controls update at once; the card list follows at lower priority, so dragging stays smooth.
  const [dHabitat, dOxygen, dArea] = [useDeferredValue(habitat), useDeferredValue(oxygen), useDeferredValue(area)];
  const ranked = rank(investigations, { habitat: dHabitat, oxygen: dOxygen, area: dArea });
  const pickedInvs = picked.map((id) => investigations.find((i) => i.id === id)!);
  const toggle = useCallback((id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])), []);

  return (
    <section id="rank" className="mx-auto max-w-6xl scroll-mt-16 px-4 pt-20 sm:px-6">
      <Reveal className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <p className="card-label text-accent-foreground">Rank</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">Rank for your habitat</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {investigations.length} investigations, scored by a transparent formula. Change a setting and the order updates.
          </p>
        </div>
        <HowItWorks />
      </Reveal>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[17rem_1fr]">
        <motion.div {...reveal(1)} className="space-y-7 rounded-2xl bg-charcoal p-6 text-charcoal-foreground lg:sticky lg:top-20">
          <label className="block">
            <span className={label}>Habitat</span>
            <select
              value={habitat}
              onChange={(e) => setHabitat(e.target.value as Habitat)}
              className="mt-2 block h-11 w-full rounded-full bg-card px-4 text-sm font-medium text-foreground"
            >
              {HABITATS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
            {habitat === "moon_base" && (
              <span className="mt-2 block text-xs leading-relaxed text-charcoal-muted">
                No NASA record names the Moon, so this scores Moon Base oxygen and pressure instead.
              </span>
            )}
          </label>
          <label className="block">
            <span className="flex items-baseline justify-between">
              <span className={label}>Oxygen in the cabin air</span>
              <span className="text-4xl leading-none font-bold tracking-tight text-fire tabular-nums">{oxygen}%</span>
            </span>
            <input
              type="range"
              min={15}
              max={40}
              value={oxygen}
              onChange={(e) => setOxygen(Number(e.target.value))}
              className="mt-3 block w-full"
            />
            <span className="relative mt-1 flex justify-between font-mono text-[11px] text-charcoal-muted">
              <span>15%</span>
              <span className="absolute left-[24%] -translate-x-1/2">Earth 21</span>
              <span>40%</span>
            </span>
          </label>
          <div role="group" aria-label="Safety area">
            <span className={label}>Safety area</span>
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-3xl bg-charcoal-raised p-1 text-sm">
              {AREAS.map((a) => (
                <Button
                  key={a}
                  variant="ghost"
                  size="sm"
                  aria-pressed={area === a}
                  onClick={() => setArea(a)}
                  className="rounded-full font-medium text-charcoal-muted capitalize hover:bg-charcoal hover:text-charcoal-foreground aria-pressed:bg-card aria-pressed:text-foreground"
                >
                  {a}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        <ol className="grid gap-4 md:grid-cols-2">
          {ranked.map((item, i) => (
            <RankCard
              key={item.inv.id}
              item={item}
              place={i + 1}
              picked={picked.includes(item.inv.id)}
              pickDisabled={!picked.includes(item.inv.id) && picked.length >= 3}
              onDetails={setDetail}
              onTogglePick={toggle}
            />
          ))}
        </ol>
      </div>

      {picked.length > 0 && (
        <div className="sticky bottom-4 z-20 mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-3xl bg-charcoal p-3 pl-5 text-sm text-charcoal-foreground shadow-lift sm:rounded-full sm:p-2 sm:pl-5">
          <span>
            <span className="font-medium">{picked.length} of 3 picked:</span>{" "}
            <span className="font-mono text-xs text-fire">{picked.join(", ")}</span>
            {picked.length < 2 && <span className="text-charcoal-muted"> (pick at least 2)</span>}
          </span>
          <span className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPicked([])} className="text-charcoal-muted hover:bg-charcoal-raised hover:text-charcoal-foreground">
              Clear
            </Button>
            <Button size="sm" disabled={picked.length < 2} onClick={() => setComparing(true)}>
              Compare
            </Button>
          </span>
        </div>
      )}

      <DetailDrawer inv={detail} onClose={() => setDetail(null)} />
      <CompareTable invs={pickedInvs} open={comparing && picked.length >= 2} onClose={() => setComparing(false)} />
    </section>
  );
}
