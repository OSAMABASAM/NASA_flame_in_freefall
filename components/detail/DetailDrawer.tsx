"use client";

import { Modal } from "@/components/ui/Modal";
import { Sources } from "@/components/detail/Sources";
import type { Investigation } from "@/lib/data";
import { EMPTY, FIELDS } from "@/lib/fields";

export function DetailDrawer({ inv, onClose }: { inv: Investigation | null; onClose: () => void }) {
  return (
    <Modal
      open={inv !== null}
      onClose={onClose}
      eyebrow={inv?.id}
      title={inv?.name ?? ""}
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-xl border-l open:duration-250 open:animate-in open:slide-in-from-right"
    >
      {inv && (
        <dl className="divide-y text-sm">
          {FIELDS.map((f) => {
            const v = f.value(inv);
            return (
              <div key={f.label} className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
                <dt className="text-xs font-medium text-muted-foreground sm:pt-0.5">{f.label}</dt>
                <dd className={v ? "leading-relaxed text-secondary-foreground" : "italic text-muted-foreground"}>{v || EMPTY}</dd>
              </div>
            );
          })}
          <div className="grid gap-1 py-3 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
            <dt className="text-xs font-medium text-muted-foreground sm:pt-0.5">Source</dt>
            <dd>
              <Sources urls={inv.source_url} />
            </dd>
          </div>
        </dl>
      )}
    </Modal>
  );
}
