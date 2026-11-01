// Official logo, unchanged, from https://assets.spaceappschallenge.org/media/documents/NASA_Space_Apps_Logos_2026.zip.
// The brand guide asks for 1U of clear space on every side, about 0.39 of the logo height, built in as padding.
const RATIO = 561 / 221;

export function SpaceAppsLogo({ height, className }: { height: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a static SVG needs no image optimizer
    <img
      src="/brand/space-apps-logo.svg"
      alt="NASA Space Apps Challenge"
      width={Math.round(height * RATIO)}
      height={height}
      style={{ padding: Math.ceil(height * 0.39), boxSizing: "content-box" }}
      className={className}
    />
  );
}
