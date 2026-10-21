"use client";

import { useState } from "react";
import { projects, type Project } from "@/content/site";
import Modal from "./Modal";
import { tilt } from "./tilt";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

export default function Projects() {
  const [open, setOpen] = useState<Project | null>(null);

  return (
    <section id="projects" className="container section" aria-labelledby="projects-title">
      <SectionHead id="projects" eyebrow="Projects" title="Things I've built" intro="Real problems, real users, measurable outcomes." />
      <ul className={`grid ${projects.length === 2 ? "grid-2" : ""}`} style={{ listStyle: "none", padding: 0 }}>
        {projects.map((p, i) => (
          <Reveal as="li" key={p.id} delay={i * 90}>
            <button className="card" onClick={() => setOpen(p)} aria-haspopup="dialog" {...tilt}>
              <div className="card-cover" style={{ background: p.cover }} aria-hidden={!p.image}>
                {p.image ? (
                  <img src={p.image} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className="card-cover-label">{p.tags[0]}</span>
                )}
              </div>
              <div className="card-body">
                <h3>{p.title}</h3>
                <p>{p.problem}</p>
                <div className="card-foot">
                  <span className="card-result">{p.result}</span>
                  <span className="tags">
                    {p.tags.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            </button>
          </Reveal>
        ))}
      </ul>
      {open && <ProjectModal project={open} onClose={() => setOpen(null)} />}
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
      <div className="modal-cover" style={{ background: p.cover }} aria-hidden="true">
        {p.image && <img src={p.image} alt="" loading="lazy" decoding="async" />}
      </div>
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
