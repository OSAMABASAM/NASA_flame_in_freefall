"use client";

import { Modal } from "@/components/ui/Modal";
import { Sources } from "@/components/detail/Sources";
import type { Investigation } from "@/lib/data";
import { cn } from "@/lib/utils";
import { EMPTY, FIELDS, differs } from "@/lib/fields";

export function CompareTable({ invs, open, onClose }: { invs: Investigation[]; open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={`Compare ${invs.length} investigations`} className="m-auto w-[min(64rem,100%-2rem)] rounded-lg border">
      <p className="mb-3 text-sm text-muted-foreground">
        <span className="rounded bg-amber-50 px-1.5 text-amber-950 ring-1 ring-amber-200">Tinted</span> cells differ between the investigations. Plain rows are the same.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-40 border-b p-2 text-left font-normal text-muted-foreground">Field</th>
              {invs.map((i) => (
                <th key={i.id} className="border-b p-2 text-left align-bottom">
                  <span className="block font-mono text-xs text-muted-foreground">{i.id}</span>
                  {i.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FIELDS.map((f) => {
              const diff = differs(f, invs);
              return (
                <tr key={f.label} data-differs={diff || undefined} className="group">
                  <th className="border-b p-2 text-left align-top font-normal text-muted-foreground">{f.label}</th>
                  {invs.map((i) => {
                    const v = f.value(i);
                    return (
                      <td key={i.id} className={cn(
                          "border-b p-2 align-top group-data-differs:bg-amber-50 group-data-differs:text-amber-950",
                          !v && "italic opacity-70",
                        )}>
                        {v || EMPTY}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr>
              <th className="p-2 text-left align-top font-normal text-muted-foreground">Source</th>
              {invs.map((i) => (
                <td key={i.id} className="p-2 align-top text-xs">
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
