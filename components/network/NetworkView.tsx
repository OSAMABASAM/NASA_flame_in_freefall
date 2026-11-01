"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { DetailDrawer } from "@/components/detail/DetailDrawer";
import type { Investigation } from "@/lib/data";
import { buildNetwork, type NetLink, type NetNode } from "@/lib/network";

// The graph library draws on a canvas and needs the browser, so it loads only on the client.
const NetworkGraph = dynamic(() => import("@/components/network/NetworkGraph").then((m) => m.NetworkGraph), {
  ssr: false,
  loading: () => <div className="h-[560px] sm:h-[520px]" />,
});

const LEGEND = [
  { label: "Prevention", color: "var(--area-prevention)" },
  { label: "Detection", color: "var(--area-detection)" },
  { label: "Suppression", color: "var(--area-suppression)" },
  { label: "No safety area (science)", color: "var(--area-none)" },
];

const other = (l: NetLink, id: string) => (l.source === id ? l.target : l.source);

export function NetworkView({ investigations }: { investigations: Investigation[] }) {
  const [detail, setDetail] = useState<Investigation | null>(null);
  const [hover, setHover] = useState<{ node: NetNode; links: NetLink[] } | null>(null);
  const onHover = useCallback((node: NetNode | null, links: NetLink[]) => setHover(node ? { node, links } : null), []);
  const list = buildNetwork(investigations);
  // Load and start the graph only when the section comes near the screen.
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "400px" });
    io.observe(box.current!);
    return () => io.disconnect();
  }, []);

  return (
    <section id="network" className="mx-auto max-w-6xl scroll-mt-16 px-4 pt-20 sm:px-6">
      <h2 className="text-2xl font-semibold tracking-tight">How the experiments connect</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Each dot is an investigation. A line means two share a fuel type, a piece of hardware or a project; thicker lines
        share more. Bigger dots have more links. Hover to see neighbors, click to open the details.
      </p>

      <div ref={box} className="mt-6 overflow-hidden rounded-2xl bg-card shadow-card">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 border-b px-5 py-3 text-xs text-secondary-foreground">
          {LEGEND.map((l) => (
            <li key={l.label} className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ background: l.color }} />
              {l.label}
            </li>
          ))}
          <li className="text-muted-foreground">Half and half = two safety areas</li>
        </ul>
        {near ? (
          <NetworkGraph
            investigations={investigations}
            onOpen={setDetail}
            onHover={onHover}
          />
        ) : (
          <div className="h-[560px] sm:h-[520px]" />
        )}
        <p className="min-h-12 border-t px-5 py-3 text-sm text-secondary-foreground" aria-live="polite">
          {hover ? (
            <>
              <span className="font-mono text-xs text-accent-foreground">{hover.node.id}</span> {hover.node.inv.name}:{" "}
              {hover.links.length} links
              {hover.links.length > 0 && (
                <span className="text-muted-foreground">
                  {" "}
                  ({[...new Set(hover.links.flatMap((l) => l.reasons))].join(", ")})
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">Hover a dot to see what it shares. On a phone, tap a dot to open it.</span>
          )}
        </p>
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Show the links as a list</summary>
        <ul className="mt-3 divide-y rounded-2xl bg-card px-5 shadow-card">
          {list.nodes.map((n) => {
            const mine = list.links.filter((l) => l.source === n.id || l.target === n.id);
            return (
              <li key={n.id} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
                <button onClick={() => setDetail(n.inv)} className="text-left font-mono text-xs text-accent-foreground hover:underline">
                  {n.id} · {n.degree} links
                </button>
                <span className="text-secondary-foreground">
                  {mine.length ? mine.map((l) => `${other(l, n.id)} (${l.reasons.join(", ")})`).join("; ") : "No shared fuel, hardware or project in our data."}
                </span>
              </li>
            );
          })}
        </ul>
      </details>

      <DetailDrawer inv={detail} onClose={() => setDetail(null)} />
    </section>
  );
}
