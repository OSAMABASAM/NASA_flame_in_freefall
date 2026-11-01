import { test } from "node:test";
import assert from "node:assert/strict";
import { checkCitations } from "../lib/ask.ts";
import { plainDashes } from "../lib/text.ts";

const ids = new Set(["FLEX", "ACME-BRE", "SAME"]);

test("keeps known ids and lists them once", () => {
  const r = checkCitations("FLEX burned [FLEX]. BRE too [ACME-BRE, FLEX].", ids);
  assert.equal(r.answer, "FLEX burned [FLEX]. BRE too [ACME-BRE][FLEX].");
  assert.deepEqual(r.cited, ["FLEX", "ACME-BRE"]);
});

test("drops ids that are not in the dataset", () => {
  const r = checkCitations("Made up [FAKE-1] and real [SAME, NOPE].", ids);
  assert.equal(r.answer, "Made up and real [SAME].");
  assert.deepEqual(r.cited, ["SAME"]);
});

test("no citations gives an empty list", () => {
  const r = checkCitations("That is not in the data.", ids);
  assert.deepEqual(r.cited, []);
});

test("long dashes become commas, and number ranges become words", () => {
  assert.equal(plainDashes("FLEX tested 12–34% oxygen — the widest range."), "FLEX tested 12 to 34% oxygen, the widest range.");
  assert.equal(plainDashes("Fuel—heptane—burned."), "Fuel, heptane, burned.");
});

import { findProblems, tidy } from "../lib/ask.ts";

const records = new Map([
  ["BASS", JSON.stringify({ id: "BASS", objective: "test an inert gaseous extinguishing agent", flow_max_cm_s: 40 })],
  ["BASS-II", JSON.stringify({ id: "BASS-II", o2_min_pct: 13.6, o2_max_pct: 22.2 })],
]);

test("a checked answer passes", () => {
  assert.deepEqual(findProblems("BASS-II burned at 13.6% to 22.2% oxygen [BASS-II].", records, "question 30%"), []);
});

test("unknown ids and missing citations fail", () => {
  assert.match(findProblems("Made up [FAKE-1].", records, "")[0], /FAKE-1/);
  assert.match(findProblems("No citation here.", records, "")[0], /no investigation id/);
});

test("a real number pinned on the wrong record fails", () => {
  const p = findProblems("BASS tested 13.6% oxygen [BASS].", records, "");
  assert.match(p.join(), /13\.6/);
});

test("numbers from the question or the instructions are allowed", () => {
  assert.deepEqual(findProblems("At 30% oxygen, BASS-II is close [BASS-II].", records, "a Moon Base at 30% oxygen"), []);
});

test("a citation after the full stop still counts for that sentence", () => {
  assert.deepEqual(findProblems("BASS-II reached 22.2% oxygen. [BASS-II]", records, ""), []);
});

test("spelled-out numbers fail", () => {
  assert.match(findProblems("BASS-II reached twenty-two point two percent [BASS-II].", records, "").join(), /digits/);
});

test("look-alike hyphens in ids still match", () => {
  assert.deepEqual(findProblems(tidy("BASS‑II reached 22.2\u202f% oxygen [BASS‑II]."), records, ""), []);
  assert.equal(plainDashes(tidy("12 %–34 % oxygen")), "12% to 34% oxygen");
});

test("a number must belong to the record cited right after it, not just the same sentence", () => {
  const p = findProblems("BASS reached 13.6% oxygen [BASS]; BASS-II reached 22.2% [BASS-II].", records, "");
  assert.match(p.join(), /13\.6/);
  assert.match(findProblems("BASS-II reached 22.2% [BASS-II]. It also used 40 cm/s.", records, "").join(), /40/);
});

test("a name must be in the record cited right after it", () => {
  const recs = new Map([
    ["SAME", JSON.stringify({ id: "SAME", fuel_detail: "Teflon, Kapton" })],
    ["SAME-R", JSON.stringify({ id: "SAME-R", fuel_detail: "Kapton, Pyrell fire retardant foam" })],
  ]);
  assert.match(findProblems("SAME heated Teflon and Pyrell foam [SAME].", recs, "").join(), /Pyrell/);
  assert.deepEqual(findProblems("SAME heated Teflon [SAME]. SAME-R added Pyrell foam [SAME-R].", recs, ""), []);
  assert.deepEqual(findProblems("No Moon-base test exists, nor a Martian one [SAME].", recs, "Moon"), []);
});
