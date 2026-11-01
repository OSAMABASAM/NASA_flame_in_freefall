---
name: hack-start
description: Step 1 of a hackathon or fast project. Turn a messy brain dump plus the event rules into one locked idea, written to .plans/00-idea.md. Use at the very start, when the user says "brain dump", "what should I build", "pick an idea", or pastes a hackathon theme or challenge.
---

# Hack Start: from brain dump to one locked idea

Goal: leave this step with ONE idea, locked, inside the first 1 to 2 hours. Indecision is the most common way teams lose time.

## 1. Collect the inputs (ask only for what is missing)

Ask the user to paste, in one message, whatever they have:
- The theme, tracks or challenge statements, and the **judging criteria with weights**.
- Sponsor prizes and the sponsor tools or APIs (sponsor judges reward projects that show off their tech).
- Deadline, submission requirements (video length, repo, deploy link, deck), team size and skills.
- Their raw brain dump: ideas, interests, voice-note style rambling. Accept it messy.

Save the inputs verbatim to `.plans/00-inputs.md` before doing anything else.

## 2. Research the PROBLEM, not the idea

Do not ask the model "what should I build". For each promising theme or challenge:
- Who exactly has this problem? Name one specific user (not "everyone").
- How often does it happen, and what does it cost them (time, money, risk)?
- What do they use today, and why is that not enough?
- Is there real data or an API we can use in the time we have?

Use web search for facts. Every number must have a source link. If you cannot find a source, write "no source found" instead of a number. Never invent statistics.

## 3. Generate, then score

Generate 6 to 8 candidate ideas. Include at least one "craziest cool thing" and then check if a reduced version is feasible.

Score each idea from 1 to 5 on:
| Criterion | Question |
|---|---|
| Judging fit | How well does it hit the official criteria, weighted as the event weights them? |
| Wow demo | Is there one moment in a 2-minute demo that makes a judge say "yes, that one"? |
| Feasible | Can a working end-to-end version be built in the time with this team's skills and free tools? |
| One sentence | Can a non-technical person understand it from one sentence? |
| Specific user | Is there a named user with a real, evidenced pain? |
| Sponsor/tool use | Does it use the sponsor tech or the provided data in a visible way? |

Show the table. If two ideas are close, offer `/council` for a structured decision.

## 4. Think backward from the win

For the top idea, write the award moment first: "We won because the judges saw ___". Then derive:
- The one-sentence pitch.
- The demo flow: the 3 to 5 screens or steps the judge will see, in order.
- Must-have features: maximum 3, each one visible in the demo.
- Cut list: everything else, written down so nobody builds it.
- Biggest technical risk, and how to test it in the first hour.

## 5. Lock it

Write `.plans/00-idea.md` with: one-liner, target user, problem evidence (with links), wow moment, demo flow, must-haves, cut list, top risk, judging-criteria mapping.

Then tell the user: "Idea locked. Next: /hack-plan". Reply in the user's language, simply.
