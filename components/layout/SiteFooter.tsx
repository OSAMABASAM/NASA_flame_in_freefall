import type { Investigation } from "@/lib/data";

const CHALLENGE = "https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/";

// Demo step 6: "Back on Earth" from the data, and the partial-gravity data NASA has not published yet.
export function SiteFooter({ investigations }: { investigations: Investigation[] }) {
  const earth = investigations.filter((i) => i.earth_application);
  return (
    <footer className="mt-20 border-t bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 items-start md:grid-cols-[3fr_2fr]">
        <section aria-labelledby="earth" className="rounded-xl border bg-card p-6">
          <h2 id="earth" className="text-lg font-semibold">Back on Earth</h2>
          <p className="mt-1 text-sm text-muted-foreground">What these space experiments help with on the ground, as NASA states it.</p>
          <ul className="mt-5 divide-y text-sm">
            {earth.map((i) => (
              <li key={i.id} className="flex gap-3 py-2.5">
                <a href={`#inv-${i.id}`} className="w-36 shrink-0 font-mono text-xs leading-5 text-accent-foreground hover:underline">
                  {i.id}
                </a>
                <span className="text-secondary-foreground">{i.earth_application}</span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="next" className="rounded-xl border border-dashed bg-card/60 p-6">
          <p className="text-xs font-medium text-cool">Coming next</p>
          <h2 id="next" className="mt-1 text-lg font-semibold">LUCI and FM2 partial-gravity data</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            NASA&apos;s PSI has no partial-gravity fire data yet. When LUCI (Lunar-g Combustion Investigation) and FM2
            (Flammability of Materials on the Moon) publish, they become new rows in the same table, and Moon Base can be
            ranked by real lunar-gravity results.
          </p>
          <a href={CHALLENGE} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground">
            Source: NASA challenge brief
          </a>
        </section>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-10 text-xs text-muted-foreground sm:px-6">
        Built for the NASA Space Apps Challenge 2026. Not an official NASA site. Data from NASA Physical Sciences Informatics;
        empty cells mean the source does not state the value.
      </p>
    </footer>
  );
}
