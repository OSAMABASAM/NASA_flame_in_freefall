// Builds data/investigations.json from data/investigations.csv and checks it.
// Usage: node scripts/build-data.mjs   (or: npm run data)
// No dependencies. Exits with code 1 if anything is wrong, and says which row and column.
import { readFileSync, writeFileSync } from "node:fs";

const CSV = "data/investigations.csv";
const OUT = "data/investigations.json";

export const COLUMNS = [
  "id", "name", "project", "safety_area", "fuel_type", "fuel_detail", "hardware",
  "o2_min_pct", "o2_max_pct", "pressure_kpa_min", "pressure_kpa_max",
  "flow_min_cm_s", "flow_max_cm_s", "sensors", "objective", "variables",
  "habitats", "earth_application", "relevance_note", "source_url", "data_status", "gravity",
];
const LISTS = ["safety_area", "fuel_type", "hardware", "sensors", "habitats", "source_url", "gravity"];
const NUMBERS = ["o2_min_pct", "o2_max_pct", "pressure_kpa_min", "pressure_kpa_max", "flow_min_cm_s", "flow_max_cm_s"];
const ALLOWED = {
  safety_area: ["prevention", "detection", "suppression"],
  fuel_type: ["solid", "liquid", "gas"],
  habitats: ["spacecraft", "station", "moon_base", "mars_base", "rover"],
  data_status: ["challenge_text", "verified", "resources"],
  gravity: ["microgravity", "moon", "mars"],
};

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((v) => v.trim() !== "")) rows.push(row);
  return rows;
}

const errors = [];
const text = readFileSync(CSV, "utf8").replace(/^﻿/, "");
const [header, ...body] = parseCsv(text);
const head = header.map((h) => h.trim());
const missingCols = COLUMNS.filter((c) => !head.includes(c));
if (missingCols.length) {
  console.error(`Header is missing columns: ${missingCols.join(", ")}`);
  process.exit(1);
}

const seen = new Set();
const gaps = {};
const items = body.map((cells, r) => {
  const line = r + 2;
  const item = {};
  for (const col of COLUMNS) {
    const raw = (cells[head.indexOf(col)] ?? "").trim();
    if (LISTS.includes(col)) item[col] = raw ? raw.split(";").map((s) => s.trim()).filter(Boolean) : [];
    else if (NUMBERS.includes(col)) {
      if (raw === "") item[col] = null;
      else if (Number.isFinite(Number(raw))) item[col] = Number(raw);
      else { errors.push(`Row ${line}, ${col}: "${raw}" is not a number`); item[col] = null; }
    } else item[col] = raw;
    const empty = item[col] === "" || item[col] === null || (Array.isArray(item[col]) && !item[col].length);
    if (empty) gaps[col] = (gaps[col] ?? 0) + 1;
  }
  if (!item.id) errors.push(`Row ${line}: id is empty`);
  else if (seen.has(item.id)) errors.push(`Row ${line}: id "${item.id}" is used twice`);
  seen.add(item.id);
  if (!item.name) errors.push(`Row ${line}: name is empty`);
  for (const [col, allowed] of Object.entries(ALLOWED)) {
    const values = Array.isArray(item[col]) ? item[col] : item[col] ? [item[col]] : [];
    for (const v of values) if (!allowed.includes(v)) errors.push(`Row ${line}, ${col}: "${v}" must be one of ${allowed.join(" | ")}`);
  }
  if (!item.data_status) errors.push(`Row ${line}: data_status is empty`);
  const hasNumber = NUMBERS.some((c) => item[c] !== null);
  if (hasNumber && !item.source_url.length) errors.push(`Row ${line}: has numbers but no source_url`);
  for (const [a, b] of [["o2_min_pct", "o2_max_pct"], ["pressure_kpa_min", "pressure_kpa_max"], ["flow_min_cm_s", "flow_max_cm_s"]])
    if (item[a] !== null && item[b] !== null && item[a] > item[b]) errors.push(`Row ${line}: ${a} is bigger than ${b}`);
  return item;
});

if (errors.length) {
  console.error(`Found ${errors.length} problem(s) in ${CSV}:`);
  for (const e of errors) console.error(" - " + e);
  process.exit(1);
}

writeFileSync(OUT, JSON.stringify({ generated_at: new Date().toISOString(), count: items.length, items }, null, 2) + "\n");
const byStatus = items.reduce((acc, i) => ((acc[i.data_status] = (acc[i.data_status] ?? 0) + 1), acc), {});
console.log(`OK: ${items.length} investigations written to ${OUT}`);
console.log(`Status: ${Object.entries(byStatus).map(([k, v]) => `${k}=${v}`).join(", ")}`);
console.log(`Empty cells per column: ${Object.entries(gaps).map(([k, v]) => `${k}=${v}`).join(", ") || "none"}`);
