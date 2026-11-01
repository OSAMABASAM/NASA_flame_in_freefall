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
- **Decision (Osama, 1 Nov): Moon Base is scored by conditions, not by a habitat label.** No PSI record names the Moon, so the 35 habitat points for Moon Base go to how well an experiment covers Moon Base conditions: high oxygen and low pressure, measured against NASA's planned exploration atmospheres as listed in the ACME-BRE PSI record (21% O2 at 14.7 psia, 26.5% at 10.2 psia, 34% at 8.2 psia). Never add a `moon_base` label to a row without a source. Explain this in "How the score works".

## Task 4: Detail + Compare (Day 2 = 2 Nov, morning) — owns `components/detail/`, `components/compare/`
- Detail drawer with all fields and source link. Compare table for 2 to 3 selected; highlight differing cells; "Not in our data yet" for empty.
- **Accept:** demo steps 4 and 5 run.

## Task 5: smooth Motion on the demo path (Day 2 = 2 Nov, midday) — owns motion code in `components/`
- Added by Osama on 1 Nov. Install `motion` (latest stable, check with `npm view motion version`). No GSAP or Lenis.
- Rank cards animate to their new position when the oxygen slider, habitat or safety area changes (Motion layout animation on each card, keyed by id).
- Buttons and chips (Ask, example chips, safety area tabs, Details, Compare, Clear) get a soft press and hover effect.
- The detail drawer slides in from the right; the compare dialog fades in. Keep the native `<dialog>` (Esc, focus, backdrop).
- One fade-in on the home hero. (Changed 1 Nov: a glide up without the fade, for LCP; see Progress.)
- Subtle and fast: about 150 to 250 ms, small distances, no bounce. With `prefers-reduced-motion: reduce`, no movement at all (Motion `MotionConfig reducedMotion="user"` plus CSS fallback).
- **Accept:** Playwright: slider 21 → 30% at Moon Base still reorders correctly and cards settle within 300 ms; with reduced motion emulated, cards jump with no animation; no console errors; slider still feels instant.

## Task 6: design applied (Day 2 = 2 Nov, midday) — no Claude Design handoff, designed by Claude from `.plans/design-brief.md`
- Osama, 1 Nov: no handoff; Claude designs it from the brief. First built dark; then Osama (1 Nov) switched it to a light Apple-style theme: near-white page, white cards with soft shadows and large rounded corners, one blue accent, dark gray text, generous spacing. Font: system stack (-apple-system, BlinkMacSystemFont), Inter from `next/font/google` as the web fallback; system monospace for ids. Osama, 1 Nov (later): restyled to the "White contrast" bento in `docs/design/reference-2.png`: light gray page, 20px cards in white, fire orange, soft yellow and charcoal, small uppercase card labels, pill badges, score gauge, hero stat cards counted from the data. Scroll motion with Motion only (reveal on view, count-up, top progress bar, light hero parallax); never a transform on the network graph or its parents.
- Tokens live in `app/globals.css` (no hex colors in components). shadcn-style `components/ui/button.tsx` (primary, outline, ghost, chip). No GSAP or Lenis.
- Screens: sticky header; hero with headline, Apollo 1 / Artemis line with source link, ask box, chips, answer card, 3 stats computed from the data; rank with a left controls panel (sticky on desktop) and a 2-column card grid (place, id, score with meter, why line, tags); detail drawer as a label/value list; compare table with tinted differing rows; footer with "Back on Earth" (from `earth_application`) and "Coming next: LUCI and FM2".
- **Accept:** desktop (1440 wide) and phone (390 wide) screenshots of hero, rank, drawer, compare and footer look clean; no horizontal page scroll on phone; text contrast AA on the light background; no console errors; tests, tsc, lint and build pass.

## Task 6b: network view (stretch, added by Osama on 1 Nov) — owns `lib/network.ts`, `components/network/`
- Its own section under Rank ("How the experiments connect"), plus a "Network" link in the header. Nothing in Ask, Rank, Detail or Compare changes.
- Nodes = investigations, colored by `safety_area` (two areas = a half-and-half dot, none = gray), sized by number of links. Links = shared `fuel_type`, shared `hardware` item or same `project`; thicker = more shared.
- Hover dims everything except the node and its neighbors and names what they share; click (tap on a phone) opens the existing detail drawer. "Show the links as a list" gives the same info as text, for keyboards and screen readers.
- `react-force-graph-2d` (latest stable, 1.29.2), loaded only in the browser. Light theme colors are tokens in `globals.css` (validated colorblind-safe). Zoom and pan are off so the page still scrolls on a phone. With reduced motion, the layout is computed before the first paint and never moves.
- **Accept:** Playwright at 1440 and 390 wide, normal and reduced motion: graph shows, hover names the neighbors, click opens the drawer, no horizontal scroll, no console errors; with reduced motion the canvas does not change after load; Rank drawer and Compare still work; tests, tsc, lint and build pass.

## Task 7: demo-check + video (Day 2 = 2 Nov, afternoon)
Plan A (Claude records, try this first):
- Run the app inside this cloud session (`npm run build && npm start`, or `npm run dev`) and use Playwright against localhost, so no outside network is needed. The example questions answer from the cache, so no AI call is needed during recording.
- `/demo-check`, then `scripts/demo-video.ts` (`npm run video`): walk the click path in `docs/VIDEO.md` with matching pauses, record 1280×720 to `docs/demo/screen.webm`.
- Osama records his voice on his phone from the text in `docs/VIDEO.md` and uploads it on github.com to `docs/demo/voice.mp3` (Add file → Upload files). Pull it.
- `npm run video:final`: ffmpeg merges screen + voice + 4 s title card + 4 s end card into `docs/demo/final.mp4`. Commit it so Osama can download it from github.com.
- If Chromium, Playwright or ffmpeg cannot be installed or run here, say so in one line and switch to Plan B. Do not spend more than 30 minutes on Plan A.
Plan B (Osama records): he records screen + voice in one take with OBS Studio, following `docs/VIDEO.md`. Give him the OBS steps in plain words.
- Either way: rewrite `docs/VIDEO.md` so the click path matches the real UI exactly. Backup: Osama uploads the final video to YouTube as unlisted.
- **Accept:** a final video under the length limit (target 90 s).

## Task 8: ship prep (Day 2 = 2 Nov, evening) — README, `docs/SUBMISSION.md`, `docs/PITCH.md`, `docs/QA.md`
- `/pitch` and `/ship`. README states data sources, what is verified vs challenge text, and AI usage.

## Task 9: data-day rehearsal (3 Nov, morning) — browser only
- Osama follows `docs/DATA_DAY.md` exactly as on 13 Nov, WITHOUT asking Claude: edit `data/investigations.csv` on github.com, add one test row, commit to `main`, watch the Vercel deploy, check the live link. Then delete the test row and commit again. Also try one deliberate mistake (a wrong `fuel_type`) and confirm Vercel shows a clear error and the old site stays live.
- Fix anything that needed Claude, and update `docs/DATA_DAY.md`.
- **Accept:** Osama did the whole data day alone in the browser in under 30 minutes.

Only stretch task: 6b (network view), added by Osama. Simple and working beats bigger and broken.

## Progress
- Done: Task 0 (Next.js 16 + React 19.3 + Tailwind 4; shadcn set up by hand because ui.shadcn.com is blocked in the cloud session; `npm run data` runs before dev and build). Live link: https://flame-in-freefall-five.vercel.app (in CLAUDE.md).
- Done: Task 1. All rows now come from NASA PSI (psi.nasa.gov records and their "Experimental table" files), `data_status=verified`, each row cites its PSI page and DOI. Added 3 PSI flight investigations not named in the challenge: ACME-FLAME-DESIGN, ACME-CLD, ACME-S-FLAME (20 rows total). Verified with `npm run data`, build, lint and a browser screenshot.
- Remaining data gaps (left empty on purpose, PSI does not state them):
  - Oxygen: BASS, SAFFIRE-III, SAME, SAME-R, DAFT, DAFT-2, ACME-E-FIELD, ACME-CLD, SPICE, SLICE.
  - Pressure: only FLEX, FLEX-2, CFI, ACME-CFI-G, ACME-FLAME-DESIGN have it. ACME-BRE pressures were varied but are "not identified" in its table.
  - Habitats: no PSI record mentions the Moon, Mars, rovers or a habitat. Only `spacecraft` and `station` are filled, where PSI says so. Task 3 must decide how Moon Base scores (the formula gives 35 points for a habitat match, so today every row gets 0 for Moon Base).
  - Sensors: FLEX and DAFT-2 rely on shared or missing descriptions; FLEX is empty.
- Judgment calls to review: `safety_area` is our classification from the PSI objectives (left empty for pure science studies). Oxygen for inverse flames (ACME-CFI-G, ACME-FLAME-DESIGN) is the burner flow, up to 85%; the row note says so.
- Done (code), live check pending: Task 2. `lib/ask.ts` holds the prompt, Groq (`llama-3.3-70b-versatile`) then Gemini (`gemini-3.5-flash-lite`) fallback, and the citation check (unknown ids are removed). `/api/ask` route, `components/ask/AskBox.tsx`, `npm run cache` in `prebuild` (never fails the build), `npm test` (3 citation tests). Verified here: tests, tsc, lint, build, browser screenshots of a cached answer with citation chips and of the no-key error message. The real AI call can only be checked on the Vercel preview (keys live only in Vercel).
- Note for Task 7: `data/demo-answers.json` is `{}` in git because this session has no keys. Vercel fills it during each build. For local recording, first fetch the 3 answers from the live `/api/ask` and save them into that file.
- Done: Task 3. `lib/score.ts` (formula from spec §6), `components/rank/RankView.tsx` (habitat select, oxygen slider 15 to 40%, safety area tabs, cards with score and reason, "How the score works" popover using the native HTML popover, no new dependency). The rank cards replaced the plain list and keep the `inv-<ID>` anchors, so Ask citation chips still jump to them. Moon Base = 17.5 if tested at 26.5% oxygen or more + 17.5 if tested at 10.2 psia or less (kPa converted and rounded to 0.1 psia, like NASA's list); a sourced `moon_base` label would still give the full 35. Safety area tabs reorder, they do not hide cards. Verified: 4 new score tests pass (7 total), tsc, lint, build, Playwright: slider reorders in under 20 ms, no console errors, desktop and phone screenshots.
- Demo note: at Moon Base, moving oxygen 21 → 30% changes the lower ranks (CFI drops, ACME-BRE and ACME-S-FLAME rise); the top 4 already cover Moon Base oxygen. Spacecraft shows a bigger reshuffle.
- Done: Task 4. `components/detail/DetailDrawer.tsx` (right-side drawer, every field + source links), `components/compare/CompareTable.tsx` (2 to 3 picked, one row per field, differing cells tinted, "Not in our data yet" for empty), shared field list in `lib/fields.ts`, native `<dialog>` wrapper in `components/ui/Modal.tsx` (Esc, focus trap, backdrop click closes; no new dependency). Each rank card has "Details" and a "Compare" checkbox (4th is disabled at 3); a sticky bar opens the table. Verified: 2 new field tests (9 total), tsc, lint, build, Playwright on desktop and phone: drawer opens, 3 picked, table shows, backdrop closes, no console errors.
- Demo tip for step 5 ("same hardware, different fuels"): compare FLEX and FLEX-2. Their hardware row stays plain (both MDCA + CIR) and the fuel row is tinted. Adding a third with other hardware tints the hardware row too.
- Added Task 5 (Motion) on 1 Nov at Osama's request; old Tasks 5 to 8 are now 6 to 9.
- Done: Task 6 (design, no Claude Design handoff; Claude designed it from the brief, acceptance rewritten to match). Light Apple-style tokens in `app/globals.css` (colors, radius, `shadow-card` and `shadow-lift`), system font + Inter fallback, `components/ui/button.tsx`, new `components/layout/` (header, footer with Back on Earth + Coming next), rank split into `RankCard.tsx` and `HowItWorks.tsx`. Verified: tests, tsc, lint, build, Playwright desktop 1440 and phone 390 screenshots of hero, rank, drawer, compare, footer, popover; no horizontal scroll; no console errors.
- Done: Task 5 (Motion 14.9.0). Cards glide with `layout="position"` (220 ms); Button lifts 1 px on hover and presses to 97% (150 ms); `MotionConfig reducedMotion="user"` in `components/motion/MotionProvider.tsx`. Drawer slide, compare fade and hero fade use `tw-animate-css` classes on the native `<dialog>` and the server-rendered hero (no wait for JavaScript), with a CSS reduced-motion fallback in `globals.css`. Verified with Playwright: Moon Base 21 → 30% reorders to the same order `lib/score.ts` gives, DOM updates in about 20 ms, cards settle in about 256 ms; with reduced motion no card moves; no console errors.
- Demo blocker found on 1 Nov (not fixed here): on the live site the cached answer for "Which experiments matter most for a Moon Base at 30% oxygen?" is "That is not in the data yet." (Gemini). Demo step 2 needs this fixed before Task 7: likely the prompt or the question wording, since no PSI row names the Moon.
- Done: Task 6b (network view, react-force-graph-2d 1.29.2). `lib/network.ts` builds nodes and links (1 new test, 10 total). `components/network/NetworkView.tsx` (section, legend, hover line, list view, its own copy of the existing DetailDrawer) and `NetworkGraph.tsx` (canvas, client only). On a phone the layout is pulled into a tall shape. Verified: Playwright at 1440 and 390, with and without reduced motion: hover, click → drawer, static under reduced motion, no horizontal scroll, no console errors; Rank drawer and Compare unchanged; tests, tsc, lint, build pass. Known: a click in the first half second after load can be missed while the graph library starts.
- Fixed 1 Nov (after Task 6b went live): (1) only some network nodes could be dragged. Cause: the graph library finds the node under the pointer on a hidden hit map that it redraws at most every 800 ms, so while dots were still moving it lagged behind what was drawn. Now the layout is computed before the first paint, the hit map is refreshed on every simulation step, the hit area = the drawn dot + 3 px, dots never overlap (collision force) and never leave the frame (bounds force), and dragging works with reduced motion too (neighbors stay put). Playwright drags and clicks all 20 nodes one by one: 20/20 on desktop mouse, phone touch and reduced motion. (2) Speed: the graph loads only when its section is near the screen and its drawing loop pauses off screen; after a drag it settles in at most 60 frames and stops. Rank cards are memoized and the ranking follows the slider at lower priority (`useDeferredValue`); the card glide is unchanged. The hero entrance is now a glide without the fade, because a fade from opacity 0 delayed LCP by about 1.9 s. Lighthouse mobile 88 → 97 to 99; LCP 3.2 s → 0.92 s; JS loaded with the page 253 → 195 KB; slider worst frame 83 to 117 ms → 50 to 67 ms at 4x CPU slowdown.
- Next: fix the Moon Base cached answer, then Task 7 (demo-check + video).
- Notes: shadcn components must be added by hand (or from npm packages) in this cloud session. Fonts: system stack first, Inter via `next/font/google` as fallback (downloads at build time).
