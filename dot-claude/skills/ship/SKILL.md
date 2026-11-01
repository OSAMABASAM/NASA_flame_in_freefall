---
name: ship
description: Step 6. Prepare and check everything the submission needs (README, description, video, links), so nothing fails at the deadline. Use when the user says "submit", "ship", "submission", "final checks", or in the last hours before the deadline.
---

# Ship: submit early, submit complete

Read `.plans/00-inputs.md` for the exact submission requirements. If they are missing, ask the user to paste the submission page fields.

## 1. README.md (judges open the repo)

- Project name and one-liner.
- Screenshot or GIF at the top (from `docs/demo/`).
- Live demo link and video link.
- The problem, the user, and the solution, in plain language.
- How it works, with a short architecture diagram in text or an image.
- How to run locally (copy-paste commands, `.env.example` with variable names, no secrets).
- Data sources and APIs, with credit and licenses.
- What is real versus sample data.
- Honest note on AI tools used to build it, if the rules ask for it.
- Team and contact.

## 2. Submission text

Draft each field the submission form asks for, within its character limit. Plain language, problem first, no buzzword stacking. Save to `docs/SUBMISSION.md` so it can be copy-pasted, and suggest the user paste it into a Claude Docs document to edit calmly and keep a backup.

## 3. Video

If a video is required:
- Respect the length limit exactly.
- Open with the problem in one sentence, then the demo, then the result.
- Use `docs/demo/backup.webm` or record a new Playwright run of the demo script. The user records their voice-over separately; merge with ffmpeg, add a title card at the start and a name card at the end.
- Upload where the rules require and check the link plays in a private window.

## 4. Final checklist (run every item, report pass or fail)

- [ ] Repo is public (if required) and the default branch has the final code.
- [ ] No secrets committed (search for keys, tokens, `.env`).
- [ ] Live link works in a private window on desktop and phone.
- [ ] Video link plays in a private window.
- [ ] Every required form field is filled.
- [ ] Team members are added on the submission platform.
- [ ] Submitted at least 1 hour before the deadline. Edit later if the platform allows it.

Tell the user clearly what is still missing.
