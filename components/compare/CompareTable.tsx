"use client";

import { Modal } from "@/components/ui/Modal";
import { Sources } from "@/components/detail/Sources";
import type { Investigation } from "@/lib/data";
import { cn } from "@/lib/utils";
import { EMPTY, FIELDS, differs } from "@/lib/fields";

export function CompareTable({ invs, open, onClose }: { invs: Investigation[]; open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Compare ${invs.length} investigations`}
      className="m-auto max-h-[90dvh] w-[min(68rem,100%-1rem)] rounded-2xl open:duration-200 open:animate-in open:fade-in open:slide-in-from-bottom-2"
    >
      <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-block size-3 shrink-0 rounded-sm border border-primary/30 bg-accent" />
        Tinted rows differ between the investigations. Plain rows are the same.
      </p>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead className="bg-raised">
            <tr>
              <th className="w-28 border-b sm:w-36 p-3 text-left text-xs font-medium text-muted-foreground">Field</th>
              {invs.map((i) => (
                <th key={i.id} className="border-b border-l p-3 text-left align-bottom font-semibold">
                  <span className="block font-mono text-xs font-normal text-accent-foreground">{i.id}</span>
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
                  <th className="p-3 text-left align-top text-xs font-medium text-muted-foreground group-data-differs:text-accent-foreground">
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
              <th className="p-3 text-left align-top text-xs font-medium text-muted-foreground">Source</th>
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
