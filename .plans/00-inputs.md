# Inputs: NASA Space Apps Challenge 2026

## Challenge
Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data
https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/
Difficulty: Advanced, Intermediate. Subject: Space Exploration.

### Summary (verbatim)
For decades, NASA has studied how flames and fire behave in microgravity, gathering a trove of experimental data along the way. That knowledge matters more than ever as humans gear up to return to the Moon and press on to Mars, yet the volume of results makes them hard to find, compare, and understand. Your challenge is to create an interactive, super intelligence (SI) powered dashboard that summarizes, ranks, and interprets those findings to deliver fire safety insights for human space exploration.

### Background (key facts, from the challenge text)
- Fire hazards in space: Artemis II smoke alarm ("...when you're still about 80,000 miles from home"), Apollo 13 oxygen tank explosion, Mir fire from an oxygen generator failure, Apollo 1 crew died in a 1967 pre-launch test fire in an oxygen-filled spacecraft.
- In microgravity there is no buoyancy; a candle flame becomes a blue sphere that relies on diffusion for oxygen.
- NASA spacecraft fire safety = prevention, detection, suppression.
- Prevention: ignition source control and material selection, which depends on flammability limits.
- Moon Base and pressurized rovers: increased oxygen, reduced pressure. Flammability depends strongly on oxygen concentration; airflow also matters in microgravity.
- Solid materials flammability: BASS, BASS-II, Saffire-I, -II, -III.
- Detection: SAME, SAME-R (smoke and aerosol measurement).
- Suppression: FLEX (dilution with carbon dioxide and helium).

### Objectives (verbatim)
Results from low-gravity combustion experiments, conducted for example on the International Space Station (ISS), are being made publicly available through NASA's Physical Science Informatics (PSI) database, but the amount of data can be overwhelming. It can be hard to find, harder to compare, and harder yet to interpret.
Build an SI-powered, web-based dashboard that summarizes, ranks, and interprets combustion science investigations to deliver critical foundational insights for fire safety. You may consider enabling users to:
- Identify investigations most relevant to the fire safety needs of habitable crew environments, including spacecraft, space stations, bases on the lunar and Martian surfaces, and pressurized rovers.
- Extract data that supports predictive modeling of flammability and fire scenarios in space exploration.
- Highlight research that informs the development of next-generation fire safety controls and equipment.
Optional: applications of PSI data to fire safety on Earth (fine-water-mist extinguishers, smoke detection, firefighter gear, protective clothing, air tanks).
Out of scope: rockets and propellants.

### Potential considerations (summary)
- Audience: professors, graduate and undergraduate students, aerospace researchers and engineers.
- Display per investigation: objectives; fuels (shape, size of samples or burners); test conditions (oxygen concentration, airflow speed); variables (how tests in one investigation differed and were the same); sensors / measurement types.
- Show similarities and differences between investigations.
- Other PSI investigations: DAFT, DAFT-2 (dust, same instrument as SAME); ACME Burning Rate Emulator (BRE): gaseous fuels, materials flammability in still atmospheres vs material properties.
- Hardware: six ACME experiments, gaseous fuels, same modular hardware in the Combustion Integrated Rack (CIR). FLEX, FLEX-2, Cool Flames Investigation (CFI): burning liquid fuel droplets, Multi-user Droplet Combustion Apparatus (MDCA) in the CIR. BASS, BASS-II, SPICE (Smoke Point In Co-flow Experiment), SLICE (Structure & Liftoff In Combustion Experiment): solid and gaseous fuels, Microgravity Science Glovebox (MSG), fan-driven flow duct built for SPICE.
- Spacesuits: 100% oxygen at 4.3 psi (Earth sea level 14.7 psi). Moon Base / rovers: likely 30% oxygen or more at 10.2 psi or less; more than 40% increase in oxygen concentration vs Earth, making materials much more flammable.
- Highest oxygen in microgravity tests: ACME CFI-G, oxygen-nitrogen mixture up to 85% oxygen from a spherical burner (inside-out flame), chamber filled with nitrogen and a flammable gas (e.g. propane).
- No partial-gravity combustion data in PSI yet; future: LUCI (Lunar-g Combustion Investigation), FM2 (Flammability of Materials on the Moon). E-FIELD Flames (ACME) mimicked partial gravity with an electric field. Microgravity and normal-gravity results could bound intermediate gravity.

## Resources
Resources tab opens on Friday 13 November 2026. PSI data is already public: https://science.nasa.gov/physical-sciences-informatics-psi/

## Judging (1 to 5 each)
Impact, Creativity, Validity, Relevance, Presentation. Balance all five.

## Constraints
- Solo team, online, from Gaza.
- Build window with Claude Code: 1 and 2 November 2026; 3 November rehearsal and fixes only (Claude Code budget, about 100 USD of tokens, ends 4 November).
- On 13 November the resources must be added by Osama alone, in simple steps, without Claude Code.
- Free tiers only for the AI inside the site (Groq primary, Gemini fallback).
- Submission rules, deadline and video length: UNKNOWN, Osama to paste them when published.
