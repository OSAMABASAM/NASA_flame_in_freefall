import type { CSSProperties } from "react";

// Counts from 0 to the real value as the page appears, in pure CSS (see count-up in globals.css), so it needs
// no JavaScript and never shows a wrong number. Screen readers get the final value at once.
export function CountUp({ value }: { value: number }) {
  return (
    <>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="count-up" style={{ "--count": value } as CSSProperties} />
    </>
  );
}
