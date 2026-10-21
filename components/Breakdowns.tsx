"use client";

import { useState } from "react";
import { breakdowns, type Breakdown } from "@/content/site";
import Modal from "./Modal";
import { tilt } from "./tilt";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

export default function Breakdowns() {
  const [open, setOpen] = useState<Breakdown | null>(null);

  return (
    <section id="breakdowns" className="container section" aria-labelledby="breakdowns-title">
      <SectionHead id="breakdowns" eyebrow="Product Breakdowns" title="How I think about products." intro="Teardowns of products I use: what works, what breaks, and what I'd build next." />
      <ul className={`grid ${breakdowns.length % 2 === 0 && breakdowns.length % 3 !== 0 ? "grid-2" : ""}`} style={{ listStyle: "none", padding: 0 }}>
        {breakdowns.map((b, i) => (
          <Reveal as="li" key={b.id} delay={i * 90}>
            <button className="card" onClick={() => setOpen(b)} aria-haspopup="dialog" {...tilt}>
              <div className="card-body">
                <div className="breakdown-head">
                  <span className="logo-mark" aria-hidden="true">
                    {b.logo}
                  </span>
                  <span className="breakdown-product">{b.product}</span>
                </div>
                <h3>{b.title}</h3>
                <div className="card-foot">
                  <div className="breakdown-meta">
                    <span className="tag">{b.category}</span>
                    <span>{b.readTime}</span>
                  </div>
                </div>
              </div>
            </button>
          </Reveal>
        ))}
      </ul>
      {open && <BreakdownModal breakdown={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

function BreakdownModal({ breakdown: b, onClose }: { breakdown: Breakdown; onClose: () => void }) {
  const sections: { title: string; body: React.ReactNode }[] = [
    {
      title: "The Product & Context",
      body: b.context.map((p) => <p key={p}>{p}</p>),
    },
    {
      title: "Target Users & Jobs-to-be-Done",
      body: (
        <ul>
          {b.users.map((u) => {
            const [who, ...rest] = u.split(": ");
            return (
              <li key={u}>
                <strong>{who}:</strong> {rest.join(": ")}
              </li>
            );
          })}
        </ul>
      ),
    },
    {
      title: "What Works (and why)",
      body: (
        <ul>
          {b.works.map((w) => (
            <li key={w.point}>
              <strong>{w.point}</strong> {w.why}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "Friction Points & Opportunities",
      body: (
        <ul>
          {b.friction.map((f) => (
            <li key={f.point}>
              <strong>{f.point}</strong> {f.opportunity}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "My Recommendation",
      body: (
        <>
          <div className="callout">
            <span className="callout-label">Top priority</span>
            <p>{b.recommendation.feature}</p>
          </div>
          <ul>
            {b.recommendation.rationale.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </>
      ),
    },
    {
      title: "Success Metrics",
      body: (
        <>
          <div className="callout">
            <span className="callout-label">North star</span>
            <p>{b.metrics.northStar}</p>
          </div>
          <ul>
            {b.metrics.supporting.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </>
      ),
    },
    {
      title: "Risks & Tradeoffs",
      body: (
        <ul>
          {b.risks.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <Modal labelledBy="breakdown-modal-title" onClose={onClose}>
      <article className="modal-content">
        <header className="modal-header">
          <div className="breakdown-head">
            <span className="logo-mark" aria-hidden="true">
              {b.logo}
            </span>
            <span className="breakdown-product">
              {b.product} · {b.readTime}
            </span>
          </div>
          <h2 id="breakdown-modal-title">{b.title}</h2>
          <span className="tag">{b.category}</span>
        </header>
        {sections.map((s, i) => (
          <section key={s.title} className="prose-section">
            <h3>
              <span className="prose-num">{String(i + 1).padStart(2, "0")}</span>
              {s.title}
            </h3>
            {s.body}
          </section>
        ))}
      </article>
    </Modal>
  );
}
