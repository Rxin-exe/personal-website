"use client";

import { useEffect, useRef, useState } from "react";
import { education, experience, type Experience as Role } from "@/content/site";
import { bayerAt } from "@/lib/dither";
import { paintCampanile } from "@/lib/campanile";
import { FX_MARGIN, roleFx, type Built, type FxId, type Scene } from "@/lib/roleFx";
import { sound } from "@/lib/sound";
import SectionHead from "./SectionHead";
import WipeLink from "./WipeLink";
import { ArrowRight } from "./icons";

/** The longer of the two comparison bars is this many pixel blocks. */
const BAR_BLOCKS = 18;
/** Transformations: CSS px per pixel, and how long they take to come in and go away. */
const CELL = 3;
const IN_MS = 750;
const OUT_MS = 280;
/** Behind text the scene fades this far toward its darkest colour, easing off over FEATHER cells. */
const CALM = 0.72;
const FEATHER = 3;

/**
 * How much to quiet the art in each cell: 1 right behind a line of text, fading to 0 a few
 * cells away. Measured from the real line boxes, so the art still shows between lines.
 */
function textCalm(row: HTMLElement, w: number, h: number, m: number) {
  const calm = new Float32Array(w * h);
  const origin = row.getBoundingClientRect();
  const rects: DOMRect[] = [];
  const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim()) continue;
    range.selectNodeContents(n);
    rects.push(...Array.from(range.getClientRects()));
  }
  row.querySelectorAll(".role-bar-track, .role-link").forEach((el) => rects.push(el.getBoundingClientRect()));
  for (const r of rects) {
    const x0 = (r.left - origin.left) / CELL + m;
    const x1 = (r.right - origin.left) / CELL + m;
    const y0 = (r.top - origin.top) / CELL + m;
    const y1 = (r.bottom - origin.top) / CELL + m;
    for (let y = Math.max(0, Math.floor(y0 - FEATHER)); y < Math.min(h, Math.ceil(y1 + FEATHER)); y++) {
      for (let x = Math.max(0, Math.floor(x0 - FEATHER)); x < Math.min(w, Math.ceil(x1 + FEATHER)); x++) {
        const dx = Math.max(x0 - (x + 0.5), x + 0.5 - x1, 0);
        const dy = Math.max(y0 - (y + 0.5), y + 0.5 - y1, 0);
        const v = 1 - Math.hypot(dx, dy) / FEATHER;
        const i = y * w + x;
        if (v > calm[i]) calm[i] = v;
      }
    }
  }
  return calm;
}

/**
 * Experience as one panel, a row per role: a header line (who, what, when), then the
 * result beside its number. Where the number is a change, two pixel bars show before and
 * now. They fill in, block by block, the first time each row scrolls into view.
 */
export default function Experience() {
  return (
    <section id="experience" className="container section" aria-labelledby="experience-title">
      <SectionHead id="experience" />
      <Education />
      {/* The frame carries the 3D edge; the panel inside is clipped to pixel corners. */}
      <div className="roles-frame">
        <div className="roles-panel">
          <ol className="roles">
            {experience.map((x) => (
              <RoleRow key={x.org} role={x} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/**
 * Draws a row's transformation (lib/roleFx.ts) onto its canvas. It comes in along the
 * scene's own order (outward from the cursor, bottom-up, a scan line...), keeps animating
 * while active, and dissolves away in Bayer order when it ends.
 */
function useRoleFx(id: FxId | undefined, rowRef: React.RefObject<HTMLLIElement | null>, canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const ctl = useRef<(on: boolean, cx?: number, cy?: number) => void>(() => {});

  useEffect(() => {
    const row = rowRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!id || !row || !canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const M = FX_MARGIN;

    let built: Built | null = null;
    let scene: Scene | null = null;
    let img: ImageData | null = null;
    let calm: Float32Array | null = null;
    let k = 0; // 0–1: how far the transformation has come in
    let from = 0;
    let target = 0;
    let phaseAt = 0;
    let startAt = 0;
    let lastDraw = 0;
    let raf = 0;

    const build = (cx?: number, cy?: number) => {
      const r = row.getBoundingClientRect();
      const w = Math.round(r.width / CELL) + 2 * M;
      const h = Math.round(r.height / CELL) + 2 * M;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${w * CELL}px`;
      canvas.style.height = `${h * CELL}px`;
      canvas.style.left = canvas.style.top = `${-M * CELL}px`;
      scene = { w, h, m: M, ex: cx === undefined ? w / 2 : (cx - r.left) / CELL + M, ey: cy === undefined ? h / 2 : (cy - r.top) / CELL + M };
      built = roleFx[id](scene);
      img = ctx.createImageData(w, h);
      calm = textCalm(row, w, h, M);
    };

    const draw = (now: number) => {
      raf = 0;
      if (!built || !scene || !img || !calm) return;
      const p = Math.min(1, (now - phaseAt) / (target ? IN_MS : OUT_MS));
      k = reduced ? target : target ? from + (1 - from) * (1 - Math.pow(1 - p, 2)) : from * (1 - p);
      const still = !target && k <= 0;
      if (still) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      // About 30 frames a second is plenty for pixel art.
      if (now - lastDraw >= 30 || p < 1) {
        lastDraw = now;
        const { w, h } = scene;
        const order = built.order;
        const [dr, dg, db] = built.dark;
        const paint = built.frame(reduced ? 3000 : now - startAt, k);
        const d = img.data;
        d.fill(0);
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = y * w + x;
            const front = k - order[i];
            // Coming in: along the scene's order, with a dithered edge. Going: Bayer dissolve.
            if (target ? front + (bayerAt(x, y) - 0.5) * 0.1 < 0 : bayerAt(x, y) >= k) continue;
            // The leading edge only glows while it's still moving.
            const c = paint(x, y, target && k < 1 ? front : 1);
            if (!c) continue;
            // Quiet the art behind text: fade toward the scene's darkest colour.
            const q = calm[i] * CALM;
            const o = i * 4;
            d[o] = c[0] + (dr - c[0]) * q;
            d[o + 1] = c[1] + (dg - c[1]) * q;
            d[o + 2] = c[2] + (db - c[2]) * q;
            d[o + 3] = 255;
          }
        }
        ctx.putImageData(img, 0, 0);
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    ctl.current = (on, cx, cy) => {
      if (on === !!target) return;
      const now = performance.now();
      if (on && (!built || k <= 0)) {
        build(cx, cy);
        startAt = now;
      }
      from = k;
      target = on ? 1 : 0;
      phaseAt = now;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    return () => cancelAnimationFrame(raf);
  }, [id, rowRef, canvasRef]);

  return ctl;
}

/**
 * Education, first and on its own: an ode to Berkeley. The Campanile at dusk in pixel art;
 * hovering (or tapping) it plays on the motto, Fiat Lux: the bell chamber lights gold,
 * lights come on across the hills, and the carillon rings.
 */
function Education() {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lit, setLit] = useState(false);
  const litRef = useRef(false);
  const lastRing = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let k = 0; // 0–1, how lit
    let img: ImageData | null = null;
    let raf = 0;
    let last = 0;
    let visible = false;

    const size = () => {
      const r = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width / CELL));
      const h = Math.max(1, Math.round(r.height / CELL));
      if (canvas.width !== w || canvas.height !== h || !img) {
        canvas.width = w;
        canvas.height = h;
        img = ctx.createImageData(w, h);
      }
    };
    const frame = (now: number) => {
      raf = 0;
      if (!img) return;
      const target = litRef.current ? 1 : 0;
      k = reduced ? target : k + (target - k) * 0.12;
      if (Math.abs(target - k) < 0.01) k = target;
      // Stars twinkle slowly; a few frames a second is enough until it's lighting up.
      if (now - last > (k === target ? 200 : 30)) {
        last = now;
        paintCampanile(img.data, canvas.width, canvas.height, k, reduced ? 0 : now);
        ctx.putImageData(img, 0, 0);
      }
      if (visible && !reduced) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    size();
    kick(); // the first frame paints whether or not it's on screen yet
    const ro = new ResizeObserver(() => {
      size();
      last = 0;
      kick();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(canvas);
    const onLit = () => kick();
    canvas.addEventListener("lit", onLit);
    return () => {
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("lit", onLit);
      cancelAnimationFrame(raf);
    };
  }, []);

  const light = (on: boolean) => {
    litRef.current = on;
    setLit(on);
    canvasRef.current?.dispatchEvent(new Event("lit"));
    const now = performance.now();
    if (on && now - lastRing.current > 2500) {
      lastRing.current = now;
      sound.carillon();
    }
  };

  // Touch: tap to light, tap anywhere else to dim.
  const pointer = useRef("mouse");
  useEffect(() => {
    if (!lit) return;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && !cardRef.current?.contains(e.target as Node)) light(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  });

  return (
    <div className="edu-frame">
      <div
        ref={cardRef}
        className={`edu ${lit ? "is-lit" : ""}`}
        onPointerDown={(e) => (pointer.current = e.pointerType)}
        onPointerEnter={(e) => e.pointerType === "mouse" && light(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && light(false)}
        onClick={() => pointer.current !== "mouse" && light(!lit)}
      >
        <canvas ref={canvasRef} className="edu-art" aria-hidden="true" />
        <div className="edu-body">
          <p className="edu-tag">Education</p>
          <h3 className="edu-school">{education.school}</h3>
          <p className="edu-degree">{education.degree}</p>
          <p className="edu-motto">
            <span lang="la">Fiat Lux</span>
            <span className="edu-motto-en">let there be light</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleRow({ role: x }: { role: Role }) {
  const ref = useRef<HTMLLIElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shown, setShown] = useState(false);
  const [fxOn, setFxOn] = useState(false);
  const current = x.dates.includes("now");
  const fx = useRoleFx(x.fx, ref, canvasRef);
  const pointer = useRef("mouse");
  const lastSound = useRef(0);

  const transform = (on: boolean, cx?: number, cy?: number) => {
    if (!x.fx) return;
    setFxOn(on);
    fx.current(on, cx, cy);
    // A short sound each time it transforms, but not again for cursor jitter.
    const now = performance.now();
    if (on && now - lastSound.current > 900) {
      lastSound.current = now;
      sound.fx(x.fx);
    }
  };

  // Touch: a tap anywhere else turns it back.
  useEffect(() => {
    if (!fxOn) return;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && !ref.current?.contains(e.target as Node)) {
        setFxOn(false);
        fx.current(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [fxOn, fx]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !x.metric?.compare) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setShown(true);
        sound.fill();
        io.disconnect();
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [x.metric?.compare]);

  return (
    <li
      ref={ref}
      className={`role ${shown ? "is-shown" : ""} ${x.fx ? `fx-${x.fx}` : ""} ${fxOn ? "is-fx" : ""}`}
      onPointerDown={(e) => (pointer.current = e.pointerType)}
      onPointerEnter={(e) => e.pointerType === "mouse" && transform(true, e.clientX, e.clientY)}
      onPointerLeave={(e) => e.pointerType === "mouse" && transform(false)}
      onClick={(e) => pointer.current !== "mouse" && transform(!fxOn, e.clientX, e.clientY)}
    >
      {x.fx && <canvas ref={canvasRef} className="role-fx" aria-hidden="true" />}
      <div className="role-head">
        <h3>{x.org}</h3>
        <p>
          {x.role}
          <span className="role-sep" aria-hidden="true">
            ·
          </span>
          <span className={`role-dates ${current ? "is-current" : ""}`}>{x.dates}</span>
        </p>
      </div>
      <div className="role-result">
        <p>{x.result}</p>
        {x.href && (
          <WipeLink href={x.href} className="btn btn-ghost btn-sm role-link">
            Read the case study
            <ArrowRight size={14} />
          </WipeLink>
        )}
      </div>
      {x.metric && (
        <div className="role-metric">
          <p className="role-metric-value">
            <span className="metric-value">{x.metric.value}</span>
            <span className="role-metric-label">{x.metric.label}</span>
          </p>
          {x.metric.compare && <Compare {...x.metric.compare} />}
        </div>
      )}
    </li>
  );
}

/** Before and now as two pixel bars, scaled to the larger. Decorative: the label says it in words. */
function Compare({ from, to }: { from: number; to: number }) {
  const max = Math.max(from, to);
  const bars = [
    { tag: "before", n: from, now: false },
    { tag: "now", n: to, now: true },
  ];
  return (
    <div className="role-bars" aria-hidden="true">
      {bars.map((b, row) => {
        const blocks = Math.max(1, Math.round((b.n / max) * BAR_BLOCKS));
        return (
          <div key={b.tag} className={`role-bar ${b.now ? "is-now" : ""}`}>
            <span className="role-bar-tag">{b.tag}</span>
            <span className="role-bar-track">
              {Array.from({ length: blocks }, (_, i) => (
                <i key={i} style={{ "--i": i + row * 8 } as React.CSSProperties} />
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
}
