// The fields shown in the detail drawer and the compare table, as plain text ("" = not in our data).
// Only type imports, so plain Node can run the tests.
import type { Investigation } from "./data.ts";

export type Field = { label: string; value: (inv: Investigation) => string };

const list = (xs: string[]) => xs.map((x) => x.replace(/_/g, " ")).join(", ");

function range(min: number | null, max: number | null) {
  if (min === null && max === null) return "";
  if (min === null) return `up to ${max}`;
  if (max === null) return `from ${min}`;
  return min === max ? `${min}` : `${min} to ${max}`;
}

export const FIELDS: Field[] = [
  { label: "Project", value: (i) => i.project },
  { label: "Objective", value: (i) => i.objective },
  { label: "Safety area", value: (i) => list(i.safety_area) },
  { label: "Fuel type", value: (i) => list(i.fuel_type) },
  { label: "Fuel", value: (i) => i.fuel_detail },
  { label: "Oxygen (% by volume)", value: (i) => range(i.o2_min_pct, i.o2_max_pct) },
  { label: "Pressure (kPa)", value: (i) => range(i.pressure_kpa_min, i.pressure_kpa_max) },
  { label: "Airflow (cm/s)", value: (i) => range(i.flow_min_cm_s, i.flow_max_cm_s) },
  { label: "Sensors", value: (i) => i.sensors.join("; ") },
  { label: "Hardware", value: (i) => i.hardware.join("; ") },
  { label: "What was varied", value: (i) => i.variables },
  { label: "Habitats named by NASA", value: (i) => list(i.habitats) },
  { label: "Back on Earth", value: (i) => i.earth_application },
  { label: "Why it matters", value: (i) => i.relevance_note },
  { label: "Data status", value: (i) => i.data_status.replace(/_/g, " ") },
];

export const EMPTY = "Not in our data yet";

export function differs(field: Field, invs: Investigation[]) {
  return new Set(invs.map(field.value)).size > 1;
}
