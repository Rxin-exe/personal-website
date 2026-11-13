/**
 * The dither wipe: the transition into a write-up or case study. Pixels of night spread
 * out from where you clicked, with a sunset-orange edge, then dissolve away in Bayer order
 * to show what opened. The overlay lives outside React, so it survives a page navigation.
 */

import { bayerAt } from "./dither";
import { sound } from "./sound";

const CELL = 3;
const INK: [number, number, number] = [8, 11, 30];
const RIM: [number, number, number] = [255, 139, 61];
const COVER_MS = 340;
const REVEAL_MS = 420;

type Wipe = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; w: number; h: number; safety: ReturnType<typeof setTimeout> };
let active: Wipe | null = null;

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function frame(w: number, h: number, paint: (x: number, y: number) => 0 | 1 | 2) {
  const img = new ImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = paint(x, y);
      if (!v) continue;
      const c = v === 2 ? RIM : INK;
      const i = (y * w + x) * 4;
      d[i] = c[0];
      d[i + 1] = c[1];
      d[i + 2] = c[2];
      d[i + 3] = 255;
    }
  }
  return img;
}

function animate(ms: number, step: (t: number) => void) {
  return new Promise<void>((resolve) => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      step(t);
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

/** Covers the screen from a point (client px). Resolves once fully covered. */
export async function coverWipe(originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
  if (reduced()) return;
  if (active) revealWipe(true);
  sound.wipe();
  const canvas = document.createElement("canvas");
  canvas.className = "wipe";
  canvas.setAttribute("aria-hidden", "true");
  const w = Math.ceil(window.innerWidth / CELL);
  const h = Math.ceil(window.innerHeight / CELL);
  canvas.width = w;
  canvas.height = h;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  // If nothing ever calls reveal, don't leave the screen covered.
  const safety = setTimeout(() => revealWipe(), 3000);
  active = { canvas, ctx, w, h, safety };

  const ox = originX / CELL;
  const oy = originY / CELL;
  const maxR = Math.max(Math.hypot(ox, oy), Math.hypot(w - ox, oy), Math.hypot(ox, h - oy), Math.hypot(w - ox, h - oy));
  await animate(COVER_MS, (t) => {
    const e = 1 - Math.pow(1 - t, 2);
    const front = e * 1.3;
    ctx.putImageData(
      frame(w, h, (x, y) => {
        const r = Math.hypot(x - ox, y - oy) / maxR + (bayerAt(x, y) - 0.5) * 0.18;
        return r < front - 0.07 ? 1 : r < front ? 2 : 0;
      }),
      0,
      0
    );
  });
}

/** Dissolves the cover away. Safe to call when nothing is covering. */
export function revealWipe(instant = false) {
  const wipe = active;
  if (!wipe) return;
  active = null;
  clearTimeout(wipe.safety);
  const done = () => wipe.canvas.remove();
  if (instant) return done();
  const { ctx, w, h } = wipe;
  animate(REVEAL_MS, (t) => {
    ctx.putImageData(frame(w, h, (x, y) => (bayerAt(x, y) >= t ? 1 : 0)), 0, 0);
  }).then(done);
}
