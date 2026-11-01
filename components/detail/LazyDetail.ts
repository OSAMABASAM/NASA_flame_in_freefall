"use client";

import dynamic from "next/dynamic";

// The detail drawer and the compare table are not on the first screen, so their code downloads separately.
const loadDrawer = () => import("@/components/detail/DetailDrawer").then((m) => m.DetailDrawer);
const loadCompare = () => import("@/components/compare/CompareTable").then((m) => m.CompareTable);

export const DetailDrawer = dynamic(loadDrawer);
export const CompareTable = dynamic(loadCompare);

// Fetch both while the browser is idle after load, so the first click opens at once. Fetching is not mounting:
// they still mount only when opened.
export function preloadDetail() {
  const go = () => void Promise.all([loadDrawer(), loadCompare()]);
  if ("requestIdleCallback" in window) requestIdleCallback(go, { timeout: 4000 });
  else setTimeout(go, 2000);
}
