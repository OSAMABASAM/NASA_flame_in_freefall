import { AskBox } from "@/components/ask/AskBox";
import { HeroStats } from "@/components/hero/HeroStats";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Reveal } from "@/components/motion/Reveal";
import { NetworkView } from "@/components/network/NetworkView";
import { RankView } from "@/components/rank/RankView";
import cache from "@/data/demo-answers.json";
import type { Answer } from "@/lib/ask";
import { investigations } from "@/lib/data";
import { AREAS } from "@/lib/score";

const CHALLENGE = "https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/";

// Hero numbers, counted from the dataset at build time. Nothing is typed in by hand.
const numbers = {
  total: investigations.length,
  withOxygen: investigations.filter((i) => i.o2_min_pct !== null || i.o2_max_pct !== null).length,
  sourced: investigations.filter((i) => i.source_url.length).length,
  byArea: [
    ...AREAS.filter((a) => a !== "all").map((a) => ({
      label: a[0].toUpperCase() + a.slice(1),
      value: investigations.filter((i) => i.safety_area.includes(a)).length,
    })),
    { label: "Science only", value: investigations.filter((i) => !i.safety_area.length).length, science: true },
  ],
};

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-6xl items-start gap-x-10 gap-y-10 px-4 pt-12 pb-4 sm:px-6 sm:pt-16 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Reveal>
              <p className="card-label text-accent-foreground">Microgravity combustion · crew fire safety</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                Which space fire experiments matter for your habitat?
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
                Apollo 1&apos;s crew died in a 1967 test fire in an oxygen-filled cabin. As Artemis heads back to the
                Moon, habitats will run richer oxygen at lower pressure, where materials burn more easily.{" "}
                <a href={CHALLENGE} target="_blank" rel="noreferrer" className="whitespace-nowrap underline decoration-input underline-offset-4 hover:text-foreground">
                  Source: NASA challenge brief
                </a>
              </p>
            </Reveal>
            <Reveal index={1}>
              <AskBox cache={cache as Record<string, Answer>} />
            </Reveal>
          </div>
          <HeroStats {...numbers} />
        </section>
        <RankView investigations={investigations} />
        <NetworkView investigations={investigations} />
      </main>
      <SiteFooter investigations={investigations} />
    </>
  );
}
