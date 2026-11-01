# Spec: Flame in Freefall dashboard

Read `00-inputs.md` and `00-idea.md` first. The idea is locked; do not re-open it. Skip /hack-start.

## 0. Simplicity contract (read before every task)
- Three features only: Ask, Rank, Compare. The detail view is just a drawer on the card. Nothing else gets built until all three run on the live link.
- One small page app. No login, no database, no graph view, no GSAP or Lenis. Motion only on the demo path (Task 5, Osama 1 Nov): hero fade-in, rank cards glide to new positions, soft press on buttons, drawer slides in. Subtle, fast, off with reduced motion.
- Every step Osama must repeat on 13 November without Claude Code is a single `npm run ...` command, documented in `docs/DATA_DAY.md`. If a task makes that harder, it is the wrong design.
- If a task takes more than double its time, cut it down and tell Osama.

- BROWSER ONLY: Osama works in Claude Code on the web (claude.ai/code), the GitHub website and the Vercel website. He has no local terminal setup. Never ask him to run a command on his computer.
- Vercel is connected to the GitHub repo on vercel.com, so every merge to `main` deploys. The Vercel build runs `npm run data` (fails loudly on a bad CSV) and then `npm run cache` (never fails the build: if the AI call fails it keeps the old cached answers and logs a warning).
- Data day (13 Nov) is: edit `data/investigations.csv` on github.com, commit to `main`, Vercel rebuilds. Nothing else.

## 1. One-liner and user
A dashboard that summarizes, ranks and interprets NASA microgravity combustion investigations for the fire safety of crew habitats. User: aerospace engineer, researcher or graduate student.

## 2. Demo script (what the judge sees, about 2 minutes)
| Step | Screen | Presenter says |
|---|---|---|
| 1 | Home: headline, one line on Apollo 1 and Artemis II, big ask box, 3 example chips | "NASA has decades of fire experiments in space. Finding the right one takes days. Here it takes seconds." |
| 2 | Click chip "Which experiments matter most for a Moon Base at 30% oxygen?" → streamed answer with citation chips | "It answers only from NASA's data, and every claim links to its source." |
| 3 | Rank view: habitat = Moon Base, oxygen slider 21% → 30%, safety area filter | "Watch the ranking change as oxygen rises. The score is a transparent formula, not a black box." |
| 4 | Open one card (detail drawer) | "Objective, fuel, oxygen, airflow, sensors, hardware, and the source." |
| 5 | Compare 3 investigations | "Same hardware, different fuels: differences are highlighted." |
| 6 | Footer strip: Back on Earth + Coming next (LUCI, FM2) | "And it is ready for partial-gravity data when NASA publishes it." |

## 3. Must-have features and acceptance checks
1. **Ask**: POST `/api/ask` with a question returns an answer in under 10 s that cites at least one investigation `id` present in the dataset. If the dataset has no answer, it says so. Preset demo questions are served from `data/demo-answers.json` instantly (cache), live API is the fallback.
2. **Rank**: changing habitat, oxygen or safety area reorders cards within 100 ms; each card shows its score and a one-line reason built from the formula parts.
3. **Compare**: selecting 2 to 3 cards opens a table with one row per field; cells that differ are highlighted; empty cells show "Not in our data yet".

## 4. Architecture
```
data/investigations.csv  --(npm run data: scripts/build-data.mjs)-->  data/investigations.json
                                                                           |
Next.js app (Vercel) ── pages read the JSON at build time ─────────────────┘
   └─ /api/ask  → sends question + whole JSON (small, ~20 rows) to Groq; Gemini if Groq fails
                  → answer must cite ids; server checks ids exist, drops unknown ones
```
No database. No vector search: the dataset is small enough to send whole.

## 5. Data
- Source of truth: `data/investigations.csv`, one row per investigation, editable by hand in LibreOffice Calc. Columns are defined in `scripts/build-data.mjs` (`COLUMNS`).
- Seed rows contain only facts stated in the challenge text (`data_status = challenge_text`). On 2 November, enrich from the public PSI site (https://science.nasa.gov/physical-sciences-informatics-psi/) and NASA pages, with `source_url` per row and `data_status = verified`. Never guess a number; leave the cell empty.
- On 13 November Osama adds the official Resources by hand (see `docs/DATA_DAY.md`).
- Units: oxygen in percent by volume, pressure in kPa, flow speed in cm/s. Say so in column headers and UI.

## 6. Ranking formula (show it in the UI under "How the score works")
score (0 to 100) =
- 35 × habitat match (row `habitats` contains the selected habitat; 1 or 0)
- 25 × oxygen coverage (1 if selected oxygen is inside [o2_min_pct, o2_max_pct]; 0.5 if within 10 points of the range; 0 if no data)
- 20 × safety area match (row `safety_area` contains the selected area, or "all" selected)
- 10 × airflow data present (flow_min_cm_s or flow_max_cm_s not empty)
- 10 × verified (data_status = verified or resources)
Reason line = the parts that scored, in words.

## 7. Stack (feature → language → where it runs → library)
| Feature | Language | Runs | Library |
|---|---|---|---|
| UI, rank, compare | TypeScript | browser + Next.js build | Next.js App Router, Tailwind, shadcn/ui |
| Data build | JavaScript (Node, no deps) | Osama's laptop | `scripts/build-data.mjs` |
| Ask | TypeScript | Vercel route handler | `fetch` to Groq API, Gemini API fallback |
| Motion | TypeScript | browser | Motion, small animations on the demo path (Task 5) |
| Demo check + video | TypeScript | laptop | Playwright, ffmpeg |
Env vars: `GROQ_API_KEY`, `GEMINI_API_KEY` (Vercel + `.env.local`; names in `.env.example`).

## 8. Risks (build in this order)
1. Facts per investigation (oxygen, airflow, sensors) with sources. → Task 1.
2. AI answer grounded and cited; free-tier rate limits. → cache demo answers, server-side id check, fallback provider.
3. Design time. → one Claude Design session, max 1 hour.

## 9. Time plan (two build days; Claude Code budget ends 4 Nov)
- Before 1 Nov: install, API keys tested, repo on GitHub, Vercel connected, Claude Design screens done.
- 1 Nov: Task 0 deployed, Task 1 data enriched from public PSI, Task 2 Ask working.
- 2 Nov: Tasks 3 to 8. **Feature freeze 16:00.** Full demo, voice recorded, final video, README, pitch.
- 3 Nov: Task 9 rehearsal of data day, bug fixes only. No new features.
- 13 Nov: resources added to `data/investigations.csv` by hand, one-command rebuild, submit (see DATA_DAY.md).
