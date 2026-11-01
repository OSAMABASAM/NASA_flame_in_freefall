// [min, max] from the data. One known end is a single value, never a guessed range. null = not reported.
export function span(min: number | null, max: number | null): [number, number] | null {
  const lo = min ?? max;
  const hi = max ?? min;
  return lo === null || hi === null ? null : [lo, hi];
}
