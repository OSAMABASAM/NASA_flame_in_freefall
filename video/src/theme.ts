// Colors from the site's tokens (app/globals.css, "White contrast"), plus violet and amber for icons.
export const C = {
  page: "#ebedf0",
  ink: "#17181a",
  card: "#ffffff",
  raised: "#f4f5f7",
  muted: "#5b5f66",
  border: "#e3e5e9",
  fire: "#ff6a1f",
  fireText: "#b3440a",
  fireSoft: "#ffede4",
  sun: "#ffe47a",
  charcoal: "#222326",
  blue: "#2a78d6",
  green: "#1baf7a",
  violet: "#7c5cd6",
  amber: "#d98e04",
};
export const FONT = '"Inter Variable", -apple-system, "Helvetica Neue", Arial, sans-serif';
export const SHADOW = "0 2px 6px rgb(0 0 0 / 0.06), 0 16px 40px rgb(0 0 0 / 0.14)";
// Soft tinted background behind a colored icon.
export const tint = (hex: string, a = 0.14) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16} ${(n >> 8) & 255} ${n & 255} / ${a})`;
};
