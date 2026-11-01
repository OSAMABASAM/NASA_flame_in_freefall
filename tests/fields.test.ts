import { test } from "node:test";
import assert from "node:assert/strict";
import { FIELDS, differs } from "../lib/fields.ts";
import { inv } from "./fixture.ts";

const base = inv("X");
const oxygen = FIELDS.find((f) => f.label.startsWith("Oxygen"))!;

test("formats a range, a single value and empty", () => {
  assert.equal(oxygen.value({ ...base, o2_min_pct: 15, o2_max_pct: 30 }), "15 to 30");
  assert.equal(oxygen.value({ ...base, o2_min_pct: 21, o2_max_pct: 21 }), "21");
  assert.equal(oxygen.value({ ...base, o2_max_pct: 40 }), "up to 40");
  assert.equal(oxygen.value(base), "");
});

test("differs only when values are not all the same", () => {
  const a = { ...base, o2_min_pct: 21, o2_max_pct: 21 };
  assert.equal(differs(oxygen, [a, { ...a, id: "Y" }]), false);
  assert.equal(differs(oxygen, [a, base]), true);
});
