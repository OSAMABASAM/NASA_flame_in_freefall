const PSI = "https://science.nasa.gov/physical-sciences-informatics-psi/";

// A spherical microgravity flame.
export function FlameMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-6">
      <circle cx="12" cy="12" r="10" fill="none" stroke="var(--primary)" strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="6.5" fill="var(--primary)" fillOpacity="0.2" />
      <circle cx="12" cy="12" r="3" fill="var(--primary)" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <FlameMark />
          Flame in Freefall
        </a>
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <a href="#rank" className="hidden rounded-md px-3 py-1.5 hover:bg-raised hover:text-foreground sm:block">
            Rank
          </a>
          <a href={PSI} target="_blank" rel="noreferrer" className="rounded-md px-3 py-1.5 hover:bg-raised hover:text-foreground">
            Data: NASA PSI ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
