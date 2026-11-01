import dataset from "@/data/investigations.json";

export type Investigation = {
  id: string;
  name: string;
  project: string;
  safety_area: string[];
  fuel_type: string[];
  fuel_detail: string;
  hardware: string[];
  o2_min_pct: number | null;
  o2_max_pct: number | null;
  pressure_kpa_min: number | null;
  pressure_kpa_max: number | null;
  flow_min_cm_s: number | null;
  flow_max_cm_s: number | null;
  sensors: string[];
  objective: string;
  variables: string;
  habitats: string[];
  earth_application: string;
  relevance_note: string;
  source_url: string[];
  data_status: string;
  /** Gravity level(s) the tests ran in, as the source states it (PSI "Project Type"). Empty = not reported. */
  gravity: string[];
};

export const investigations = dataset.items as Investigation[];
