// Research gaps: which oxygen × pressure × gravity conditions the investigations covered.
// An investigation counts in a cell only when the data states all three values; a min–max range counts in
// every band it touches. Missing values go to "not reported", never into a cell.
// Only type imports, so plain Node can run the tests.
import type { Investigation } from "./data.ts";

type Band = { id: string; label: string; words: string; lo: number; hi: number; hiIn?: boolean; loOut?: boolean };

// Oxygen in % by volume. 26.5% and 34% are NASA's planned exploration atmospheres (ACME-BRE PSI record).
export const OXYGEN: Band[] = [
  { id: "below", label: "Below 21%", words: "below-air oxygen", lo: -Infinity, hi: 21 },
  { id: "air", label: "21 to 26%", words: "air-level oxygen", lo: 21, hi: 26.5 },
  { id: "moon", label: "26.5 to 34%", words: "Moon-habitat oxygen", lo: 26.5, hi: 34, hiIn: true },
  { id: "above", label: "Above 34%", words: "very high oxygen", lo: 34, hi: Infinity, loOut: true },
];

// Pressure in kPa. 10.2 psia (70.3 kPa) and 8.2 psia are the planned Moon-habitat pressures; 101 kPa is sea level.
export const PRESSURE: Band[] = [
  { id: "low", label: "Below 71 kPa", words: "low pressure", lo: -Infinity, hi: 71 },
  { id: "sea", label: "71 to 102 kPa", words: "sea-level pressure", lo: 71, hi: 102, hiIn: true },
  { id: "high", label: "Above 102 kPa", words: "high pressure", lo: 102, hi: Infinity, loOut: true },
];

export const GRAVITY = [
  { id: "microgravity", label: "Microgravity", words: "microgravity" },
  { id: "moon", label: "Moon", words: "Moon-gravity" },
  { id: "mars", label: "Mars", words: "Mars-gravity" },
] as const;

// [min, max] from the data; one known end is treated as a single value. null = not reported.
function span(min: number | null, max: number | null): [number, number] | null {
  if (min === null && max === null) return null;
  return [min ?? max!, max ?? min!];
}

// Does the closed range [a, b] touch the band? Bands include lo and exclude hi, unless loOut or hiIn say otherwise.
export function touches([a, b]: [number, number], band: Band) {
  return (band.hiIn ? a <= band.hi : a < band.hi) && (band.loOut ? b > band.lo : b >= band.lo);
}

export type Cell = { gravity: string; oxygen: string; pressure: string; ids: string[]; line: string };

export function coverage(invs: Investigation[]) {
  const placed = invs.map((i) => ({
    id: i.id,
    o2: span(i.o2_min_pct, i.o2_max_pct),
    p: span(i.pressure_kpa_min, i.pressure_kpa_max),
    g: i.gravity,
  }));
  const cells: Cell[] = GRAVITY.flatMap((g) =>
    OXYGEN.flatMap((o) =>
      PRESSURE.map((p) => {
        const ids = placed
          .filter((x) => x.o2 && x.p && x.g.includes(g.id) && touches(x.o2, o) && touches(x.p, p))
          .map((x) => x.id);
        return { gravity: g.id, oxygen: o.id, pressure: p.id, ids, line: ids.length ? "" : `No ${g.words} test at ${o.words} and ${p.words}.` };
      }),
    ),
  );
  const notReported = {
    oxygen: placed.filter((x) => !x.o2).length,
    pressure: placed.filter((x) => !x.p).length,
    gravity: placed.filter((x) => !x.g.length).length,
    // Investigations that miss at least one of the three, so they sit in no cell.
    any: placed.filter((x) => !x.o2 || !x.p || !x.g.length).length,
  };
  const partialGravity = invs.filter((i) => i.gravity.some((g) => g === "moon" || g === "mars")).length;
  const microgravity = invs.filter((i) => i.gravity.includes("microgravity")).length;
  return { cells, notReported, partialGravity, microgravity, total: invs.length };
}
