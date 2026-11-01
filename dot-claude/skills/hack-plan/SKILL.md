---
name: hack-plan
description: Step 2. Interview the user relentlessly about the locked idea, then write a build spec and a task list split for parallel work, saved in .plans/. Use after /hack-start, or when the user says "plan it", "write the spec", or "interview me".
---

# Hack Plan: interview, spec, task split

Read `.plans/00-idea.md` and `.plans/00-inputs.md` first. If they do not exist, run the hack-start steps briefly or ask for the idea.

## 1. Interview (based on Johnathan Mo's /interview skill, MIT)

Use the AskUserQuestion tool. Ask non-obvious questions, in batches of up to 4, about:
- The exact demo flow and what the judge sees on each screen.
- Data: where it comes from, its shape, what happens if it is missing or slow.
- Stack: propose one using the stack table below, per feature, and ask the user to confirm or object. Unfamiliar tech "to look cool" is a top failure cause.
- AI inside the product: which model and API, free-tier limits, fallback if the API fails during the demo.
- UI and UX: one reference site or screenshot to copy the feel from (agents copy better than they invent).
- Deploy: where the live link will run (for example Vercel, Netlify, Hugging Face Spaces) and what needs env vars.
- Tradeoffs and what we will deliberately fake or stub (must be labeled in the UI as sample data).

Keep going until there are no open questions that would change the build. Stop when answers start repeating.

### Stack table (start from the default; change a row only when a feature truly needs it)

| Part | Default | Change only if |
|---|---|---|
| Frontend | Next.js + TypeScript + Tailwind + shadcn/ui (see /design-kit) | almost never |
| Server logic and AI calls | Next.js API routes (route handlers) | heavy computation → move that part to Python |
| Data processing / science | Python (pandas) script run once, outputs JSON files committed to the repo | must compute live per request → Python FastAPI service |
| Database | none: static JSON files | users, accounts, or data that changes → Supabase |
| AI model | Groq primary + Gemini fallback, called only from the server, answers cached | the event or a sponsor requires a specific provider |
| Charts | Recharts or a shadcn chart | a graph or network view → a graph library such as react-force-graph |
| Deploy | Vercel | a Python service → Render or Hugging Face Spaces |

Rules:
- Two languages maximum: TypeScript for the app, Python only for data work.
- Decide the stack here, in the plan. After the plan is written, change it only for a blocking reason, and write the reason in the spec.
- For every must-have feature, write one line in the spec: feature → language → where it runs → library.

## 2. Write the spec: `.plans/spec.md`

Sections, in this order:
1. One-liner and target user.
2. **Demo script first**: the exact click path, with the sentence the presenter says at each step.
3. Must-have features (max 3) with acceptance checks a script can verify.
4. Architecture: the smallest thing that works. One diagram in text.
5. Data and APIs, with free-tier limits and the fallback for each.
6. Stack and why, plus the feature → language → where it runs → library table.
7. Risks, ordered. The riskiest one is built first.
8. Cut list (copied from the idea file, extended).
9. Time plan with a **feature freeze** time (at least 25% of total time before the deadline) and a "working demo exists" checkpoint at about 50%.

## 3. Split into tasks: `.plans/tasks.md`

- Task 0 is always a walking skeleton: one thin path through the whole app, from input to output, deployed. Ugly is fine.
- Then one task per piece that can be built independently. For each task: goal, files it owns, inputs and outputs, acceptance check, estimated time.
- Mark tasks that can run in parallel. Parallel tasks must not edit the same files.
- Order: riskiest first, then demo-critical, then polish.

## 4. Design step (before building)

Write `.plans/design-brief.md`: the demo screens in order, what each must show, the mood, and one reference site. Tell the user to paste it into Claude Design (Output > Design in a Claude conversation, or `/design` in Claude Code), make a design system plus only the demo screens, then use Export > Handoff to Claude Code (Send to Claude Code Web for cloud sessions, or Send to local coding agent). Also export standalone HTML into `docs/design/` as a backup. The same design system is used later for the pitch slides.

## 5. Hand off

Tell the user the plan path and say: "Next: design in Claude Design, then /hack-build in a fresh session."
