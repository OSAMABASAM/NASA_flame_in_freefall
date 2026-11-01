import type { Investigation } from "./data.ts";

export type NetNode = { id: string; inv: Investigation; degree: number };
export type NetLink = { source: string; target: string; reasons: string[] };

// Two investigations are linked when they share a fuel type, a piece of hardware, or the same project.
export type Network = { nodes: NetNode[]; links: NetLink[] };

export function buildNetwork(invs: Investigation[]): Network {
  const links: NetLink[] = [];
  invs.forEach((a, i) =>
    invs.slice(i + 1).forEach((b) => {
      const reasons = [
        ...a.fuel_type.filter((f) => b.fuel_type.includes(f)).map((f) => `${f} fuel`),
        ...a.hardware.filter((h) => b.hardware.includes(h)),
        ...(a.project && a.project === b.project ? [`project ${a.project}`] : []),
      ];
      if (reasons.length) links.push({ source: a.id, target: b.id, reasons });
    }),
  );
  const nodes = invs.map((inv) => ({
    id: inv.id,
    inv,
    degree: links.filter((l) => l.source === inv.id || l.target === inv.id).length,
  }));
  return { nodes, links };
}
