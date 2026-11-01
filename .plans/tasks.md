# Tasks

Run `/hack-build`. One task per session where possible. The whole build fits in TWO days (1 and 2 Nov). 3 Nov is only for the rehearsal and fixes. Claude Code budget ends 4 Nov. Check each acceptance item before marking done.

## Task 0: walking skeleton (Day 1 = 1 Nov, morning) — riskiest path first
- Next.js (App Router, TypeScript, Tailwind) + shadcn init. Copy `data/`, `scripts/` stay as they are.
- Add npm scripts: `"data": "node scripts/build-data.mjs"`, `"predev": "npm run data"`, `"prebuild": "npm run data"` (Task 2 extends it to `npm run data && npm run cache`).
- Osama is browser only. Guide him step by step to import the repo on vercel.com (Add New → Project → Import → Deploy) and to add `GROQ_API_KEY` and `GEMINI_API_KEY` in Vercel → Settings → Environment Variables. Open a PR to `main` and tell him to merge it on github.com.
- Home page lists investigation names from `data/investigations.json`.
- Deploy to Vercel. **Accept:** live URL shows the list.

## Task 1: enrich the data (Day 1 = 1 Nov) — owns `data/investigations.csv`
- For each seed row, look up the PSI page and NASA pages; fill empty cells only with sourced facts; set `source_url` and `data_status=verified`. Leave unknown cells empty.
- Add other PSI combustion investigations if clearly documented (mark `relevance_note`).
- **Accept:** `npm run data` passes; every non-empty numeric cell has a `source_url`; report lists remaining gaps.

## Task 2: Ask (Day 1 = 1 Nov, evening) — owns `app/api/ask/`, `components/ask/`
- Route handler: system prompt = answer only from the JSON, cite ids in `[ID]` form, say "not in the data" otherwise, keep under 150 words, plain English.
- Groq first, Gemini on error or 429. Validate cited ids against the dataset.
- `npm run cache` script: generates `data/demo-answers.json` for the 3 example questions. Add it to `prebuild` so it runs on every Vercel build. It must never fail the build: on any API error keep the existing file and print a warning.
- **Accept:** example chips answer instantly from cache; a new question answers live in under 10 s with valid citations.

## Task 3: Rank (Day 2 = 2 Nov, morning) — owns `lib/score.ts`, `components/rank/`
- Implement the formula from spec §6 in `lib/score.ts` with a unit test for 3 cases (match, partial oxygen, no data).
- Controls: habitat select, oxygen slider 15 to 40%, safety area tabs. Cards with score + reason. "How the score works" popover.
- **Accept:** test passes; slider reorders cards instantly.

## Task 4: Detail + Compare (Day 2 = 2 Nov, morning) — owns `components/detail/`, `components/compare/`
- Detail drawer with all fields and source link. Compare table for 2 to 3 selected; highlight differing cells; "Not in our data yet" for empty.
- **Accept:** demo steps 4 and 5 run.

## Task 5: design applied (Day 2 = 2 Nov, midday) — after Claude Design handoff
- `/design-kit` steps 1 to 4 only: tokens from the handoff, shadcn components restyled, one Motion fade-in on the home hero. No GSAP or Lenis. Footer: Back on Earth, Coming next.
- **Accept:** screenshots match `docs/design/`; phone size works.

## Task 6: demo-check + video (Day 2 = 2 Nov, afternoon)
Plan A (Claude records, try this first):
- Run the app inside this cloud session (`npm run build && npm start`, or `npm run dev`) and use Playwright against localhost, so no outside network is needed. The example questions answer from the cache, so no AI call is needed during recording.
- `/demo-check`, then `scripts/demo-video.ts` (`npm run video`): walk the click path in `docs/VIDEO.md` with matching pauses, record 1280×720 to `docs/demo/screen.webm`.
- Osama records his voice on his phone from the text in `docs/VIDEO.md` and uploads it on github.com to `docs/demo/voice.mp3` (Add file → Upload files). Pull it.
- `npm run video:final`: ffmpeg merges screen + voice + 4 s title card + 4 s end card into `docs/demo/final.mp4`. Commit it so Osama can download it from github.com.
- If Chromium, Playwright or ffmpeg cannot be installed or run here, say so in one line and switch to Plan B. Do not spend more than 30 minutes on Plan A.
Plan B (Osama records): he records screen + voice in one take with OBS Studio, following `docs/VIDEO.md`. Give him the OBS steps in plain words.
- Either way: rewrite `docs/VIDEO.md` so the click path matches the real UI exactly. Backup: Osama uploads the final video to YouTube as unlisted.
- **Accept:** a final video under the length limit (target 90 s).

## Task 7: ship prep (Day 2 = 2 Nov, evening) — README, `docs/SUBMISSION.md`, `docs/PITCH.md`, `docs/QA.md`
- `/pitch` and `/ship`. README states data sources, what is verified vs challenge text, and AI usage.

## Task 8: data-day rehearsal (3 Nov, morning) — browser only
- Osama follows `docs/DATA_DAY.md` exactly as on 13 Nov, WITHOUT asking Claude: edit `data/investigations.csv` on github.com, add one test row, commit to `main`, watch the Vercel deploy, check the live link. Then delete the test row and commit again. Also try one deliberate mistake (a wrong `fuel_type`) and confirm Vercel shows a clear error and the old site stays live.
- Fix anything that needed Claude, and update `docs/DATA_DAY.md`.
- **Accept:** Osama did the whole data day alone in the browser in under 30 minutes.

No stretch tasks. Simple and working beats bigger and broken.

## Progress
- Done: Task 0 (Next.js 16 + React 19.3 + Tailwind 4; shadcn set up by hand because ui.shadcn.com is blocked in the cloud session; `npm run data` runs before dev and build). Live link: not recorded yet in CLAUDE.md.
- Done: Task 1. All rows now come from NASA PSI (psi.nasa.gov records and their "Experimental table" files), `data_status=verified`, each row cites its PSI page and DOI. Added 3 PSI flight investigations not named in the challenge: ACME-FLAME-DESIGN, ACME-CLD, ACME-S-FLAME (20 rows total). Verified with `npm run data`, build, lint and a browser screenshot.
- Remaining data gaps (left empty on purpose, PSI does not state them):
  - Oxygen: BASS, SAFFIRE-III, SAME, SAME-R, DAFT, DAFT-2, ACME-E-FIELD, ACME-CLD, SPICE, SLICE.
  - Pressure: only FLEX, FLEX-2, CFI, ACME-CFI-G, ACME-FLAME-DESIGN have it. ACME-BRE pressures were varied but are "not identified" in its table.
  - Habitats: no PSI record mentions the Moon, Mars, rovers or a habitat. Only `spacecraft` and `station` are filled, where PSI says so. Task 3 must decide how Moon Base scores (the formula gives 35 points for a habitat match, so today every row gets 0 for Moon Base).
  - Sensors: FLEX and DAFT-2 rely on shared or missing descriptions; FLEX is empty.
- Judgment calls to review: `safety_area` is our classification from the PSI objectives (left empty for pure science studies). Oxygen for inverse flames (ACME-CFI-G, ACME-FLAME-DESIGN) is the burner flow, up to 85%; the row note says so.
- Next: Task 2 (Ask).
- Notes: shadcn components must be added by hand (or from npm packages) in this cloud session. System fonts for now; Task 5 brings the design fonts.
