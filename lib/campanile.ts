/**
 * The Campanile (Sather Tower) at dusk, as dithered pixel art for the Education card.
 * Fiat Lux, "let there be light": `lit` (0–1) lights the bell chamber gold, warms the sky
 * around it, and switches on the lights across the Berkeley hills.
 */

import { bayerAt } from "./dither";

type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function hash(x: number, y: number, seed = 0) {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

function vnoise(x: number, scale: number, seed = 0) {
  const f = x / scale;
  const i = Math.floor(f);
  const t = f - i;
  const s = t * t * (3 - 2 * t);
  const a = hash(i, 0, seed);
  const b = hash(i + 1, 0, seed);
  return a + (b - a) * s;
}

function pal(p: RGB[], v: number, x: number, y: number): RGB {
  const f = clamp(v) * (p.length - 1);
  let i = Math.floor(f);
  if (f - i > bayerAt(x, y)) i++;
  return p[Math.min(i, p.length - 1)];
}

/** Dusk, top to horizon: the site's night navy down through plum to a sunset glow. */
const SKY = ["#090d24", "#121a40", "#1b2658", "#2f2a5a", "#4a2240", "#a8402c", "#ff8b3d"].map(hex);
const STONE = ["#1c1f3d", "#2d2f52", "#474666", "#6e6680", "#b39478", "#ffc38f"].map(hex);
const HILL = hex("#141a3d");
const HILL_NEAR = hex("#0e1331");
const GROUND = hex("#0a0e26");
const TREE = hex("#0c1230");
const STAR = hex("#c8cfe8");
const STAR_BRIGHT = hex("#f2ede4");
const GOLD = hex("#fdb515"); // California Gold
const GOLD_PALE = hex("#ffe08a");
const ARCH_DARK = hex("#120f26");
const CLOCK = hex("#f2ede4");
const HANDS = hex("#1c1f3d");

export function paintCampanile(data: Uint8ClampedArray, w: number, h: number, lit: number, t: number) {
  const groundY = h - 6;
  const cx = Math.floor(w * 0.5);
  const top = Math.max(3, Math.round(h * 0.06)); // the finial's tip
  const spireBase = top + 10;
  const bellTop = spireBase + 1;
  const bellBottom = bellTop + 8;
  const clockY = bellBottom + 5;
  const hw = 4; // shaft half-width, cells

  const ridge = (x: number) => groundY - 7 - vnoise(x, 16, 3) * 7 - Math.sin(x * 0.06) * 2;
  const near = (x: number) => groundY - 2 - vnoise(x, 7, 5) * 3;

  const set = (x: number, y: number, c: RGB) => {
    const i = (y * w + x) * 4;
    data[i] = c[0];
    data[i + 1] = c[1];
    data[i + 2] = c[2];
    data[i + 3] = 255;
  };

  const tower = (x: number, y: number): RGB | null => {
    const dx = x - cx;
    // Finial and spire: a narrow pyramid on top.
    if (y >= top && y < top + 3 && dx === 0) return pal(STONE, 0.55, x, y);
    if (y >= top + 3 && y <= spireBase) {
      const half = ((y - top - 3) / (spireBase - top - 3)) * (hw + 1);
      if (Math.abs(dx) <= half) return pal(STONE, dx > 0 ? 0.62 : 0.3, x, y);
      return null;
    }
    // Cornices above and below the bell chamber: a step wider than the shaft.
    if ((y === bellTop || y === bellBottom + 1) && Math.abs(dx) <= hw + 1) return pal(STONE, 0.7, x, y);
    // Bell chamber: two tall arched openings, glowing gold when lit.
    if (y > bellTop && y <= bellBottom && Math.abs(dx) <= hw) {
      const inArch = (Math.abs(dx) === 2 || Math.abs(dx) === 3) && y > bellTop + 1 && !(y === bellTop + 2 && Math.abs(dx) === 3);
      if (inArch) {
        if (lit <= 0) return ARCH_DARK;
        const glow = lit * (0.75 + 0.25 * Math.sin(t / 240 + y));
        return glow > bayerAt(x, y) ? (glow > 0.8 && bayerAt(x + 3, y) < 0.5 ? GOLD_PALE : GOLD) : ARCH_DARK;
      }
      return pal(STONE, dx > 1 ? 0.6 : 0.32, x, y);
    }
    // Shaft, with a clock face and recessed pilasters; a wider plinth at the base.
    const shaftTop = bellBottom + 2;
    if (y >= shaftTop && y <= groundY) {
      const plinth = y >= groundY - 3;
      const half = plinth ? hw + 2 : hw;
      if (Math.abs(dx) > half) return null;
      const cd = Math.hypot(dx, (y - clockY) * 1.1);
      if (cd < 2.4) return cd < 0.8 || (dx === 0 && y < clockY && y > clockY - 2) || (y === clockY && dx === 1) ? HANDS : CLOCK;
      if (!plinth && Math.abs(dx) === 2 && y > clockY + 3 && y < groundY - 4) return pal(STONE, 0.15, x, y);
      // Lit from the sunset on the right; the left face in shadow.
      return pal(STONE, (dx >= 3 ? 0.68 : dx > 0 ? 0.48 : 0.28) + hash(x, y, 9) * 0.08, x, y);
    }
    return null;
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const tc = tower(x, y);
      if (tc) {
        set(x, y, tc);
        continue;
      }
      if (y >= groundY) {
        set(x, y, GROUND);
        continue;
      }
      // Trees around the tower's foot.
      const tree = [-11, -8, 8, 12].some((o, i) => Math.hypot(x - (cx + o), (y - (groundY - 1)) * 1.2) < 3.5 + (i % 2));
      if (tree) {
        set(x, y, TREE);
        continue;
      }
      if (y >= near(x)) {
        set(x, y, HILL_NEAR);
        continue;
      }
      if (y >= ridge(x)) {
        // Lights in the hills: off at dusk, on with Fiat Lux.
        const light = hash(x, y, 4);
        if (light > 0.93 && y > ridge(x) + 1) {
          const on = lit > (light - 0.93) / 0.07;
          set(x, y, on ? (light > 0.97 ? GOLD_PALE : GOLD) : HILL);
          continue;
        }
        set(x, y, HILL);
        continue;
      }
      // Sky: dusk gradient, brighter toward the right where the sun went down.
      const v = Math.pow(y / groundY, 1.7) * 0.92 + (x / w) * 0.12;
      let c = pal(SKY, v, x, y);
      // Gold light spilling from the bell chamber.
      if (lit > 0) {
        const d = Math.hypot(x - cx, (y - (bellTop + 4)) * 1.2);
        const g = lit * clamp(1 - d / 16) * 0.55;
        if (g > bayerAt(x, y)) c = mix(c, GOLD, 0.55);
      }
      // Stars in the upper sky, twinkling.
      const s = hash(x, y, 1);
      if (y < groundY * 0.5 && s > 0.985) c = Math.sin(t / 500 + s * 400) > 0.3 ? STAR_BRIGHT : STAR;
      set(x, y, c);
    }
  }
}
