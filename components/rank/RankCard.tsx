import { motion } from "motion/react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import type { Scored } from "@/lib/score";

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
  return (
    <motion.li
      layout="position"
      transition={{ duration: 0.22 }}
      id={`inv-${inv.id}`}
      className="flex scroll-mt-20 flex-col rounded-2xl bg-card p-6 shadow-card glow target:ring-2 target:ring-primary/50 has-checked:ring-2 has-checked:ring-primary/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted-foreground">
            <span className="text-accent-foreground">#{place}</span> · {inv.id}
          </p>
          <h3 className="mt-1 font-semibold leading-snug text-balance">{inv.name}</h3>
        </div>
        <div className="shrink-0 text-right" aria-label={`Score ${score} of 100`}>
          <p className="text-[28px] leading-none font-semibold tracking-tight tabular-nums">{score}</p>
          <div className="mt-2 h-1 w-14 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
          </div>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{inv.objective}</p>
      <p className="mt-3 text-sm leading-relaxed text-secondary-foreground">
        <span className="text-accent-foreground">Why: </span>
        {reasons.length ? reasons.join(" · ") : "no matching data for these settings."}
      </p>
      <ul className="mt-3 mb-4 flex flex-wrap gap-1.5 text-xs">
        {tags.map((t) => (
          <li key={t} className="rounded-full bg-raised px-2.5 py-0.5 text-secondary-foreground">
            {t}
          </li>
        ))}
        {inv.data_status === "challenge_text" && (
          <li className="rounded-full border border-dashed px-2.5 py-0.5 text-muted-foreground">From challenge text only</li>
        )}
      </ul>
      <div className="mt-auto flex items-center justify-between gap-3 border-t pt-3 text-sm">
        <Button variant="outline" size="sm" onClick={() => onDetails(inv)}>
          Details
        </Button>
        <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-muted-foreground hover:text-foreground has-checked:text-accent-foreground has-disabled:cursor-not-allowed has-disabled:opacity-45">
          <input type="checkbox" checked={picked} disabled={pickDisabled} onChange={() => onTogglePick(inv.id)} className="size-4 accent-primary" />
          Compare
        </label>
      </div>
    </motion.li>
  );
}

// Re-render a card only when what it shows changes, so moving the slider does not redraw all of them.
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
