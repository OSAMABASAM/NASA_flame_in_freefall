"use client";

import { useState } from "react";
import type { Investigation } from "@/lib/data";
import { AREAS, HABITATS, MOON_O2_PCT, MOON_PSIA, rank, type Area, type Habitat } from "@/lib/score";

function HowItWorks() {
  return (
    <>
      <button popoverTarget="how-score" className="shrink-0 text-sm underline underline-offset-4">
        How the score works
      </button>
      <div
        id="how-score"
        popover="auto"
        className="m-auto max-w-md rounded-lg border bg-background p-5 text-sm leading-relaxed shadow-lg"
      >
        <p className="font-medium">Score out of 100, a plain sum:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>35: the investigation was run for the chosen habitat.</li>
          <li>25: your oxygen level is inside the tested range (12.5 if within 10 points of it).</li>
          <li>20: it covers the chosen safety area (everyone gets these with &quot;all&quot;).</li>
          <li>10: it has airflow data.</li>
          <li>10: its data was checked against NASA sources.</li>
        </ul>
        <p className="mt-3">
          <span className="font-medium">Moon Base:</span> no NASA record names the Moon, so its 35 points go to
          conditions instead: 17.5 if tested at {MOON_O2_PCT}% oxygen or more, 17.5 if tested at {MOON_PSIA} psia
          (70.3 kPa) or less. These are NASA&apos;s planned exploration atmospheres as listed in the{" "}
          <a href="https://psi.nasa.gov/physci/repo/data/investigations/PSI-20" className="underline" target="_blank">
            ACME-BRE record
          </a>
          : 21% oxygen at 14.7 psia, 26.5% at 10.2 psia, 34% at 8.2 psia.
        </p>
        <p className="mt-3 text-muted-foreground">Missing data scores 0. We never guess a value.</p>
      </div>
    </>
  );
}

export function RankView({ investigations }: { investigations: Investigation[] }) {
  const [habitat, setHabitat] = useState<Habitat>("spacecraft");
  const [oxygen, setOxygen] = useState(21);
  const [area, setArea] = useState<Area>("all");
  const ranked = rank(investigations, { habitat, oxygen, area });

  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-medium">Rank for your habitat ({investigations.length} investigations)</h2>
        <HowItWorks />
      </div>

      <div className="mt-4 grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
        <label className="text-sm">
          Habitat
          <select
            value={habitat}
            onChange={(e) => setHabitat(e.target.value as Habitat)}
            className="mt-1 block w-full rounded-md border bg-background px-3 py-2"
          >
            {HABITATS.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Oxygen: <span className="font-mono font-medium">{oxygen}%</span>
          <input
            type="range"
            min={15}
            max={40}
            value={oxygen}
            onChange={(e) => setOxygen(Number(e.target.value))}
            className="mt-3 block w-full accent-primary"
          />
        </label>
        <div className="text-sm sm:col-span-2" role="group" aria-label="Safety area">
          Safety area
          <div className="mt-1 grid grid-cols-2 gap-1 rounded-md bg-muted p-1 sm:grid-cols-4">
            {AREAS.map((a) => (
              <button
                key={a}
                aria-pressed={area === a}
                onClick={() => setArea(a)}
                className="rounded px-3 py-1.5 capitalize aria-pressed:bg-background aria-pressed:shadow-sm"
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ol className="mt-4 grid gap-3 sm:grid-cols-2">
        {ranked.map(({ inv, score, reasons }) => (
          <li key={inv.id} id={`inv-${inv.id}`} className="scroll-mt-4 rounded-lg border p-4 target:ring-2 target:ring-ring">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{inv.id}</p>
                <h3 className="font-medium">{inv.name}</h3>
              </div>
              <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 font-mono text-sm text-primary-foreground">
                {score}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{inv.objective}</p>
            <p className="mt-2 text-sm">
              {reasons.length ? reasons.join(" · ") : "No matching data for these settings."}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
              {[...inv.fuel_type.map((f) => `${f} fuel`), ...inv.hardware].map((t) => (
                <span key={t} className="rounded bg-muted px-2 py-0.5">
                  {t}
                </span>
              ))}
              {inv.data_status === "challenge_text" && (
                <span className="rounded border px-2 py-0.5">From challenge text only</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
