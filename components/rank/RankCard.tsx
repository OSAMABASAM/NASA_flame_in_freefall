import * as m from "motion/react-m";
import { memo } from "react";
import { reveal } from "@/components/motion/Reveal";
import { ScoreGauge } from "@/components/rank/ScoreGauge";
import { Button } from "@/components/ui/button";
import type { Scored } from "@/lib/score";
import { cn } from "@/lib/utils";

type Props = {
  item: Scored;
  place: number;
  picked: boolean;
  pickDisabled: boolean;
  onDetails: (inv: Scored["inv"]) => void;
  onTogglePick: (id: string) => void;
};

function Card({ item: { inv, score, reasons }, place, picked, pickDisabled, onDetails, onTogglePick }: Props) {
  const tags = [...inv.fuel_type.map((f) => `${f} fuel`), ...inv.hardware];
  // Muted text on the yellow top card needs its own token to keep contrast.
  const top = place === 1;
  const muted = top ? "text-sun-muted" : "text-muted-foreground";
  const r = reveal((place - 1) % 2);
  return (
    <m.li
      // Without layoutDependency Motion measures every card on every slider tick, and the slider stutters.
      layout="position"
      layoutDependency={place}
      {...r}
      transition={{ ...r.transition, layout: { duration: 0.22 } }}
      id={`inv-${inv.id}`}
      className={cn(
        "glow flex scroll-mt-20 flex-col rounded-2xl p-6 target:ring-2 target:ring-charcoal has-checked:ring-2 has-checked:ring-charcoal",
        top ? "bg-sun text-sun-foreground" : "bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="pill bg-charcoal text-charcoal-foreground">#{place}</span>
            <span className={cn("card-label font-mono", muted)}>{inv.id}</span>
            {top && <span className="card-label">Top match</span>}
          </p>
          <h3 className="mt-2.5 text-lg leading-snug font-bold tracking-tight text-balance">{inv.name}</h3>
        </div>
        <ScoreGauge score={score} onSun={top} />
      </div>
      <p className={cn("mt-3 line-clamp-2 text-sm leading-relaxed", muted)}>{inv.objective}</p>
      <p className="mt-3 text-sm leading-relaxed">
        <span className="font-semibold">Why: </span>
        {reasons.length ? reasons.join(", ") : "no matching data for these settings."}
      </p>
      <ul className="mt-3 mb-4 flex flex-wrap gap-1.5 text-xs">
        {tags.map((t) => (
          <li key={t} className={cn("rounded-full px-2.5 py-0.5 text-secondary-foreground", top ? "bg-card/70" : "bg-raised")}>
            {t}
          </li>
        ))}
        {inv.data_status === "challenge_text" && (
          <li className={cn("rounded-full border border-dashed border-current px-2.5 py-0.5", muted)}>From challenge text only</li>
        )}
      </ul>
      <div className={cn("mt-auto flex items-center justify-between gap-3 border-t pt-3 text-sm", top && "border-sun-muted/20")}>
        <Button variant="outline" size="sm" onClick={() => onDetails(inv)}>
          Details
        </Button>
        <label
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-full px-2 py-1 font-medium hover:text-foreground has-checked:text-foreground has-disabled:cursor-not-allowed has-disabled:opacity-45",
            muted,
          )}
        >
          <input type="checkbox" checked={picked} disabled={pickDisabled} onChange={() => onTogglePick(inv.id)} className="size-4 accent-charcoal" />
          Compare
        </label>
      </div>
    </m.li>
  );
}

// rank() returns new objects on every slider tick, so compare what the card shows.
export const RankCard = memo(
  Card,
  (a, b) =>
    a.item.inv === b.item.inv &&
    a.item.score === b.item.score &&
    a.item.reasons.join() === b.item.reasons.join() &&
    a.place === b.place &&
    a.picked === b.picked &&
    a.pickDisabled === b.pickDisabled &&
    a.onDetails === b.onDetails &&
    a.onTogglePick === b.onTogglePick,
);
