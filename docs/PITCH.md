# Pitch

Every fact here is from the challenge brief, the README or the site. No numbers the 13 November data update could change.

## 60 second version
In 1967, a fire in an oxygen-filled Apollo 1 cabin killed three astronauts during a ground test. Fire is still one of the biggest risks in space.

And in space, fire behaves differently. Without gravity, hot gas doesn't rise, so a flame has to pull in oxygen by diffusion.

NASA has studied this for decades and published the results. But, as the challenge says, the data is hard to find, harder to compare, and harder yet to interpret.

So I built Flame in Freefall. Pick a habitat, like a Moon Base, set the oxygen level, and NASA's experiments re-rank with a clear score and the reason behind it. Ask a question, and every claim in the answer cites the experiment it came from. Compare experiments side by side, and see what was never tested: no experiment in our data ran in Moon gravity.

Flame in Freefall. Fire safety answers in seconds, straight from NASA's data.

## 3 minute version

**1. Hook (20 s).** 1967, Apollo 1: a fire in an oxygen-filled cabin killed three astronauts during a ground test. Fire hazards followed later missions too: the Mir fire from an oxygen generator, and a smoke alarm on Artemis II. As we go back to the Moon, fire safety matters more than ever.

**2. The science (25 s).** In microgravity there is no buoyancy. Hot gas doesn't rise, and a candle flame becomes a blue sphere that gets its oxygen by diffusion. Moon habitats may use more oxygen at lower pressure, which makes materials more flammable.

**3. The problem (20 s).** NASA has studied microgravity fire for decades and publishes it in the Physical Science Informatics database. But the challenge brief puts it simply: hard to find, harder to compare, harder yet to interpret.

**4. Demo: Rank (35 s).** Here is Flame in Freefall. I pick Moon Base and raise the oxygen. The experiments re-rank instantly. Every card shows its score and why. The score is a published formula, not a black box. No PSI record names the Moon, so Moon Base is scored by the oxygen and pressure NASA considered for human missions.

**5. Demo: Ask (30 s).** Now I ask: which experiments matter most for a Moon Base? The answer comes only from NASA's records, and every claim cites its source. Before any answer is shown, code checks that each cited experiment exists and that every number appears in it. If it can't pass, the site shows an error instead of a guess.

**6. Demo: Compare, Network, Gaps (30 s).** I can compare up to three experiments side by side, with differences highlighted. The network shows which experiments share a fuel, hardware or project. And the gaps view shows what's missing: no experiment in the data ran in Moon or Mars gravity.

**7. Accuracy and next steps (20 s).** Every experiment links to its PSI record and DOI. Missing values stay empty, never guessed. Next: the official challenge resources, and partial gravity data from LUCI and FM2 when NASA publishes it.

**8. Close (10 s).** I'm Osama Saleh. This is Flame in Freefall: fire safety answers in seconds, straight from NASA's data.

## Slide outline (7 slides)
1. **Title.** Flame in Freefall · Osama Saleh · NASA Space Apps Challenge 2026 · live link.
2. **Why it matters.** Apollo 1 (1967), Mir, Artemis II smoke alarm. Return to the Moon.
3. **Fire in microgravity.** No buoyancy, spherical flames, more oxygen at lower pressure in Moon habitats.
4. **The problem.** PSI data: hard to find, harder to compare, harder yet to interpret (brief quote).
5. **The solution.** Screenshots: Ask, Rank, Compare, Network, Research gaps.
6. **Why you can trust it.** PSI records and DOIs, empty means not stated, published scoring formula, code checks on every AI answer.
7. **What's next.** Official resources, LUCI and FM2 partial gravity data, more PSI investigations. Links: live site, video, code.

Sources: challenge brief https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/ (Apollo 1, Mir, Artemis II, buoyancy, Moon atmospheres, LUCI, FM2) and the README data table.
