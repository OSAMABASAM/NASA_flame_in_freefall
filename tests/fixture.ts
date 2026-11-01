import type { Investigation } from "../lib/data.ts";

export const inv = (id: string, extra: Partial<Investigation> = {}): Investigation => ({
  id, name: id, project: "", safety_area: [], fuel_type: [], fuel_detail: "", hardware: [],
  o2_min_pct: null, o2_max_pct: null, pressure_kpa_min: null, pressure_kpa_max: null,
  flow_min_cm_s: null, flow_max_cm_s: null, sensors: [], objective: "", variables: "",
  habitats: [], earth_application: "", relevance_note: "", source_url: [], data_status: "verified", gravity: [],
  ...extra,
});
