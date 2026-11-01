# Demo video plan

Target length: 90 seconds. Change it the moment Space Apps publishes the official limit.
The video is recorded once on 2 November. The voice never mentions a number that the 13 November data could change (no "17 experiments", no scores), so it stays correct.

## How it is made
**Plan A: Claude Code records it (Task 7).** Claude runs the site inside its cloud session, Playwright clicks through the timeline below and records the screen. Osama records only his voice on his phone, reading the voice lines, and uploads it on github.com as `docs/demo/voice.mp3`. Claude merges screen + voice + title and end cards into `docs/demo/final.mp4`, which Osama downloads from github.com.

**Plan B: Osama records it (only if Plan A fails in the cloud).** OBS Studio (Ubuntu Software app): Sources → + → Screen Capture, keep Mic/Aux on, record mp4 while clicking the live site and reading the voice lines. Several takes are fine.

Either way, upload the final video to YouTube as unlisted (backup and usually the submission link).

## Timeline and voice-over (English)
| Time | Screen | Voice |
|---|---|---|
| 0–4 s | Title card: "Flame in Freefall" + one line "Fire safety insights from NASA microgravity combustion data" | (silence or music) |
| 4–18 s | Home hero | "In 1967, fire killed the Apollo 1 crew. As we head back to the Moon, fire is still one of the biggest dangers in space. NASA has years of fire experiments from orbit, but finding the right one takes days." |
| 18–38 s | Click the Moon Base example question, answer appears with citations, click one citation | "Flame in Freefall answers in seconds. I ask which experiments matter most for a Moon base, and it answers only from NASA's data, with every claim linked to its source." |
| 38–58 s | Rank view: habitat Moon Base, drag oxygen from 21% to 30%, cards reorder, open "How the score works" | "The ranking is transparent, not a black box. A Moon base will likely run at thirty percent oxygen or more. As I raise it, the experiments reorder, and every card says why." |
| 58–74 s | Open one card, then compare three investigations | "I can open any investigation to see its fuel, oxygen, airflow and sensors, and compare experiments side by side to spot what changed." |
| 74–86 s | Footer: Back on Earth, Coming next: LUCI and FM2 | "It also shows what this research means for fire safety on Earth, and it's ready for partial-gravity data from future missions." |
| 86–90 s | End card: "Flame in Freefall · Osama Saleh · NASA Space Apps 2026" + live link | "Flame in Freefall. Making the next giant leap a safer one." |

Facts used in the voice-over come from the challenge text: Apollo 1 (1967), Moon Base oxygen likely 30% or more, LUCI and FM2 partial-gravity experiments.
