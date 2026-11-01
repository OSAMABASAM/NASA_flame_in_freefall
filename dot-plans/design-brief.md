# Design brief (paste into Claude Design)

Product: "Flame in Freefall", a NASA fire safety data dashboard for aerospace engineers.
Mood: calm, scientific, trustworthy, a little cinematic. Dark background like space, one warm accent like a blue flame turning orange. Not neon, not "AI startup".
Type: one clean sans for UI and numbers, optionally one display face for the hero headline.
Reference feel: NASA mission pages and modern data tools such as Linear or Vercel dashboards (clean grids, generous space).

Make a design system (colors, type, spacing, radius, components: button, chip, card, slider, tabs, table, drawer), then only these screens:
1. Home hero: headline, one-line context (Apollo 1, Artemis II), big ask box, 3 example question chips, answer area with citation chips.
2. Rank view: left controls (habitat select, oxygen slider 15 to 40%, safety area tabs: all, prevention, detection, suppression), right a grid of investigation cards (name, short objective, score badge, reason line, fuel and hardware tags).
3. Detail drawer: fields list (objective, fuel, oxygen range, pressure, airflow, sensors, hardware, safety area, habitats, Earth application, source link).
4. Compare table: 3 columns, differing cells highlighted, empty cells "Not in our data yet".
5. Footer strip: "Back on Earth" and "Coming next: LUCI and FM2 partial-gravity data".

Then: Export > Handoff to Claude Code, and Export standalone HTML into `docs/design/`.
