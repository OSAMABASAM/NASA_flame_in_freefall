"use client";

import { Modal } from "@/components/ui/Modal";
import { Sources } from "@/components/detail/Sources";
import type { Investigation } from "@/lib/data";
import { EMPTY, FIELDS } from "@/lib/fields";

// Loaded and mounted only when a card or graph dot is opened (see LazyDetail.ts).
export function DetailDrawer({ inv, onClose }: { inv: Investigation; onClose: () => void }) {
  return (
    <Modal
      onClose={onClose}
      eyebrow={inv.id}
      title={inv.name}
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-xl rounded-l-2xl open:duration-250 open:animate-in open:slide-in-from-right"
    >
      <dl className="divide-y rounded-2xl bg-card px-5 text-sm">
        {FIELDS.map((f) => {
          const v = f.value(inv);
          return (
            <div key={f.label} className="grid gap-1 py-3.5 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
              <dt className="card-label text-muted-foreground sm:pt-0.5">{f.label}</dt>
              <dd className={v ? "leading-relaxed text-secondary-foreground" : "italic text-muted-foreground"}>{v || EMPTY}</dd>
            </div>
          );
        })}
        <div className="grid gap-1 py-3.5 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
          <dt className="card-label text-muted-foreground sm:pt-0.5">Source</dt>
          <dd>
            <Sources urls={inv.source_url} />
          </dd>
        </div>
      </dl>
    </Modal>
  );
}
