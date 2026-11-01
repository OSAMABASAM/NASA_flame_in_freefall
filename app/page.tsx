import { AskBox } from "@/components/ask/AskBox";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RankView } from "@/components/rank/RankView";
import cache from "@/data/demo-answers.json";
import type { Answer } from "@/lib/ask";
import { investigations } from "@/lib/data";

const CHALLENGE = "https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/";

const stats = [
  { value: investigations.length, label: "NASA investigations" },
  { value: investigations.filter((i) => i.o2_min_pct !== null || i.o2_max_pct !== null).length, label: "with oxygen data" },
  { value: investigations.filter((i) => i.source_url.length).length, label: "linked to a NASA source" },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero-wash">
          <div className="mx-auto max-w-6xl px-4 pt-16 pb-14 duration-500 animate-in fade-in slide-in-from-bottom-2 sm:px-6 sm:pt-24">
            <p className="text-sm font-medium text-accent-foreground">Microgravity combustion · crew fire safety</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Which space fire experiments matter for your habitat?
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
              Apollo 1&apos;s crew died in a 1967 test fire in an oxygen-filled cabin. As Artemis heads back to the
              Moon, habitats will run richer oxygen at lower pressure, where materials burn more easily.{" "}
              <a href={CHALLENGE} target="_blank" rel="noreferrer" className="whitespace-nowrap underline decoration-border underline-offset-4 hover:text-foreground">
                Source: NASA challenge brief
              </a>
            </p>
            <AskBox cache={cache as Record<string, Answer>} />
            <dl className="mt-12 grid grid-cols-3 gap-6 border-t pt-8 sm:max-w-xl">
              {stats.map((s) => (
                <div key={s.label}>
                  <dd className="text-3xl font-semibold tracking-tight tabular-nums">{s.value}</dd>
                  <dt className="mt-1 text-xs leading-snug text-muted-foreground">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>
        <RankView investigations={investigations} />
      </main>
      <SiteFooter investigations={investigations} />
    </>
  );
}
