"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { projects, type Project } from "@/content/site";
import DitherImage from "./DitherImage";
import SectionHead from "./SectionHead";
import WipeLink from "./WipeLink";

export default function Projects() {
  const router = useRouter();
  const [featured, ...rest] = projects;

  // Old shared links (#project/sendo) now live at /work/sendo.
  useEffect(() => {
    const [head, id] = window.location.hash.slice(1).split("/");
    if (head === "project" && projects.some((p) => p.id === id)) router.replace(`/work/${id}`);
  }, [router]);

  return (
    <section id="projects" className="container section" aria-labelledby="projects-title">
      <SectionHead id="projects" />
      <ul className="projects">
        <li className="project-featured">
          <ProjectCard project={featured} featured />
        </li>
        {rest.map((p) => (
          <li key={p.id}>
            <ProjectCard project={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProjectCard({ project: p, featured = false }: { project: Project; featured?: boolean }) {
  return (
    <WipeLink href={`/work/${p.id}`} className={`card has-dither ${featured ? "card-featured" : ""}`}>
      {p.image && (
        <div className="card-media">
          <DitherImage src={p.image} priority={featured} />
        </div>
      )}
      <div className="card-body">
        <p className="card-context">{p.context}</p>
        <h3>{p.title}</h3>
        <p className="card-problem">{p.problem}</p>
        <div className="metric">
          <span className="metric-value">{p.metric.value}</span>
          <span className="metric-label">{p.metric.label}</span>
        </div>
        <span className="card-cta">Read the case study</span>
      </div>
    </WipeLink>
  );
}
