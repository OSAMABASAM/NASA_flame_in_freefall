import type { CSSProperties } from "react";
import { AskBox } from "@/components/ask/AskBox";
import { HeroStats } from "@/components/hero/HeroStats";
import { LazyGaps, LazyNetwork } from "@/components/layout/LazySection";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RankView } from "@/components/rank/RankView";
import cache from "@/data/demo-answers.json";
import type { Answer } from "@/lib/ask";
import { investigations } from "@/lib/data";
import { CHALLENGE_URL } from "@/lib/links";
import { AREAS } from "@/lib/score";

// Counted from the dataset at build time, never typed in by hand.
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
            {/* CSS animation, not Motion, so the hero shows on the first paint before JavaScript loads. */}
            <div className="rise-in">
              <p className="card-label text-accent-foreground">Microgravity combustion and crew fire safety</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                Which space fire experiments matter for your habitat?
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
                Apollo 1&apos;s crew died in a 1967 test fire in a cabin full of oxygen. As Artemis heads back to the
                Moon, habitats will run richer oxygen at lower pressure, where materials burn more easily.{" "}
                <a href={CHALLENGE_URL} target="_blank" rel="noreferrer" className="whitespace-nowrap underline decoration-input underline-offset-4 hover:text-foreground">
                  Source: NASA challenge brief
                </a>
              </p>
            </div>
            <div className="rise-in" style={{ "--i": 1 } as CSSProperties}>
              <AskBox cache={cache as Record<string, Answer>} />
            </div>
          </div>
          <HeroStats {...numbers} />
        </section>
        <RankView investigations={investigations} />
        <LazyNetwork investigations={investigations} />
        <LazyGaps investigations={investigations} />
      </main>
      <SiteFooter investigations={investigations} />
    </>
  );
}
