"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Native <dialog>, mounted only while open, so the browser handles Esc, the focus trap and returning focus.
// Every way of closing goes through dialog.close(), whose close event tells the parent to unmount it.
export function Modal({
  onClose,
  title,
  eyebrow,
  className,
  children,
}: {
  onClose: () => void;
  title: string;
  eyebrow?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current!;
    if (!d.open) d.showModal();
  }, []);
  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && close()}
      className={cn("bg-background p-0 text-card-foreground shadow-lift backdrop:bg-charcoal/40 backdrop:backdrop-blur-sm open:backdrop:duration-200 open:backdrop:animate-in open:backdrop:fade-in", className)}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-background/90 px-4 py-4 backdrop-blur sm:px-6">
        <div className="min-w-0">
          {eyebrow && <p className="pill mb-1.5 bg-charcoal font-mono text-charcoal-foreground">{eyebrow}</p>}
          <h2 className="text-lg leading-snug font-bold tracking-tight">{title}</h2>
        </div>
        <Button variant="outline" size="sm" onClick={close} aria-label="Close" className="shrink-0">
          Close ✕
        </Button>
      </div>
      <div className="px-4 pb-4 sm:px-6 sm:pb-6">{children}</div>
    </dialog>
  );
}
