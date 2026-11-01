import { test } from "node:test";
import assert from "node:assert/strict";
import { checkCitations } from "../lib/ask.ts";

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
