import { education, experience } from "@/content/site";
import SectionHead from "./SectionHead";
import WipeLink from "./WipeLink";

/** Experience as one organised table: who and when, what happened, and the number. */
export default function Experience() {
  return (
    <section id="experience" className="container section" aria-labelledby="experience-title">
      <SectionHead id="experience" />
      <ol className="roles">
        {experience.map((x) => (
          <li key={x.org} className={`role ${x.dates.includes("now") ? "is-current" : ""}`}>
            <div className="role-who">
              <h3>{x.org}</h3>
              <p>{x.role}</p>
              <p className="role-dates">{x.dates}</p>
            </div>
            <div className="role-result">
              <p>{x.result}</p>
              {x.href && (
                <WipeLink href={x.href} className="role-link">
                  Read the case study
                </WipeLink>
              )}
            </div>
            {x.metric && (
              <p className="role-metric">
                <span className="metric-value">{x.metric.value}</span>
                <span className="role-metric-label">{x.metric.label}</span>
              </p>
            )}
          </li>
        ))}
        <li className="role is-current">
          <div className="role-who">
            <h3>{education.school}</h3>
            <p>Education</p>
            <p className="role-dates">{education.dates}</p>
          </div>
          <p className="role-result">{education.degree}</p>
        </li>
      </ol>
    </section>
  );
}
