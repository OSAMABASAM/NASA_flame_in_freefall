import { SpaceAppsLogo } from "./SpaceAppsLogo";

const PSI = "https://science.nasa.gov/physical-sciences-informatics-psi/";

// Header height 64px fits the 35px logo plus its brand-guide clear space (14px) above and below.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#" aria-label="Flame in Freefall, back to top" className="flex items-center text-xl font-semibold tracking-tight">
          <SpaceAppsLogo height={35} className="-ml-[14px] shrink-0" />
          Flame in Freefall
        </a>
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <a href="#rank" className="hidden rounded-md px-3 py-1.5 hover:bg-raised hover:text-foreground sm:block">
            Rank
          </a>
          <a href="#network" className="hidden rounded-md px-3 py-1.5 hover:bg-raised hover:text-foreground sm:block">
            Network
          </a>
          <a href={PSI} target="_blank" rel="noreferrer" className="hidden rounded-md px-3 py-1.5 hover:bg-raised hover:text-foreground sm:block">
            Data: NASA PSI ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
