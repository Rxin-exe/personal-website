"use client";

import { useEffect, useRef, useState } from "react";
import type { Chart } from "@/content/site";

/** Each bar is drawn as this many pixel blocks at full length. */
const BAR_BLOCKS = 32;

/**
 * Results as pixel charts: bars made of square blocks, or a grid of squares with some lit.
 * They fill in, block by block, the first time they scroll into view.
 */
export default function PixelChart({ chart }: { chart: Chart }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={ref} className={`pchart ${shown ? "is-shown" : ""}`}>
      <figcaption className="pchart-title">{chart.title}</figcaption>
      {chart.kind === "bars" ? <Bars chart={chart} /> : <Squares chart={chart} />}
    </figure>
  );
}

function Bars({ chart }: { chart: Extract<Chart, { kind: "bars" }> }) {
  const max = Math.max(...chart.bars.map((b) => b.value));
  return (
    <div className="pchart-bars">
      {chart.bars.map((b, row) => {
        const blocks = Math.max(1, Math.round((b.value / max) * BAR_BLOCKS));
        return (
          <div key={b.label} className={`pchart-row ${b.highlight ? "is-highlight" : ""}`}>
            <span className="pchart-label">{b.label}</span>
            <span className="pchart-track" aria-hidden="true">
              {Array.from({ length: blocks }, (_, i) => (
                <i key={i} style={{ "--i": i + row * 6 } as React.CSSProperties} />
              ))}
            </span>
            <span className="pchart-value">
              {b.value}
              <span className="sr-only"> {chart.unit}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Squares({ chart }: { chart: Extract<Chart, { kind: "squares" }> }) {
  const lit = new Set(chart.lit);
  return (
    <div className="pchart-squares-wrap">
      <span className="pchart-squares" aria-hidden="true">
        {Array.from({ length: chart.total }, (_, i) => (
          <i key={i} className={lit.has(i) ? "is-lit" : ""} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </span>
      <span className="pchart-caption">{chart.caption}</span>
    </div>
  );
}
