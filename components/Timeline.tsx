"use client";

import { useEffect, useRef } from "react";
import { timeline, type TimelineEntry } from "@/content/site";
import { useInView } from "./Reveal";
import SectionHead from "./SectionHead";

export default function Timeline() {
  const listRef = useRef<HTMLDivElement>(null);

  // Draw the line downward as the user scrolls through the list.
  useEffect(() => {
    const list = listRef.current;
    if (!list || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      const rect = list.getBoundingClientRect();
      const start = window.innerHeight * 0.75;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / rect.height));
      list.style.setProperty("--progress", progress.toFixed(4));
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="timeline" className="container section" aria-labelledby="timeline-title">
      <SectionHead id="timeline" eyebrow="Timeline" title="Education & experience" />
      <div ref={listRef} className="timeline">
        <div className="timeline-track" aria-hidden="true" />
        <div className="timeline-progress" aria-hidden="true" />
        <ol className="timeline-list">
          {timeline.map((entry, i) => (
            <Item key={`${entry.title}-${i}`} entry={entry} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Item({ entry }: { entry: TimelineEntry }) {
  const ref = useRef<HTMLLIElement>(null);
  const visible = useInView(ref, "0px 0px -20% 0px");

  return (
    <li ref={ref} className={`timeline-item reveal ${visible ? "is-visible" : ""}`}>
      <span className="timeline-dot" aria-hidden="true" />
      <article className="timeline-card">
        <div className="timeline-meta">
          <span className="timeline-date">{entry.dates}</span>
          <span className="tag">{entry.type}</span>
        </div>
        <h3>{entry.title}</h3>
        <p className="timeline-org">{entry.org}</p>
        {entry.bullets && entry.bullets.length > 0 && (
          <ul>
            {entry.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
      </article>
    </li>
  );
}
