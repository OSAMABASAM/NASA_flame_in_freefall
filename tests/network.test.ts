import { test } from "node:test";
import assert from "node:assert/strict";
import { buildNetwork } from "../lib/network.ts";
import type { Investigation } from "../lib/data.ts";

const inv = (id: string, extra: Partial<Investigation>): Investigation => ({
  id, name: id, project: "", safety_area: [], fuel_type: [], fuel_detail: "", hardware: [],
  o2_min_pct: null, o2_max_pct: null, pressure_kpa_min: null, pressure_kpa_max: null,
  flow_min_cm_s: null, flow_max_cm_s: null, sensors: [], objective: "", variables: "",
  habitats: [], earth_application: "", relevance_note: "", source_url: [], data_status: "verified", gravity: [],
  ...extra,
});

test("links by shared fuel, hardware or project, and counts links per node", () => {
  const { nodes, links } = buildNetwork([
    inv("A", { fuel_type: ["solid"], hardware: ["MSG"], project: "P" }),
    inv("B", { fuel_type: ["solid"], project: "P" }),
    inv("C", { hardware: ["MSG"] }),
    inv("D", { fuel_type: ["gas"] }),
  ]);
  assert.deepEqual(links, [
    { source: "A", target: "B", reasons: ["solid fuel", "project P"] },
    { source: "A", target: "C", reasons: ["MSG"] },
  ]);
  assert.deepEqual(nodes.map((n) => n.degree), [2, 1, 1, 0]);
});
