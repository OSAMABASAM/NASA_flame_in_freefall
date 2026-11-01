import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreInvestigation } from "../lib/score.ts";
import type { Investigation } from "../lib/data.ts";

const base: Investigation = {
  id: "X", name: "X", project: "", safety_area: [], fuel_type: [], fuel_detail: "", hardware: [],
  o2_min_pct: null, o2_max_pct: null, pressure_kpa_min: null, pressure_kpa_max: null,
  flow_min_cm_s: null, flow_max_cm_s: null, sensors: [], objective: "", variables: "",
  habitats: [], earth_application: "", relevance_note: "", source_url: [], data_status: "challenge_text", gravity: [],
};

test("full match scores 100", () => {
  const inv = {
    ...base, habitats: ["spacecraft"], safety_area: ["prevention"], o2_min_pct: 17, o2_max_pct: 30,
    flow_min_cm_s: 0.1, data_status: "verified",
  };
  const s = scoreInvestigation(inv, { habitat: "spacecraft", oxygen: 21, area: "prevention" });
  assert.equal(s.score, 100);
});

test("oxygen within 10 points of the range gives half the oxygen points", () => {
  const inv = { ...base, o2_min_pct: 21, o2_max_pct: 22 };
  const s = scoreInvestigation(inv, { habitat: "spacecraft", oxygen: 30, area: "detection" });
  assert.equal(s.score, 12.5);
});

test("no data scores 0, except the 20 points for 'all' areas", () => {
  assert.equal(scoreInvestigation(base, { habitat: "station", oxygen: 30, area: "suppression" }).score, 0);
  assert.equal(scoreInvestigation(base, { habitat: "moon_base", oxygen: 30, area: "all" }).score, 20);
});

test("Moon Base scores by conditions: high oxygen and low pressure", () => {
  // 70.4 kPa is 10.2 psia when rounded like NASA's planned atmospheres, so it counts.
  const both = { ...base, o2_min_pct: 12, o2_max_pct: 34, pressure_kpa_min: 70.4, pressure_kpa_max: 309 };
  assert.equal(scoreInvestigation(both, { habitat: "moon_base", oxygen: 50, area: "detection" }).score, 35);
  const oxygenOnly = { ...base, o2_min_pct: 21, o2_max_pct: 40 };
  assert.equal(scoreInvestigation(oxygenOnly, { habitat: "moon_base", oxygen: 99, area: "detection" }).score, 17.5);
});
