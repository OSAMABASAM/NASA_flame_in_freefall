import { Reveal } from "@/components/motion/Reveal";
import type { Investigation } from "@/lib/data";
import { coverage, GRAVITY, OXYGEN, PRESSURE, type Cell } from "@/lib/gaps";
import { cn } from "@/lib/utils";

const CHALLENGE = "https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/";
const card = "h-full rounded-2xl bg-card p-6 sm:p-7";
const eyebrow = "card-label text-muted-foreground";

// Moon gravity + Moon base oxygen + low pressure: the real conditions of a Moon base.
const isMoonBase = (c: Cell) => c.gravity === "moon" && c.oxygen === "moon" && c.pressure === "low";

export function GapsView({ investigations }: { investigations: Investigation[] }) {
  const { cells, notReported, partialGravity, microgravity, total } = coverage(investigations);

  return (
    <section id="gaps" className="mx-auto max-w-6xl scroll-mt-16 px-4 pt-20 sm:px-6">
      <Reveal>
        <p className="card-label text-accent-foreground">Gaps</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight">Research gaps</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Which oxygen, pressure and gravity conditions the {total} investigations covered. Each number counts the
          investigations that ran there. <span className="font-medium text-accent-foreground">Orange cells</span> have no test yet.
        </p>
      </Reveal>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <div className={cn(card, "flex flex-col bg-charcoal text-charcoal-foreground")}>
            <p className="card-label text-fire">Strongest finding</p>
            <p className="mt-3 text-6xl leading-none font-bold tracking-tighter tabular-nums">
              {partialGravity} <span className="text-2xl font-semibold tracking-tight text-charcoal-muted">of {total}</span>
            </p>
            <p className="mt-3 text-base leading-relaxed text-pretty">
              investigations ran in partial gravity (Moon or Mars).{" "}
              <span className="text-charcoal-muted">
                {microgravity} of {total} are NASA microgravity investigations, so a Moon base has no fire data at its own
                gravity yet.
              </span>
            </p>
            <div className="mt-auto pt-6">
              <p className="card-label text-charcoal-muted">Coming next</p>
              <p className="mt-1 text-sm text-charcoal-muted">
                <a href="#next" className="font-medium text-fire underline decoration-fire/40 underline-offset-4 hover:decoration-current">
                  LUCI (Lunar-g Combustion Investigation)
                </a>{" "}
                and{" "}
                <a href="#next" className="font-medium text-fire underline decoration-fire/40 underline-offset-4 hover:decoration-current">
                  FM2 (Flammability of Materials on the Moon)
                </a>{" "}
                will fill the Moon column.{" "}
                <a href={CHALLENGE} target="_blank" rel="noreferrer" className="whitespace-nowrap text-charcoal-muted underline decoration-charcoal-muted/40 underline-offset-4 hover:text-charcoal-foreground">
                  Source: NASA challenge brief
                </a>
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal index={1}>
          <div className={card}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className={eyebrow}>Not reported</p>
              <span className="pill bg-charcoal text-charcoal-foreground">
                {notReported.any} of {total}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Kept out of the grid. We never guess a value: {notReported.any} of {total} investigations miss at least one,
              so they sit in no cell.
            </p>
            <dl className="mt-5 grid grid-cols-3 gap-4 border-t pt-5">
              {[
                ["Oxygen", notReported.oxygen],
                ["Pressure", notReported.pressure],
                ["Gravity", notReported.gravity],
              ].map(([label, n]) => (
                <div key={label}>
                  <dd className="text-4xl leading-none font-bold tracking-tight tabular-nums">{n}</dd>
                  <dt className="mt-2 text-xs text-muted-foreground">{label} not reported</dt>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        {GRAVITY.map((g, n) => (
          <Reveal key={g.id} index={n % 2}>
            <GravityGrid label={g.label} cells={cells.filter((c) => c.gravity === g.id)} />
          </Reveal>
        ))}

        <Reveal index={1}>
          <div className={cn(card, "border border-dashed border-input bg-transparent")}>
            <p className={eyebrow}>How we count</p>
            <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-relaxed text-secondary-foreground">
              <li>An investigation counts in a cell only when the data states its oxygen, pressure and gravity.</li>
              <li>A tested range counts in every band it touches. If only one end is stated, only that value counts.</li>
              <li>Gravity is the &quot;Project Type&quot; on each NASA PSI record. All say microgravity.</li>
              <li>
                26.5 to 34% oxygen and below 71 kPa (10.2 psia) are NASA&apos;s planned exploration atmospheres, from the
                ACME-BRE PSI record. 101 kPa is sea level.
              </li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function GravityGrid({ label, cells }: { label: string; cells: Cell[] }) {
  const empty = cells.filter((c) => !c.ids.length).length;
  return (
    <div className={cn(card, "px-4 sm:px-7")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold tracking-tight">{label}</h3>
        <span className={cn("pill", empty ? "bg-fire text-fire-foreground" : "bg-charcoal text-charcoal-foreground")}>
          {empty ? `${empty} of ${cells.length} conditions untested` : "Every condition tested"}
        </span>
      </div>
      <table className="mt-4 w-full table-fixed border-separate border-spacing-1.5 text-left">
        <caption className="sr-only">
          {label}: investigations per oxygen band (rows) and pressure band (columns)
        </caption>
        <thead>
          <tr>
            <th scope="col" className="w-16 sm:w-20">
              <span className="sr-only">Oxygen</span>
            </th>
            {PRESSURE.map((p) => (
              <th key={p.id} scope="col" className="px-1 pb-1 text-[11px] leading-tight font-semibold text-muted-foreground">
                {p.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {OXYGEN.map((o) => (
            <tr key={o.id}>
              <th scope="row" className="pr-1 text-[11px] leading-tight font-semibold text-muted-foreground">
                {o.label} O₂
              </th>
              {PRESSURE.map((p) => {
                const c = cells.find((x) => x.oxygen === o.id && x.pressure === p.id)!;
                return (
                  <td
                    key={p.id}
                    title={c.ids.length ? c.ids.join(", ") : c.line}
                    className={cn(
                      "h-full rounded-xl p-2 align-top",
                      c.ids.length ? "bg-accent" : "bg-fire-soft",
                      isMoonBase(c) && "ring-2 ring-charcoal",
                    )}
                  >
                    <span className={cn("block text-xl leading-tight font-bold tabular-nums", c.ids.length ? "text-foreground" : "text-accent-foreground")}>
                      {c.ids.length}
                    </span>
                    {c.ids.length ? (
                      <span className="block font-mono text-[10px] leading-snug break-words text-secondary-foreground">
                        <span className="sr-only">investigations: </span>
                        {c.ids.join(", ")}
                      </span>
                    ) : (
                      <span className="block text-[11px] leading-snug text-accent-foreground">
                        {isMoonBase(c) && <strong className="block font-semibold">Moon base conditions</strong>}
                        {c.line}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
