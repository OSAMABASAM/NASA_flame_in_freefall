// Ranking formula from .plans/spec.md section 6. Shown to users in "How the score works".
// Only type imports, so plain Node can run the tests.
import type { Investigation } from "./data.ts";

export type Habitat = "spacecraft" | "station" | "moon_base";
export type Area = "all" | "prevention" | "detection" | "suppression";
export type Choice = { habitat: Habitat; oxygen: number; area: Area };
export type Scored = { inv: Investigation; score: number; reasons: string[] };

export const HABITATS: { value: Habitat; label: string }[] = [
  { value: "spacecraft", label: "Spacecraft" },
  { value: "station", label: "Space station" },
  { value: "moon_base", label: "Moon Base (scored by conditions)" },
];
export const AREAS: Area[] = ["all", "prevention", "detection", "suppression"];

// NASA's planned exploration atmospheres, as listed in the ACME-BRE PSI record:
// 21% O2 at 14.7 psia, 26.5% at 10.2 psia, 34% at 8.2 psia.
// No PSI record names the Moon, so Moon Base is scored by these conditions (decision of 1 Nov).
export const MOON_O2_PCT = 26.5;
export const MOON_PSIA = 10.2;
const KPA_PER_PSI = 6.894757;

function range(min: number | null, max: number | null): [number, number] | null {
  const lo = min ?? max;
  const hi = max ?? min;
  return lo === null || hi === null ? null : [lo, hi];
}

// 1 for each half: reaches 26.5% oxygen or more; reaches 10.2 psia or less (rounded to 0.1 psia like NASA's list).
function moonConditions(inv: Investigation) {
  const o2 = range(inv.o2_min_pct, inv.o2_max_pct);
  const p = range(inv.pressure_kpa_min, inv.pressure_kpa_max);
  const highO2 = o2 !== null && o2[1] >= MOON_O2_PCT;
  const lowP = p !== null && Math.round((p[0] / KPA_PER_PSI) * 10) / 10 <= MOON_PSIA;
  return { highO2, lowP };
}

export function scoreInvestigation(inv: Investigation, c: Choice): Scored {
  let score = 0;
  const reasons: string[] = [];

  if (inv.habitats.includes(c.habitat)) {
    score += 35;
    reasons.push(`run for ${c.habitat === "moon_base" ? "a Moon Base" : c.habitat === "station" ? "a space station" : "a spacecraft"}`);
  } else if (c.habitat === "moon_base") {
    const { highO2, lowP } = moonConditions(inv);
    if (highO2) score += 17.5;
    if (lowP) score += 17.5;
    if (highO2 && lowP) reasons.push("tested at Moon Base oxygen and pressure");
    else if (highO2) reasons.push(`tested at ${MOON_O2_PCT}% oxygen or more`);
    else if (lowP) reasons.push(`tested at ${MOON_PSIA} psia or less`);
  }

  const o2 = range(inv.o2_min_pct, inv.o2_max_pct);
  if (o2) {
    const tested = o2[0] === o2[1] ? `${o2[0]}%` : `${o2[0]} to ${o2[1]}%`;
    if (c.oxygen >= o2[0] && c.oxygen <= o2[1]) {
      score += 25;
      reasons.push(`${c.oxygen}% oxygen is inside the tested ${tested}`);
    } else if (c.oxygen >= o2[0] - 10 && c.oxygen <= o2[1] + 10) {
      score += 12.5;
      reasons.push(`${c.oxygen}% oxygen is close to the tested ${tested}`);
    }
  }

  if (c.area === "all") score += 20;
  else if (inv.safety_area.includes(c.area)) {
    score += 20;
    reasons.push(`covers ${c.area}`);
  }

  if (inv.flow_min_cm_s !== null || inv.flow_max_cm_s !== null) {
    score += 10;
    reasons.push("has airflow data");
  }

  if (inv.data_status === "verified" || inv.data_status === "resources") {
    score += 10;
    reasons.push("checked against NASA sources");
  }

  return { inv, score, reasons };
}

export function rank(list: Investigation[], c: Choice): Scored[] {
  return list.map((inv) => scoreInvestigation(inv, c)).sort((a, b) => b.score - a.score);
}
