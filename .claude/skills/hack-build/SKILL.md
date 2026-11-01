---
name: hack-build
description: Step 3. Execute .plans/tasks.md fast and safely, riskiest first, integrating continuously and verifying each task before calling it done. Use when the user says "build", "start coding", "next task", or after /hack-plan.
---

# Hack Build: ship a working demo, then make it better

Read `.plans/spec.md` and `.plans/tasks.md`. If a Claude Design handoff exists (via `/design`) or files exist in `docs/design/`, the UI must match that design: same layout, colors, fonts, spacing. Do not invent a new look. Keep a progress section at the bottom of `tasks.md` (done, in progress, blocked, cut).

## Rules

1. **Walking skeleton first.** Task 0 must run end to end and be deployed before any feature work. Show the user the live link.
2. **Riskiest first.** The part most likely to fail (data access, the AI call, the hardest algorithm) comes before UI polish.
3. **Integrate after every task.** Never leave integration to the end. After each task, the full demo flow must still run.
4. **Verify before "done".** For each task:
   - Risky logic: write the test first, watch it fail, then implement.
   - Run the type checker or linter if the stack has one.
   - Run the app and walk the demo flow. For web UI, open it in a browser (Playwright) and take a screenshot. Look at it.
   - Only then mark the task done.
5. **Parallel work.** When tasks are marked parallel and own different files, give each one to a subagent with a short brief: goal, files it owns, acceptance check. Use worktree isolation when they touch the same repo heavily. Each subagent costs usage, so only parallelize when it saves real time.
6. **Cut, do not drown.** If one bug eats more than 30 minutes, stop, use /diagnosing-bugs once, and if still stuck propose cutting or stubbing the feature. Tell the user.
7. **Honest data.** If data is sample or mocked, label it in the UI. Judges punish fakes they discover.
8. **Commit often** with clear messages, so any bad change can be reverted in seconds.
9. **Feature freeze.** At the freeze time in the spec, stop adding features. Only fix bugs, polish the demo path, and prepare the pitch.
10. **Context hygiene.** One task per session when possible. If the conversation gets long, write a /handoff and suggest a fresh session.

## Polish pass (only after the demo flow works end to end)

- `/design-kit` to wire the design tokens, shadcn components, Motion and (last) GSAP + Lenis scroll motion.
- `/impeccable polish` or `/jmo-workflow:better-ui` for interface quality.
- `/jmo-workflow:animate` for a few purposeful animations on the demo path only.
- `/ponytail-review` to cut unneeded code before submission.

## After each task

Report in 3 lines: what changed, how it was verified, what is next.
