import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { profile, projects } from "@/content/site";
import CopyLink from "@/components/CopyLink";
import DitherImage from "@/components/DitherImage";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import WipeLink from "@/components/WipeLink";
import { ArrowUpRight } from "@/components/icons";

type Params = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const p = projects.find((x) => x.id === id);
  if (!p) return {};
  const title = `${p.title}, a case study by ${profile.name}`;
  return {
    title,
    description: p.problem,
    alternates: { canonical: `/work/${p.id}` },
    openGraph: { type: "article", url: `/work/${p.id}`, title, description: p.problem },
    twitter: { card: "summary_large_image", title, description: p.problem },
  };
}

export default async function CaseStudy({ params }: Params) {
  const { id } = await params;
  const index = projects.findIndex((x) => x.id === id);
  if (index < 0) notFound();
  const p = projects[index];
  const next = projects[(index + 1) % projects.length];

  const body: { title: string; content: React.ReactNode }[] = [
    { title: "Problem", content: <p>{p.problemDetail}</p> },
    { title: "Users", content: <p>{p.users}</p> },
    { title: "My role", content: <p>{p.role}</p> },
    {
      title: "Approach",
      content: (
        <ul>
          {p.approach.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      ),
    },
    { title: "Solution", content: <p>{p.solution}</p> },
    {
      title: "Results",
      content: (
        <ul>
          {p.results.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ),
    },
    ...(p.next ? [{ title: "What I'd do next", content: <p>{p.next}</p> }] : []),
  ];

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main" className="container case">
        <WipeLink href="/#projects" className="case-back">
          All projects
        </WipeLink>

        <header className="case-head">
          <p className="card-context">{p.context}</p>
          <h1>{p.title}</h1>
          <p className="case-lede">{p.problem}</p>
          <div className="metric">
            <span className="metric-value">{p.metric.value}</span>
            <span className="metric-label">{p.metric.label}</span>
          </div>
          <div className="modal-actions">
            {p.links?.map((l) => (
              <a key={l.label} href={l.href} className="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">
                {l.label}
                <ArrowUpRight size={14} />
              </a>
            ))}
            <CopyLink />
          </div>
        </header>

        {p.image && (
          <div className="case-banner has-dither">
            <DitherImage src={p.image} alt={`${p.title} screenshot`} priority />
          </div>
        )}

        <div className="case-body">
          {body.map((s) => (
            <section key={s.title} className="prose-section">
              <h2>{s.title}</h2>
              {s.content}
            </section>
          ))}
        </div>

        <nav className="case-next" aria-label="Next case study">
          <span>Next case study</span>
          <WipeLink href={`/work/${next.id}`}>{next.title}</WipeLink>
        </nav>
      </main>
      <Footer />
    </>
  );
}
