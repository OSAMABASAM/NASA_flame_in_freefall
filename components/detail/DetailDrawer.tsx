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
      title={inv ? `${inv.id}: ${inv.name}` : ""}
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-lg border-l"
    >
      {inv && (
        <dl className="space-y-4 text-sm">
          {FIELDS.map((f) => {
            const v = f.value(inv);
            return (
              <div key={f.label}>
                <dt className="text-xs text-muted-foreground">{f.label}</dt>
                <dd className={v ? "mt-0.5" : "mt-0.5 italic text-muted-foreground"}>{v || EMPTY}</dd>
              </div>
            );
          })}
          <div>
            <dt className="text-xs text-muted-foreground">Source</dt>
            <dd className="mt-0.5">
              <Sources urls={inv.source_url} />
            </dd>
          </div>
        </dl>
      )}
    </Modal>
  );
}
