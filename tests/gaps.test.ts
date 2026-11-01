import { test } from "node:test";
import assert from "node:assert/strict";
import { coverage, touches, OXYGEN } from "../lib/gaps.ts";
import { inv } from "./fixture.ts";

const cell = (r: ReturnType<typeof coverage>, g: string, o: string, p: string) =>
  r.cells.find((c) => c.gravity === g && c.oxygen === o && c.pressure === p)!;

test("a range counts in every band it touches; band edges are not double counted", () => {
  const [below, air, moon, above] = OXYGEN;
  assert.equal(touches([21, 21], below), false);
  assert.equal(touches([21, 21], air), true);
  assert.equal(touches([34, 34], moon), true);
  assert.equal(touches([34, 34], above), false);
  assert.equal(touches([12, 85], below) && touches([12, 85], above), true);
});

test("counts an investigation only when oxygen, pressure and gravity are all in the data", () => {
  const r = coverage([
    inv("FULL", { o2_min_pct: 21, o2_max_pct: 21, pressure_kpa_min: 101, pressure_kpa_max: 101, gravity: ["microgravity"] }),
    inv("NO-P", { o2_min_pct: 21, o2_max_pct: 21, gravity: ["microgravity"] }),
    inv("NO-G", { o2_min_pct: 21, o2_max_pct: 21, pressure_kpa_min: 101, pressure_kpa_max: 101 }),
    inv("NOTHING", {}),
  ]);
  assert.deepEqual(cell(r, "microgravity", "air", "sea").ids, ["FULL"]);
  assert.equal(r.cells.reduce((n, c) => n + c.ids.length, 0), 1);
  assert.deepEqual(r.notReported, { oxygen: 1, pressure: 2, gravity: 2, any: 3 });
});

test("one known end is a single value, not a guessed range", () => {
  const r = coverage([inv("UP", { o2_max_pct: 30, pressure_kpa_min: 60, gravity: ["moon"] })]);
  assert.deepEqual(cell(r, "moon", "moon", "low").ids, ["UP"]);
  assert.deepEqual(cell(r, "moon", "below", "low").ids, []);
  assert.equal(r.partialGravity, 1);
});

test("empty cells get one plain-English line; filled cells none", () => {
  const r = coverage([inv("A", { o2_min_pct: 21, o2_max_pct: 21, pressure_kpa_min: 101, pressure_kpa_max: 101, gravity: ["microgravity"] })]);
  assert.equal(r.cells.length, 4 * 3 * 3);
  assert.equal(cell(r, "microgravity", "air", "sea").line, "");
  assert.equal(cell(r, "moon", "moon", "low").line, "No test on the Moon with Moon base oxygen and low pressure.");
});
