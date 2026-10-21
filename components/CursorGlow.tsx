"use client";

import { useEffect, useRef } from "react";

/** Soft amber glow that trails the cursor. Desktop pointers only; off for reduced motion. */
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    if (!el || !finePointer || reduced) return;

    let x = 0;
    let y = 0;
    let frame = 0;

    const render = () => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = 0;
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.classList.add("is-visible");
      if (!frame) frame = requestAnimationFrame(render);
    };
    const onLeave = () => el.classList.remove("is-visible");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}
