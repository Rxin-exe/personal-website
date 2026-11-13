"use client";

import { useEffect, useRef, useState } from "react";
import { bayerAt } from "@/lib/dither";
import { sound } from "@/lib/sound";

const CELL = 3;
const FLIGHT_MS = 1100;
const TRAIL = 26; // cells

/**
 * Every so often a pixel shooting star crosses the sky. Catching it (clicking it while it
 * flies) opens the hidden grade pyramid. Rare on purpose: first one after ~8–14s, then
 * every 25–45s, only while the tab is visible, never with reduced motion.
 */
export default function ShootingStar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [flying, setFlying] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const button = buttonRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !button || !ctx) return;

    let timer: ReturnType<typeof setTimeout>;
    let raf = 0;

    const schedule = (min: number, max: number) => {
      timer = setTimeout(launch, min + Math.random() * (max - min));
    };

    const launch = () => {
      if (document.hidden) return schedule(5000, 10000);
      const w = Math.ceil(window.innerWidth / CELL);
      const h = Math.ceil(window.innerHeight / CELL);
      canvas.width = w;
      canvas.height = h;
      // Start high up and travel down-left, like it's falling toward the sunset.
      const sx = w * (0.45 + Math.random() * 0.5);
      const sy = h * (0.04 + Math.random() * 0.22);
      const len = Math.min(w * 0.35, 110);
      const dx = -len;
      const dy = len * 0.38;
      const t0 = performance.now();
      setFlying(true);
      sound.star();

      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / FLIGHT_MS);
        const e = 1 - Math.pow(1 - t, 2);
        const hx = sx + dx * e;
        const hy = sy + dy * e;
        ctx.clearRect(0, 0, w, h);
        const fade = t < 0.75 ? 1 : 1 - (t - 0.75) / 0.25;
        // Trail: thins out in the dither pattern behind the head.
        for (let i = 0; i < TRAIL; i++) {
          const k = i / TRAIL;
          const x = Math.round(hx - (dx / len) * i * 1.1);
          const y = Math.round(hy - (dy / len) * i * 1.1);
          if (bayerAt(x, y) > (1 - k) * fade) continue;
          ctx.fillStyle = k < 0.25 ? "#aeb9e0" : k < 0.6 ? "#6478b8" : "#33468a";
          ctx.fillRect(x, y, 1, 1);
        }
        if (fade > 0.2) {
          ctx.fillStyle = "#f2ede4";
          ctx.fillRect(Math.round(hx) - 1, Math.round(hy), 2, 1);
          ctx.fillRect(Math.round(hx), Math.round(hy) - 1, 1, 2);
        }
        button.style.transform = `translate(${hx * CELL - 22}px, ${hy * CELL - 22}px)`;
        if (t < 1) raf = requestAnimationFrame(tick);
        else {
          ctx.clearRect(0, 0, w, h);
          setFlying(false);
          schedule(25000, 45000);
        }
      };
      raf = requestAnimationFrame(tick);
    };

    schedule(8000, 14000);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, []);

  const catchIt = (e: React.MouseEvent) => {
    sound.caught();
    window.dispatchEvent(new CustomEvent("open-beta", { detail: { x: e.clientX, y: e.clientY } }));
  };

  return (
    <>
      <canvas ref={canvasRef} className="shooting-star" aria-hidden="true" />
      <button
        ref={buttonRef}
        type="button"
        className={`shooting-star-catch ${flying ? "is-flying" : ""}`}
        onClick={catchIt}
        tabIndex={-1}
        aria-label="Catch the shooting star"
      />
    </>
  );
}
