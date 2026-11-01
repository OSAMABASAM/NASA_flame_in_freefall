import { MOON_O2_PCT, MOON_PSIA } from "@/lib/score";

const PARTS = [
  [35, "the investigation was run for the chosen habitat"],
  [25, "your oxygen level is inside the tested range (12.5 if within 10 points of it)"],
  [20, "it covers the chosen safety area (everyone gets these with \"all\")"],
  [10, "it has airflow data"],
  [10, "its data was checked against NASA sources"],
] as const;

// Native HTML popover: Esc and click-outside come from the browser.
export function HowItWorks() {
  return (
    <>
      <button
        popoverTarget="how-score"
        className="shrink-0 text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
      >
        How the score works
      </button>
      <div
        id="how-score"
        popover="auto"
        className="m-auto w-[min(32rem,100%-2rem)] rounded-xl border bg-card p-6 text-sm leading-relaxed text-card-foreground shadow-2xl shadow-black/50 backdrop:bg-black/50"
      >
        <p className="font-semibold">Score out of 100, a plain sum</p>
        <ul className="mt-3 space-y-2">
          {PARTS.map(([pts, text]) => (
            <li key={pts + text} className="flex gap-3">
              <span className="w-8 shrink-0 text-right font-mono text-accent-foreground">{pts}</span>
              <span className="text-secondary-foreground">{text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-lg bg-raised p-3 text-secondary-foreground">
          <span className="font-medium text-foreground">Moon Base:</span> no NASA record names the Moon, so its 35 points
          go to conditions instead: 17.5 if tested at {MOON_O2_PCT}% oxygen or more, 17.5 if tested at {MOON_PSIA} psia
          (70.3 kPa) or less. These are NASA&apos;s planned exploration atmospheres as listed in the{" "}
          <a href="https://psi.nasa.gov/physci/repo/data/investigations/PSI-20" className="underline underline-offset-2" target="_blank" rel="noreferrer">
            ACME-BRE record
          </a>
          : 21% oxygen at 14.7 psia, 26.5% at 10.2 psia, 34% at 8.2 psia.
        </p>
        <p className="mt-3 text-muted-foreground">Missing data scores 0. We never guess a value.</p>
      </div>
    </>
  );
}
