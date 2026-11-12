"use client";

import { useEffect, useState } from "react";

const GRID = 16; // logo drawn on a 16×16 pixel grid
const CELL = 3; // each logo pixel is 3 CSS px, like the scenes

/**
 * A brand mark re-drawn as pixel art: the SVG path is rasterised onto a 16×16 grid,
 * thresholded, and used as a CSS mask, so its colour comes from `currentColor`
 * (and can change on hover). Falls back to the text mark until it's drawn.
 */
export default function PixelLogo({ path, fallback }: { path?: string; fallback: string }) {
  const [mask, setMask] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;
    const small = document.createElement("canvas");
    small.width = small.height = GRID;
    const sctx = small.getContext("2d");
    if (!sctx) return;
    sctx.scale(GRID / 24, GRID / 24);
    sctx.fill(new Path2D(path));
    const src = sctx.getImageData(0, 0, GRID, GRID).data;

    // Upscale by hand (no smoothing) so the mask stays crisp at any size.
    const big = document.createElement("canvas");
    big.width = big.height = GRID * CELL;
    const bctx = big.getContext("2d");
    if (!bctx) return;
    bctx.fillStyle = "#000";
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        if (src[(y * GRID + x) * 4 + 3] > 110) bctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }
    setMask(big.toDataURL());
  }, [path]);

  if (!mask) {
    return (
      <span className="pixel-logo pixel-logo--text" aria-hidden="true">
        {fallback}
      </span>
    );
  }
  return <span className="pixel-logo" aria-hidden="true" style={{ WebkitMaskImage: `url(${mask})`, maskImage: `url(${mask})` }} />;
}
