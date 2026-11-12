"use client";

import { useEffect, useRef } from "react";

const CELL = 3;
const STAR_DIM = [51, 70, 138]; // blue
const STAR_MID = [100, 120, 184]; // periwinkle
const STAR_BRIGHT = [174, 185, 224]; // mist

/** Deterministic per-cell noise, so stars land in the same place on every visit. */
const hash = (x: number, y: number) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

/**
 * One starfield for the whole page. It scrolls with the content (no fixed layer to slide
 * against the scenes) and shows through the dark sky of the summit and the camp. Stars
 * come out as you go down: a few at dusk, the full sky by the time you reach camp.
 * The text column stays almost clear.
 */
export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let lastKey = "";
    const draw = () => {
      const doc = document.documentElement;
      const pageH = doc.scrollHeight;
      const w = Math.ceil(doc.clientWidth / CELL);
      const h = Math.ceil(pageH / CELL);
      const key = `${w}x${h}`;
      if (key === lastKey) return;
      lastKey = key;
      canvas.style.height = `${h * CELL}px`;
      canvas.width = w;
      canvas.height = h;

      const heroEnd = (document.querySelector(".hero")?.getBoundingClientRect().bottom ?? 0) + window.scrollY;
      const camp = (document.getElementById("contact")?.getBoundingClientRect().top ?? pageH) + window.scrollY;
      // How many stars, by depth down the page.
      const nightfall = (yPx: number) => {
        if (yPx < heroEnd) return 0.6;
        const t = Math.min(1, Math.max(0, (yPx - heroEnd) / Math.max(1, camp - heroEnd)));
        return 0.15 + 0.85 * t * t;
      };
      const column = (1120 / 2 + 48) / CELL;

      const img = ctx.createImageData(w, h);
      const d = img.data;
      for (let y = 0; y < h; y++) {
        const depth = nightfall(y * CELL);
        for (let x = 0; x < w; x++) {
          const fromCentre = Math.abs(x - w / 2);
          const side = fromCentre < column ? 0.1 : Math.min(1, 0.1 + (fromCentre - column) / 40);
          const p = 0.0016 * depth * side;
          const n = hash(x, y);
          if (n >= p) continue;
          const c = n < p * 0.12 ? STAR_BRIGHT : n < p * 0.4 ? STAR_MID : STAR_DIM;
          const i = (y * w + x) * 4;
          d[i] = c[0];
          d[i + 1] = c[1];
          d[i + 2] = c[2];
          d[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    draw();
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    });
    ro.observe(document.body);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}
