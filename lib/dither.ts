import { daylight, summitSky } from "./daylight";

/**
 * Ordered (Bayer 8×8) dithering onto the site palette. Used by the hero horizon and
 * by every project image, so the whole site shares one set of colours.
 */

type RGB = [number, number, number];

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

/** Dark to light, then the warm accent family. */
export const PALETTE: RGB[] = [
  "#080b1e", // ink
  "#10163a", // night
  "#1e2a5c", // navy
  "#33468a", // blue
  "#6478b8", // periwinkle
  "#aeb9e0", // mist
  "#f2ede4", // cream
  "#23253a", // graphite (keeps dark UI screenshots neutral)
  "#4d5269", // slate
  "#4a2240", // plum
  "#a8402c", // rust
  "#ff8b3d", // orange (accent)
  "#ffc38f", // peach
].map(hex);

// Standard 8×8 Bayer matrix, values 0–63.
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33,
  9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];

/** Dithers RGBA pixels in place. `spread` is how far (0–255) the threshold pattern pushes each channel. */
export function dither(data: Uint8ClampedArray, width: number, height: number, spread = 56) {
  const cache = new Map<number, number>();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const t = ((BAYER[(y & 7) * 8 + (x & 7)] + 0.5) / 64 - 0.5) * spread;
      const r = clamp(data[i] + t);
      const g = clamp(data[i + 1] + t);
      const b = clamp(data[i + 2] + t);
      const key = ((r >> 2) << 12) | ((g >> 2) << 6) | (b >> 2);
      let best = cache.get(key);
      if (best === undefined) {
        best = nearest(r, g, b);
        cache.set(key, best);
      }
      const c = PALETTE[best];
      data[i] = c[0];
      data[i + 1] = c[1];
      data[i + 2] = c[2];
      data[i + 3] = 255;
    }
  }
}

function nearest(r: number, g: number, b: number) {
  let best = 0;
  let bestD = Infinity;
  for (let p = 0; p < PALETTE.length; p++) {
    const [pr, pg, pb] = PALETTE[p];
    // Weighted RGB distance: closer to how the eye judges colour difference.
    const rm = (r + pr) / 2;
    const dr = r - pr;
    const dg = g - pg;
    const db = b - pb;
    const d = (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

/** The Bayer threshold (0–1) at a pixel. Used to dissolve scene edges in the same pattern as the dither. */
export const bayerAt = (x: number, y: number) => (BAYER[(y & 7) * 8 + (x & 7)] + 0.5) / 64;

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v | 0);

/**
 * The hero scene's layout, in buffer pixels: where the horizon sits, where the sun sets,
 * and the ridge of the foreground mountain whose summit the climber stands on.
 */
function layout(width: number, height: number) {
  const horizon = (x: number) => height * (0.94 - 0.3 * (x / width));
  // On narrow (portrait) screens, push the mountain right so it stays out of the copy.
  const peakX = Math.round(width * (width < height ? 0.74 : 0.66));
  const peakY = Math.round(horizon(peakX) - height * 0.035);
  const sunX = width * (width < height ? 0.9 : 0.8);
  const sunY = horizon(sunX);
  const sunR = Math.max(6, Math.min(height, width * 1.6) * 0.05);
  const flat = 5; // a small flat summit for the climber to stand on
  const ridge = (x: number) => {
    const dx = Math.abs(x - peakX);
    if (dx <= flat) return peakY;
    const d = dx - flat;
    const slope = x < peakX ? 0.72 : 0.5;
    // Rocky ridgeline: layered noise that fades in away from the summit.
    const rock =
      (Math.sin(x * 0.21) * 2.2 + Math.sin(x * 0.53 + 1.3) * 1.2 + Math.sin(x * 1.37 + 0.4) * 0.6) * Math.min(1, d / 14);
    return peakY + d * slope + rock;
  };
  return { horizon, peakX, peakY, sunX, sunY, sunR, ridge };
}

/** Paints the hero's sunset, sun and mountain (before dithering) into an RGBA buffer. */
/** `boost` (0–1) is the cursor-near-the-sun version: a bigger, hotter sun and brighter rims. */
export function paintHorizon(data: Uint8ClampedArray, width: number, height: number, boost = 0) {
  const night = hex("#090d24");
  const navy = hex("#1b2658");
  const plum = hex("#55264a");
  const orange = hex("#ff8b3d");
  const peach = hex("#ffd2a3");
  const cream = hex("#f2ede4");
  const ground = hex("#0a0e26");
  const rock = hex("#141a40");
  const mist = hex("#aeb9e0");
  const periwinkle = hex("#6478b8");
  const slate = hex("#4d5269");
  const blueGround = hex("#33468a");
  const day = daylight.on;
  // Setting the sun: at dusk it's half under the horizon, at night it's gone.
  const mode = day ? "sunset" : summitSky.mode;
  const glow = mode === "dusk" ? 0.55 : mode === "night" ? 0.1 : 1;

  const L = layout(width, height);
  const sunY = L.sunY + (mode === "dusk" ? L.sunR * 0.9 : mode === "night" ? L.sunR * 6 : 0);
  const aspect = width / height;
  for (let y = 0; y < height; y++) {
    const v = y / height;
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const d = (y - L.horizon(x)) / height;
      const sun = Math.exp(-(((x - L.sunX) / width) ** 2) / 0.06);
      let c: RGB;
      if (day && d < 0) {
        // Daytime (Konami code): a clear blue sky, the sun up and bright.
        const up = -d;
        c = mix(mist, periwinkle, Math.min(1, up / 0.7));
        const sd = Math.hypot(x - L.sunX, y - (L.sunY - height * 0.35)) / (L.sunR * 1.3);
        if (sd < 1) c = mix(peach, cream, 1 - sd);
        else c = mix(c, cream, Math.exp(-(sd - 1) / 1.2) * 0.45);
      } else if (day) {
        c = mix(blueGround, navy, Math.min(1, d / 0.2));
      } else if (d < 0) {
        const up = -d; // distance above the horizon
        c = mix(night, navy, Math.exp(-up / 0.45) * 0.9 * (mode === "night" ? 0.5 : 1));
        c = mix(c, plum, Math.exp(-up / 0.16) * (0.55 + 0.45 * sun) * Math.max(glow, 0.35));
        c = mix(c, orange, Math.min(1, Math.exp(-up / (0.06 + 0.03 * boost)) * (0.35 + 0.65 * sun) * (1 + 0.4 * boost)) * glow);
        c = mix(c, peach, Math.exp(-up / 0.015) * sun * 0.9 * glow);
        // A soft diagonal light band across the sky, like a lens streak.
        const band = Math.exp(-((u * aspect - (1 - v) * 1.4 - 0.2 * aspect) ** 2) / 0.02);
        c = mix(c, navy, band * 0.25);
        // The sun: half a disc sitting on the horizon, with a glow around it.
        const sd = Math.hypot(x - L.sunX, y - sunY) / (L.sunR * (1 + 0.3 * boost));
        if (sd < 1) c = mix(peach, cream, 1 - sd);
        else c = mix(c, peach, Math.exp(-(sd - 1) / (0.6 + 0.9 * boost)) * (0.5 + 0.35 * boost) * glow);
      } else {
        // Below: dark ground lit by a thin rim of light along the horizon.
        c = mix(ground, orange, Math.exp(-d / 0.012) * (0.3 + 0.6 * sun) * glow);
        c = mix(c, navy, Math.exp(-d / 0.18) * 0.35);
      }

      // Foreground mountain, in front of everything.
      const r = L.ridge(x);
      if (y >= r && day) {
        // By day the mountain is blue-grey granite with a pale, sunlit ridge.
        const depth = y - r;
        c = mix(slate, navy, Math.min(1, depth / (height * 0.3)));
        c = mix(c, mist, Math.exp(-depth / 2.2) * 0.8);
      } else if (y >= r) {
        const depth = y - r;
        const sunSide = x > L.peakX ? 1 : 0.3;
        c = mix(ground, rock, Math.min(1, depth / (height * 0.25)) * 0.6);
        // The face toward the sun picks up a little warmth…
        c = mix(c, plum, Math.exp(-depth / (height * 0.12)) * 0.45 * sunSide);
        // …and the ridgeline catches a bright rim of light.
        c = mix(c, boost ? peach : orange, Math.min(1, Math.exp(-depth / (2.2 + 1.5 * boost)) * (0.25 + 0.75 * sunSide) * (1 + 0.3 * boost)) * glow);
        // After dark the ridge catches a little moonlight instead.
        if (mode === "night") c = mix(c, periwinkle, Math.exp(-depth / 2) * 0.35);
      }

      const i = (y * width + x) * 4;
      data[i] = c[0];
      data[i + 1] = c[1];
      data[i + 2] = c[2];
      data[i + 3] = 255;
    }
  }
}

/**
 * The climber on the summit, drawn as crisp pixel art after dithering: facing the sun,
 * saluting it, with a pack on their back. "#" is silhouette; edges facing the sun get a rim of light.
 */
const CLIMBER = [
  "..###.....",
  ".######...",
  ".####.#...",
  "..##...#..",
  ".#####.#..",
  "#######...",
  "######....",
  "######....",
  ".#####....",
  "..####....",
  "..##.##...",
  "..##..##..",
  "..##..##..",
  "..##...##.",
  "..##...##.",
  ".###...###",
];

/** Where the sun sits, in buffer pixels: the entrance reveals the scene outward from here. */
export function sunAt(width: number, height: number) {
  const L = layout(width, height);
  return { x: L.sunX, y: L.sunY };
}

/**
 * Makes the darkest sky pixels see-through, so the page's one starfield shows through
 * the dusk at the top of the hero. Everything at or below the horizon stays solid.
 */
export function skyWindows(data: Uint8ClampedArray, width: number, height: number) {
  const L = layout(width, height);
  const [r, g, b] = PALETTE[0];
  for (let x = 0; x < width; x++) {
    const top = Math.min(L.horizon(x), L.ridge(x)) - height * 0.08;
    for (let y = 0; y < top; y++) {
      const i = (y * width + x) * 4;
      if (data[i] === r && data[i + 1] === g && data[i + 2] === b) data[i + 3] = 0;
    }
  }
}

export function paintClimber(data: Uint8ClampedArray, width: number, height: number, bright = false) {
  const L = layout(width, height);
  const ink = hex("#080b1e");
  const rim = hex(summitSky.mode === "night" && !daylight.on ? "#6478b8" : bright ? "#ffc38f" : "#ff8b3d");
  const SPRITE = CLIMBER;
  const h = SPRITE.length;
  const w = SPRITE[0].length;
  const left = L.peakX - 3;
  const top = L.peakY - h;
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      if (SPRITE[row][col] !== "#") continue;
      const x = left + col;
      const y = top + row;
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      const lit = SPRITE[row][col + 1] !== "#" && row < h - 2;
      const c = lit ? rim : ink;
      const i = (y * width + x) * 4;
      data[i] = c[0];
      data[i + 1] = c[1];
      data[i + 2] = c[2];
    }
  }
}

const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
