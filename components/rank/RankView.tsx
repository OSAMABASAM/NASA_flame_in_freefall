"use client";

import { useState } from "react";
import { CompareTable } from "@/components/compare/CompareTable";
import { DetailDrawer } from "@/components/detail/DetailDrawer";
import { HowItWorks } from "@/components/rank/HowItWorks";
import { RankCard } from "@/components/rank/RankCard";
import { Button } from "@/components/ui/button";
import type { Investigation } from "@/lib/data";
import { AREAS, HABITATS, rank, type Area, type Habitat } from "@/lib/score";

const label = "text-xs font-medium text-muted-foreground";

export function RankView({ investigations }: { investigations: Investigation[] }) {
  const [habitat, setHabitat] = useState<Habitat>("spacecraft");
  const [oxygen, setOxygen] = useState(21);
  const [area, setArea] = useState<Area>("all");
  const [detail, setDetail] = useState<Investigation | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const ranked = rank(investigations, { habitat, oxygen, area });
  const pickedInvs = picked.map((id) => investigations.find((i) => i.id === id)!);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <section id="rank" className="mx-auto max-w-6xl scroll-mt-14 px-4 pt-14 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Rank for your habitat</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {investigations.length} investigations, scored by a transparent formula. Change a setting and the order updates.
          </p>
        </div>
        <HowItWorks />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[17rem_1fr]">
        <div className="space-y-6 rounded-xl border bg-card p-5 lg:sticky lg:top-20">
          <label className="block">
            <span className={label}>Habitat</span>
            <select
              value={habitat}
              onChange={(e) => setHabitat(e.target.value as Habitat)}
              className="mt-2 block h-10 w-full rounded-md border border-input bg-raised px-3 text-sm"
            >
              {HABITATS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
            {habitat === "moon_base" && (
              <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                No NASA record names the Moon, so this scores Moon Base oxygen and pressure instead.
              </span>
            )}
          </label>
          <label className="block">
            <span className="flex items-baseline justify-between">
              <span className={label}>Oxygen in the cabin air</span>
              <span className="font-mono text-lg font-medium text-accent-foreground tabular-nums">{oxygen}%</span>
            </span>
            <input
              type="range"
              min={15}
              max={40}
              value={oxygen}
              onChange={(e) => setOxygen(Number(e.target.value))}
              className="mt-3 block w-full"
            />
            <span className="relative mt-1 flex justify-between font-mono text-[11px] text-muted-foreground">
              <span>15%</span>
              <span className="absolute left-[24%] -translate-x-1/2">Earth 21</span>
              <span>40%</span>
            </span>
          </label>
          <div role="group" aria-label="Safety area">
            <span className={label}>Safety area</span>
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg bg-raised p-1 text-sm">
              {AREAS.map((a) => (
                <button
                  key={a}
                  aria-pressed={area === a}
                  onClick={() => setArea(a)}
                  className="h-8 rounded-md capitalize text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-sm aria-pressed:ring-1 aria-pressed:ring-border"
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ol className="grid gap-4 md:grid-cols-2">
          {ranked.map((item, i) => (
            <RankCard
              key={item.inv.id}
              item={item}
              place={i + 1}
              picked={picked.includes(item.inv.id)}
              pickDisabled={!picked.includes(item.inv.id) && picked.length >= 3}
              onDetails={() => setDetail(item.inv)}
              onTogglePick={() => toggle(item.inv.id)}
            />
          ))}
        </ol>
      </div>

      {picked.length > 0 && (
        <div className="sticky bottom-4 z-20 mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/40 bg-card/95 p-3 pl-4 text-sm shadow-2xl shadow-black/50 backdrop-blur">
          <span>
            <span className="font-medium">{picked.length} of 3 picked:</span>{" "}
            <span className="font-mono text-xs text-accent-foreground">{picked.join(", ")}</span>
            {picked.length < 2 && <span className="text-muted-foreground"> (pick at least 2)</span>}
          </span>
          <span className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPicked([])}>
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
