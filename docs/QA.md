# Judge questions and honest answers

Short answers first. If a judge pushes, give the detail line.

**1. Where does the data come from?**
NASA Physical Science Informatics (PSI). Every investigation in the site links to its PSI record and DOI; the full table is in the README.

**2. How do you know the numbers are right?**
They are copied from the PSI records and their test tables, one row per investigation, with the source on each row. If PSI does not state a value, the cell stays empty and the site shows it as missing. We never guess.

**3. Can the AI make things up?**
It can try, so we check it. The model only gets the investigation records, and every claim must cite a record id. Code then checks that each id exists and that every number and name appears in the record it cites. A failed answer gets one retry; if it still fails, the site shows an error, not the answer.

**4. How does the ranking work?**
A plain sum out of 100: 35 for the habitat, 25 if the chosen oxygen is inside the tested range (12.5 if close), 20 for the safety area, 10 for airflow data, 10 for being checked against NASA sources. The formula is shown on the site and every card lists the reasons it scored.

**5. No experiment ran on the Moon. How can you rank for a Moon Base?**
Right, none did, and the site says so. Moon Base is scored by conditions instead: oxygen at 26.5% or more and pressure at 10.2 psia or less, which are atmospheres NASA considered for human missions, listed in the ACME-BRE PSI record.

**6. Why do some investigations score low?**
Often because PSI does not state their oxygen or pressure range, and missing data scores 0. That is a data gap, not a judgment of the experiment, and the Research gaps view makes it visible.

**7. Is this really an "AI dashboard"?**
AI powers Ask, the question and answer part. Rank, Compare, Network and Research gaps are deterministic and computed from the data, on purpose, so the core results are transparent and repeatable.

**8. The video says experiments show "key results". Where are they?**
Honest answer: the records hold each experiment's objective, what was varied, why it matters and its Earth application, not a results table. Adding measured results from PSI data files is a next step.

**9. The video says the graph shows how one result leads to another. Is that what it does?**
Not exactly. The network connects investigations that share a fuel type, hardware or project. It shows which experiments are related, not a chain of results. Linking findings is future work.

**10. What happens if the AI service is down during judging?**
The example questions answer instantly from a cache that passed the same checks. Rank, Compare, Network and Gaps never need AI.

**11. What are the main limitations?**
Free AI tiers can be busy, many records lack oxygen or pressure ranges, there is no partial gravity data in PSI yet, and the dataset is a snapshot, not a live feed.

**12. What would you build next?**
Add the official challenge resources, add LUCI and FM2 partial gravity data when NASA publishes it, cover more PSI investigations, and pull measured values from PSI data files for predictive modeling.

**13. Who would use this?**
Aerospace engineers, researchers and students working on fire safety for spacecraft, stations, Moon bases and rovers, who need the right experiment in minutes, not days.

**14. Did you use AI to build it?**
Yes. I used Claude Code as a coding assistant. The idea, the decisions, the data checks and the demo are mine. The site itself uses Groq and Gemini models for Ask.
