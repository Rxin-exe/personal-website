"use client";

import { useEffect, useRef } from "react";

/**
 * A perspective dot-grid terrain under the hero. Each dot carries a little random
 * jitter, so the surface reads as noisy data. Under the cursor, the noise resolves
 * into signal: dots settle onto a clean fitted slope and turn amber. Moving sends small ripples; clicking sends a big one.
 * Plain canvas 2D with a hand-rolled camera; no 3D library.
 */

type Ripple = { x: number; z: number; t0: number; amp: number };

const AMBER = "245, 158, 11";
const WHITE = "250, 250, 250";
const ALPHA_STEPS = 10;

export default function SignalTerrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 640px)").matches;

    // World: ground plane y = 0, x across, z away from the camera.
    const COLS = small ? 44 : 96;
    const ROWS = small ? 30 : 46;
    const X_HALF = small ? 4.2 : 7.5;
    const Z_NEAR = 1.4;
    const Z_FAR = 13;
    const CAM_H = 1.25;
    const PITCH = 0.3;
    const LENS_R = small ? 1 : 1.15;
    const cosP = Math.cos(PITCH);
    const sinP = Math.sin(PITCH);

    const n = COLS * ROWS;
    const gx = new Float32Array(n);
    const gz = new Float32Array(n);
    const jitter = new Float32Array(n);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        gx[i] = -X_HALF + (c / (COLS - 1)) * X_HALF * 2;
        // Rows bunch up toward the horizon so spacing looks even in perspective.
        const t = r / (ROWS - 1);
        gz[i] = Z_NEAR + (Z_FAR - Z_NEAR) * t * t;
        jitter[i] = (Math.random() - 0.5) * 0.16;
      }
    }

    let width = 0;
    let height = 0;
    let focal = 0;
    let cx = 0;
    let cy = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      focal = Math.max(width * 0.55, height * 0.9);
      cx = width / 2;
      // Put the horizon about a third of the way down.
      cy = height * 0.34 + focal * Math.tan(PITCH);
    };

    // Smooth rolling waves: the "underlying trend" the noise sits on.
    const wave = (x: number, z: number, t: number) =>
      0.2 * Math.sin(x * 0.55 + t * 0.35) * Math.cos(z * 0.42 - t * 0.25) +
      0.1 * Math.sin((x + z) * 0.9 + t * 0.6) +
      0.05 * Math.sin(x * 1.7 - z * 1.3 + t * 0.9);

    const ripples: Ripple[] = [];
    const rippleAt = (x: number, z: number, t: number) => {
      let h = 0;
      for (const rp of ripples) {
        const age = t - rp.t0;
        const d = Math.hypot(x - rp.x, z - rp.z);
        const front = age * 2.6;
        if (d > front) continue;
        h += rp.amp * Math.sin((front - d) * 3.2) * Math.exp(-age * 1.1) * Math.exp(-d * 0.25);
      }
      return h;
    };

    /** Screen point → ground-plane point, or null above the horizon. */
    const toGround = (sx: number, sy: number) => {
      const X = (sx - cx) / focal;
      const Y = -(sy - cy) / focal;
      const dy = Y * cosP - sinP;
      if (dy >= -0.02) return null;
      const t = -CAM_H / dy;
      return { x: X * t, z: (Y * sinP + cosP) * t };
    };

    const project = (x: number, y: number, z: number, out: { x: number; y: number; s: number }) => {
      const yc = (y - CAM_H) * cosP + z * sinP;
      const zc = -(y - CAM_H) * sinP + z * cosP;
      out.x = cx + (focal * x) / zc;
      out.y = cy - (focal * yc) / zc;
      out.s = 1 / zc;
    };

    // Cursor: target on the ground, smoothed lens centre, and lens strength.
    const pointer = { active: false, sx: 0, sy: 0 };
    const lens = { x: 0, z: 5, k: 0 };
    let lastRipple = 0;
    let lastRippleX = 0;
    let lastRippleZ = 0;

    const localPoint = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { sx: e.clientX - rect.left, sy: e.clientY - rect.top, inside: e.clientY >= rect.top && e.clientY <= rect.bottom };
    };

    const start = performance.now();
    const seconds = () => (performance.now() - start) / 1000;

    const onMove = (e: PointerEvent) => {
      const p = localPoint(e);
      const g = p.inside ? toGround(p.sx, p.sy) : null;
      pointer.active = !!g && e.pointerType === "mouse";
      pointer.sx = p.sx;
      pointer.sy = p.sy;
      if (!g) return;
      const t = seconds();
      if (t - lastRipple > 0.14 && Math.hypot(g.x - lastRippleX, g.z - lastRippleZ) > 0.35) {
        ripples.push({ x: g.x, z: g.z, t0: t, amp: 0.05 });
        lastRipple = t;
        lastRippleX = g.x;
        lastRippleZ = g.z;
      }
    };
    const onDown = (e: PointerEvent) => {
      const p = localPoint(e);
      const g = p.inside ? toGround(p.sx, p.sy) : null;
      if (g) ripples.push({ x: g.x, z: g.z, t0: seconds(), amp: 0.22 });
    };
    const onLeave = () => (pointer.active = false);

    if (!reduced) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    // Per-frame buffers, bucketed by colour and alpha so each bucket is one fill().
    const pt = { x: 0, y: 0, s: 0 };
    const buckets = {
      white: Array.from({ length: ALPHA_STEPS }, () => [] as number[]),
      amber: Array.from({ length: ALPHA_STEPS }, () => [] as number[]),
    };

    const draw = () => {
      const t = reduced ? 4 : seconds();
      const intro = reduced ? 1 : 1 - Math.pow(1 - Math.min(1, t / 2.4), 3);

      // Glide the lens toward the cursor and fade it in or out.
      const g = pointer.active ? toGround(pointer.sx, pointer.sy) : null;
      if (g) {
        lens.x += (g.x - lens.x) * 0.18;
        lens.z += (g.z - lens.z) * 0.18;
      }
      lens.k += ((g ? 1 : 0) - lens.k) * 0.08;

      while (ripples.length && t - ripples[0].t0 > 4) ripples.shift();

      // Fit the local trend: slope of the smooth wave along x at the lens.
      const base = wave(lens.x, lens.z, t) + rippleAt(lens.x, lens.z, t);
      const slope = (wave(lens.x + 0.3, lens.z, t) - wave(lens.x - 0.3, lens.z, t)) / 0.6;
      const trend = (x: number) => base + slope * (x - lens.x);

      ctx.clearRect(0, 0, width, height);
      for (const b of buckets.white) b.length = 0;
      for (const b of buckets.amber) b.length = 0;

      for (let i = 0; i < n; i++) {
        const x = gx[i];
        const z = gz[i];
        const smooth = wave(x, z, t) + rippleAt(x, z, t);
        let y = (smooth + jitter[i]) * intro;
        let w = 0;
        if (lens.k > 0.01) {
          const d = Math.hypot(x - lens.x, (z - lens.z) * 0.8);
          if (d < LENS_R) {
            const u = 1 - d / LENS_R;
            w = u * u * (3 - 2 * u) * lens.k;
            y = y + (trend(x) * intro - y) * w;
          }
        }
        project(x, y, z, pt);
        if (pt.x < -4 || pt.x > width + 4 || pt.y < -4 || pt.y > height + 4) continue;

        // Fade toward the horizon, the side edges and the bottom.
        const depth = (z - Z_NEAR) / (Z_FAR - Z_NEAR);
        const edge = 1 - Math.pow(Math.abs(x) / X_HALF, 4);
        const bottom = Math.min(1, (height - pt.y) / (height * 0.22));
        const alpha = Math.max(0, (1 - depth) * edge * bottom) * (0.42 + 0.58 * w) * intro;
        if (alpha < 0.04) continue;

        const size = Math.max(1.1, pt.s * (small ? 5 : 6.5)) * (1 + w * 0.6);
        const bucket = Math.min(ALPHA_STEPS - 1, Math.floor(alpha * ALPHA_STEPS));
        (w > 0.35 ? buckets.amber : buckets.white)[bucket].push(pt.x - size / 2, pt.y - size / 2, size);
      }

      for (const [name, rgb] of [["white", WHITE], ["amber", AMBER]] as const) {
        buckets[name].forEach((list, step) => {
          if (!list.length) return;
          ctx.fillStyle = `rgba(${rgb}, ${(step + 1) / ALPHA_STEPS})`;
          ctx.beginPath();
          for (let j = 0; j < list.length; j += 3) ctx.rect(list[j], list[j + 1], list[j + 2], list[j + 2]);
          ctx.fill();
        });
      }
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw();
    });
    ro.observe(canvas);

    let frame = 0;
    let running = false;
    const loop = () => {
      draw();
      frame = requestAnimationFrame(loop);
    };
    const play = () => {
      if (running || reduced) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(frame);
    };
    if (reduced) draw();

    // Only animate while the hero is on screen and the tab is visible.
    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && !document.hidden) play();
      else pause();
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden || !onScreen ? pause() : play());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      pause();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="signal-terrain" aria-hidden="true" />;
}
