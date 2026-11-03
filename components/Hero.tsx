import { contact, profile, site } from "@/content/site";
import HeroParticles from "./HeroParticles";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

export default function Hero() {
  return (
    <section id="top" className="container hero" aria-labelledby="hero-name">
      <HeroParticles />
      <div className="hero-grid">
        <div className="hero-main">
          {profile.showPhoto && (
            <div className="hero-photo hero-item" style={delay(0)}>
              <img src={profile.photo} alt={profile.photoAlt} width={120} height={120} fetchPriority="high" />
            </div>
          )}
          <h1 id="hero-name" className="hero-name hero-item" style={delay(80)}>
            {profile.name}
          </h1>
          <p className="hero-headline hero-item" style={delay(160)}>
            {profile.headline}
          </p>
          <p className="hero-value hero-item" style={delay(240)}>
            {profile.valueStatement}
          </p>
          <div className="hero-actions hero-item" style={delay(320)}>
            <a href="#projects" className="btn btn-primary">
              See my projects
            </a>
            <a href={`mailto:${contact.email}`} className="btn btn-secondary">
              Email me
            </a>
          </div>
        </div>

        <aside className="glance hero-item" style={delay(420)} aria-labelledby="glance-title">
          <div className="glance-head">
            <span id="glance-title">At a glance</span>
            <span>Updated {site.updated}</span>
          </div>
          <dl className="glance-list">
            {profile.glance.map((row) => (
              <div key={row.label} className="glance-row">
                <dt>{row.label}</dt>
                <dd>
                  {row.live && <span className="status-dot" aria-hidden="true" />}
                  {row.href ? (
                    <a href={row.href}>
                      {row.value} <span aria-hidden="true">→</span>
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}
