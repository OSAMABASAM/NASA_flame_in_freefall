import type { CSSProperties } from "react";

// Pure CSS (count-up in globals.css), so it runs before JavaScript loads and never shows a wrong final number.
export function CountUp({ value }: { value: number }) {
  return (
    <>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="count-up" style={{ "--count": value } as CSSProperties} />
    </>
  );
}
