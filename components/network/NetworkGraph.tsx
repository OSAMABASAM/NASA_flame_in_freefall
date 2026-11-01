"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { forceCollide, forceX, type ForceLink } from "d3-force";
import ForceGraph2D, { type ForceGraphMethods, type LinkObject, type NodeObject } from "react-force-graph-2d";
import type { Investigation } from "@/lib/data";
import { buildNetwork, type NetLink, type NetNode } from "@/lib/network";

type N = NodeObject<NetNode>;
type L = LinkObject<NetNode, NetLink>;

const EMPTY = { nodes: [], links: [] };
const endId = (end: L["source"]) => (typeof end === "object" ? (end as N).id : end) as string;
const radius = (n: NetNode) => 4 + Math.sqrt(n.degree) * 1.8;
const GAP = 14; // room between two dots for the id label
const noLabel = () => "";

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

// Click and drag area = the drawn dot plus 3 screen pixels.
function paintHitArea(n: N, color: string, ctx: CanvasRenderingContext2D, scale: number) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(n.x!, n.y!, radius(n) + 3 / scale, 0, 2 * Math.PI);
  ctx.fill();
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
  const [visible, setVisible] = useState(false);
  const fitted = useRef(false); // fit once after each layout, so later drags never rescale the view
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

  // While the graph is on screen, the library redraws every frame, so its hidden click map always matches the dots.
  // Off screen, it pauses redrawing once the layout is still.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(wrap.current!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const g = fg.current;
    if (!g) return;
    g.d3Force("charge")?.strength(-140);
    // Weak links: dragging one dot barely tugs its neighbors.
    (g.d3Force("link") as ForceLink<N, L> | undefined)?.distance(55).strength(0.15);
    g.d3Force("collide", forceCollide<N>((n) => radius(n) + GAP / 2));
    // On a narrow screen, pull dots toward the vertical middle line so the graph grows tall instead of wide.
    g.d3Force("narrow", size.w < 640 ? forceX<N>(0).strength(0.12) : null);
    fitted.current = false;
    g.d3ReheatSimulation();
    // Hand over the data only now, so the layout (computed before the first paint) already uses these forces.
    setReady(true);
  }, [size.w]);

  // The browser test (tests/e2e/network-drag.cjs) reads node positions through this.
  useEffect(() => {
    if (ready) Object.assign(window, { __networkGraph: { graph: fg.current, nodes: data.nodes } });
  }, [ready, data]);

  const onEngineStop = useCallback(() => {
    if (fitted.current || !ready) return;
    fitted.current = true;
    fg.current?.zoomToFit(0, 36);
  }, [ready]);

  const onNodeHover = useCallback(
    (n: N | null) => {
      setHover(n?.id ?? null);
      onHover(n ?? null, n ? data.links.filter((l) => endId(l.source) === n.id || endId(l.target) === n.id) : []);
      if (wrap.current) wrap.current.style.cursor = n ? "pointer" : "";
    },
    [data, onHover],
  );
  const onNodeClick = useCallback((n: N) => onOpen(n.inv), [onOpen]);
  // Pin a dot where it is dropped, so it stays there and the cluster does not pull it back.
  const onNodeDragEnd = useCallback((n: N) => {
    n.fx = n.x;
    n.fy = n.y;
  }, []);

  const hot = useCallback((l: L) => hover !== null && (endId(l.source) === hover || endId(l.target) === hover), [hover]);
  const linkWidth = useCallback((l: L) => (hot(l) ? 1.5 + l.reasons.length : 0.5 + l.reasons.length * 0.5), [hot]);
  const linkColor = useCallback(
    (l: L) => (!hover ? tokens.link : hot(l) ? tokens.linkHot : "rgba(0,0,0,0.04)"),
    [hover, hot, tokens],
  );

  const drawNode = useCallback(
    (n: N, ctx: CanvasRenderingContext2D, scale: number) => {
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
    },
    [hover, neighbors, tokens],
  );

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
          // neighbors settle for at most 60 frames (about 1 s); with reduced motion they stay put.
          warmupTicks={300}
          cooldownTicks={reduced ? 0 : 60}
          d3VelocityDecay={0.55}
          autoPauseRedraw={!visible}
          onEngineStop={onEngineStop}
          enableZoomInteraction={false}
          enablePanInteraction={false}
          enableNodeDrag
          nodeLabel={noLabel}
          onNodeHover={onNodeHover}
          onNodeClick={onNodeClick}
          onNodeDragEnd={onNodeDragEnd}
          linkWidth={linkWidth}
          linkColor={linkColor}
          nodePointerAreaPaint={paintHitArea}
          nodeCanvasObject={drawNode}
        />
      )}
    </div>
  );
}
