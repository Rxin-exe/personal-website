import { contact, profile } from "@/content/site";
import DitherScene from "./DitherScene";
import { ArrowDown } from "./icons";

export default function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-name">
      <DitherScene scene="summit" />
      <div className="container hero-inner">
        <div className="hero-copy">
        <p className="hero-status">
          <span className="status-dot" aria-hidden="true" />
          {profile.status}
        </p>
        <h1 id="hero-name" className="hero-name" aria-label={profile.name}>
          {/* One span per letter, so the entrance can print the name a letter at a time. */}
          {[...profile.name].map((ch, i) => (
            <span key={i} aria-hidden="true" style={{ "--i": i } as React.CSSProperties}>
              {ch}
            </span>
          ))}
        </h1>
        <p className="hero-bio">{profile.bio}</p>
        <div className="hero-actions">
          <a href={`mailto:${contact.email}`} className="btn btn-primary">
            Email me
          </a>
          <a href={contact.resume} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
            Resume
            <ArrowDown />
          </a>
        </div>
        </div>
      </div>
    </section>
  );
}
