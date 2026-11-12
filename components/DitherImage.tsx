"use client";

import { useEffect, useRef, useState } from "react";
import { dither } from "@/lib/dither";

/** CSS pixels per dither cell, final. */
const CELL = 2;
/** The first time an image scrolls into view it sharpens through these cell sizes. */
const SHARPEN = [14, 8, 5, 3, CELL];
const STEP_MS = 90;

/**
 * Shows an image dithered onto the site palette. It loads coarse (big pixels) and
 * sharpens to full detail the first time it scrolls into view, like an old screen
 * resolving. Hovering or focusing the parent `.has-dither` reveals the original.
 */
export default function DitherImage({ src, alt = "", priority = false }: { src: string; alt?: string; priority?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!wrap || !canvas || !img || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cell = reduced ? CELL : SHARPEN[0];
    let lastKey = "";
    let stepTimer: ReturnType<typeof setTimeout> | undefined;

    const render = () => {
      if (!img.complete || !img.naturalWidth) return;
      const box = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.round(box.width / cell));
      const h = Math.max(1, Math.round(box.height / cell));
      const key = `${w}x${h}`;
      if (key === lastKey) return;
      lastKey = key;
      canvas.width = w;
      canvas.height = h;
      // Same crop as object-fit: cover.
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      const frame = ctx.getImageData(0, 0, w, h);
      dither(frame.data, w, h);
      ctx.putImageData(frame, 0, 0);
      setReady(true);
    };

    // Sharpen once, when the image is both loaded and on screen.
    let seen = reduced;
    const sharpen = () => {
      if (!seen || !img.complete || !img.naturalWidth || cell === CELL) return;
      const i = SHARPEN.indexOf(cell);
      stepTimer = setTimeout(() => {
        cell = SHARPEN[i + 1];
        render();
        sharpen();
      }, STEP_MS);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        seen = true;
        io.disconnect();
        sharpen();
      },
      { threshold: 0.35 }
    );
    io.observe(wrap);

    const onLoad = () => {
      render();
      sharpen();
    };
    if (img.complete) onLoad();
    else img.addEventListener("load", onLoad, { once: true });

    let raf = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    });
    observer.observe(wrap);
    return () => {
      observer.disconnect();
      io.disconnect();
      clearTimeout(stepTimer);
      cancelAnimationFrame(raf);
      img.removeEventListener("load", onLoad);
    };
  }, [src]);

  return (
    <div ref={wrapRef} className={`dither ${ready ? "is-ready" : ""}`}>
      <img ref={imgRef} src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" />
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
