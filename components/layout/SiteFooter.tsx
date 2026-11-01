import type { Investigation } from "@/lib/data";
import { SpaceAppsLogo } from "./SpaceAppsLogo";

const PSI = "https://science.nasa.gov/physical-sciences-informatics-psi/";
const CHALLENGE = "https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/";

// Demo step 6: "Back on Earth" from the data, and the partial-gravity data NASA has not published yet.
export function SiteFooter({ investigations }: { investigations: Investigation[] }) {
  const earth = investigations.filter((i) => i.earth_application);
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 items-start md:grid-cols-[3fr_2fr]">
        <section aria-labelledby="earth" className="rounded-2xl bg-card p-7 shadow-card">
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
        <section aria-labelledby="next" className="rounded-2xl border border-dashed border-input p-7">
          <p className="text-xs font-medium text-accent-foreground">Coming next</p>
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
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 pb-10 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-4 sm:px-6">
        <a href={CHALLENGE} target="_blank" rel="noreferrer" className="-ml-4 shrink-0 self-start sm:self-auto">
          <SpaceAppsLogo height={40} />
        </a>
        <p className="leading-relaxed">
          Built for the NASA Space Apps Challenge 2026. Data from NASA&apos;s{" "}
          <a href={PSI} target="_blank" rel="noreferrer" className="underline decoration-border underline-offset-4 hover:text-foreground">
            Physical Sciences Informatics (PSI)
          </a>{" "}
          system. Not affiliated with or endorsed by NASA. Empty cells mean the source does not state the value.
        </p>
      </div>
    </footer>
  );
}
