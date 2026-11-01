// Ask logic shared by the /api/ask route and scripts/cache-answers.mjs.
// Only a small local import, so plain Node can run it too. If a model is retired, change its name here
// (check the lists at https://console.groq.com/docs/models and https://ai.google.dev/gemini-api/docs/models).
import { plainDashes } from "./text.ts";

const GROQ_MODEL = "openai/gpt-oss-120b";
// Newest stable Flash first; the free tier often answers 503 "high demand" for it, then the older one is tried.
const GEMINI_MODELS = ["gemini-3.8-flash", "gemini-3.5-flash"];
const NOT_IN_DATA = "That is not in the data yet.";

export const EXAMPLE_QUESTIONS = [
  "Which experiments matter most for a Moon Base at 30% oxygen?",
  "What has NASA tested on detecting smoke in microgravity?",
  "Which experiments tested putting out fires, and with what?",
];

export type Answer = { answer: string; cited: string[]; provider: string };
type Row = Record<string, unknown> & { id: string };
type Keys = { groq?: string; gemini?: string };
// maxWaitMs: the longest we wait when Groq says "rate limited, try again in N seconds".
// only: use just one provider (for testing).
type Options = { maxWaitMs?: number; only?: "groq" | "gemini" };

const SYSTEM = `You answer questions about NASA microgravity combustion investigations.
Use ONLY the JSON data below as your source of facts. Each record is one investigation, identified by its "id".

How to read the data:
- safety_area "prevention" means stopping fires from starting or spreading (how materials burn).
- safety_area "detection" means smoke and fire detection (smoke detectors, smoke particles, sensors).
- safety_area "suppression" means putting fires out (extinguishing agents, lowering oxygen, extinction).
- Moon Base: no record names the Moon. Treat a Moon Base as the atmospheres NASA considered for human missions, listed in the ACME-BRE record: 26.5% oxygen at 10.2 psia (about 70 kPa) and 34% oxygen at 8.2 psia (about 57 kPa). Match experiments to it by oxygen (o2_min_pct to o2_max_pct reaching about 26.5% or more) and by pressure (pressure_kpa_min to pressure_kpa_max reaching about 70 kPa or less), and say in your own words that no experiment flew on the Moon, so you matched by oxygen and pressure; cite [ACME-BRE] for those atmospheres. Call them "atmospheres NASA considered for human missions", never Moon Base atmospheres, because the data does not tie them to the Moon.
- A question about a specific oxygen level: compare it with each record's oxygen range.
- A record's oxygen range and pressure range are separate. Say a record's ranges cover a condition, never that it tested that exact combination.
- relevance_note holds caveats (for example, 85% oxygen is the burner flow in inverse flames, not the room air). Respect them.
- Keep what burned (the fuel) separate from what put the fire out (an extinguishing gas, or lowering oxygen). Never call a fuel a suppressant.

Rules:
- After each claim, cite in square brackets the id of the record that states it, like [FLEX] or [ACME-BRE].
- Keep facts from different records in different clauses, each clause ending with its own citation. One citation per clause is enough.
- Cite an id ONLY if that record's own fields support the claim, also when you say what a record did not do. Never move a fact from one record to another, even when the names are alike (BASS and BASS-II, FLEX and FLEX-2, SAME and SAME-R, SAFFIRE-I, II and III are different records).
- Do not add conclusions, explanations or lessons that the data does not state.
- Answer whenever any record is relevant, even partly. Say "${NOT_IN_DATA}" only when no record is relevant at all.
- Never invent numbers. Write every number in digits, copied exactly as it appears in the data or above (for example 26.5% or 70.2 kPa); do not convert, round, estimate or add them up. If a value is missing from the data, say it is not in the data.
- Plain English, no jargon, under 150 words, one or two short paragraphs. No markdown, no bullet points, no bold. Never use dashes (— or –) as punctuation; use commas or full stops.
- Units: oxygen in percent, pressure in kPa, airflow in cm/s.`;

// Only the fields that help answer; empty ones are dropped to save tokens (Groq's free tier allows 8,000 per minute).
const FIELDS = [
  "id", "name", "safety_area", "fuel_type", "fuel_detail", "o2_min_pct", "o2_max_pct",
  "pressure_kpa_min", "pressure_kpa_max", "flow_min_cm_s", "flow_max_cm_s",
  "sensors", "objective", "variables", "habitats", "relevance_note",
];
function slim(rows: Row[]) {
  return rows.map((r) =>
    Object.fromEntries(
      FIELDS.map((k) => [k, r[k]]).filter(
        ([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && !v.length),
      ),
    ),
  );
}

// Models write ids with look-alike hyphens ("SAME‑R"), "12 %" with a space, bold and bullets: make them plain.
export function tidy(text: string) {
  return text
    .replace(/[\u2010\u2011\u2012]/g, "-")
    .replace(/(\d)\s+%/g, "$1%")
    .replace(/\*\*/g, "")
    .replace(/^\s*[-*•]\s+/gm, "")
    .trim();
}

// Tidies the text, rewrites "[A, B]" as "[A][B]", removes ids not in the dataset, lists cited ids once, and drops long dashes.
export function checkCitations(text: string, ids: Set<string>) {
  const cited: string[] = [];
  const answer = plainDashes(tidy(text))
    .replace(/\s*\[([^\]]+)\]/g, (_m, inside: string) => {
      const good = inside.split(",").map((s) => s.trim()).filter((id) => ids.has(id));
      for (const id of good) if (!cited.includes(id)) cited.push(id);
      return good.length ? " " + good.map((id) => `[${id}]`).join("") : "";
    })
    .trim();
  return { answer, cited };
}

// "4,000" -> "4000", "26.50" -> "26.5", so the same number always looks the same.
function numbersIn(text: string) {
  return (text.match(/\d+(?:[.,]\d+)*/g) ?? []).map((n) => String(parseFloat(n.replace(/,(?=\d{3}\b)/g, ""))));
}

// Capitalised words that are not the first word of a sentence: materials, instruments, experiment names.
function namesIn(text: string) {
  return text
    .split(/[.!?:;]\s+|\n+/)
    .flatMap((sentence) => sentence.trim().split(/[\s,()]+/).slice(1))
    .map((w) => w.replace(/[^A-Za-z0-9-]+$/, "").replace(/^[^A-Za-z0-9]+/, ""))
    // "Moon-base" is checked as "Moon"; ids like "SAME-R" stay whole.
    .flatMap((w) => (/[a-z]/.test(w) ? w.split("-") : [w]))
    .filter((w) => w.length > 2 && /[A-Z]/.test(w));
}

// Problems that make an answer untrustworthy. Empty list = passed.
// records: id -> that record's data as text. baseText: the instructions and the question.
// - every bracketed id must exist, and at least one must be cited (unless the answer says it is not in the data);
// - every number must appear in the record(s) cited right after it (the next [..] group), or in baseText,
//   so a real number pinned on the wrong experiment fails too;
// - names (capitalised words inside a sentence, like Pyrell or Kapton) follow the same rule as numbers;
// - numbers must be digits, because spelled-out numbers would slip past that check.
export function findProblems(text: string, records: Map<string, string>, baseText: string) {
  const problems: string[] = [];
  const idsIn = (t: string) => [...t.matchAll(/\[([^\]]+)\]/g)].flatMap((m) => m[1].split(",").map((s) => s.trim()));
  const all = idsIn(text);
  const unknown = [...new Set(all.filter((id) => !records.has(id)))];
  if (unknown.length) problems.push(`these ids are not in the data: ${unknown.join(", ")}`);
  if (!all.some((id) => records.has(id)) && !text.includes(NOT_IN_DATA)) problems.push("no investigation id is cited");
  baseText += " Martian lunar Earth"; // harmless words the data does not use
  const base = numbersIn(baseText);
  const strange = new Set<string>();
  const unsupportedNames = new Set<string>();
  // Split into pieces that each end with a group of citations: "text [A][B]". Text after the last group has none.
  for (const [, piece, group] of text.matchAll(/([^[]*)((?:\[[^\]]+\]\s*)*)/g)) {
    const allowed = new Set([...base, ...idsIn(group).flatMap((id) => numbersIn(records.get(id) ?? ""))]);
    for (const n of numbersIn(piece)) if (!allowed.has(n)) strange.add(n);
    const source = (baseText + idsIn(group).map((id) => records.get(id) ?? "").join(" ")).toLowerCase();
    for (const name of namesIn(piece)) if (!source.includes(name.toLowerCase())) unsupportedNames.add(name);
  }
  if (strange.size) problems.push(`these numbers are not in the record cited right after them: ${[...strange].join(", ")}`);
  if (unsupportedNames.size) problems.push(`these names are not in the record cited right after them: ${[...unsupportedNames].join(", ")}`);
  const words = text.match(/\b(?:(?:eleven|twelve|(?:thir|four|fif|six|seven|eigh|nine)teen|(?:twen|thir|for|fif|six|seven|eigh|nine)ty|hundred|thousand)\w*|point (?:zero|one|two|three|four|five|six|seven|eight|nine))\b/gi);
  if (words) problems.push(`write these numbers in digits: ${[...new Set(words)].join(", ")}`);
  return problems;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

class RateLimited extends Error {
  waitMs: number;
  constructor(waitMs: number, message: string) {
    super(message);
    this.waitMs = waitMs;
  }
}

// Groq says how long to wait in a "retry-after" header (seconds) or in the message ("try again in 7.5s").
function waitFrom(res: Response, body: string) {
  const header = Number(res.headers.get("retry-after"));
  if (header > 0) return header * 1000;
  const m = body.match(/try again in (?:(\d+)m)?([\d.]+)s/);
  return m ? (Number(m[1] ?? 0) * 60 + Number(m[2])) * 1000 : 10_000;
}

type Message = { role: "user" | "assistant"; content: string };

async function groq(system: string, messages: Message[], key: string) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.1,
      max_completion_tokens: 1500, // Groq counts this toward its tokens-per-minute limit
      reasoning_effort: "medium", // "low" mixed up BASS and BASS-II in tests
      include_reasoning: false,
      messages: [{ role: "system", content: system }, ...messages],
    }),
    signal: AbortSignal.timeout(20_000),
  });
  const body = await res.text();
  if (res.status === 429) throw new RateLimited(waitFrom(res, body), `Groq 429: ${body.slice(0, 200)}`);
  if (!res.ok) throw new Error(`Groq ${res.status}: ${body.slice(0, 200)}`);
  return String(JSON.parse(body).choices?.[0]?.message?.content ?? "");
}

async function gemini(system: string, messages: Message[], key: string) {
  let last = "";
  for (const model of GEMINI_MODELS) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        generationConfig: { temperature: 0.1, maxOutputTokens: 4096, thinkingConfig: { thinkingLevel: "low" } },
      }),
      signal: AbortSignal.timeout(15_000),
    }).catch((e) => e as Error);
    if (res instanceof Error) {
      last = `Gemini ${model}: ${res.message}`; // timed out: the model is overloaded, try the next one
      continue;
    }
    last = `Gemini ${model} ${res.status}: ${(await res.clone().text()).slice(0, 200)}`;
    if (res.status === 429 || res.status === 503) continue; // busy: try the next model
    if (!res.ok) throw new Error(last);
    const json = await res.json();
    const parts: { text?: string; thought?: boolean }[] = json.candidates?.[0]?.content?.parts ?? [];
    return parts.filter((p) => !p.thought).map((p) => p.text ?? "").join("");
  }
  throw new RateLimited(3000, last);
}

// One provider: when busy (429, or Gemini 503) wait the time asked for (if short enough) and try again once.
async function call(fn: typeof groq, system: string, messages: Message[], key: string, maxWaitMs: number) {
  try {
    return await fn(system, messages, key);
  } catch (e) {
    if (!(e instanceof RateLimited) || e.waitMs > maxWaitMs) throw e;
    await sleep(e.waitMs + 500);
    return fn(system, messages, key);
  }
}

const recordsOf = (slimRows: Record<string, unknown>[]) => new Map(slimRows.map((r) => [String(r.id), JSON.stringify(r)]));

// Checks a saved answer against today's data (used by the cache script). Empty list = still good.
export function checkAnswer(answer: string, question: string, rows: Row[]) {
  return findProblems(answer, recordsOf(slim(rows)), `${SYSTEM} ${question}`);
}

// Groq first, then Gemini. Each answer is checked (findProblems: ids exist, numbers and names match the cited record);
// a failed check gets one retry with the problems listed. Throws if no provider gives a checked answer.
export async function askModel(question: string, rows: Row[], keys: Keys, opts: Options = {}): Promise<Answer> {
  const slimRows = slim(rows);
  const system = `${SYSTEM}\n\nDATA:\n${JSON.stringify(slimRows)}`;
  const records = recordsOf(slimRows);
  const ids = new Set(records.keys());
  const errors: string[] = [];
  const providers = [
    ["groq", keys.groq, groq],
    ["gemini", keys.gemini, gemini],
  ] as const;
  for (const [name, key, fn] of providers) {
    if (opts.only && opts.only !== name) continue;
    if (!key) {
      errors.push(`${name}: no API key`);
      continue;
    }
    try {
      const messages: Message[] = [{ role: "user", content: question }];
      for (let attempt = 0; attempt < 2; attempt++) {
        const text = tidy(await call(fn, system, messages, key, opts.maxWaitMs ?? 8000));
        const problems = text ? findProblems(text, records, `${SYSTEM} ${question}`) : ["empty answer"];
        if (!problems.length) return { ...checkCitations(text, ids), provider: name };
        errors.push(`${name} try ${attempt + 1}: ${problems.join("; ")}`);
        messages.push(
          { role: "assistant", content: text },
          { role: "user", content: `Your answer failed a check: ${problems.join("; ")}. Answer the question again. Put each number and name in a clause that ends with the id of the record that states it.` },
        );
      }
    } catch (e) {
      errors.push(`${name}: ${e instanceof Error ? e.message : e}`);
    }
  }
  throw new Error(errors.join(" | "));
}
