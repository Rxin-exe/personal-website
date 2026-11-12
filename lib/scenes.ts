/**
 * Every dithered scene on the page. Each one has a `paint` step (smooth colour, before
 * dithering) and an optional `post` step (crisp pixel-art sprites drawn after it).
 *
 *   summit – the hero: a climber on a peak at sunset (paint lives in ./dither)
 *   camp   – the bottom of the page: the same climber at camp, after dark
 */

import { PALETTE, paintClimber, paintHorizon, skyWindows, sunAt } from "./dither";

type RGB = [number, number, number];
type Buf = Uint8ClampedArray;

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

const C = {
  ink: hex("#080b1e"),
  night: hex("#090d24"),
  navy: hex("#1b2658"),
  blue: hex("#33468a"),
  periwinkle: hex("#6478b8"),
  mist: hex("#aeb9e0"),
  cream: hex("#f2ede4"),
  plum: hex("#4a2240"),
  rust: hex("#a8402c"),
  orange: hex("#ff8b3d"),
  peach: hex("#ffc38f"),
  ground: hex("#0a0e26"),
  slate: hex("#4d5269"),
  graphite: hex("#23253a"),
};

const set = (data: Buf, width: number, x: number, y: number, c: RGB) => {
  const i = (y * width + x) * 4;
  data[i] = c[0];
  data[i + 1] = c[1];
  data[i + 2] = c[2];
  data[i + 3] = 255;
};

/** Draws a sprite: each character maps to a colour; "." is transparent. */
function sprite(data: Buf, width: number, height: number, rows: string[], left: number, top: number, colours: Record<string, RGB>, scale = 1) {
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const col = colours[rows[r][c]];
      if (!col) continue;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const x = left + c * scale + dx;
          const y = top + r * scale + dy;
          if (x < 0 || y < 0 || x >= width || y >= height) continue;
          set(data, width, x, y, col);
        }
      }
    }
  }
}

// ---------- the real moon ----------

/** Tonight's moon: phase 0 = new, 0.5 = full. Mean synodic month from a known new moon. */
export function moonPhase(date = new Date()) {
  const SYNODIC = 29.530588853;
  const NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // 6 Jan 2000, 18:14 UTC
  const days = (date.getTime() - NEW_MOON) / 86400000;
  const p = (((days / SYNODIC) % 1) + 1) % 1;
  const names = ["new moon", "waxing crescent", "first quarter", "waxing gibbous", "full moon", "waning gibbous", "last quarter", "waning crescent"];
  return { p, name: names[Math.round(p * 8) % 8], lit: (1 - Math.cos(2 * Math.PI * p)) / 2 };
}

// ---------- camp: the bottom of the page ----------

function campLayout(width: number, height: number) {
  const narrow = width < height * 1.2;
  const groundY = (x: number) => height * 0.78 - height * 0.035 * Math.sin(x * 0.012 + 0.6);
  const farRidge = (x: number) =>
    height * 0.6 - height * (0.07 * Math.sin(x * 0.018 + 0.4) + 0.035 * Math.sin(x * 0.051 + 2) + 0.015 * Math.sin(x * 0.13));
  // Sprite scale: 2× on wide screens so the camp reads at a glance, 1× on phones so it fits.
  const S = narrow ? 1 : 2;
  const fireX = Math.round(width * (narrow ? 0.42 : 0.62));
  const tentX = fireX - 23 * S;
  const moon = { x: width * (narrow ? 0.8 : 0.84), y: height * 0.26, r: Math.max(5, Math.min(width, height) * 0.06) };
  // Burden of Dreams (V17 / 9A, Lappnor, Finland): a 4 m granite face that overhangs at a
  // steady 45°, climbed on small, sharp crimps. Outline in boulder units (k cells each) around
  // the base centre; the face runs straight from FACE_BASE up to the lip at 45°.
  const k = S;
  const bx = fireX + 40 * S;
  const by = Math.round(groundY(bx)) + 1;
  const FACE_BASE = -6;
  const HEIGHT = 26;
  const outline: [number, number][] = [
    [FACE_BASE - HEIGHT, -HEIGHT], // the lip
    [FACE_BASE - HEIGHT + 2, -HEIGHT - 4],
    [-18, -33],
    [-2, -33],
    [10, -30],
    [17, -22],
    [19, -10],
    [18, 0],
    [FACE_BASE, 0],
  ];
  const boulder = outline.map(([x, y]) => [bx + x * k, by + y * k] as [number, number]);
  const face = { x: Math.round(bx + FACE_BASE * k), y: by, length: HEIGHT * k };
  // Lappnor is pine forest: a few on the skyline, kept clear of the camp.
  const pines = (narrow ? [0.08, 0.92] : [0.06, 0.14, 0.3, 0.95]).map((f) => Math.round(width * f));
  return { groundY, farRidge, fireX, fireY: Math.round(groundY(fireX)), tentX, moon, S, k, bx, by, boulder, face, pines };
}

/** Even-odd point-in-polygon. */
function inside(poly: [number, number][], x: number, y: number) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function paintCamp(data: Buf, width: number, height: number) {
  const L = campLayout(width, height);
  const moon = moonPhase();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Sky: the page's night colour at the top, a moonlit navy toward the horizon.
      let c = mix(C.night, C.navy, Math.pow(y / height, 2) * 1.1);
      // Moon and its halo.
      // The moon, in tonight's real phase. The unlit part keeps a faint earthshine.
      const md = Math.hypot(x - L.moon.x, y - L.moon.y) / L.moon.r;
      if (md < 1) {
        const u = (x - L.moon.x) / L.moon.r;
        const v = (y - L.moon.y) / L.moon.r;
        const edge = Math.cos(2 * Math.PI * moon.p) * Math.sqrt(Math.max(0, 1 - v * v));
        const lit = moon.p < 0.5 ? u > edge : u < -edge;
        c = lit ? mix(C.mist, C.cream, 1 - md) : mix(C.graphite, C.navy, 0.6);
      } else c = mix(c, C.periwinkle, Math.exp(-(md - 1) / 1.4) * 0.45 * (0.25 + 0.75 * moon.lit));
      // Fire glow in the air.
      const fd = Math.hypot((x - L.fireX) / height, (y - L.fireY) / height);
      c = mix(c, C.rust, Math.exp(-fd / 0.08) * 0.65);

      // Far ridge, lit blue by the moon.
      if (y >= L.farRidge(x)) {
        const depth = (y - L.farRidge(x)) / height;
        c = mix(mix(C.navy, C.blue, 0.45), C.night, Math.min(1, depth / 0.16));
        c = mix(c, C.periwinkle, Math.exp(-(y - L.farRidge(x)) / 1.2) * 0.5);
      }
      // Near ground, warmed around the fire.
      if (y >= L.groundY(x)) {
        c = mix(C.ground, C.ink, Math.min(1, (y - L.groundY(x)) / (height * 0.2)));
        c = mix(c, C.orange, Math.exp(-fd / 0.05) * 0.7);
        c = mix(c, C.plum, Math.exp(-fd / 0.14) * 0.5);
      }
      // The boulder: speckled granite, moonlit on top and on its back, the 45° face firelit.
      if (inside(L.boulder, x + 0.5, y + 0.5)) {
        const u = (x - L.bx) / L.k; // boulder units, 0 at the base centre
        const grain = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const speck = grain - Math.floor(grain);
        c = mix(C.graphite, C.slate, 0.55);
        c = mix(c, speck > 0.92 ? C.mist : C.night, speck > 0.92 ? 0.35 : 0.12 * speck);
        if (u > 6) c = mix(c, C.periwinkle, Math.min(0.3, (u - 6) / 30));
        if (!inside(L.boulder, x + 0.5, y - 2.5 * L.k)) c = mix(c, C.mist, 0.45);
        // Distance in from the overhanging face: the first few cells catch the fire.
        const fromFace = (x - L.face.x) - (y - L.face.y);
        const nearFace = fromFace < 6 * L.k;
        c = mix(c, C.rust, Math.min(1, Math.exp(-fd / 0.16) * (nearFace ? 1.1 : 0.3)));
        c = mix(c, C.orange, Math.exp(-fd / 0.08) * (nearFace ? 0.4 : 0.1));
        c = mix(c, C.ink, Math.max(0, 1 - (L.by - y) / (4 * L.k)) * 0.5);
      }
      set(data, width, x, y, c);
    }
  }
}

const TENT = [
  ".......#.......",
  "......###......",
  ".....##o##.....",
  "....##ooo##....",
  "...###ooo###...",
  "..####oppo###..",
  ".#####oppo####.",
  "######pppo#####",
];

// The climber again, on Burden of Dreams: compressed under the 45° face, hands on crimps
// high on it, feet pressed into it lower down, body hanging below. In this sprite the face
// runs along y = x - 2 (rock above and to the right). Lit from the fire.
const CRIMPING_HD = rim([
  "..##....................",
  "..##....................",
  ".h##....................",
  "hh##....................",
  "hh##....................",
  "hh##...##...............",
  "hh##..###...............",
  "..##..##................",
  "..######................",
  "..#####.................",
  "..#####.................",
  "...######...............",
  "....######..............",
  ".....#######............",
  ".......######...........",
  "........#######.###.....",
  ".........##########.....",
  "...........######.......",
  ".............####.......",
  "..............#########.",
  "................#######.",
]);

/** Half-size version for narrow screens (its face runs along y = x - 1). */
const CRIMPING = halve(CRIMPING_HD);

function halve(rows: string[]) {
  const out: string[] = [];
  for (let r = 0; r < rows.length; r += 2) {
    let line = "";
    for (let c = 0; c < rows[0].length; c += 2) {
      const block = [rows[r][c], rows[r][c + 1], rows[r + 1]?.[c], rows[r + 1]?.[c + 1]];
      line += block.includes("h") ? "h" : block.some((ch) => ch && ch !== ".") ? "#" : ".";
    }
    out.push(line);
  }
  return rim(out.map((l) => l.replace(/o/g, "#")));
}

// For the 404 page: they came off. Lying on their back on a crash pad, knees up.
const FALLEN_HD = rim([
  "..............##..##....",
  "............####.####...",
  "hhh.......####..#..###..",
  "hhh###########......###.",
  "hhh###################..",
]);
const FALLEN = halve(FALLEN_HD);

// A second climber at the foot of the wall, watching: facing the boulder, head tipped up,
// one arm raised to spot. Firelit like the first.
const SPOTTER_HD = rim([
  "...##....",
  "..hhhh...",
  "..hhhh.#.",
  "...hh.#..",
  "..#####..",
  ".######..",
  ".#####...",
  ".#####...",
  ".#####...",
  "..####...",
  "..##.##..",
  "..##..##.",
  "..##..##.",
  "..##..##.",
  "..##..##.",
  ".###..###",
]);
const SPOTTER = halve(SPOTTER_HD);

// Click to send: the climber tops out (arms up), then sits on top. The spotter cheers.
const TOPPED_HD = rim([
  "##.......##",
  "##.......##",
  "###.....###",
  ".##.hhh.##.",
  ".###hhh###.",
  "..##hhh##..",
  "..#######..",
  "...#####...",
  "...#####...",
  "....####...",
  "....####...",
  ".....###...",
  "....####...",
  "....####...",
  "...######..",
  "..###..###.",
  "..##....##.",
]);
const TOPPED = halve(TOPPED_HD);

const SITTING_HD = rim([
  "......hhh...",
  "......hhh...",
  "......hhh...",
  "......###...",
  "......####..",
  ".....######.",
  "....#######.",
  "...#########",
  "...##..#####",
  "..########..",
  "..########..",
  ".########...",
]);
const SITTING = halve(SITTING_HD);

const CHEER_HD = rim([
  ".##....##",
  ".##....##",
  ".##hhh.##",
  ".##hhh###",
  "..#hhh##.",
  "..######.",
  "..######.",
  "..######.",
  "...####..",
  "...####..",
  "....###..",
  "...####..",
  "...####..",
  "..######.",
  "..##..##.",
  "..##..##.",
]);
const CHEER = halve(CHEER_HD);

/** What's happening at camp: set by clicks, read when drawing. Lives for this page visit. */
const camp = { sendAt: 0, sent: false, sparkAt: 0 };
const SEND_MS = 2600;
const SPARK_MS = 1400;

const PINE = ["...#...", "..###..", ".#####.", "..###..", ".#####.", "#######", "..###..", "...#...", "...#..."];

/** Marks silhouette pixels on the left edge (toward the fire) as lit. */
function rim(rows: string[]) {
  return rows.map((row) => [...row].map((ch, c) => (ch === "#" && row[c - 1] !== "#" ? "o" : ch)).join(""));
}

const FIRE = [
  ["..p..", ".pop.", ".ooo.", "ooroo", ".rrr."],
  [".p...", "..pp.", ".oop.", "orooo", ".rrr."],
  ["...p.", ".pp..", ".poo.", "oooro", ".rrr."],
];

function campSprites(data: Buf, width: number, height: number, frame: number, fallen = false) {
  const L = campLayout(width, height);
  // The darkest sky pixels are see-through: the page's starfield shows through them.
  const [ir, ig, ib] = PALETTE[0];
  for (let x = 0; x < width; x++) {
    const top = L.farRidge(x);
    for (let y = 0; y < top; y++) {
      const i = (y * width + x) * 4;
      if (data[i] === ir && data[i + 1] === ig && data[i + 2] === ib) data[i + 3] = 0;
    }
  }
  const tentBase = Math.round(L.groundY(L.tentX));
  const S = L.S;
  sprite(data, width, height, TENT, L.tentX - 7 * S, tentBase - TENT.length * S, { "#": C.blue, o: C.rust, p: C.peach }, S);
  const now = performance.now();
  // Send progress: 0 before, 0–1 during, 1 after.
  const send = camp.sent ? 1 : camp.sendAt ? Math.min(1, (now - camp.sendAt) / SEND_MS) : 0;
  if (camp.sendAt && send >= 1) {
    camp.sent = true;
    camp.sendAt = 0;
  }
  const toppedOut = send >= 0.6 && send < 1;
  const sparking = camp.sparkAt ? (now - camp.sparkAt) / SPARK_MS : toppedOut ? (send - 0.6) / 0.4 : 1;
  if (camp.sparkAt && sparking >= 1) camp.sparkAt = 0;

  // The fire: bigger while it's been stoked (or while celebrating), with sparks rising.
  const flare = sparking < 1;
  const fs = flare ? S + 1 : S;
  sprite(data, width, height, FIRE[frame % FIRE.length], L.fireX - Math.round(2.5 * fs) + Math.round(S / 2), L.fireY - 5 * fs, { p: C.peach, o: C.orange, r: C.rust }, fs);
  if (flare) {
    for (let i = 0; i < 12; i++) {
      const life = sparking * (1.1 + (i % 3) * 0.25);
      if (life >= 1) continue;
      const x = Math.round(L.fireX + Math.sin(i * 7.13 + life * 4) * (2 + i) * S * 0.6);
      const y = Math.round(L.fireY - 6 * S - life * (18 + (i % 5) * 6) * S);
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      set(data, width, x, y, life < 0.4 ? C.peach : life < 0.75 ? C.orange : C.rust);
    }
  }
  // Jeffrey pines on the skyline, dark against the moonlit ridge.
  for (const px of L.pines) {
    const base = Math.round(L.groundY(px));
    sprite(data, width, height, PINE, px - 3 * S, base - PINE.length * S * 2, { "#": C.night }, S * 2);
  }
  // The climber, hands two-thirds of the way up the face. Each sprite's face line
  // (y = x - offset) is lined up with the boulder's 45° face.
  // The spotter stands between the fire and the wall, clear of the climber above.
  const spotter = toppedOut ? (S === 2 ? CHEER_HD : CHEER) : S === 2 ? SPOTTER_HD : SPOTTER;
  const sx = L.fireX + 11 * S;
  sprite(data, width, height, spotter, sx, Math.round(L.groundY(sx + 4)) - spotter.length, { "#": C.rust, o: C.orange, h: C.peach });

  if (fallen) {
    // A crash pad at the foot of the overhang, and the climber flat on it.
    const padW = 30 * S;
    const padX = L.face.x - Math.round(L.face.length * 0.55);
    const padY = Math.round(L.groundY(padX + padW / 2));
    for (let y = padY - 2 * S; y <= padY; y++) {
      for (let x = padX; x < padX + padW; x++) {
        const edge = y === padY - 2 * S || x === padX || x === padX + padW - 1;
        if (x >= 0 && x < width && y >= 0 && y < height) set(data, width, x, y, edge ? C.periwinkle : C.blue);
      }
    }
    const body = S === 2 ? FALLEN_HD : FALLEN;
    sprite(data, width, height, body, padX + 3 * S, padY - 2 * S - body.length, { "#": C.rust, o: C.orange, h: C.peach });
    return;
  }
  const lit = { "#": C.rust, o: C.orange, h: C.peach };
  const top = summitSpot(L);
  if (send >= 1) {
    // Already sent: sitting on top, legs over the lip.
    const rows = S === 2 ? SITTING_HD : SITTING;
    sprite(data, width, height, rows, top.sitX, top.sitY - rows.length, lit);
  } else if (toppedOut) {
    const rows = S === 2 ? TOPPED_HD : TOPPED;
    sprite(data, width, height, rows, top.x - Math.floor(rows[0].length / 2), top.y - rows.length, lit);
  } else {
    // On the face. While sending, they move up it toward the lip.
    const pose = S === 2 ? { rows: CRIMPING_HD, hand: 2, offset: 2 } : { rows: CRIMPING, hand: 1, offset: 1 };
    const climb = send > 0 ? 0.75 + 0.22 * (1 - Math.pow(1 - send / 0.6, 2)) : 0.75;
    const ox = L.face.x - Math.round(L.face.length * climb) - pose.hand;
    const oy = ox + pose.offset - L.face.x + L.face.y;
    // Lit by the fire (unlike the summit silhouette, there's no bright sky behind them here).
    sprite(data, width, height, pose.rows, ox, oy, lit);
  }
}

/** Where to stand (topping out) and sit (after) on top of the boulder, in cells. */
function summitSpot(L: ReturnType<typeof campLayout>) {
  return {
    x: Math.round(L.bx - 20 * L.k),
    y: Math.round(L.by - 33 * L.k),
    sitX: Math.round(L.bx - 31 * L.k),
    sitY: Math.round(L.by - 30 * L.k),
  };
}

type Hotspot = { id: string; label: string; x: number; y: number; w: number; h: number };

/** Clickable areas in the camp, in cells: the climber (send it) and the fire (stoke it). */
function campHotspots(width: number, height: number, fallen: boolean): Hotspot[] {
  const L = campLayout(width, height);
  const S = L.S;
  const spots: Hotspot[] = [
    { id: "fire", label: "Stoke the fire", x: L.fireX - 6 * S, y: L.fireY - 12 * S, w: 12 * S, h: 13 * S },
  ];
  if (!fallen) {
    if (camp.sent) {
      const t = summitSpot(L);
      spots.push({ id: "send", label: "They sent it", x: t.sitX - 2 * S, y: t.sitY - 8 * S, w: 10 * S, h: 9 * S });
    } else {
      const reach = Math.round(L.face.length * 0.75);
      spots.push({ id: "send", label: "Send Burden of Dreams", x: L.face.x - reach - 2 * S, y: L.face.y - reach - S, w: 14 * S, h: 13 * S });
    }
  }
  return spots;
}

/** Handles a click on a hotspot. Returns how long (ms) the scene should animate. */
function campAct(id: string, instant: boolean) {
  const now = performance.now();
  if (id === "fire") {
    camp.sparkAt = instant ? 0 : now;
    return instant ? 0 : SPARK_MS;
  }
  if (id === "send" && !camp.sent && !camp.sendAt) {
    if (instant) {
      camp.sent = true;
      return 0;
    }
    camp.sendAt = now;
    return SEND_MS;
  }
  return 0;
}

// ---------- rule: the horizon line under each section title ----------

function paintRule(data: Buf, width: number, height: number) {
  for (let y = 0; y < height; y++) {
    // Bottom row is the bright line; rows above are its glow.
    const glow = height > 1 ? 0.35 + 0.65 * (y / (height - 1)) : 1;
    for (let x = 0; x < width; x++) {
      const t = Math.pow(x / width, 0.7);
      let c = mix(C.peach, C.orange, Math.min(1, t * 6));
      c = mix(c, C.rust, Math.min(1, Math.max(0, t * 2.5 - 0.3)));
      c = mix(c, C.plum, Math.min(1, Math.max(0, t * 2 - 0.7)));
      c = mix(c, C.night, Math.min(1, Math.max(0, t * 1.6 - 0.6)));
      set(data, width, x, y, mix(C.night, c, glow));
    }
  }
}

// ---------- registry ----------

export type SceneId = "summit" | "camp" | "fallen" | "rule";

type Scene = {
  paint: (d: Buf, w: number, h: number) => void;
  post?: (d: Buf, w: number, h: number, frame: number) => void;
  frames?: number;
  spread?: number;
  /** Fraction of the height over which an edge dissolves, pixel by pixel, into what's behind. */
  dissolve?: { top?: number; bottom?: number };
  /** On a first visit, the scene dithers in outward from this point. */
  origin?: (w: number, h: number) => { x: number; y: number };
  /** Clickable areas (in cells), each a real button over the canvas. */
  hotspots?: (w: number, h: number) => Hotspot[];
  /** Responds to a hotspot click; returns how long the scene should animate (ms). */
  act?: (id: string, instant: boolean) => number;
  /** A brighter version the scene blends toward, around `at`, as the cursor approaches it. */
  hover?: { paint: (d: Buf, w: number, h: number) => void; post: (d: Buf, w: number, h: number) => void; at: (w: number, h: number) => { x: number; y: number } };
};

export const scenes: Record<SceneId, Scene> = {
  summit: {
    paint: paintHorizon,
    post: (d, w, h) => {
      skyWindows(d, w, h);
      paintClimber(d, w, h);
    },
    spread: 48,
    dissolve: { bottom: 0.2 },
    origin: sunAt,
    hover: {
      paint: (d, w, h) => paintHorizon(d, w, h, 1),
      post: (d, w, h) => {
        skyWindows(d, w, h);
        paintClimber(d, w, h, true);
      },
      at: sunAt,
    },
  },
  camp: {
    paint: paintCamp,
    post: campSprites,
    frames: FIRE.length,
    spread: 44,
    dissolve: { top: 0.3 },
    hotspots: (w, h) => campHotspots(w, h, false),
    act: campAct,
  },
  fallen: {
    paint: paintCamp,
    post: (d, w, h, f) => campSprites(d, w, h, f, true),
    frames: FIRE.length,
    spread: 44,
    dissolve: { top: 0.3 },
    hotspots: (w, h) => campHotspots(w, h, true),
    act: campAct,
  },
  rule: { paint: paintRule, spread: 64 },
};
