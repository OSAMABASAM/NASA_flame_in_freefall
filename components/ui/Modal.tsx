"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Native <dialog>: Esc, focus trap and backdrop come from the browser. A click on the backdrop closes it.
export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
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
      className={cn("bg-card p-0 text-card-foreground shadow-2xl shadow-black/60 backdrop:bg-black/60 backdrop:backdrop-blur-sm open:backdrop:duration-200 open:backdrop:animate-in open:backdrop:fade-in", className)}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-card/95 px-4 py-4 sm:px-6 backdrop-blur">
        <div className="min-w-0">
          {eyebrow && <p className="font-mono text-xs text-accent-foreground">{eyebrow}</p>}
          <h2 className="font-semibold leading-snug">{title}</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close" className="-mr-2 shrink-0">
          Close ✕
        </Button>
      </div>
      {open && <div className="p-4 sm:p-6">{children}</div>}
    </dialog>
  );
}
