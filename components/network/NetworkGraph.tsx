"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
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

// The graph library sizes its canvas by window.devicePixelRatio. A 3x phone screen would make it paint 9 canvas
// pixels per CSS pixel on every frame; capped at 2 it paints 4 and still looks sharp. Only scripts read this
// value: the browser keeps drawing the rest of the page at the screen's full density.
const dpr = Object.getOwnPropertyDescriptor(window, "devicePixelRatio");
if (dpr?.get && dpr.configurable) {
  const real = dpr.get;
  Object.defineProperty(window, "devicePixelRatio", { ...dpr, get: () => Math.min(2, real.call(window)) });
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

// Click and drag area = the drawn dot plus 3 screen pixels.
function paintHitArea(n: N, color: string, ctx: CanvasRenderingContext2D, scale: number) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(n.x!, n.y!, radius(n) + 3 / scale, 0, 2 * Math.PI);
  ctx.fill();
}

// The visible frame in graph units, and the zoom (k) to turn screen pixels into graph units.
type Frame = { x0: number; y0: number; x1: number; y1: number; k: number };

// Keeps a dot and its id label inside the frame, so it never slides out of sight.
function clampToFrame(n: N, f: Frame | null) {
  if (!f) return;
  const r = radius(n), pad = 4 / f.k;
  const side = Math.max(r, (n.id.length * 3.4) / f.k) + pad; // half the label width (11px monospace)
  const x = Math.min(f.x1 - side, Math.max(f.x0 + side, n.x!));
  const y = Math.min(f.y1 - r - 16 / f.k - pad, Math.max(f.y0 + r + pad, n.y!)); // label sits below the dot
  if (x !== n.x) [n.x, n.vx] = [x, 0];
  if (y !== n.y) [n.y, n.vy] = [y, 0];
}

// A dot dropped onto a pinned dot would hide it (only the top one can be grabbed), so move it to the nearest
// free spot inside the frame, searching outward from the drop point in a spiral.
function moveOffPinned(n: N, nodes: N[], f: Frame | null) {
  if (!f) return;
  const [x, y] = [n.x!, n.y!];
  const pinned = nodes.filter((o) => o !== n && o.fx != null);
  for (let i = 0; i < 200; i++) {
    const d = (Math.sqrt(i) * 6) / f.k, a = i * 2.4;
    [n.x, n.y] = [x + d * Math.cos(a), y + d * Math.sin(a)];
    clampToFrame(n, f);
    if (pinned.every((o) => Math.hypot(o.x! - n.x!, o.y! - n.y!) >= radius(n) + radius(o) + 4 / f.k)) return;
  }
  [n.x, n.y] = [x, y];
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
  const fitted = useRef(false); // fit once after each layout, so later drags never rescale the view
  const frame = useRef<Frame | null>(null);
  // The library finds the dot under the pointer on a hidden "hit map" that it repaints at most every 800 ms, so
  // right after dots move it can point at old positions. A new hit painter makes it repaint now; we do that on
  // every press, just before the drag starts looking for the dot under the pointer.
  const [hitVersion, refreshHitMap] = useReducer((v: number) => v + 1, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- a new function identity is the point
  const hitPainter = useMemo(() => paintHitArea.bind(null), [hitVersion]);
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

  // The box has a fixed height in CSS (560px on phones, 520px from sm), so the page never jumps around the graph.
  useEffect(() => {
    const el = wrap.current!;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // While the graph is on screen, the library keeps redrawing (and keeps its hit map catching up with the dots).
  // Off screen, its animation loop stops completely, so scrolling elsewhere costs nothing. The first layout is
  // allowed to settle and fit off screen first (onEngineStop pauses it then), so it is ready before it is seen.
  const onScreen = useRef(false);
  useEffect(() => {
    if (!ready) return;
    const io = new IntersectionObserver(([e]) => {
      onScreen.current = e.isIntersecting;
      if (e.isIntersecting) fg.current?.resumeAnimation();
      else if (fitted.current) fg.current?.pauseAnimation();
    });
    io.observe(wrap.current!);
    return () => io.disconnect();
  }, [ready]);

  useEffect(() => {
    const g = fg.current;
    if (!g) return;
    g.d3Force("charge")?.strength(-140);
    // Weak links: dragging one dot barely tugs its neighbors.
    (g.d3Force("link") as ForceLink<N, L> | undefined)?.distance(55).strength(0.15);
    g.d3Force("collide", forceCollide<N>((n) => radius(n) + GAP / 2));
    // On a narrow screen, pull dots toward the vertical middle line so the graph grows tall instead of wide.
    g.d3Force("narrow", size.w < 640 ? forceX<N>(0).strength(0.12) : null);
    // Dots that are not pinned stay inside the frame; a dragged dot is kept inside by onNodeDrag.
    let nodes: N[] = [];
    const inFrame = Object.assign(() => nodes.forEach((n) => n.fx == null && clampToFrame(n, frame.current)), {
      initialize: (ns: N[]) => (nodes = ns),
    });
    g.d3Force("frame", inFrame);
    fitted.current = false;
    frame.current = null;
    g.d3ReheatSimulation();
    // Hand over the data only now, so the layout (computed before the first paint) already uses these forces.
    setReady(true);
  }, [size.w]);

  useEffect(() => {
    if (!ready) return;
    // The drag library blocks page scrolling on the whole graph (touch-action: none), which traps a phone user.
    // pan-y lets a finger on empty space scroll the page; a finger on a dot still drags it.
    wrap.current?.querySelector("canvas")?.style.setProperty("touch-action", "pan-y");
    // The browser test (tests/e2e/network-drag.cjs) reads node positions through this.
    Object.assign(window, { __networkGraph: { graph: fg.current, nodes: data.nodes } });
  }, [ready, data]);

  const onEngineStop = useCallback(() => {
    const g = fg.current;
    if (fitted.current || !ready || !g) return;
    fitted.current = true;
    g.zoomToFit(0, 48);
    const a = g.screen2GraphCoords(0, 0), b = g.screen2GraphCoords(size.w, size.h);
    frame.current = { x0: a.x, y0: a.y, x1: b.x, y1: b.y, k: g.zoom() };
    // The library schedules its next frame right after this callback returns, so pause just after that.
    queueMicrotask(() => onScreen.current || g.pauseAnimation());
  }, [ready, size]);

  const onNodeHover = useCallback(
    (n: N | null) => {
      setHover(n?.id ?? null);
      onHover(n ?? null, n ? data.links.filter((l) => endId(l.source) === n.id || endId(l.target) === n.id) : []);
      if (wrap.current) wrap.current.style.cursor = n ? "pointer" : "";
    },
    [data, onHover],
  );
  const onNodeClick = useCallback((n: N) => onOpen(n.inv), [onOpen]);
  // While dragging, keep the dot inside the frame.
  const onNodeDrag = useCallback((n: N) => {
    clampToFrame(n, frame.current);
    [n.fx, n.fy] = [n.x, n.y];
  }, []);
  // On drop, pin the dot (off any other pinned dot), so the cluster does not pull it back.
  const onNodeDragEnd = useCallback(
    (n: N) => {
      clampToFrame(n, frame.current);
      moveOffPinned(n, data.nodes, frame.current);
      [n.fx, n.fy] = [n.x, n.y];
    },
    [data],
  );

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
    <div ref={wrap} className="h-[560px] w-full sm:h-[520px]" onPointerDownCapture={() => refreshHitMap()} aria-hidden>
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
          autoPauseRedraw={false}
          onEngineStop={onEngineStop}
          enableZoomInteraction={false}
          enablePanInteraction={false}
          enableNodeDrag
          nodeLabel={noLabel}
          onNodeHover={onNodeHover}
          onNodeClick={onNodeClick}
          onNodeDrag={onNodeDrag}
          onNodeDragEnd={onNodeDragEnd}
          linkWidth={linkWidth}
          linkColor={linkColor}
          nodePointerAreaPaint={hitPainter}
          nodeCanvasObject={drawNode}
        />
      )}
    </div>
  );
}
