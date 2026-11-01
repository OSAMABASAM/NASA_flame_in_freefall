import { test } from "node:test";
import assert from "node:assert/strict";
import { buildNetwork } from "../lib/network.ts";
import { inv } from "./fixture.ts";

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
