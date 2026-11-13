/**
 * Every sound on the site, synthesised live with Web Audio: no files to load.
 *
 * Ambience (starts on the first click or key, as browsers require), heard only while the
 * camp at the bottom of the page is on screen, rising as more of it comes into view:
 *   wind      – soft gusts
 *   pad       – a slow, warm chord under everything
 *   crickets  – the night; swapped for birds while it's day (Konami code)
 *   campfire  – a bed of hiss and crackle
 *
 * Effects are short and quiet: ticks on hover, the sun's shimmer, stoking the fire,
 * the climber's effort on the send and the camp's applause when they top out.
 *
 * On by default, remembered per browser ("sound" in localStorage), toggled from the nav.
 */

type Nodes = {
  ctx: AudioContext;
  master: GainNode;
  sfx: GainNode;
  amb: GainNode;
  verb: GainNode;
  white: AudioBuffer;
  brown: AudioBuffer;
};

const KEY = "sound";
let A: Nodes | null = null;
let enabled = true;
let loaded = false;
let unlocked = false;
const listeners = new Set<(on: boolean) => void>();

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    enabled = localStorage.getItem(KEY) !== "off";
  } catch {
    // keep the default
  }
}

// ---------- engine ----------

function noiseBuffer(ctx: AudioContext, seconds: number, brown: boolean) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    } else d[i] = w;
  }
  return buf;
}

/** A soft outdoor reverb: decaying stereo noise. */
function impulse(ctx: AudioContext, seconds: number, decay: number) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function init(): Nodes | null {
  if (A) return A;
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.knee.value = 14;
  comp.ratio.value = 3;
  comp.attack.value = 0.004;
  comp.release.value = 0.25;
  comp.connect(ctx.destination);

  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(comp);
  const sfx = ctx.createGain();
  sfx.gain.value = 0.9;
  sfx.connect(master);
  const amb = ctx.createGain();
  amb.gain.value = 0;
  amb.connect(master);

  const conv = ctx.createConvolver();
  conv.buffer = impulse(ctx, 2.8, 3);
  const verb = ctx.createGain();
  verb.gain.value = 0.35;
  verb.connect(conv);
  conv.connect(master);

  A = { ctx, master, sfx, amb, verb, white: noiseBuffer(ctx, 4, false), brown: noiseBuffer(ctx, 4, true) };
  return A;
}

/** The engine, if a sound may play right now. */
function live(): Nodes | null {
  if (!enabled || !unlocked || !A || document.hidden) return null;
  return A;
}

function gainNode(ctx: AudioContext, value: number, dest: AudioNode | AudioParam) {
  const g = ctx.createGain();
  g.gain.value = value;
  if (dest instanceof AudioParam) g.connect(dest);
  else g.connect(dest);
  return g;
}

function panNode(ctx: AudioContext, pan: number, dest: AudioNode): AudioNode {
  if (!ctx.createStereoPanner || !pan) return dest;
  const p = ctx.createStereoPanner();
  p.pan.value = clamp(pan, -1, 1);
  p.connect(dest);
  return p;
}

/** Output for one effect: dry to the sfx bus plus a little reverb, optionally panned. */
function bus(a: Nodes, pan = 0, wet = 0.25) {
  const out = panNode(a.ctx, pan, a.sfx);
  if (wet > 0) {
    const send = gainNode(a.ctx, wet, a.verb);
    const g = a.ctx.createGain();
    g.connect(out);
    g.connect(send);
    return g;
  }
  return out;
}

/** Attack–decay envelope on a gain param (exponential, so it sounds natural). */
function env(p: AudioParam, t: number, peak: number, attack: number, decay: number) {
  p.cancelScheduledValues(t);
  p.setValueAtTime(0.0001, t);
  p.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
  p.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function tone(a: Nodes, o: { type?: OscillatorType; f: number; to?: number; t: number; peak: number; attack?: number; decay: number; dest: AudioNode }) {
  const osc = a.ctx.createOscillator();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.f, o.t);
  const attack = o.attack ?? 0.005;
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, o.t + attack + o.decay);
  const g = a.ctx.createGain();
  env(g.gain, o.t, o.peak, attack, o.decay);
  osc.connect(g).connect(o.dest);
  osc.start(o.t);
  osc.stop(o.t + attack + o.decay + 0.05);
}

function noise(
  a: Nodes,
  o: { t: number; peak: number; attack?: number; decay: number; type?: BiquadFilterType; f: number; to?: number; q?: number; dest: AudioNode; brown?: boolean }
) {
  const src = a.ctx.createBufferSource();
  src.buffer = o.brown ? a.brown : a.white;
  const f = a.ctx.createBiquadFilter();
  f.type = o.type ?? "bandpass";
  f.frequency.setValueAtTime(o.f, o.t);
  const attack = o.attack ?? 0.002;
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, o.t + attack + o.decay);
  f.Q.value = o.q ?? 1;
  const g = a.ctx.createGain();
  env(g.gain, o.t, o.peak, attack, o.decay);
  src.connect(f).connect(g).connect(o.dest);
  const offset = Math.random() * (src.buffer.duration - attack - o.decay - 0.1);
  src.start(o.t, Math.max(0, offset));
  src.stop(o.t + attack + o.decay + 0.05);
}

/** A struck bell: a few inharmonic partials decaying at different rates. */
function bell(a: Nodes, f: number, t: number, peak: number, dest: AudioNode, length = 1.6) {
  tone(a, { f, t, peak, attack: 0.004, decay: length, dest });
  tone(a, { f: f * 2.76, t, peak: peak * 0.35, attack: 0.002, decay: length * 0.45, dest });
  tone(a, { f: f * 5.4, t, peak: peak * 0.12, attack: 0.002, decay: length * 0.2, dest });
}

// ---------- voices (the climber and the spotter) ----------

const VOWEL = {
  uh: [620, 1200, 2550],
  ah: [760, 1150, 2600],
  hn: [330, 1500, 2500], // closed, nasal: the effort sound through the nose
  oo: [330, 820, 2300],
} as const;

/**
 * A short human vocalisation: a buzzy source with a pitch contour, shaped by three formant
 * filters, with breath noise on top. `strain` adds grit, for effort.
 */
function voice(
  a: Nodes,
  o: { t: number; dur: number; f0: [number, number, number]; vowel: readonly number[]; peak: number; breath?: number; strain?: number; dest: AudioNode }
) {
  const { ctx } = a;
  const { t, dur } = o;
  const end = t + dur;

  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(o.f0[0], t);
  osc.frequency.linearRampToValueAtTime(o.f0[1], t + dur * 0.3);
  osc.frequency.exponentialRampToValueAtTime(o.f0[2], end);
  // A little wobble, so it isn't a synth.
  const vib = ctx.createOscillator();
  vib.frequency.value = rand(5, 7);
  const vibAmt = gainNode(ctx, o.f0[1] * 0.025, osc.frequency);
  vib.connect(vibAmt);

  let src: AudioNode = osc;
  if (o.strain) {
    const shaper = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    const k = 1 + o.strain * 6;
    for (let i = 0; i < 256; i++) {
      const x = (i / 255) * 2 - 1;
      curve[i] = Math.tanh(k * x) / Math.tanh(k);
    }
    shaper.curve = curve;
    osc.connect(shaper);
    src = shaper;
  }

  const amp = ctx.createGain();
  // (Formant filtering eats most of the energy, hence the make-up gain.)
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(o.peak, t + 0.025);
  amp.gain.setValueAtTime(o.peak, t + dur * 0.55);
  amp.gain.exponentialRampToValueAtTime(0.0001, end);
  const warm = ctx.createBiquadFilter();
  warm.type = "lowpass";
  warm.frequency.value = 3200;
  amp.connect(warm).connect(o.dest);

  const weights = [1, 0.55, 0.22];
  o.vowel.forEach((f, i) => {
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = f;
    bp.Q.value = f / (70 + i * 40);
    src.connect(bp);
    bp.connect(gainNode(ctx, weights[i] * 6, amp));
  });

  // Breath: an "h" leading in, and air through the whole sound.
  const breath = o.breath ?? 0.4;
  if (breath > 0) {
    noise(a, { t: t - 0.05, peak: o.peak * breath * 0.9, attack: 0.03, decay: 0.08, f: 1600, q: 0.8, dest: o.dest });
    noise(a, { t, peak: o.peak * breath * 0.35, attack: 0.03, decay: dur, f: 1300, q: 0.6, dest: o.dest });
  }

  osc.start(t);
  vib.start(t);
  osc.stop(end + 0.05);
  vib.stop(end + 0.05);
}

/** A quick breath in through the mouth, between moves. */
function inhale(a: Nodes, t: number, peak: number, dest: AudioNode) {
  noise(a, { t, peak, attack: 0.16, decay: 0.06, f: 2400, to: 3000, q: 1.2, dest });
}

/** A hand slapping onto rock, and the scuff of a shoe. */
function slap(a: Nodes, t: number, peak: number, dest: AudioNode) {
  noise(a, { t, peak, attack: 0.001, decay: 0.05, f: 900, q: 1.4, dest });
  noise(a, { t, peak: peak * 0.6, attack: 0.001, decay: 0.03, type: "lowpass", f: 300, dest, brown: true });
}

function scuff(a: Nodes, t: number, peak: number, dest: AudioNode) {
  noise(a, { t, peak, attack: 0.01, decay: 0.09, f: 1800, to: 900, q: 0.7, dest });
}

/** One person clapping: a burst of filtered noise per clap. */
function clapper(a: Nodes, t0: number, seconds: number, dest: AudioNode, level: number) {
  const pan = rand(-0.7, 0.7);
  const out = panNode(a.ctx, pan, dest);
  const pitch = rand(900, 2200);
  const rate = rand(3.6, 5.2);
  let t = t0 + rand(0, 0.35);
  const end = t0 + seconds * rand(0.8, 1);
  while (t < end) {
    const p = (t - t0) / seconds;
    // Swell in fast, tail off as people stop.
    const shape = Math.min(1, p * 5) * Math.pow(1 - p, 0.8);
    noise(a, { t, peak: level * shape * rand(0.6, 1), attack: 0.001, decay: rand(0.025, 0.05), f: pitch * rand(0.85, 1.15), q: rand(1, 2), dest: out });
    t += (1 / rate) * rand(0.85, 1.15);
  }
}

// ---------- ambience ----------

type Amb = {
  wind: GainNode;
  windFilter: BiquadFilterNode;
  pad: GainNode;
  padVoices: OscillatorNode[][];
  fire: GainNode;
  shimmer: GainNode;
};
let amb: Amb | null = null;

/** Where on the page we are, and what's happening; drives the ambience mix. */
const mix = { hero: 1, camp: 0, fireHover: false, stokeUntil: 0, glow: 0, day: false };

const CHORDS = [
  [146.83, 220.0, 329.63, 369.99], // D  A  E  F#  (Dadd9)
  [123.47, 185.0, 293.66, 440.0], //  B  F# D  A   (Bm7)
  [98.0, 146.83, 246.94, 369.99], //  G  D  B  F#  (Gmaj7)
  [110.0, 164.81, 277.18, 329.63], // A  E  C# E   (A)
];

function startAmbience(a: Nodes) {
  if (amb) return;
  const { ctx } = a;
  const t = ctx.currentTime;

  // Wind: brown noise through a lowpass that drifts, in slow gusts.
  const windSrc = ctx.createBufferSource();
  windSrc.buffer = a.brown;
  windSrc.loop = true;
  const windFilter = ctx.createBiquadFilter();
  windFilter.type = "lowpass";
  windFilter.frequency.value = 420;
  windFilter.Q.value = 0.8;
  const gust = ctx.createGain();
  gust.gain.value = 0.8;
  const wind = ctx.createGain();
  wind.gain.value = 0;
  windSrc.connect(windFilter).connect(gust).connect(wind).connect(a.amb);
  windSrc.start(t);

  // Pad: four soft voices, each two detuned triangles, gliding between chords.
  const pad = ctx.createGain();
  pad.gain.value = 0;
  const padLp = ctx.createBiquadFilter();
  padLp.type = "lowpass";
  padLp.frequency.value = 700;
  padLp.connect(pad).connect(a.amb);
  pad.connect(gainNode(ctx, 0.6, a.verb));
  const padVoices = CHORDS[0].map((f, i) => {
    const g = gainNode(ctx, 0.25 / (1 + i * 0.3), padLp);
    return [-4, 4].map((cents) => {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      o.detune.value = cents;
      o.connect(g);
      o.start(t);
      return o;
    });
  });

  // Campfire bed: a low hiss and roar, raised when the camp is on screen.
  const fire = ctx.createGain();
  fire.gain.value = 0;
  const firePan = panNode(ctx, 0.15, a.amb);
  fire.connect(firePan);
  const hiss = ctx.createBufferSource();
  hiss.buffer = a.white;
  hiss.loop = true;
  const hissF = ctx.createBiquadFilter();
  hissF.type = "bandpass";
  hissF.frequency.value = 2400;
  hissF.Q.value = 0.5;
  hiss.connect(hissF).connect(gainNode(ctx, 0.12, fire));
  hiss.start(t);
  const roar = ctx.createBufferSource();
  roar.buffer = a.brown;
  roar.loop = true;
  roar.playbackRate.value = 0.7;
  const roarF = ctx.createBiquadFilter();
  roarF.type = "lowpass";
  roarF.frequency.value = 180;
  roar.connect(roarF).connect(gainNode(ctx, 0.9, fire));
  roar.start(t);

  // The sun's shimmer: three high, slightly beating sines, silent until you get close.
  const shimmer = ctx.createGain();
  shimmer.gain.value = 0;
  shimmer.connect(a.sfx);
  shimmer.connect(gainNode(ctx, 1.2, a.verb));
  const trem = ctx.createOscillator();
  trem.frequency.value = 0.35;
  const tremAmt = ctx.createGain();
  tremAmt.gain.value = 0.3;
  const shimmerBody = gainNode(ctx, 0.7, shimmer);
  trem.connect(tremAmt).connect(shimmerBody.gain);
  trem.start(t);
  [880, 1108.73, 1318.51, 1760].forEach((f, i) => {
    const o = ctx.createOscillator();
    o.frequency.value = f;
    o.detune.value = rand(-6, 6);
    o.connect(gainNode(ctx, 0.3 / (1 + i * 0.6), shimmerBody));
    o.start(t);
  });

  amb = { wind, windFilter, pad, padVoices, fire, shimmer };

  // Fade the whole bed in, gently.
  a.amb.gain.setValueAtTime(0, t);
  a.amb.gain.linearRampToValueAtTime(1, t + 4);

  // Slow changes: gusts, chord changes, crickets, crackles. All skip while the tab is hidden.
  let chord = 0;
  setInterval(() => {
    if (!live()) return;
    const now = ctx.currentTime;
    windFilter.frequency.setTargetAtTime(rand(260, 760), now, 1.6);
    gust.gain.setTargetAtTime(rand(0.5, 1.15), now, 1.8);
  }, 2600);
  setInterval(() => {
    if (!live() || !amb) return;
    chord = (chord + 1) % CHORDS.length;
    const now = ctx.currentTime;
    amb.padVoices.forEach((pair, i) => pair.forEach((o) => o.frequency.setTargetAtTime(CHORDS[chord][i], now, 1.8)));
  }, 14000);

  const crickets = [
    { f: 4400, pan: -0.55, every: 1.1 },
    { f: 4750, pan: 0.6, every: 1.6 },
    { f: 4100, pan: 0.1, every: 2.3 },
  ];
  crickets.forEach((c) => {
    const loop = () => {
      setTimeout(loop, c.every * 1000 * rand(0.75, 1.3));
      const a = live();
      if (!a) return;
      if (mix.camp < 0.05) return;
      if (mix.day) {
        if (Math.random() < 0.45 * mix.camp) bird(a, c.pan);
      } else cricket(a, c.f, c.pan, mix.camp);
    };
    setTimeout(loop, rand(500, 2500));
  });

  const crackle = () => {
    const level = fireLevel();
    // More pops the bigger the fire is.
    setTimeout(crackle, level > 0.02 ? rand(40, 420) / (0.4 + level) : 400);
    const a = live();
    if (!a || level < 0.02) return;
    pop(a, level);
  };
  crackle();

  // Follow the page: scroll position decides the mix.
  let raf = 0;
  const onScroll = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(measure);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  setInterval(measure, 700); // page changes (client navigation) don't scroll
  window.addEventListener("daylight", () => {
    mix.day = document.documentElement.classList.contains("daytime");
    const a = live();
    if (a && mix.day) morning(a);
  });
  measure();
}

/** How much of an element is on screen, 0–1. */
function visible(id: string) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  const overlap = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
  return clamp(overlap / Math.min(r.height || 1, window.innerHeight));
}

function fireLevel() {
  const stoked = performance.now() < mix.stokeUntil ? 1 : 0;
  return mix.camp * (0.55 + (mix.fireHover ? 0.35 : 0) + stoked * 0.9);
}

function measure() {
  mix.hero = visible("top");
  mix.camp = visible("contact");
  applyMix();
}

function applyMix() {
  if (!A || !amb) return;
  const now = A.ctx.currentTime;
  // The whole bed follows the camp: silent until it scrolls into view.
  amb.wind.gain.setTargetAtTime(0.08 * mix.camp, now, 0.6);
  amb.pad.gain.setTargetAtTime(0.022 * mix.camp * (mix.day ? 1.3 : 1), now, 0.8);
  amb.fire.gain.setTargetAtTime(0.045 * fireLevel(), now, 0.35);
  amb.shimmer.gain.setTargetAtTime(0.05 * mix.glow * mix.hero, now, 0.15);
}

function cricket(a: Nodes, f: number, pan: number, level: number) {
  const { ctx } = a;
  const t = ctx.currentTime + 0.02;
  const out = panNode(ctx, pan, a.amb);
  const g = ctx.createGain();
  g.gain.value = 0;
  const o = ctx.createOscillator();
  o.frequency.value = f * rand(0.99, 1.01);
  o.connect(g).connect(out);
  const pulses = Math.random() < 0.5 ? 3 : 4;
  for (let i = 0; i < pulses; i++) {
    const p = t + i * 0.045;
    g.gain.setValueAtTime(0, p);
    g.gain.linearRampToValueAtTime(0.012 * level, p + 0.006);
    g.gain.linearRampToValueAtTime(0, p + 0.03);
  }
  o.start(t);
  o.stop(t + pulses * 0.045 + 0.05);
}

function bird(a: Nodes, pan: number) {
  const t = a.ctx.currentTime + 0.02;
  const out = panNode(a.ctx, pan, a.amb);
  const base = rand(2600, 3600);
  const notes = 2 + Math.floor(Math.random() * 4);
  for (let i = 0; i < notes; i++) {
    tone(a, { f: base * rand(0.9, 1.05), to: base * rand(1.2, 1.5), t: t + i * rand(0.09, 0.14), peak: 0.016, attack: 0.01, decay: 0.07, dest: out });
  }
}

/** One crackle from the fire. */
function pop(a: Nodes, level: number) {
  const t = a.ctx.currentTime + 0.01;
  const out = panNode(a.ctx, rand(0.05, 0.3), a.amb);
  const big = Math.random() < 0.12;
  noise(a, {
    t,
    peak: (big ? 0.07 : rand(0.02, 0.05)) * Math.min(1.4, level),
    attack: 0.0008,
    decay: big ? rand(0.02, 0.05) : rand(0.004, 0.018),
    type: big ? "bandpass" : "highpass",
    f: big ? rand(700, 1600) : rand(1800, 5000),
    q: big ? 1.2 : 0.7,
    dest: out,
  });
}

// ---------- public API ----------

let lastTick = 0;
let tickN = 0;

export const sound = {
  /** Call from any user gesture. Starts the engine (browsers block audio until one). */
  unlock() {
    load();
    if (!enabled) return;
    const a = init();
    if (!a) return;
    if (a.ctx.state !== "running") a.ctx.resume().catch(() => {});
    if (!unlocked) {
      unlocked = true;
      a.master.gain.setTargetAtTime(1, a.ctx.currentTime, 0.4);
      startAmbience(a);
    }
  },

  isOn() {
    load();
    return enabled;
  },

  setOn(on: boolean) {
    load();
    enabled = on;
    try {
      localStorage.setItem(KEY, on ? "on" : "off");
    } catch {
      // ignore
    }
    listeners.forEach((l) => l(on));
    if (on) {
      sound.unlock();
      if (A) A.master.gain.setTargetAtTime(1, A.ctx.currentTime, 0.3);
      sound.press();
    } else if (A) {
      const a = A;
      a.master.gain.setTargetAtTime(0, a.ctx.currentTime, 0.12);
      setTimeout(() => !enabled && a.ctx.suspend().catch(() => {}), 600);
    }
  },

  subscribe(fn: (on: boolean) => void) {
    listeners.add(fn);
    return () => void listeners.delete(fn);
  },

  /** Pauses everything while the tab is hidden. */
  visibility() {
    if (!A || !enabled || !unlocked) return;
    if (document.hidden) A.ctx.suspend().catch(() => {});
    else A.ctx.resume().catch(() => {});
  },

  // --- interface ---

  /** Hovering a button or link: a soft, high tick, never twice in a rush. */
  hover() {
    const a = live();
    const now = performance.now();
    if (!a || now - lastTick < 45) return;
    lastTick = now;
    tickN++;
    const t = a.ctx.currentTime;
    const f = [1568, 1760, 1975.5][tickN % 3]; // G6 A6 B6, so runs of ticks make a little tune
    tone(a, { type: "triangle", f, t, peak: 0.022, attack: 0.002, decay: 0.05, dest: bus(a, 0, 0.1) });
  },

  /** Pressing a button: a low, rounded tock. */
  press() {
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime;
    const out = bus(a, 0, 0.1);
    tone(a, { f: 520, to: 340, t, peak: 0.06, attack: 0.002, decay: 0.08, dest: out });
    noise(a, { t, peak: 0.02, decay: 0.02, f: 3000, q: 0.8, dest: out });
  },

  /** An Experience row transforming (see lib/roleFx.ts): a short sound that fades out. */
  fx(id: "ice" | "rock" | "laser" | "robot" | "tennis") {
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime + 0.01;
    const out = bus(a, 0, 0.3);
    if (id === "ice") {
      // A skate carving in, a stick on the puck, then the ice crackling as it freezes.
      noise(a, { t, peak: 0.05, attack: 0.08, decay: 0.45, type: "bandpass", f: 2200, to: 6500, q: 0.9, dest: out });
      noise(a, { t: t + 0.32, peak: 0.12, decay: 0.03, f: 2600, q: 3, dest: out });
      tone(a, { f: 1650, t: t + 0.32, peak: 0.03, attack: 0.001, decay: 0.08, dest: out });
      for (let i = 0; i < 9; i++) {
        const at = t + 0.4 + Math.pow(Math.random(), 1.3) * 0.9;
        noise(a, { t: at, peak: rand(0.01, 0.03) * (1.3 - (at - t) / 1.4), decay: rand(0.005, 0.015), type: "highpass", f: rand(4000, 8000), dest: out });
      }
      bell(a, 2349.32, t + 0.45, 0.008, out, 1.4);
    } else if (id === "rock") {
      // Stone grinding into place, pebbles settling, a last solid thud.
      noise(a, { t, peak: 0.07, attack: 0.15, decay: 0.7, type: "lowpass", f: 380, to: 140, q: 2, dest: out, brown: true });
      noise(a, { t, peak: 0.025, attack: 0.1, decay: 0.6, f: 900, to: 500, q: 1.5, dest: out });
      for (let i = 0; i < 7; i++) {
        noise(a, { t: t + rand(0.1, 0.8), peak: rand(0.015, 0.04), decay: rand(0.01, 0.03), f: rand(1800, 4200), q: 5, dest: out });
      }
      noise(a, { t: t + 0.85, peak: 0.08, attack: 0.003, decay: 0.18, type: "lowpass", f: 140, dest: out, brown: true });
    } else if (id === "laser") {
      // The zap, the scan sweeping down, and a hum that dies away.
      tone(a, { type: "square", f: 2400, to: 320, t, peak: 0.02, attack: 0.002, decay: 0.22, dest: out });
      noise(a, { t, peak: 0.03, attack: 0.1, decay: 0.6, f: 4000, to: 500, q: 4, dest: out });
      const hum = a.ctx.createBiquadFilter();
      hum.type = "lowpass";
      hum.frequency.value = 700;
      hum.connect(out);
      tone(a, { type: "sawtooth", f: 110, t: t + 0.05, peak: 0.02, attack: 0.08, decay: 1.1, dest: hum });
      tone(a, { type: "sawtooth", f: 111.5, t: t + 0.05, peak: 0.015, attack: 0.08, decay: 1.1, dest: hum });
    } else if (id === "robot") {
      // A servo whirring up, a couple of mechanical clicks, then three beeps.
      const whirr = a.ctx.createBiquadFilter();
      whirr.type = "bandpass";
      whirr.frequency.value = 1100;
      whirr.Q.value = 2.5;
      whirr.connect(out);
      tone(a, { type: "sawtooth", f: 180, to: 520, t, peak: 0.05, attack: 0.05, decay: 0.38, dest: whirr });
      noise(a, { t: t + 0.42, peak: 0.06, decay: 0.012, f: 3200, q: 6, dest: out });
      noise(a, { t: t + 0.5, peak: 0.05, decay: 0.012, f: 2600, q: 6, dest: out });
      [1318.51, 1760, 1046.5].forEach((f, i) => tone(a, { type: "square", f, t: t + 0.62 + i * 0.1, peak: 0.012, attack: 0.002, decay: 0.07, dest: out }));
    } else {
      // A racket hitting the ball, two bounces, and the return.
      const pock = (at: number, level: number) => {
        tone(a, { f: 540, to: 420, t: at, peak: 0.07 * level, attack: 0.001, decay: 0.07, dest: out });
        noise(a, { t: at, peak: 0.06 * level, decay: 0.025, f: 1500, q: 1.5, dest: out });
      };
      const bounce = (at: number, level: number) => {
        noise(a, { t: at, peak: 0.07 * level, attack: 0.001, decay: 0.05, type: "lowpass", f: 450, dest: out, brown: true });
        tone(a, { f: 300, t: at, peak: 0.03 * level, attack: 0.001, decay: 0.05, dest: out });
      };
      pock(t, 1);
      bounce(t + 0.45, 0.8);
      bounce(t + 0.75, 0.5);
      pock(t + 1.05, 0.55);
    }
  },

  /** A result's bars filling in: a quiet run of three rising blips. */
  fill() {
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime;
    const out = bus(a, 0.2, 0.2);
    [880, 1108.73, 1318.51].forEach((f, i) => tone(a, { type: "triangle", f, t: t + i * 0.07, peak: 0.014, attack: 0.003, decay: 0.09, dest: out }));
  },

  /** Something worked (copied the email): two rising bell notes. */
  success() {
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime;
    const out = bus(a, 0, 0.35);
    bell(a, 1046.5, t, 0.035, out, 0.6);
    bell(a, 1568, t + 0.09, 0.03, out, 0.9);
  },

  /** A dialog or menu opening (or closing). */
  open(closing = false) {
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime;
    const out = bus(a, 0, 0.4);
    noise(a, { t, peak: 0.03, attack: 0.08, decay: 0.2, f: closing ? 1800 : 500, to: closing ? 500 : 1800, q: 1.4, dest: out });
    tone(a, { f: closing ? 784 : 587.33, t: t + 0.02, peak: 0.02, attack: 0.01, decay: 0.3, dest: out });
    if (!closing) tone(a, { f: 880, t: t + 0.07, peak: 0.016, attack: 0.01, decay: 0.35, dest: out });
  },

  /** The dither wipe covering the screen. */
  wipe() {
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime;
    noise(a, { t, peak: 0.04, attack: 0.2, decay: 0.35, type: "lowpass", f: 300, to: 2600, q: 2, dest: bus(a, 0, 0.5) });
  },

  // --- the summit ---

  /** How close the cursor is to the sun (0–1): fades its shimmer in and out. */
  glow(k: number) {
    mix.glow = k;
    applyMix();
  },

  /** A click on the sun; the nth in a row rings a step higher. */
  sun(n: number) {
    const a = live();
    if (!a) return;
    const scale = [659.25, 739.99, 880, 987.77, 1174.66]; // E F# A B D, the pad's key
    bell(a, scale[Math.min(n, 5) - 1], a.ctx.currentTime, 0.04, bus(a, -0.2, 0.6), 2.2);
  },

  /** The sun setting (fifth click): a long falling sweep and a low chord. */
  sunset() {
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime + 0.25;
    const out = bus(a, 0, 0.8);
    noise(a, { t, peak: 0.05, attack: 0.6, decay: 2.6, type: "lowpass", f: 3200, to: 180, q: 3, dest: out });
    [146.83, 220, 277.18].forEach((f, i) => tone(a, { type: "triangle", f: f * 2, to: f, t: t + i * 0.08, peak: 0.03, attack: 0.4, decay: 3.2, dest: out }));
  },

  /** The sun coming back up. */
  sunrise() {
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime;
    const out = bus(a, 0, 0.7);
    [587.33, 739.99, 880, 1174.66].forEach((f, i) => bell(a, f, t + i * 0.12, 0.025, out, 1.6));
  },

  // --- the camp ---

  /** Hovering the fire: it crackles harder, with a soft breath of air. */
  fireHover(on: boolean) {
    if (mix.fireHover === on) return;
    mix.fireHover = on;
    applyMix();
    const a = live();
    if (!a || !on) return;
    noise(a, { t: a.ctx.currentTime, peak: 0.03, attack: 0.15, decay: 0.3, f: 400, to: 900, q: 0.8, dest: bus(a, 0.15, 0.2) });
  },

  /** Stoking the fire: a whoosh, a thump, then a burst of sparks crackling. */
  stoke() {
    mix.stokeUntil = performance.now() + 1800;
    applyMix();
    setTimeout(applyMix, 1850);
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime;
    const out = bus(a, 0.15, 0.3);
    noise(a, { t, peak: 0.02, attack: 0.002, decay: 0.08, type: "lowpass", f: 220, dest: out, brown: true });
    noise(a, { t: t + 0.03, peak: 0.08, attack: 0.18, decay: 0.75, f: 280, to: 1400, q: 0.9, dest: out });
    for (let i = 0; i < 14; i++) {
      const at = t + 0.12 + Math.pow(Math.random(), 1.6) * 1.3;
      noise(a, { t: at, peak: rand(0.04, 0.12), attack: 0.0008, decay: rand(0.004, 0.02), type: "highpass", f: rand(2000, 6000), dest: out });
    }
  },

  /** The tent light switching (off: a lower click). */
  tent(off: boolean) {
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime;
    const out = bus(a, -0.05, 0.15);
    noise(a, { t, peak: 0.08, decay: 0.012, f: off ? 1800 : 2600, q: 3, dest: out });
    noise(a, { t: t + 0.03, peak: 0.05, decay: 0.01, f: off ? 1400 : 3200, q: 3, dest: out });
  },

  /** Pointing at the moon: one faint, glassy note. */
  moon() {
    const a = live();
    if (!a) return;
    bell(a, 2093, a.ctx.currentTime, 0.012, bus(a, 0.6, 0.8), 2.4);
  },

  /** The bear wandering through: a huff, then soft pad-falls left to right. */
  bearWalk(ms: number) {
    const a = live();
    if (!a) return;
    const t0 = a.ctx.currentTime;
    const steps = Math.floor(ms / 520);
    for (let i = 0; i < steps; i++) {
      const p = i / steps;
      const out = panNode(a.ctx, -0.85 + 1.7 * p, a.amb);
      const level = 0.03 * Math.sin(Math.PI * Math.min(1, p * 1.2)) + 0.004;
      noise(a, { t: t0 + i * 0.52 + rand(-0.03, 0.03), peak: level, attack: 0.004, decay: 0.07, type: "lowpass", f: 260, dest: out, brown: true });
      noise(a, { t: t0 + i * 0.52 + 0.26, peak: level * 0.7, attack: 0.004, decay: 0.06, type: "lowpass", f: 300, dest: out, brown: true });
    }
    sound.bear(t0 + ms / 1000 * 0.35, -0.2);
  },

  /** A bear's huff (clicking it, or on its walk). */
  bear(at?: number, pan = 0) {
    const a = live();
    if (!a) return;
    const t = at ?? a.ctx.currentTime;
    const out = bus(a, pan, 0.2);
    voice(a, { t, dur: 0.35, f0: [75, 85, 60], vowel: VOWEL.uh, peak: 0.05, breath: 1.2, strain: 0.8, dest: out });
    noise(a, { t: t + 0.4, peak: 0.04, attack: 0.03, decay: 0.2, f: 600, q: 0.7, dest: out });
  },

  /**
   * Sending Burden of Dreams. Times match SEND_MS in lib/scenes.ts: the climber moves up
   * the face (0–1.56s), tops out, and the camp applauds while the spotter whoops.
   */
  send() {
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime + 0.03;
    const climber = bus(a, 0.35, 0.18);
    // Breath, slap, grunt: three hard moves, then the big one.
    inhale(a, t, 0.025, climber);
    slap(a, t + 0.2, 0.09, climber);
    voice(a, { t: t + 0.2, dur: 0.22, f0: [118, 132, 104], vowel: VOWEL.hn, peak: 0.07, breath: 0.6, strain: 0.4, dest: climber });
    scuff(a, t + 0.48, 0.03, climber);

    inhale(a, t + 0.52, 0.025, climber);
    slap(a, t + 0.72, 0.1, climber);
    voice(a, { t: t + 0.72, dur: 0.2, f0: [126, 140, 112], vowel: VOWEL.uh, peak: 0.075, breath: 0.5, strain: 0.5, dest: climber });

    scuff(a, t + 0.98, 0.035, climber);
    slap(a, t + 1.12, 0.11, climber);
    voice(a, { t: t + 1.1, dur: 0.36, f0: [122, 150, 118], vowel: VOWEL.hn, peak: 0.08, breath: 0.5, strain: 0.8, dest: climber });

    // The lip: a release on the top-out.
    inhale(a, t + 1.38, 0.03, climber);
    voice(a, { t: t + 1.56, dur: 0.55, f0: [150, 205, 150], vowel: VOWEL.ah, peak: 0.075, breath: 0.4, strain: 0.6, dest: climber });

    // Applause from round the fire, and a whoop from the spotter.
    const crowd = bus(a, 0.1, 0.5);
    for (let i = 0; i < 7; i++) clapper(a, t + 1.7, 3.4, crowd, 0.07);
    const spotter = bus(a, 0.2, 0.35);
    voice(a, { t: t + 1.8, dur: 0.5, f0: [240, 430, 360], vowel: VOWEL.oo, peak: 0.05, breath: 0.3, dest: spotter });
    voice(a, { t: t + 2.45, dur: 0.32, f0: [300, 380, 280], vowel: VOWEL.ah, peak: 0.035, breath: 0.3, dest: spotter });
  },

  // --- the sky ---

  /** A shooting star crossing: a faint falling sparkle. */
  star() {
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime;
    const out = bus(a, 0.3, 0.7);
    noise(a, { t, peak: 0.012, attack: 0.15, decay: 0.85, type: "highpass", f: 7000, to: 3500, q: 0.7, dest: out });
    for (let i = 0; i < 4; i++) tone(a, { f: 3136 - i * 300, t: t + i * 0.18, peak: 0.006, attack: 0.003, decay: 0.25, dest: out });
  },

  /** Catching one: a bright arpeggio. */
  caught() {
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime;
    const out = bus(a, 0, 0.6);
    [1174.66, 1479.98, 1760, 2349.32].forEach((f, i) => bell(a, f, t + i * 0.06, 0.025, out, 1));
  },
};

/** Daybreak (Konami code): a rising chime, then birds take over from the crickets. */
function morning(a: Nodes) {
  const t = a.ctx.currentTime;
  const out = bus(a, 0, 0.7);
  [587.33, 880, 1108.73, 1318.51].forEach((f, i) => bell(a, f, t + i * 0.1, 0.022, out, 1.8));
  setTimeout(() => {
    const b = live();
    if (b && mix.camp > 0.05) bird(b, -0.3);
  }, 600);
}
