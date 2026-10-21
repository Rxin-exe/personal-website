import { profile } from "@/content/site";
import HeroCTA from "./HeroCTA";
import HeroParticles from "./HeroParticles";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

export default function Hero() {
  return (
    <section id="top" className="container hero" aria-labelledby="hero-name">
      <div className="hero-glow" aria-hidden="true" />
      <HeroParticles />
      {profile.showPhoto && (
        <div className="hero-photo hero-item" style={delay(0)}>
          <img src={profile.photo} alt={profile.photoAlt} width={220} height={220} fetchPriority="high" />
        </div>
      )}
      <h1 id="hero-name" className="hero-name hero-item" style={delay(120)}>
        {profile.name}
      </h1>
      <p className="hero-headline hero-item" style={delay(220)}>
        {profile.headline}
      </p>
      <p className="hero-value hero-item" style={delay(320)}>
        {profile.valueStatement}
      </p>
      <div className="hero-actions hero-item" style={delay(440)}>
        <HeroCTA />
        <a href="#contact" className="btn btn-secondary">
          Get in touch
        </a>
      </div>
    </section>
  );
}
