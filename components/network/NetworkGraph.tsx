"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D, { type ForceGraphMethods, type LinkObject, type NodeObject } from "react-force-graph-2d";
import type { Investigation } from "@/lib/data";
import { buildNetwork, type NetLink, type NetNode } from "@/lib/network";

type N = NodeObject<NetNode>;
type L = LinkObject<NetNode, NetLink>;

const EMPTY = { nodes: [], links: [] };
const endId = (end: L["source"]) => (typeof end === "object" ? (end as N).id : end) as string;
const radius = (n: NetNode) => 4 + Math.sqrt(n.degree) * 1.8;

// Canvas cannot read CSS variables, so read the tokens from globals.css once.
function readTokens() {
  const css = getComputedStyle(document.documentElement);
  const t = (name: string) => css.getPropertyValue(`--${name}`).trim();
  return {
    area: { prevention: t("area-prevention"), detection: t("area-detection"), suppression: t("area-suppression") } as Record<string, string>,
    none: t("area-none"),
    card: t("card"),
    text: t("foreground"),
    muted: t("muted-foreground"),
    link: t("input"),
    linkHot: t("primary"),
  };
}

export function NetworkGraph({
  investigations,
  onOpen,
  onHover,
}: {
  investigations: Investigation[];
  onOpen: (inv: Investigation) => void;
  onHover: (node: NetNode | null, links: NetLink[]) => void;
}) {
  const data = useMemo(() => buildNetwork(investigations), [investigations]);
  const wrap = useRef<HTMLDivElement>(null);
  const fg = useRef<ForceGraphMethods<N, L> | undefined>(undefined);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [reduced] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [tokens] = useState(readTokens);

  const neighbors = useMemo(() => {
    if (!hover) return null;
    const set = new Set([hover]);
    for (const l of data.links) {
      const [s, t] = [endId(l.source), endId(l.target)];
      if (s === hover) set.add(t);
      if (t === hover) set.add(s);
    }
    return set;
  }, [hover, data]);

  useEffect(() => {
    const el = wrap.current!;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientWidth < 640 ? 560 : 520 }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const g = fg.current;
    if (!g) return;
    g.d3Force("charge")?.strength(-140);
    g.d3Force("link")?.distance(55);
    // On a narrow screen, pull nodes toward the vertical middle line so the graph grows tall instead of wide.
    const narrow = size.w < 640;
    let nodes: N[] = [];
    const squeeze = Object.assign((alpha: number) => nodes.forEach((n) => (n.vx! -= n.x! * 0.12 * alpha)), {
      initialize: (ns: N[]) => (nodes = ns),
    });
    g.d3Force("squeeze", narrow ? squeeze : null);
    g.d3ReheatSimulation();
    // Hand over the data only now, so the first layout already uses these forces (matters with reduced motion).
    setReady(true);
  }, [size.w]);

  const hot = (l: L) => hover !== null && (endId(l.source) === hover || endId(l.target) === hover);
  const fit = () => fg.current?.zoomToFit(reduced ? 0 : 400, 36);

  return (
    <div ref={wrap} className="w-full touch-pan-y" aria-hidden>
      {size.w > 0 && (
        <ForceGraph2D<NetNode, NetLink>
          ref={fg}
          graphData={ready ? data : EMPTY}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          // Reduced motion: lay the graph out before the first paint, then never move it.
          warmupTicks={reduced ? 300 : 0}
          cooldownTicks={reduced ? 0 : 200}
          onEngineStop={fit}
          enableZoomInteraction={false}
          enablePanInteraction={false}
          enableNodeDrag={!reduced}
          nodeLabel={() => ""}
          onNodeHover={(n) => {
            setHover(n?.id ?? null);
            onHover(n ?? null, n ? data.links.filter((l) => endId(l.source) === n.id || endId(l.target) === n.id) : []);
            if (wrap.current) wrap.current.style.cursor = n ? "pointer" : "";
          }}
          onNodeClick={(n) => onOpen(n.inv)}
          linkWidth={(l) => (hot(l) ? 1.5 + l.reasons.length : 0.5 + l.reasons.length * 0.5)}
          linkColor={(l) => (!hover ? tokens.link : hot(l) ? tokens.linkHot : "rgba(0,0,0,0.04)")}
          nodePointerAreaPaint={(n, color, ctx) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(n.x!, n.y!, radius(n) + 6, 0, 2 * Math.PI);
            ctx.fill();
          }}
          nodeCanvasObject={(n, ctx, scale) => {
            const r = radius(n);
            const colors = n.areas.length ? n.areas.map((a) => tokens.area[a] ?? tokens.none) : [tokens.none];
            ctx.globalAlpha = !neighbors || neighbors.has(n.id) ? 1 : 0.18;
            // A node with two safety areas is split into two halves.
            colors.forEach((c, i) => {
              const step = (2 * Math.PI) / colors.length;
              ctx.beginPath();
              ctx.moveTo(n.x!, n.y!);
              ctx.arc(n.x!, n.y!, r, -Math.PI / 2 + i * step, -Math.PI / 2 + (i + 1) * step);
              ctx.fillStyle = c;
              ctx.fill();
            });
            ctx.beginPath();
            ctx.arc(n.x!, n.y!, r, 0, 2 * Math.PI);
            ctx.lineWidth = (n.id === hover ? 2.5 : 1.5) / scale;
            ctx.strokeStyle = n.id === hover ? tokens.text : tokens.card;
            ctx.stroke();
            const font = 11 / scale;
            ctx.font = `${n.id === hover ? 600 : 400} ${font}px ui-monospace, SFMono-Regular, Menlo, monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = n.id === hover ? tokens.text : tokens.muted;
            ctx.fillText(n.id, n.x!, n.y! + r + 3 / scale);
            ctx.globalAlpha = 1;
          }}
        />
      )}
    </div>
  );
}
