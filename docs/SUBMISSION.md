# Submission text

Paste these into the Space Apps project page. Check the official form fields when they are published on 13 November and move the parts into the matching boxes.

## Links
- Live site: https://flame-in-freefall-five.vercel.app
- Demo video: https://youtu.be/cmeFXMCAnpM
- Code: https://github.com/OSAMABASAM/NASA_flame_in_freefall
- Challenge: https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/

## Project name
Flame in Freefall

## One line
Find out in seconds which NASA microgravity fire experiments matter for a crew habitat, and why.

## Short description (about 100 words)
NASA has studied fire in microgravity for decades, but the results in its Physical Science Informatics (PSI) database are hard to find, compare and interpret. Flame in Freefall is a web dashboard built from NASA PSI investigation records. Ask a question in plain English and get an answer where every claim cites the investigation behind it. Pick a habitat, a cabin oxygen level and a safety area, and the investigations re-rank with a transparent score and the reasons behind it. Compare investigations side by side, see how they connect through shared fuel, hardware or project, and see which conditions were never tested.

## Full description (about 400 words)

**The problem.** In space, fire behaves differently: without buoyancy, hot gas does not rise and a flame gets its oxygen by diffusion. As crews prepare to return to the Moon, habitats may use more oxygen at lower pressure, which makes materials more flammable. NASA has studied microgravity combustion for decades and publishes the results in PSI, but, in the words of the challenge, the data "can be hard to find, harder to compare, and harder yet to interpret."

**What it does.** Flame in Freefall turns NASA PSI combustion investigation records into five views:
- **Ask.** Type a question. The answer is written only from the investigation records, and every claim cites a record id that links to it.
- **Rank.** Choose a habitat (spacecraft, space station or Moon Base), an oxygen level and a safety area (prevention, detection or suppression). Each investigation gets a score out of 100 from a published formula, with the reasons shown on its card.
- **Compare.** Up to three investigations side by side: fuels, oxygen, pressure, airflow, sensors and hardware, with differences highlighted.
- **Network.** A graph of investigations that share a fuel type, hardware or project.
- **Research gaps.** A grid of the oxygen, pressure and gravity conditions that were tested and the ones that were not. No investigation in PSI has run in partial gravity yet.

**How we kept it accurate.** Every investigation comes from its PSI record and DOI, listed in the README. Values PSI does not state are left empty and shown as missing, never guessed. Moon Base is scored by the oxygen and pressure NASA considered for human missions (from the ACME-BRE record), because no PSI record names the Moon. Each AI answer is checked in code before it is shown: every cited id must exist, and every number and name must appear in the record it cites. If no answer passes, the site shows an error instead.

**Who it is for.** Aerospace engineers, researchers and students designing fire safety for crew habitats who do not have time to read every PSI record.

**What's next.** Add the official challenge resources (13 November). Add partial gravity data when NASA publishes LUCI and FM2. Add more PSI investigations and test data.

**Limitations.** Ask runs on free AI tiers, so typed questions can fail when both providers are busy; the example questions answer from a checked cache. Many records do not state oxygen or pressure ranges, and those investigations score lower because missing data scores 0.

## Use of AI
- Inside the product: the Ask feature uses large language models (Groq `openai/gpt-oss-120b`, with Google Gemini as fallback), limited to the investigation records and checked in code before display.
- Building it: I used Claude Code (Anthropic) as a coding assistant. The idea, the decisions, the data checks and the demo voice are mine.

## Team
Osama Saleh, solo. Computer science student.
GitHub: https://github.com/OSAMABASAM · LinkedIn: https://www.linkedin.com/in/osamabasamsaleh/

Not affiliated with or endorsed by NASA.
