"use client";

import { Modal } from "@/components/ui/Modal";
import { Sources } from "@/components/detail/Sources";
import type { Investigation } from "@/lib/data";
import { cn } from "@/lib/utils";
import { EMPTY, FIELDS, differs } from "@/lib/fields";

// Loaded and mounted only when Compare is pressed (see RankView).
export function CompareTable({ invs, onClose }: { invs: Investigation[]; onClose: () => void }) {
  return (
    <Modal
      onClose={onClose}
      title={`Compare ${invs.length} investigations`}
      className="m-auto max-h-[90dvh] w-[min(68rem,100%-1rem)] rounded-2xl open:duration-200 open:animate-in open:fade-in open:slide-in-from-bottom-2"
    >
      <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-block size-3 shrink-0 rounded-full bg-sun" />
        Tinted rows differ between the investigations. Plain rows are the same.
      </p>
      <div className="overflow-x-auto rounded-2xl bg-card">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead className="bg-charcoal text-charcoal-foreground">
            <tr>
              <th className="card-label w-28 p-3 text-left text-charcoal-muted sm:w-36">Field</th>
              {invs.map((i) => (
                <th key={i.id} className="border-l border-charcoal-raised p-3 text-left align-bottom font-bold">
                  <span className="block font-mono text-xs font-semibold text-fire">{i.id}</span>
                  {i.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FIELDS.map((f) => {
              const diff = differs(f, invs);
              return (
                <tr key={f.label} data-differs={diff || undefined} className="group border-b">
                  <th className="card-label p-3 text-left align-top text-muted-foreground group-data-differs:bg-accent group-data-differs:text-sun-muted">
                    {f.label}
                  </th>
                  {invs.map((i) => {
                    const v = f.value(i);
                    return (
                      <td
                        key={i.id}
                        className={cn(
                          "border-l p-3 align-top leading-relaxed text-secondary-foreground group-data-differs:bg-accent",
                          !v && "italic text-muted-foreground",
                        )}
                      >
                        {v || EMPTY}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr>
              <th className="card-label p-3 text-left align-top text-muted-foreground">Source</th>
              {invs.map((i) => (
                <td key={i.id} className="border-l p-3 align-top text-xs">
                  <Sources urls={i.source_url} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
