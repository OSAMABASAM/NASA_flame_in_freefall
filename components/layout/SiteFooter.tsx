import { Reveal } from "@/components/motion/Reveal";
import type { Investigation } from "@/lib/data";
import { SpaceAppsLogo } from "./SpaceAppsLogo";

const PSI = "https://science.nasa.gov/physical-sciences-informatics-psi/";
const CHALLENGE = "https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/";

// Demo step 6: "Back on Earth" from the data, and the partial-gravity data NASA has not published yet.
export function SiteFooter({ investigations }: { investigations: Investigation[] }) {
  const earth = investigations.filter((i) => i.earth_application);
  return (
    <footer className="mt-24">
      <div className="mx-auto grid max-w-6xl items-start gap-4 px-4 sm:px-6 md:grid-cols-[3fr_2fr]">
        <Reveal>
          <section aria-labelledby="earth" className="rounded-2xl bg-card p-6 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <p className="card-label text-muted-foreground">Back on Earth</p>
              <span className="pill bg-charcoal text-charcoal-foreground">{earth.length} of {investigations.length}</span>
            </div>
            <h2 id="earth" className="mt-2 text-xl font-bold tracking-tight">What these experiments help with on the ground</h2>
            <p className="mt-1 text-sm text-muted-foreground">As NASA states it.</p>
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
        </Reveal>
        <Reveal index={1}>
          <section aria-labelledby="next" className="rounded-2xl bg-charcoal p-6 text-charcoal-foreground sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <p className="card-label text-charcoal-muted">Coming next</p>
              <span className="pill bg-fire text-fire-foreground">Partial gravity</span>
            </div>
            <h2 id="next" className="mt-2 text-xl font-bold tracking-tight">LUCI and FM2 data</h2>
            <p className="mt-3 text-sm leading-relaxed text-charcoal-muted">
              NASA&apos;s PSI has no partial-gravity fire data yet. When LUCI (Lunar-g Combustion Investigation) and FM2
              (Flammability of Materials on the Moon) publish, they become new rows in the same table, and Moon Base can be
              ranked by real lunar-gravity results.
            </p>
            <a href={CHALLENGE} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-fire underline decoration-fire/40 underline-offset-4 hover:decoration-fire">
              Source: NASA challenge brief
            </a>
          </section>
        </Reveal>
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-2 px-4 pb-10 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-4 sm:px-6">
        <a href={CHALLENGE} target="_blank" rel="noreferrer" className="-ml-4 shrink-0 self-start sm:self-auto">
          <SpaceAppsLogo height={40} />
        </a>
        <p className="leading-relaxed">
          Built for the NASA Space Apps Challenge 2026. Data from NASA&apos;s{" "}
          <a href={PSI} target="_blank" rel="noreferrer" className="underline decoration-input underline-offset-4 hover:text-foreground">
            Physical Sciences Informatics (PSI)
          </a>{" "}
          system. Not affiliated with or endorsed by NASA. Empty cells mean the source does not state the value.
        </p>
      </div>
    </footer>
  );
}
