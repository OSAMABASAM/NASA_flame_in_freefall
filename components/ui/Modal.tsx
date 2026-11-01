"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Native <dialog>: Esc, focus trap and backdrop come from the browser. A click on the backdrop closes it.
export function Modal({
  open,
  onClose,
  title,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (open && !d?.open) d?.showModal();
    if (!open && d?.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={cn("bg-background p-0 text-foreground backdrop:bg-black/40", className)}
    >
      <div className="sticky top-0 flex items-center justify-between gap-4 border-b bg-background px-5 py-3">
        <h2 className="font-medium">{title}</h2>
        <button onClick={onClose} className="rounded px-2 py-1 text-sm hover:bg-muted" aria-label="Close">
          Close ✕
        </button>
      </div>
      {open && <div className="p-5">{children}</div>}
    </dialog>
  );
}
