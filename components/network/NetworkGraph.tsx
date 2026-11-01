"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import ForceGraph2D, { type ForceGraphMethods, type LinkObject, type NodeObject } from "react-force-graph-2d";
import type { Investigation } from "@/lib/data";
import { buildNetwork, type NetLink, type NetNode } from "@/lib/network";

type N = NodeObject<NetNode>;
type L = LinkObject<NetNode, NetLink>;

const EMPTY = { nodes: [], links: [] };
const endId = (end: L["source"]) => (typeof end === "object" ? (end as N).id : end) as string;
const radius = (n: NetNode) => 4 + Math.sqrt(n.degree) * 1.8;
const GAP = 14; // room between two dots for the id label

// Pushes overlapping dots apart, so every dot (and its click area) stays separate from its neighbors.
function collide() {
  let nodes: N[] = [];
  return Object.assign(
    () => {
      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
          const [a, b] = [nodes[i], nodes[j]];
          const dx = b.x! - a.x! || 0.01, dy = b.y! - a.y!;
          const dist = Math.hypot(dx, dy), min = radius(a) + radius(b) + GAP;
          if (dist >= min) continue;
          const push = (min - dist) / dist / 2;
          a.x! -= dx * push; a.y! -= dy * push;
          b.x! += dx * push; b.y! += dy * push;
        }
    },
    { initialize: (ns: N[]) => (nodes = ns) },
  );
}

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

type Box = { x0: number; y0: number; x1: number; y1: number } | null;

// Keeps a dot (and its label) inside the visible frame, so a drag can never push it out of reach.
function keepInside(n: N, b: Box) {
  if (!b) return;
  const r = radius(n);
  const x = Math.min(b.x1 - r, Math.max(b.x0 + r, n.x!));
  const y = Math.min(b.y1 - r - GAP, Math.max(b.y0 + r, n.y!));
  if (x !== n.x) [n.x, n.vx] = [x, 0];
  if (y !== n.y) [n.y, n.vy] = [y, 0];
  if (n.fx != null) [n.fx, n.fy] = [n.x, n.y];
}

function bounds(box: { current: Box }) {
  let nodes: N[] = [];
  return Object.assign(() => nodes.forEach((n) => keepInside(n, box.current)), {
    initialize: (ns: N[]) => (nodes = ns),
  });
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
  // Fit once after each layout; later drags must not rescale the view under the pointer.
  const fitted = useRef(false);
  const box = useRef<Box>(null);
  // The library finds the node under the pointer on a hidden "hit map" that it redraws at most every 800 ms.
  // Giving it a new hit painter flushes that redraw now, so while dots move the hit map matches what is drawn.
  const [hitVersion, syncHitMap] = useReducer((v: number) => v + 1, 0);
  const paintHitArea = useCallback(
    (n: N, color: string, ctx: CanvasRenderingContext2D, scale: number) => {
      // Click and drag area = the drawn dot plus 3 screen pixels.
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(n.x!, n.y!, radius(n) + 3 / scale, 0, 2 * Math.PI);
      ctx.fill();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a new function identity is the point
    [hitVersion],
  );
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
    g.d3Force("collide", collide());
    g.d3Force("bounds", bounds(box));
    box.current = null;
    fitted.current = false;
    g.d3ReheatSimulation();
    // Hand over the data only now, so the layout (computed before the first paint) already uses these forces.
    setReady(true);
  }, [size.w]);

  // Off screen, stop the drawing loop; it restarts when the graph scrolls back into view.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? fg.current?.resumeAnimation() : fg.current?.pauseAnimation()));
    io.observe(wrap.current!);
    return () => io.disconnect();
  }, []);

  const hot = (l: L) => hover !== null && (endId(l.source) === hover || endId(l.target) === hover);
  const fit = () => {
    if (fitted.current || !ready) return;
    fitted.current = true;
    const g = fg.current;
    if (!g) return;
    g.zoomToFit(0, 36);
    // The visible frame in graph units, minus a small margin.
    const a = g.screen2GraphCoords(8, 8), b = g.screen2GraphCoords(size.w - 8, size.h - 8);
    box.current = { x0: a.x, y0: a.y, x1: b.x, y1: b.y };
  };

  return (
    <div ref={wrap} className="w-full touch-pan-y" aria-hidden>
      {size.w > 0 && (
        <ForceGraph2D<NetNode, NetLink>
          ref={fg}
          graphData={ready ? data : EMPTY}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          // The layout is computed before the first paint, so the graph appears settled. After a drag, the
          // neighbors settle for at most 60 frames (about 1 s) and the simulation stops; with reduced motion they stay put.
          warmupTicks={300}
          cooldownTicks={reduced ? 0 : 60}
          d3VelocityDecay={0.55}
          onEngineTick={syncHitMap}
          onEngineStop={() => {
            fit();
            syncHitMap();
          }}
          enableZoomInteraction={false}
          enablePanInteraction={false}
          enableNodeDrag
          nodeLabel={() => ""}
          onNodeHover={(n) => {
            setHover(n?.id ?? null);
            onHover(n ?? null, n ? data.links.filter((l) => endId(l.source) === n.id || endId(l.target) === n.id) : []);
            if (wrap.current) wrap.current.style.cursor = n ? "pointer" : "";
          }}
          onNodeClick={(n) => onOpen(n.inv)}
          onNodeDrag={(n) => keepInside(n, box.current)}
          linkWidth={(l) => (hot(l) ? 1.5 + l.reasons.length : 0.5 + l.reasons.length * 0.5)}
          linkColor={(l) => (!hover ? tokens.link : hot(l) ? tokens.linkHot : "rgba(0,0,0,0.04)")}
          nodePointerAreaPaint={paintHitArea}
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
