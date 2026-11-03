# Demo video plan

Published: https://youtu.be/cmeFXMCAnpM (unlisted, 64 s, file `docs/demo/final.mp4`).

Target: about 60 seconds. If Space Apps publishes a shorter limit, cut scenes 5 and 6 first.
No music. Sound = Osama's voice, a low fire crackle and space rumble in the background, and short sound effects on transitions and clicks (whoosh, click, pop, soft boom).
The voice never says a number that the 13 November data could change.

The script below is the one Osama recorded in `docs/demo/voice.mp3` (2 Nov). The captions in the video use these exact words. How the video is made: `docs/demo/README.md`.

## Files in `docs/demo/`
- `voice.mp3`: the 9 lines below, read in order.
- `fire.mp3`: a fire crackling sound effect (YouTube Audio Library, Sound effects tab).

## Script
| # | Screen | Voice |
|---|---|---|
| 1 | Black. A spark lights a flame, the title "Flame in Freefall" appears | What happens to a flame when there's no gravity? |
| 2 | Moon, then the site's hero | On Earth, fire rises. In space, it doesn't. |
| 3 | Hero stat cards | NASA has run years of combustion experiments in microgravity, but most of that data sits in long reports that are hard to read. |
| 4 | "Flame in Freefall" card, then Rank: Moon Base, drag oxygen up, cards glide to new places | So I built Flame in Freefall, an AI dashboard that turns NASA's microgravity combustion data into answers anyone can understand. |
| 5 | Open one card, then compare three | First, experiment summaries. Every experiment explained in plain language, with its key results at a glance. |
| 6 | Network: hover a node, its neighbors light up | Second, the data graph. Experiments, materials and findings, all connected. See, you can see how one result leads to another. |
| 7 | Type the Moon Base question, answer with citations, click one citation | And third, ask the data. Type any question, and the answer comes straight from NASA's data, not from guesses. |
| 8 | Research gaps: the headline card, then the orange Moon cells | Space research shouldn't be locked inside reports. It should be open to every curious mind. |
| 9 | End card: flame mark, "Flame in Freefall", Osama Saleh, live link, Space Apps logo | I'm Osama Saleh, a computer science student. This is Flame in Freefall, my project for NASA Space Apps 2026. |

## Facts behind the lines
- Fire behaves differently without gravity: without buoyancy, hot gas does not rise, which is why NASA studies combustion in microgravity (challenge brief and NASA PSI records). Backs line 2.
- All 20 investigations in `data/investigations.json` are NASA microgravity combustion investigations, from the NASA Physical Sciences Informatics (PSI) system. Backs "combustion experiments in microgravity" (line 3).
- The challenge brief says the data is hard to find, compare and interpret. Backs "hard to read" (line 3).
- The Ask answers are written only from the investigation data on the page, and every claim cites an investigation id (`lib/ask.ts` checks ids, numbers and names). Backs line 7.
- Event: NASA Space Apps Challenge 2026, challenge "Flame in Freefall" (`.github/agent/PROJECT.md`). Backs line 9.

## Not backed by the data yet (Osama to decide)
- Line 3, "years of": the data has no dates, so how many years is not shown on the site.
- Line 3, "long reports": the brief says hard to find, compare and interpret; it does not say long reports.
- Line 4, "an AI dashboard": only Ask uses AI. Rank uses a transparent formula, and the other views show the data as it is.
- Line 5, "key results": the records have objective, what was varied, why it matters and back on Earth, but no results field.
- Line 6, "materials and findings, all connected" and "how one result leads to another": the network links investigations that share a fuel type, hardware or project. Fuel is close to "materials"; findings and results are not linked.
- Line 9, "computer science student": personal, not in the repo.
