// Official NASA Space Apps Challenge 2026 Default logo, "Color and Black" colorway, file unchanged from
// https://assets.spaceappschallenge.org/media/documents/NASA_Space_Apps_Logos_2026.zip (brand guide: spaceappschallenge.org/brand).
// Clear space: the guide asks for 1U on every side, about 0.39 of the logo height, so it is built in as padding.
// Fixed width and height mean no layout shift while the file loads.
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
