/**
 * Hover transformations for the Experience rows. Each role turns into its own pixel scene,
 * drawn on a canvas behind the text in the site's dither style:
 *
 *   ice     – Cal Hockey: frozen into a rink, skate marks, frost fractals growing off the edges
 *   rock    – Sendo: solidifies into granite from the ground up, with crimps and chalk
 *   laser   – Handshake: a red laser scans down, leaving a red pixel gradient behind it
 *   robot   – Outamation: printed in like a machine: circuit traces, gears, a document conveyor
 *   tennis  – S.L.I.C.E. Athletics: a court rolls in and a ball bounces across it
 *
 * The scene covers the row (the "body") plus a margin around it, so things can stick out.
 * Each scene says when each cell joins (`order`, 0–1) and what colour it is right now.
 */

import { bayerAt } from "./dither";

export type FxId = "ice" | "rock" | "laser" | "robot" | "tennis";
export type RGB = [number, number, number];

/** Cells around the row that scenes may draw into. */
export const FX_MARGIN = 10;

export type Scene = {
  w: number; // cells, including the margin
  h: number;
  m: number; // margin, cells
  ex: number; // where the cursor came in, cells
  ey: number;
};

export type Built = {
  /** The scene's darkest colour: behind text, the art fades toward it. */
  dark: RGB;
  /** When each cell joins the transformation, 0–1. Cells outside the row should be 0. */
  order: Float32Array;
  /** Painter for this moment: the colour of a cell, or null to leave it clear. */
  frame: (t: number, k: number) => (x: number, y: number, front: number) => RGB | null;
};

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

function hash(x: number, y: number, seed = 0) {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Smooth value noise, 0–1. */
function vnoise(x: number, y: number, scale: number, seed = 0) {
  const fx = x / scale;
  const fy = y / scale;
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const tx = fx - x0;
  const ty = fy - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const a = hash(x0, y0, seed);
  const b = hash(x0 + 1, y0, seed);
  const c = hash(x0, y0 + 1, seed);
  const d = hash(x0 + 1, y0 + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

function fbm(x: number, y: number, seed = 0) {
  return vnoise(x, y, 14, seed) * 0.6 + vnoise(x, y, 6, seed + 9) * 0.3 + vnoise(x, y, 2.5, seed + 17) * 0.1;
}

/** A palette step for value v, dithered between neighbours in Bayer order. */
function pal(p: RGB[], v: number, x: number, y: number): RGB {
  const f = clamp(v) * (p.length - 1);
  let i = Math.floor(f);
  if (f - i > bayerAt(x, y)) i++;
  return p[Math.min(i, p.length - 1)];
}

/** Inside the row, with the site's stepped pixel corners. */
function inBody(s: Scene, x: number, y: number) {
  const bx = x - s.m;
  const by = y - s.m;
  const bw = s.w - 2 * s.m;
  const bh = s.h - 2 * s.m;
  if (bx < 0 || by < 0 || bx >= bw || by >= bh) return false;
  return Math.min(bx, bw - 1 - bx) + Math.min(by, bh - 1 - by) >= 2;
}

function field(s: Scene, fn: (x: number, y: number) => number) {
  const a = new Float32Array(s.w * s.h);
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) a[y * s.w + x] = fn(x, y);
  return a;
}

// ---------- ice: Cal Hockey ----------

const ICE = ["#0b2038", "#10304f", "#164268", "#1f5884", "#3a80b4", "#8fd0f5", "#e8f8ff"].map(hex);
const FROST_TIP = hex("#ffffff");
const FROST = hex("#bfe9ff");

function ice(s: Scene): Built {
  const { w, h, m } = s;
  const bw = w - 2 * m;
  const bh = h - 2 * m;
  const noise = field(s, (x, y) => fbm(x, y, 3));

  // Skate marks: long, shallow curves across the rink.
  const scratch = new Uint8Array(w * h);
  for (let i = 0; i < 6; i++) {
    const y0 = m + bh * (0.15 + 0.7 * hash(i, 1, 5));
    const amp = 2 + hash(i, 2, 5) * 5;
    const f = 0.01 + hash(i, 3, 5) * 0.03;
    const ph = hash(i, 4, 5) * 6;
    const x0 = m + bw * hash(i, 5, 5) * 0.4;
    const x1 = x0 + bw * (0.35 + 0.5 * hash(i, 6, 5));
    for (let x = Math.floor(x0); x < Math.min(w - m, x1); x++) {
      const y = Math.round(y0 + Math.sin(x * f + ph) * amp);
      if (y >= m && y < h - m) scratch[y * w + x] = 1;
    }
  }

  // Frost fractals: branching crystals growing out from the row's edges into the margin.
  const frost = new Float32Array(w * h).fill(-1);
  const grow = (x: number, y: number, ang: number, len: number, depth: number, t0: number) => {
    for (let i = 0; i < len; i++) {
      const px = Math.round(x + Math.cos(ang) * i);
      const py = Math.round(y + Math.sin(ang) * i);
      if (px < 0 || py < 0 || px >= w || py >= h) return;
      const born = t0 + (i / len) * (1 - t0) * 0.6;
      const at = py * w + px;
      if (frost[at] < 0 || born < frost[at]) frost[at] = born;
      if (depth < 3 && i > 1 && i % 3 === 0) {
        const sub = len * 0.45 * (1 - i / len);
        if (sub >= 2) {
          grow(px, py, ang + 1.05, sub, depth + 1, born);
          grow(px, py, ang - 1.05, sub, depth + 1, born);
        }
      }
    }
  };
  let seed = 0;
  const edge = (x: number, y: number, out: number) => {
    seed++;
    const ang = out + (hash(seed, 1, 8) - 0.5) * 0.9;
    grow(x, y, ang, 5 + hash(seed, 2, 8) * (m + 3), 0, hash(seed, 3, 8) * 0.35);
    // A short spur back into the ice.
    grow(x, y, out + Math.PI + (hash(seed, 4, 8) - 0.5), 2 + hash(seed, 5, 8) * 4, 2, 0.2);
  };
  for (let x = m + 4; x < w - m - 4; x += 14 + Math.floor(hash(x, 9, 8) * 18)) {
    edge(x, m, -Math.PI / 2);
    edge(x + 7, h - m - 1, Math.PI / 2);
  }
  edge(m, m, (-3 * Math.PI) / 4);
  edge(w - m - 1, m, -Math.PI / 4);
  edge(m, h - m - 1, (3 * Math.PI) / 4);
  edge(w - m - 1, h - m - 1, Math.PI / 4);
  edge(m, m + bh / 2, Math.PI);
  edge(w - m - 1, m + bh / 2, 0);

  // It freezes outward from where the cursor came in.
  const maxD = Math.hypot(Math.max(s.ex, w - s.ex), Math.max(s.ey, h - s.ey));
  const order = field(s, (x, y) => (inBody(s, x, y) ? clamp(Math.hypot(x - s.ex, (y - s.ey) * 1.6) / maxD + (noise[y * w + x] - 0.5) * 0.15) : 0));

  return {
    dark: ICE[0],
    order,
    frame: (t) => {
      const g = clamp((t - 120) / 900);
      return (x, y, front) => {
        const at = y * w + x;
        const f = frost[at];
        if (f >= 0 && f <= g) return f > 0.55 ? FROST_TIP : FROST;
        if (!inBody(s, x, y)) return null;
        if (front < 0.04) return ICE[5];
        let v = 0.2 + (0.1 * (y - m)) / bh + 0.2 * noise[at];
        if (scratch[at]) v += 0.24;
        const glint = hash(x, y, 2);
        if (glint > 0.996 && Math.sin(t / 260 + glint * 900) > 0.6) return ICE[6];
        return pal(ICE, v, x, y);
      };
    },
  };
}

// ---------- rock: Sendo ----------

const ROCK = ["#16120f", "#221c18", "#2f2822", "#3e352d", "#51463c", "#6b5d50", "#8c7b6a"].map(hex);
const CHALK = hex("#ece6da");
const DUST = hex("#b8a894");

function rock(s: Scene): Built {
  const { w, h, m } = s;
  const bh = h - 2 * m;
  const n1 = field(s, (x, y) => fbm(x, y, 21));
  const n2 = field(s, (x, y) => vnoise(x, y, 9, 33));

  // Crimps: short ledges, lit on top, shadowed underneath, chalked.
  const ledge = new Int8Array(w * h);
  for (let i = 0; i < 9; i++) {
    const lx = Math.floor(m + (w - 2 * m) * hash(i, 1, 40));
    const ly = Math.floor(m + 3 + (bh - 6) * hash(i, 2, 40));
    const len = 4 + Math.floor(hash(i, 3, 40) * 8);
    for (let x = lx; x < Math.min(w - m, lx + len); x++) {
      ledge[ly * w + x] = 1;
      if (ly + 1 < h) ledge[(ly + 1) * w + x] = 2;
      for (let d = 1; d <= 2; d++) if (ly - d >= 0 && hash(x, ly - d, 41) > 0.55) ledge[(ly - d) * w + x] = 3;
    }
  }

  // It solidifies from the ground up, along a rough front.
  const order = field(s, (x, y) => (inBody(s, x, y) ? clamp((1 - (y - m) / bh) * 0.82 + n1[y * w + x] * 0.25 - 0.05) : 0));

  return {
    dark: ROCK[0],
    order,
    frame: () => (x, y, front) => {
      if (!inBody(s, x, y)) return null;
      const at = y * w + x;
      if (front < 0.035) return DUST;
      const l = ledge[at];
      if (l === 3) return CHALK;
      if (l === 1) return ROCK[6];
      if (l === 2) return ROCK[0];
      if (Math.abs(n2[at] - 0.5) < 0.014) return ROCK[0]; // cracks
      return pal(ROCK, 0.14 + 0.5 * n1[at], x, y);
    },
  };
}

// ---------- laser: Handshake ----------

const RED = ["#14040a", "#2a070f", "#430b15", "#5e1019", "#80161f", "#a81e26", "#d8352f"].map(hex);
const BEAM = hex("#fff1ec");
const GLOW = hex("#ff4a3d");

function laser(s: Scene): Built {
  const { w, h, m } = s;
  const bw = w - 2 * m;
  const bh = h - 2 * m;
  const noise = field(s, (x, y) => vnoise(x, y, 7, 51));
  // A clean top-to-bottom scan.
  const order = field(s, (x, y) => (inBody(s, x, y) ? clamp((y - m) / bh) : 0));

  return {
    dark: RED[0],
    order,
    frame: (t, k) => {
      const beamY = m + k * bh;
      const scanning = k < 1;
      // After the first pass, a faint scan band keeps sweeping down.
      const band = m + (((t - 700) / 2600) % 1) * bh * 1.3 - bh * 0.15;
      return (x, y, front) => {
        const body = inBody(s, x, y);
        if (scanning) {
          const d = Math.abs(y - beamY);
          // The beam runs past the row's edges.
          if (d < 0.8) return BEAM;
          if (d < 2.2 && (body || hash(x, y, 4) > 0.4)) return GLOW;
        }
        if (!body) return null;
        if (front < 0.05) return GLOW;
        let v = 0.2 + (0.42 * (x - m)) / bw + 0.08 * noise[y * w + x];
        if (y % 2) v -= 0.06; // scanlines
        if (t > 700 && Math.abs(y - band) < 1.5) v += 0.13;
        return pal(RED, v, x, y);
      };
    },
  };
}

// ---------- robot: Outamation ----------

const STEEL = ["#081115", "#0c1a20", "#12252d", "#1a333d", "#24444f"].map(hex);
const TRACE = hex("#2f6c75");
const PULSE = hex("#b6f4ff");
const LED_ON = hex("#ffb347");
const LED_OFF = hex("#4a3212");
const GEAR = ["#2e4148", "#4d6870", "#7e9ba3", "#a9c1c7"].map(hex);
const BELT = [hex("#1e2a2f"), hex("#33454c")];
const PAPER = hex("#e6edef");
const STAMP = hex("#ff8b3d");
const HEAD = hex("#5fd0e0");

function robot(s: Scene): Built {
  const { w, h, m } = s;
  const bw = w - 2 * m;
  const bh = h - 2 * m;

  // Circuit traces: horizontal runs with gaps, and a few vertical links.
  const trace = new Uint8Array(w * h);
  const rows: number[] = [];
  for (let y = m + 3; y < h - m - 6; y += 7) {
    rows.push(y);
    for (let x = m + 2; x < w - m - 2; x++) if (vnoise(x, y, 6, 61) > 0.32) trace[y * w + x] = 1;
  }
  for (let i = 0; i < 14; i++) {
    const x = Math.floor(m + 3 + (bw - 6) * hash(i, 1, 62));
    const r = Math.floor(hash(i, 2, 62) * Math.max(1, rows.length - 1));
    if (rows[r + 1] === undefined) continue;
    for (let y = rows[r]; y <= rows[r + 1]; y++) trace[y * w + x] = 1;
  }
  const leds = new Set<number>();
  for (let i = 0; i < 10; i++) leds.add(Math.floor(m + 2 + (bh - 8) * hash(i, 3, 62)) * w + Math.floor(m + 2 + (bw - 4) * hash(i, 4, 62)));

  // Two gears on the right-hand corners, half sticking out of the row.
  const gears = [
    { cx: w - m - 3, cy: h - m, r: 11, dir: 1 },
    { cx: w - m + 2, cy: m + 1, r: 7, dir: -1.6 },
  ];
  const beltTop = h - m - 4;

  // Printed in raster order, two rows at a time, like a machine laying it down.
  const order = field(s, (x, y) => (inBody(s, x, y) ? clamp(((Math.floor((y - m) / 2) * 2) / bh) * 0.85 + ((x - m) / bw) * 0.15) : 0));

  return {
    dark: STEEL[0],
    order,
    frame: (t, k) => {
      const spin = t * 0.0025;
      const beltShift = t * 0.03;
      return (x, y, front) => {
        // Gears go on top of everything, inside the row or not, once it's mostly built.
        if (k > 0.5) {
          for (const g of gears) {
            const dx = x - g.cx;
            const dy = y - g.cy;
            const d = Math.hypot(dx, dy);
            if (d > g.r) continue;
            const a = Math.atan2(dy, dx) - g.dir * spin;
            const tooth = Math.cos(a * 10) > 0.15;
            if (d < g.r * 0.28) break; // the axle hole
            if (d < g.r * 0.74 || tooth) {
              const lit = clamp(0.5 - dy / (g.r * 2) + (d > g.r * 0.6 ? 0.15 : 0));
              return pal(GEAR, lit, x, y);
            }
          }
        }
        if (!inBody(s, x, y)) return null;
        if (front < 0.03) return HEAD;
        const at = y * w + x;
        // The conveyor: documents ride a striped belt and get stamped past the 60% mark.
        if (y >= beltTop - 2 && y < beltTop) {
          for (let i = 0; i < 4; i++) {
            const dx0 = m + ((beltShift + i * (bw / 4)) % bw);
            if (x >= dx0 && x < dx0 + 5) return dx0 - m > bw * 0.6 && y === beltTop - 2 && x === Math.floor(dx0) + 2 ? STAMP : PAPER;
          }
        }
        if (y >= beltTop && y < beltTop + 3) return BELT[Math.floor((x + beltShift) / 3) % 2];
        if (leds.has(at)) return Math.sin(t / 220 + x * 3.1) > 0 ? LED_ON : LED_OFF;
        if (trace[at]) {
          // Data pulses running along the traces.
          const pulse = (t * 0.05 + y * 13) % (bw + 20);
          return Math.abs(x - m - pulse) < 2 ? PULSE : TRACE;
        }
        return pal(STEEL, 0.25 + 0.35 * vnoise(x, y, 12, 64), x, y);
      };
    },
  };
}

// ---------- tennis: S.L.I.C.E. Athletics ----------

const COURT = ["#0b2219", "#0f2e22", "#143a2b", "#1a4735", "#205440"].map(hex);
const LINE = hex("#e2ece0");
const LINE_DIM = hex("#4f7a5f"); // inner lines, where the text sits: there, but quiet
const NET_DARK = hex("#08140f");
const NET_LIGHT = hex("#5f7d68");
const BALL = hex("#d7f24a");
const BALL_LIT = hex("#f4ffb0");
const BALL_SHADE = hex("#9bbb2c");
const SHADOW = hex("#061510");

function tennis(s: Scene): Built {
  const { w, h, m } = s;
  const bw = w - 2 * m;
  const bh = h - 2 * m;
  const noise = field(s, (x, y) => vnoise(x, y, 10, 71));
  const L = 3;
  const R = bw - 4;
  const T = 2;
  const B = bh - 3;
  const mid = Math.floor(bw / 2);
  const s1 = Math.round(L + (R - L) * 0.23);
  const s2 = Math.round(R - (R - L) * 0.23);
  const cy = Math.round((T + B) / 2);

  /** 2 for the bright outer lines, 1 for the dim inner ones, 0 for court. */
  const isLine = (bx: number, by: number) => {
    const inX = bx >= L && bx <= R;
    const inY = by >= T && by <= B;
    if ((bx === L || bx === R) && inY) return 2; // baselines
    if ((by === T || by === B) && inX) return 2; // doubles sidelines
    if ((by === T + 3 || by === B - 3) && inX) return 1; // singles sidelines
    if ((bx === s1 || bx === s2) && by > T + 3 && by < B - 3) return 1; // service lines
    if (by === cy && bx > s1 && bx < s2) return 1; // centre service line
    return 0;
  };

  // The court rolls in from the left.
  const order = field(s, (x, y) => (inBody(s, x, y) ? clamp(((x - m) / bw) * 0.9 + noise[y * w + x] * 0.1) : 0));

  return {
    dark: COURT[0],
    order,
    frame: (t) => {
      // A ball bouncing across the court, three bounces a crossing, back and forth.
      const P = 1800;
      const leg = Math.floor(t / P) % 2;
      const p = (t % P) / P;
      const along = leg ? 1 - p : p;
      const ballX = m + L + along * (R - L);
      const ground = m + B - 5;
      const hop = Math.abs(Math.sin(p * Math.PI * 3));
      const ballY = ground - hop * bh * 0.5;
      const show = t > 500;
      return (x, y, front) => {
        if (!inBody(s, x, y)) return null;
        const bx = x - m;
        const by = y - m;
        if (front < 0.03) return LINE;
        if (show) {
          const d = Math.hypot(x - ballX, y - ballY);
          if (d < 2.4) return d < 1 && y < ballY ? BALL_LIT : x > ballX + 0.8 || y > ballY + 0.8 ? BALL_SHADE : BALL;
          // Its shadow on the court, smaller the higher it is.
          if (Math.abs(y - ground - 2.5) < 0.6 && Math.abs(x - ballX) < 2.5 - hop * 1.5) return SHADOW;
        }
        if (bx === mid || bx === mid + 1) return by >= T - 1 && by <= B + 1 ? ((by + bx) % 2 ? NET_DARK : NET_LIGHT) : pal(COURT, 0.4, x, y);
        const line = isLine(bx, by);
        if (line) return line === 2 ? LINE : LINE_DIM;
        return pal(COURT, 0.35 + 0.3 * noise[y * w + x], x, y);
      };
    },
  };
}

export const roleFx: Record<FxId, (s: Scene) => Built> = { ice, rock, laser, robot, tennis };
