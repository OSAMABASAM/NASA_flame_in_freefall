"use client";

import dynamic from "next/dynamic";

const loadDrawer = () => import("@/components/detail/DetailDrawer").then((m) => m.DetailDrawer);
const loadCompare = () => import("@/components/compare/CompareTable").then((m) => m.CompareTable);

export const DetailDrawer = dynamic(loadDrawer);
export const CompareTable = dynamic(loadCompare);

// Fetch (not mount) both once the browser is idle, so the first click opens at once.
export function preloadDetail() {
  const go = () => void Promise.all([loadDrawer(), loadCompare()]);
  if ("requestIdleCallback" in window) requestIdleCallback(go, { timeout: 4000 });
  else setTimeout(go, 2000);
}
