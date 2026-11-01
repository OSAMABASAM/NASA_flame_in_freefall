# Project memory

## Who I work with
- Osama. Reply in Arabic unless he writes in English. Explain simply: everyday analogy first, then the accurate version. Unpack jargon.
- He builds mainly by prompting, so explain what you changed in plain words after each task.

## This project (fill in at the start, keep it short)
- Name: Flame in Freefall dashboard
- One-liner: answers in seconds which NASA microgravity fire experiments matter for a crew habitat, and why.
- Event: NASA Space Apps Challenge 2026, challenge "Flame in Freefall". Solo, online. Deadline and video rules: unknown yet.
- Judging: Impact, Creativity, Validity, Relevance, Presentation, 1 to 5 each.
- Demo flow: ask box → cited answer → rank by habitat and oxygen → detail → compare.
- Live link:
- SIMPLE BUILD: read `.plans/spec.md` section 0 (simplicity contract) before every task. Three features only. No GSAP or Lenis in this project.
- The idea is LOCKED. Skip /hack-start and /hack-plan. Plans are ready in `.plans/` (inputs, idea, spec, tasks, design-brief). Start with `/hack-build` Task 0.
- Data lives in `data/investigations.csv` and is built with `npm run data`. Never edit `investigations.json` by hand. Never guess a value: leave it empty.
- Claude Code budget ends 4 Nov. The build is done in two days: 1 and 2 Nov; 3 Nov is rehearsal and fixes only. Osama works ONLY in the browser (Claude Code on the web, github.com, vercel.com); never ask him to run commands on his computer. Everything after 4 Nov (13 Nov data day) must work by editing the CSV on github.com. Keep `docs/DATA_DAY.md` and `docs/VIDEO.md` accurate.

## Hackathon workflow (run in this order)
1. `/hack-start`  brain dump and rules in, one locked idea out (`.plans/00-idea.md`)
2. `/hack-plan`   interview, spec, parallel task list (`.plans/spec.md`, `.plans/tasks.md`)
2.5 Design      Osama designs the demo screens in Claude Design, then Export > Handoff to Claude Code. Run `/design` to import it. Backup HTML export lives in `docs/design/`. Build the UI to match it.
3. `/hack-build`  walking skeleton first, riskiest first, verify every task
4. `/demo-check`  real browser run of the demo, screenshots, backup video
5. `/pitch`       script (60s, 3min, 5min), slide outline, Q&A
6. `/ship`        README, submission text, video, final checklist

Helpers: `/council` for hard choices, `/grill-me` to stress-test a plan, `/prototype` for a quick throwaway test, `/diagnosing-bugs` for a stuck bug, `/handoff` before starting a fresh session.
Design: `/design-kit` (tokens, shadcn, Motion, GSAP + Lenis), `/impeccable`, `/jmo-workflow:better-ui`, `/jmo-workflow:animate`. Lean code: `/ponytail-review`.

## Design source of truth
- If a Claude Design handoff or files in `docs/design/` exist, build the UI to match them exactly (colors, fonts, spacing, layout). Do not invent a new look.
- Pitch slides are made in Claude Slides with the same design system. Submission text is drafted in `docs/SUBMISSION.md` and edited in Claude Docs.

## Rules that win
- An ugly demo that works beats a beautiful one that breaks.
- Build only what appears in the demo. Everything else goes on the cut list.
- Integrate after every task. The full demo flow must always run.
- Never call a task done without running it. For UI, open it in a browser and look at a screenshot.
- Never invent numbers, facts, quotes, or sources. Every statistic needs a link. Label sample data in the UI.
- Prefer boring, familiar tech. Copy the feel of a reference design rather than inventing one.
- After feature freeze: only bug fixes, demo polish, pitch, submission.

## Saving usage
- One task per session. Use `/handoff` then start fresh rather than letting context grow huge.
- Plan mode (Shift+Tab) for big tasks only, not for small edits.
- Point to exact files instead of letting the agent explore the whole repo.
- Before a big job, check `/context` and `/usage`.
- Subagents cost a full conversation each. Parallelize only when it saves real time.

## Code style
- Small, readable files. No dead code. No new dependency when the platform or an existing one already does it.
- User-facing text in sentence case (no ALL CAPS headings).
- Keep secrets in `.env` (git-ignored) and document names in `.env.example`.
