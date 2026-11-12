"use client";

import { useEffect, useRef, useState } from "react";
import { bayerAt, dither } from "@/lib/dither";
import { scenes, type SceneId } from "@/lib/scenes";

/** CSS pixels per dither cell, everywhere on the site. */
const CELL = 3;

/** Drops pixels near an edge in the Bayer pattern, so the scene dissolves rather than fades. */
function dissolve(img: ImageData, { top = 0, bottom = 0 }: { top?: number; bottom?: number }) {
  const { width: w, height: h, data } = img;
  const topRows = Math.round(h * top);
  const bottomRows = Math.round(h * bottom);
  for (let y = 0; y < h; y++) {
    let keep = 1;
    if (y < topRows) keep = y / topRows;
    else if (y >= h - bottomRows) keep = (h - 1 - y) / bottomRows;
    if (keep >= 1) continue;
    for (let x = 0; x < w; x++) if (bayerAt(x, y) >= keep) data[(y * w + x) * 4 + 3] = 0;
  }
}

/**
 * Renders one of the dithered scenes in lib/scenes.ts to a low-res canvas that's scaled
 * up with crisp pixels. Redrawn on resize; scenes with frames (the campfire) animate
 * slowly, only while on screen and never with reduced motion.
 */
export default function DitherScene({ scene, className = "" }: { scene: SceneId; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [spots, setSpots] = useState<{ id: string; label: string; left: number; top: number; width: number; height: number }[]>([]);
  const actRef = useRef<(id: string) => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const s = scenes[scene];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let base: ImageData | null = null;
    let bright: ImageData | null = null; // the hover version, fully composed
    let hoverK = 0; // 0–1: how much the scene has brightened toward the cursor
    let frame = 0;
    let lastKey = "";

    // First visit: reveal the scene outward from its origin (the sun), in the dither pattern.
    const html = document.documentElement;
    let intro = !!s.origin && html.classList.contains("intro");
    let introStart = 0;
    let introRaf = 0;
    let copyStarted = false;
    const INTRO_MS = 1700;

    const finishIntro = () => {
      if (!copyStarted) {
        copyStarted = true;
        html.classList.remove("intro");
        html.classList.add("intro-in");
        try {
          sessionStorage.setItem("intro-seen", "1");
        } catch {
          // ignore
        }
      }
    };

    const show = () => {
      if (!base) return;
      const out = new ImageData(new Uint8ClampedArray(base.data), base.width, base.height);
      s.post?.(out.data, out.width, out.height, frame);
      if (s.dissolve) dissolve(out, s.dissolve);
      if (intro && s.origin) {
        const p = Math.min(1, (performance.now() - introStart) / INTRO_MS);
        const eased = 1 - Math.pow(1 - p, 3);
        const o = s.origin(out.width, out.height);
        const reach = eased * 1.25; // in widths from the sun
        const d = out.data;
        for (let y = 0; y < out.height; y++) {
          for (let x = 0; x < out.width; x++) {
            const r = Math.hypot(x - o.x, (y - o.y) * 1.4) / out.width;
            // A dithered edge: pixels near the wavefront appear in Bayer order.
            if (r > reach - (bayerAt(x, y) - 0.5) * 0.16) d[(y * out.width + x) * 4 + 3] = 0;
          }
        }
        if (p > 0.55) finishIntro();
        if (p >= 1) intro = false;
      } else if (bright && s.hover && hoverK > 0.01) {
        // Cursor near the sun: swap in pixels from the bright version, in Bayer order,
        // more of them the closer they are to the sun.
        const at = s.hover.at(out.width, out.height);
        const R = out.width * 0.3;
        const d = out.data;
        const b = bright.data;
        const x0 = Math.max(0, Math.floor(at.x - R));
        const x1 = Math.min(out.width, Math.ceil(at.x + R));
        const y0 = Math.max(0, Math.floor(at.y - R));
        const y1 = Math.min(out.height, Math.ceil(at.y + R));
        for (let y = y0; y < y1; y++) {
          for (let x = x0; x < x1; x++) {
            const weight = hoverK * (1 - Math.hypot(x - at.x, (y - at.y) * 1.3) / R);
            if (weight <= 0 || bayerAt(x, y) >= weight) continue;
            const i = (y * out.width + x) * 4;
            d[i] = b[i];
            d[i + 1] = b[i + 1];
            d[i + 2] = b[i + 2];
            d[i + 3] = b[i + 3];
          }
        }
      }
      ctx.putImageData(out, 0, 0);
    };

    const runIntro = () => {
      introStart = performance.now();
      const tick = () => {
        show();
        if (intro) introRaf = requestAnimationFrame(tick);
      };
      introRaf = requestAnimationFrame(tick);
    };

    const draw = () => {
      const box = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(box.width / CELL));
      const h = Math.max(1, Math.round(box.height / CELL));
      const key = `${w}x${h}`;
      if (key === lastKey) return;
      lastKey = key;
      canvas.width = w;
      canvas.height = h;
      base = ctx.createImageData(w, h);
      s.paint(base.data, w, h);
      dither(base.data, w, h, s.spread);
      if (s.hover && !reduced) {
        bright = ctx.createImageData(w, h);
        s.hover.paint(bright.data, w, h);
        dither(bright.data, w, h, s.spread);
        s.hover.post(bright.data, w, h);
        if (s.dissolve) dissolve(bright, s.dissolve);
      }
      show();
      setReady(true);
      placeSpots();
    };

    // Clickable spots (camp: the climber and the fire), placed over the canvas in CSS px.
    function placeSpots() {
      if (!s.hotspots || !base) return;
      setSpots(
        s.hotspots(base.width, base.height).map((h) => ({ id: h.id, label: h.label, left: h.x * CELL, top: h.y * CELL, width: h.w * CELL, height: h.h * CELL }))
      );
    }

    // A click plays the scene's response, frame by frame, then settles.
    let actRaf = 0;
    actRef.current = (id: string) => {
      if (!s.act) return;
      const ms = s.act(id, reduced);
      const end = performance.now() + ms + 60;
      cancelAnimationFrame(actRaf);
      const tick = () => {
        show();
        if (performance.now() < end) actRaf = requestAnimationFrame(tick);
        else placeSpots();
      };
      tick();
    };

    draw();
    if (intro) runIntro();
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    });
    ro.observe(canvas);

    // Hover: brighten toward the cursor as it nears the scene's hot spot (the sun).
    let hoverTarget = 0;
    let hoverRaf = 0;
    const settle = () => {
      hoverRaf = 0;
      hoverK += (hoverTarget - hoverK) * 0.12;
      if (Math.abs(hoverTarget - hoverK) < 0.005) hoverK = hoverTarget;
      if (!intro) show();
      if (hoverK !== hoverTarget) hoverRaf = requestAnimationFrame(settle);
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !s.hover || !base) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const at = s.hover.at(base.width, base.height);
      const dx = (e.clientX - rect.left) / CELL - at.x;
      const dy = (e.clientY - rect.top) / CELL - at.y;
      const target = Math.max(0, Math.min(1, 1.15 - Math.hypot(dx, dy) / (base.width * 0.32)));
      if (Math.abs(target - hoverTarget) < 0.01) return;
      hoverTarget = target;
      if (!hoverRaf) hoverRaf = requestAnimationFrame(settle);
    };
    if (s.hover && !reduced) window.addEventListener("pointermove", onPointer, { passive: true });

    // Flicker: a few frames a second, only while visible.
    let timer: ReturnType<typeof setInterval> | undefined;
    let io: IntersectionObserver | undefined;
    if (s.frames && s.frames > 1 && !reduced) {
      io = new IntersectionObserver(([e]) => {
        clearInterval(timer);
        if (e.isIntersecting)
          timer = setInterval(() => {
            frame = (frame + 1) % s.frames!;
            show();
          }, 220);
      });
      io.observe(canvas);
    }

    return () => {
      ro.disconnect();
      io?.disconnect();
      cancelAnimationFrame(actRaf);
      clearInterval(timer);
      cancelAnimationFrame(raf);
      // Don't end the entrance here: React may remount and replay it. The head script's
      // timer still guarantees the copy appears if this scene goes away mid-entrance.
      cancelAnimationFrame(introRaf);
      cancelAnimationFrame(hoverRaf);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [scene]);

  const interactive = !!scenes[scene].hotspots;
  const canvas = <canvas ref={canvasRef} className={`scene scene--${scene} ${ready ? "is-ready" : ""} ${interactive ? "" : className}`} aria-hidden="true" />;
  if (!interactive) return canvas;
  // Interactive scenes: the canvas plus real buttons over the things you can click.
  return (
    <div className={`scene-wrap ${className}`}>
      {canvas}
      {spots.map((p) => (
        <button
          key={p.id}
          type="button"
          className="scene-spot"
          style={{ left: p.left, top: p.top, width: p.width, height: p.height }}
          aria-label={p.label}
          title={p.label}
          onClick={() => actRef.current(p.id)}
        />
      ))}
    </div>
  );
}
