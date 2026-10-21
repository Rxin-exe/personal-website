"use client";

import { useEffect, useRef, useState } from "react";
import { experiment } from "@/content/site";
import type { ExperimentStats, Variant } from "@/lib/experiment";
import { currentVariant } from "./abClient";
import { useInView } from "./Reveal";

const MIN_SAMPLE = 30;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default function ExperimentStrip() {
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref);
  const [stats, setStats] = useState<ExperimentStats | null>(null);
  const [failed, setFailed] = useState(false);
  const [mine, setMine] = useState<Variant | null>(null);

  useEffect(() => setMine(currentVariant()), []);

  useEffect(() => {
    if (!visible) return;
    fetch("/api/experiment", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setStats)
      .catch(() => setFailed(true));
  }, [visible]);

  if (failed) return null;

  const max = stats ? Math.max(stats.A.rate, stats.B.rate, 0.01) : 1;

  return (
    <section ref={ref} className={`container section experiment reveal ${visible ? "is-visible" : ""}`} aria-labelledby="experiment-title">
      <div className="experiment-card">
        <div className="experiment-head">
          <span className="live-dot" aria-hidden="true" />
          <span className="eyebrow">Live experiment</span>
        </div>
        <h2 id="experiment-title" className="experiment-title">
          This page is running an A/B test on you.
        </h2>
        <p className="experiment-copy">
          {mine && (
            <>
              You saw variant <strong>{mine}</strong>: “{experiment.variants[mine]}”.{" "}
            </>
          )}
          {experiment.hypothesis}
        </p>

        <div className="experiment-bars">
          {(["A", "B"] as Variant[]).map((v) => {
            const s = stats?.[v];
            const lead = stats && stats.total >= MIN_SAMPLE && stats.leader === v;
            return (
              <div key={v} className={`bar-row ${lead ? "is-leader" : ""}`}>
                <div className="bar-label">
                  <span>
                    <strong>{v}</strong> “{experiment.variants[v]}”
                  </span>
                  <span className="bar-value">{s ? `${pct(s.rate)} · ${s.clicks}/${s.visitors}` : "—"}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ transform: `scaleX(${s ? s.rate / max : 0})` }} />
                </div>
              </div>
            );
          })}
        </div>

        <p className="experiment-foot">
          {!stats
            ? "Loading results…"
            : stats.total < MIN_SAMPLE
              ? `Collecting data: ${stats.total} visitor${stats.total === 1 ? "" : "s"} so far. Results show once ${MIN_SAMPLE} have visited.`
              : stats.significant
                ? `Variant ${stats.leader} wins at p = ${stats.pValue!.toFixed(3)} (n = ${stats.total}).`
                : `No significant difference yet (p = ${stats.pValue!.toFixed(2)}, n = ${stats.total}). I'll call it at p < 0.05.`}
          <span className="experiment-metric"> Metric: {experiment.metric}</span>
        </p>
      </div>
    </section>
  );
}
