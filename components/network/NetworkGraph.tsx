"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, type SimulationNodeDatum } from "d3-force";
import type { Investigation } from "@/lib/data";
import type { NetLink, NetNode, Network } from "@/lib/network";

type Pt = { x: number; y: number };
type Box = { w: number; h: number };

const radius = (n: NetNode) => 4 + Math.sqrt(n.degree) * 1.8;
const PAD = 4;
const CLICK_SLOP = 4; // px a press may move and still count as a click

// Keeps a dot and its id label (below the dot) inside the frame.
function clamp(p: Pt, n: NetNode, box: Box): Pt {
  const r = radius(n);
  const side = Math.max(r, n.id.length * 3.4) + PAD; // half the label width (11px monospace)
  return {
    x: Math.min(box.w - side, Math.max(side, p.x)),
    y: Math.min(box.h - r - 16 - PAD, Math.max(r + PAD, p.y)),
  };
}

// Runs the force layout to the end once, then stops. Nothing moves after this unless a dot is dragged.
function layout(nodes: NetNode[], links: NetLink[], box: Box): Pt[] {
  type S = SimulationNodeDatum & { n: NetNode };
  const sim: S[] = nodes.map((n, i) => ({ n, x: box.w / 2 + Math.cos(i) * 40, y: box.h / 2 + Math.sin(i) * 40 }));
  const simulation = forceSimulation(sim)
    .force("charge", forceManyBody().strength(-140))
    .force("link", forceLink(links.map((l) => ({ ...l }))).id((d) => (d as S).n.id).distance(55).strength(0.15))
    .force("collide", forceCollide<S>((d) => radius(d.n) + 7))
    // On a narrow screen, pull harder toward the vertical middle line so the graph grows tall instead of wide.
    .force("x", forceX(box.w / 2).strength(box.w < 640 ? 0.12 : 0.04))
    .force("y", forceY(box.h / 2).strength(0.06))
    .stop();
  for (let i = 0; i < 300; i++) {
    simulation.tick();
    for (const d of sim) Object.assign(d, clamp({ x: d.x!, y: d.y! }, d.n, box));
  }
  // Spread the finished layout to fill the frame, keeping dots and text at their pixel size. Each axis stretches on
  // its own (at most 1.5x more than the other), so a tall phone frame is used top to bottom.
  const xs = sim.map((d) => d.x!), ys = sim.map((d) => d.y!);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const [mx, my] = [70, 40]; // room for the widest label and the label under a dot
  const [fx, fy] = [(box.w - 2 * mx) / (x1 - x0 || 1), (box.h - 2 * my) / (y1 - y0 || 1)];
  const [kx, ky] = [Math.min(fx, fy * 1.5), Math.min(fy, fx * 1.5)];
  return sim.map((d) =>
    clamp({ x: box.w / 2 + (d.x! - (x0 + x1) / 2) * kx, y: box.h / 2 + (d.y! - (y0 + y1) / 2) * ky }, d.n, box),
  );
}

// A dot dropped onto another would hide it, so slide it to the nearest free spot (spiral out from the drop point).
function freeSpot(i: number, p: Pt, nodes: NetNode[], pos: Pt[], box: Box): Pt {
  for (let k = 0; k < 200; k++) {
    const d = Math.sqrt(k) * 6, a = k * 2.4;
    const q = clamp({ x: p.x + d * Math.cos(a), y: p.y + d * Math.sin(a) }, nodes[i], box);
    if (pos.every((o, j) => j === i || Math.hypot(o.x - q.x, o.y - q.y) >= radius(nodes[i]) + radius(nodes[j]) + 4)) return q;
  }
  return p;
}

// One wedge of a dot: a full circle for one safety area, half and half for two.
function wedge(r: number, i: number, count: number) {
  const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / count, a1 = a0 + (2 * Math.PI) / count;
  const [x0, y0, x1, y1] = [r * Math.cos(a0), r * Math.sin(a0), r * Math.cos(a1), r * Math.sin(a1)];
  return `M0 0L${x0} ${y0}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1}Z`;
}
const areaColor = (a: string) => (["prevention", "detection", "suppression"].includes(a) ? `var(--area-${a})` : "var(--area-none)");

export function NetworkGraph({
  network: { nodes, links },
  onOpen,
  onHover,
}: {
  network: Network;
  onOpen: (inv: Investigation) => void;
  onHover: (node: NetNode | null, links: NetLink[]) => void;
}) {
  const index = useMemo(() => new Map(nodes.map((n, i) => [n.id, i])), [nodes]);
  const svg = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  // The layout is computed once per box size; dragged positions are kept only for that layout.
  const base = useMemo(() => (box ? layout(nodes, links, box) : []), [box, nodes, links]);
  const [dragged, setDragged] = useState<{ base: Pt[]; pos: Pt[] } | null>(null);
  const pos = dragged?.base === base ? dragged.pos : base;
  const setPos = (f: (old: Pt[]) => Pt[]) => setDragged({ base, pos: f(pos) });
  const [hover, setHover] = useState<string | null>(null);
  const drag = useRef<{ i: number; id: number; start: Pt; offset: Pt; moved: boolean } | null>(null);

  // The box has a fixed height in CSS; the viewBox matches its pixel size, so text stays 11px on every screen.
  // A new width gives a fresh layout.
  useEffect(() => {
    const el = svg.current!.parentElement!;
    const ro = new ResizeObserver(() =>
      setBox((b) => (b && b.w === el.clientWidth && b.h === el.clientHeight ? b : { w: el.clientWidth, h: el.clientHeight })),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const neighbors = useMemo(() => {
    if (!hover) return null;
    const set = new Set([hover]);
    for (const l of links) {
      if (l.source === hover) set.add(l.target);
      if (l.target === hover) set.add(l.source);
    }
    return set;
  }, [hover, links]);

  const enter = (n: NetNode | null) => {
    if (drag.current) return; // keep the dragged dot highlighted
    setHover(n?.id ?? null);
    onHover(n, n ? links.filter((l) => l.source === n.id || l.target === n.id) : []);
  };

  const toSvg = (e: PointerEvent): Pt => {
    const m = svg.current!.getScreenCTM()!.inverse();
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
    return { x: p.x, y: p.y };
  };

  const down = (i: number) => (e: PointerEvent<SVGGElement>) => {
    if (e.button !== 0 || drag.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toSvg(e);
    drag.current = { i, id: e.pointerId, start: p, offset: { x: pos[i].x - p.x, y: pos[i].y - p.y }, moved: false };
  };
  const move = (e: PointerEvent<SVGGElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const p = toSvg(e);
    if (!d.moved && Math.hypot(p.x - d.start.x, p.y - d.start.y) < CLICK_SLOP) return;
    d.moved = true;
    const q = clamp({ x: p.x + d.offset.x, y: p.y + d.offset.y }, nodes[d.i], box!);
    setPos((old) => old.map((o, j) => (j === d.i ? q : o)));
  };
  const up = (e: PointerEvent<SVGGElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) return onOpen(nodes[d.i].inv);
    setPos((old) => old.map((o, j) => (j === d.i ? freeSpot(j, o, nodes, old, box!) : o)));
  };
  const cancel = () => (drag.current = null);
  const key = (n: NetNode) => (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    onOpen(n.inv);
  };

  // A finger on a dot drags it instead of scrolling the page. Chrome ignores touch-action on shapes inside an SVG,
  // so block the scroll here (React's touch listeners are passive and cannot). Empty graph space still scrolls.
  useEffect(() => {
    const el = svg.current!;
    const stop = (e: TouchEvent) => (e.target as Element).closest("[data-id]") && e.preventDefault();
    el.addEventListener("touchstart", stop, { passive: false });
    return () => el.removeEventListener("touchstart", stop);
  }, []);

  const ready = box && pos.length === nodes.length;
  return (
    <div className="h-[560px] w-full sm:h-[520px]">
      <svg ref={svg} viewBox={box ? `0 0 ${box.w} ${box.h}` : undefined} className="block size-full select-none" role="group" aria-label="Network of investigations">
        {ready && (
          <>
            <g>
              {links.map((l) => {
                const [a, b] = [pos[index.get(l.source)!], pos[index.get(l.target)!]];
                const hot = hover !== null && (l.source === hover || l.target === hover);
                return (
                  <line
                    key={`${l.source}-${l.target}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={!hover ? "var(--input)" : hot ? "var(--primary)" : "rgba(0,0,0,0.04)"}
                    strokeWidth={hot ? 1.5 + l.reasons.length : 0.5 + l.reasons.length * 0.5}
                  />
                );
              })}
            </g>
            {nodes.map((n, i) => {
              const r = radius(n), on = n.id === hover;
              const areas = n.inv.safety_area;
              const colors = areas.length ? areas.map(areaColor) : ["var(--area-none)"];
              return (
                <g
                  key={n.id}
                  data-id={n.id}
                  data-r={r}
                  transform={`translate(${pos[i].x} ${pos[i].y})`}
                  opacity={!neighbors || neighbors.has(n.id) ? 1 : 0.18}
                  tabIndex={0}
                  role="button"
                  aria-label={`${n.id}, ${n.inv.name}, ${n.degree} links. Press Enter to open.`}
                  className="group cursor-pointer outline-none"
                  onPointerEnter={() => enter(n)}
                  onPointerLeave={() => enter(null)}
                  onFocus={() => enter(n)}
                  onBlur={() => enter(null)}
                  onPointerDown={down(i)}
                  onPointerMove={move}
                  onPointerUp={up}
                  onPointerCancel={cancel}
                  onKeyDown={key(n)}
                >
                  <circle r={r + 3} fill="transparent" />
                  {colors.length === 1 ? (
                    <circle r={r} fill={colors[0]} />
                  ) : (
                    colors.map((c, k) => <path key={k} d={wedge(r, k, colors.length)} fill={c} />)
                  )}
                  <circle
                    r={r}
                    fill="none"
                    strokeWidth={on ? 2.5 : 1.5}
                    className={`${on ? "stroke-foreground" : "stroke-card"} group-focus-visible:stroke-primary`}
                  />
                  <text
                    y={r + 3}
                    dominantBaseline="hanging"
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={on ? 600 : 400}
                    className={`pointer-events-none font-mono ${on ? "fill-foreground" : "fill-muted-foreground"}`}
                  >
                    {n.id}
                  </text>
                </g>
              );
            })}
          </>
        )}
      </svg>
    </div>
  );
}
