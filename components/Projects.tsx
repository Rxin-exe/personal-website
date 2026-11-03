"use client";

import { projects, type Project } from "@/content/site";
import CopyLink from "./CopyLink";
import Modal from "./Modal";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { useHashModal } from "./useHashModal";

export default function Projects() {
  const { open, show, close } = useHashModal("project", projects, "projects");

  return (
    <section id="projects" className="container section" aria-labelledby="projects-title">
      <SectionHead id="projects" />
      <ol className="cases">
        {projects.map((p, i) => (
          <Reveal as="li" key={p.id}>
            <button className="case" onClick={() => show(p)} aria-haspopup="dialog">
              <div className="case-cover" style={{ background: p.cover }} aria-hidden="true">
                {p.image ? (
                  <img src={p.image} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className="case-cover-mark">{p.title}</span>
                )}
              </div>
              <div className="case-body">
                <span className="case-index">Project {String(i + 1).padStart(2, "0")}</span>
                <h3>{p.title}</h3>
                <p className="case-problem">{p.problem}</p>
                <div className="case-metric">
                  <span className="case-metric-value">{p.metric.value}</span>
                  <span className="case-metric-label">{p.metric.label}</span>
                </div>
                <div className="case-foot">
                  <span className="tags">
                    {p.tags.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </span>
                  <span className="case-cta">
                    View project <span aria-hidden="true">→</span>
                  </span>
                </div>
              </div>
            </button>
          </Reveal>
        ))}
      </ol>
      {open && <ProjectModal project={open} onClose={close} />}
    </section>
  );
}

function ProjectModal({ project: p, onClose }: { project: Project; onClose: () => void }) {
  const sections: { title: string; body: React.ReactNode }[] = [
    { title: "Problem", body: <p>{p.problemDetail}</p> },
    { title: "Users", body: <p>{p.users}</p> },
    { title: "My Role", body: <p>{p.role}</p> },
    {
      title: "Approach",
      body: (
        <ul>
          {p.approach.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      ),
    },
    { title: "Solution", body: <p>{p.solution}</p> },
    {
      title: "Results & Metrics",
      body: (
        <ul className="result-list">
          {p.results.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ),
    },
    ...(p.next ? [{ title: "What I'd Do Next", body: <p>{p.next}</p> }] : []),
  ];

  return (
    <Modal labelledBy="project-modal-title" onClose={onClose}>
      {p.image && (
        <div className="modal-cover" style={{ background: p.cover }} aria-hidden="true">
          <img src={p.image} alt="" loading="lazy" decoding="async" />
        </div>
      )}
      <div className="modal-content">
        <header className="modal-header">
          <span className="tags">
            {p.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </span>
          <h2 id="project-modal-title">{p.title}</h2>
          <p className="modal-lede">{p.problem}</p>
          <div className="modal-meta">
            <div className="case-metric">
              <span className="case-metric-value">{p.metric.value}</span>
              <span className="case-metric-label">{p.metric.label}</span>
            </div>
            <CopyLink />
          </div>
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
        {p.links && p.links.length > 0 && (
          <div className="modal-links">
            {p.links.map((l) => (
              <a key={l.label} href={l.href} className="btn btn-secondary btn-sm" target="_blank" rel="noopener noreferrer">
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
