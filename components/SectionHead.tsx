import Reveal from "./Reveal";

export default function SectionHead({ id, eyebrow, title, intro }: { id: string; eyebrow: string; title: string; intro?: string }) {
  return (
    <Reveal className="section-head">
      <span className="eyebrow">{eyebrow}</span>
      <h2 id={`${id}-title`} className="section-title">
        {title}
      </h2>
      {intro && <p className="section-intro">{intro}</p>}
    </Reveal>
  );
}
