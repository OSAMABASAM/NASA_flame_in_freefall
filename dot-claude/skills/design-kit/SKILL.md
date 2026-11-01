---
name: design-kit
description: Osama's standard design toolkit for every web project — shadcn/ui components, a design system as CSS tokens, Motion for small interactions, GSAP ScrollTrigger plus Lenis for scroll motion, and the rules for when to use each. Use when setting up a new frontend, when the user says "design kit", "make it look good", "add scroll animation", "smooth scroll", or after a Claude Design handoff to wire the look into code.
---

# Design kit

Think of it as a carpenter's toolbox: the same tools on every job, only the wood changes.
The look (colors, fonts, spacing) comes from the Claude Design handoff or `docs/design/`. This kit is the code that carries that look.

## Order of work (never skip ahead)

1. The demo flow works end to end, even if ugly.
2. Design system tokens + shadcn components match the Claude Design screens.
3. Motion on interactions (buttons, cards, lists).
4. Scroll motion (GSAP + Lenis) on the landing or hero only, last.

If the demo is not working, do not add motion. Motion added without a vision turns into clutter.

## 1. Setup (Next.js + Tailwind project)

```bash
npx shadcn@latest init            # components base
npx shadcn@latest add button card input dialog table tabs badge skeleton sonner
npm i motion gsap @gsap/react lenis
```

GSAP and all its plugins (including ScrollTrigger) are free, including commercial use, since April 2025.

## 2. Design tokens (one place for the whole look)

Put the colors, fonts and radii from the Claude Design handoff into CSS variables in `app/globals.css` (shadcn already uses `--background`, `--foreground`, `--primary`, `--muted`, `--accent`, `--border`, `--radius`). Rules:
- Every color in components comes from a token. No hard-coded hex values in components.
- Maximum 2 font families (one display, one body), loaded with `next/font/google`.
- One spacing scale (Tailwind defaults) and one radius.
- Check text contrast reaches WCAG AA (4.5:1 for body text).
- Support dark mode only if the design has it; do not invent one.

## 3. Ready-made pieces

- **shadcn/ui** (`ui.shadcn.com`): default for all standard UI.
- **21st.dev**, **Magic UI**, **Aceternity UI**: fancy hero sections, animated backgrounds, cards. Copy one piece at a time, restyle it with the tokens, and keep only what appears in the demo.
- Prefer a native element when it already does the job (for example `<input type="date">`).

## 4. Motion (small interactions)

```tsx
"use client";
import { motion } from "motion/react";

export function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

Rules: 150 to 400 ms, ease-out, move 8 to 16 px at most, animate only `opacity` and `transform`.

## 5. Smooth scroll + scroll motion (Lenis + GSAP ScrollTrigger)

`components/smooth-scroll.tsx`:

```tsx
"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);
  return <>{children}</>;
}
```

Wrap the page body with `<SmoothScroll>` in `app/layout.tsx`.

A scroll-reveal section with `useGSAP` (cleans up automatically):

```tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function RevealSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.from(".reveal", {
      y: 40, opacity: 0, stagger: 0.12, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%" },
    });
  }, { scope: ref });
  return <section ref={ref}>{children}</section>;
}
```

Give children the class `reveal`. Pinned or scrubbed sections (`pin: true`, `scrub: true`) only for one hero or story section, never across the whole app.

## 6. Rules that keep it from looking like AI slop

- Respect `prefers-reduced-motion`: no smooth scroll and no big motion for those users.
- No ALL CAPS headings, no rainbow gradients, no random emoji, no five different card styles.
- One accent color used sparingly. Whitespace is a feature.
- Animate on the demo path only. Dashboards and data screens stay calm and fast.
- After adding motion: run the page, take a screenshot and a short Playwright video, check that nothing jumps, overlaps or lags, and check the phone size (390 by 844).
- Finish with `/impeccable audit` and fix what it reports.
