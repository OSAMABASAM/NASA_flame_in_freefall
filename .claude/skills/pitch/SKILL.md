---
name: pitch
description: Step 5. Build the pitch script, a slide outline, and Q&A preparation from the spec and the working demo. Use when the user says "pitch", "presentation", "slides", "what do I say to the judges", or after feature freeze.
---

# Pitch: sell what you built, honestly

Read `.plans/00-idea.md`, `.plans/spec.md`, and `docs/DEMO_CHECK.md`. Ask for the time limit if unknown.

## Structure (problem before tech, always)

1. **Hook question** the audience can answer with a raised hand or a nod. Ties directly to the problem.
2. **Problem and who has it.** One specific user.
3. **Evidence.** 1 to 3 real facts with sources (reports, surveys, news). Only use facts already sourced in the plan files or found now by web search with a link. Never invent a number.
4. **Cost of the problem.** Time, money, or risk lost.
5. **Solution in one sentence** a non-technical judge understands. No buzzword lists.
6. **Live demo** following the demo script. Main feature first. Say why it was built this way for this user.
7. **Before and after.** A concrete comparison (for example "2 hours of manual work becomes 30 seconds").
8. **How it works** (short): architecture, what was hard, what you are proud of technically.
9. **What is next** and, if relevant, the team.

## Deliverables

- `docs/PITCH.md` with three versions of the script: 60 seconds, 3 minutes, 5 minutes. Mark where each demo step happens.
- A slide outline (one line per slide). Keep slides visual, maximum about 15 words each. Tell the user to build the deck in Claude (Slides or Claude Design) with the same design system as the product, and export PDF or PPTX from the Export button.
- `docs/QA.md`: the 15 most likely judge questions with short, honest answers. Include: why this stack, who is the user, what is real versus sample data, how the AI part works, what does it cost to run, what would you build next, how is it different from existing tools.

## Honesty rules

- If a feature is not built, say "not built yet, next step is ___". Never bluff; judges notice.
- If something in the demo uses sample data, say so before they ask.

## Rehearsal

Tell the user to rehearse out loud at least 3 times with a timer, record one run on the phone, and cut anything that does not serve the problem, demo, or result.
