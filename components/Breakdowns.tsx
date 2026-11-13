"use client";

import { breakdowns, type Breakdown } from "@/content/site";
import { brandIcons } from "./brandIcons";
import CopyLink from "./CopyLink";
import Modal from "./Modal";
import PixelLogo from "./PixelLogo";
import SectionHead from "./SectionHead";
import { useHashModal } from "./useHashModal";
import { coverWipe, revealWipe } from "@/lib/wipe";

export default function Breakdowns() {
  const { open, show, close } = useHashModal("breakdown", breakdowns, "breakdowns");

  return (
    <section id="breakdowns" className="container section" aria-labelledby="breakdowns-title">
      <SectionHead id="breakdowns" />
      <ul className="teardowns">
        {breakdowns.map((b) => (
          <li key={b.id}>
            <button
              className="teardown"
              aria-haspopup="dialog"
              onClick={async (e) => {
                // Wipe out from the click (or the row's centre, for keyboard users).
                const r = e.currentTarget.getBoundingClientRect();
                const x = e.clientX || r.left + r.width / 2;
                const y = e.clientY || r.top + r.height / 2;
                await coverWipe(x, y);
                show(b);
                requestAnimationFrame(() => revealWipe());
              }}
            >
              <span className="teardown-top">
                <PixelLogo path={b.icon ? brandIcons[b.icon] : undefined} fallback={b.logo} />
                <span className="teardown-product">
                  {b.product}
                  <span className="teardown-category">{b.category}</span>
                </span>
              </span>
              <span className="teardown-title">{b.title}</span>
              <span className="teardown-ship">
                <span className="teardown-ship-tag">I&apos;d ship</span> {b.recommendation.pitch}
              </span>
              <span className="teardown-foot">
                <span className="teardown-cta">Read the teardown</span>
                <span className="teardown-meta">{b.readTime}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {open && <BreakdownModal breakdown={open} onClose={close} />}
    </section>
  );
}

function BreakdownModal({ breakdown: b, onClose }: { breakdown: Breakdown; onClose: () => void }) {
  const body: { title: string; content: React.ReactNode }[] = [
    { title: "Context", content: b.context.map((p) => <p key={p}>{p}</p>) },
    {
      title: "Who uses it, and for what",
      content: (
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
      title: "What works",
      content: (
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
      title: "Where it breaks",
      content: (
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
      title: "What I'd ship",
      content: (
        <>
          <p className="callout">{b.recommendation.feature}</p>
          <ul>
            {b.recommendation.rationale.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </>
      ),
    },
    {
      title: "How I'd measure it",
      content: (
        <>
          <p className="callout">{b.metrics.northStar}</p>
          <ul>
            {b.metrics.supporting.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </>
      ),
    },
    {
      title: "Risks",
      content: (
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
          <p className="card-context">
            {b.product} {b.category.toLowerCase()} teardown, {b.readTime}
          </p>
          <h2 id="breakdown-modal-title">{b.title}</h2>
          <div className="modal-actions">
            <CopyLink />
          </div>
        </header>
        {body.map((s) => (
          <section key={s.title} className="prose-section">
            <h3>{s.title}</h3>
            {s.content}
          </section>
        ))}
      </article>
    </Modal>
  );
}
