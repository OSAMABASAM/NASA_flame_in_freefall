import { PSI_URL } from "@/lib/links";
import { SpaceAppsLogo } from "./SpaceAppsLogo";

// h-16 fits the 35px logo plus its 14px brand-guide clear space above and below.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#" aria-label="Flame in Freefall, back to top" className="flex items-center text-xl font-bold tracking-tight">
          <SpaceAppsLogo height={35} className="-ml-[14px] shrink-0" />
          Flame in Freefall
        </a>
        <nav className="hidden items-center gap-1 rounded-full bg-card p-1 text-sm font-medium text-muted-foreground sm:flex">
          <a href="#rank" className="glow rounded-full px-3.5 py-1.5 hover:bg-charcoal hover:text-charcoal-foreground">
            Rank
          </a>
          <a href="#network" className="glow rounded-full px-3.5 py-1.5 hover:bg-charcoal hover:text-charcoal-foreground">
            Network
          </a>
          <a href="#gaps" className="glow rounded-full px-3.5 py-1.5 hover:bg-charcoal hover:text-charcoal-foreground">
            Gaps
          </a>
          <a href={PSI_URL} target="_blank" rel="noreferrer" className="glow rounded-full px-3.5 py-1.5 hover:bg-charcoal hover:text-charcoal-foreground">
            Data: NASA PSI ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
