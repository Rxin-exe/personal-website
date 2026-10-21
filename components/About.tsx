import { profile } from "@/content/site";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

export default function About() {
  return (
    <section id="about" className="container section" aria-labelledby="about-title">
      <SectionHead id="about" eyebrow="About" title="Data meets how people think." />
      <div className="about-grid">
        <Reveal className="about-copy">
          {profile.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Reveal>
        <Reveal className="strengths" delay={120}>
          <h3>Strengths</h3>
          <ul className="tags" style={{ listStyle: "none", padding: 0 }}>
            {profile.strengths.map((s) => (
              <li key={s} className="tag">
                {s}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
