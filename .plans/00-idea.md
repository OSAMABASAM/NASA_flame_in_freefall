# Locked idea: Flame in Freefall dashboard

## One-liner
A dashboard that answers an aerospace engineer in seconds: "Which NASA microgravity fire experiments matter for my habitat, and why?"

## Target user
An aerospace engineer, researcher or graduate student designing fire safety for a crew habitat (Moon Base, rover, station, spacecraft, Mars base) who has no time to read the PSI database.

## Wow moment
The presenter picks "Moon Base" and drags oxygen from 21% to 30%. The ranking reorders live, with the reason shown on each card. Then they ask the same question in the search box and get a cited answer.

## Demo flow
1. Home: one sentence of context (Apollo 1, Artemis II) and a big "Ask the fire data" box with 3 example questions.
2. Ask "Which experiments matter most for a Moon Base at 30% oxygen?" → answer citing investigations, each citation clickable.
3. Rank view: choose habitat + oxygen slider + safety area (prevention, detection, suppression). Cards reorder; each shows score and "why".
4. Open one card: objective, fuel, oxygen, airflow, sensors, hardware, source link.
5. Compare 2 to 3 investigations side by side; differences highlighted.
6. Closing strip: "Back on Earth" (water mist, smoke detection) and "Coming next: LUCI and FM2 partial-gravity data".

## Must-haves (3)
1. Ask (AI answers grounded only in our dataset, with citations).
2. Rank (transparent scoring by habitat, oxygen, safety area).
3. Compare (side-by-side table).

## Cut list
Accounts and login. Database. Graph or network view (stretch only, after everything else works). Raw time-series plots from PSI files. Multiple languages. Mobile app. Rocket and propellant fire. Uploading files.

## Top risk
Getting accurate per-investigation facts (oxygen range, airflow, sensors) from PSI with sources. Mitigation: a hand-editable CSV with a source column; empty cells shown as "not in our data yet", never guessed.
