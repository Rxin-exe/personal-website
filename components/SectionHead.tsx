import { sections } from "@/content/site";
import Reveal from "./Reveal";

/** Numbered section label, title and optional intro, all from `sections` in content/site.ts. */
export default function SectionHead({ id }: { id: keyof typeof sections }) {
  const s = sections[id];
  return (
    <Reveal className="section-head">
      <p className="section-index">
        <span className="section-num">{s.index}</span>
        {s.label}
      </p>
      <h2 id={`${id}-title`} className="section-title">
        {s.title}
      </h2>
      {s.intro && <p className="section-intro">{s.intro}</p>}
    </Reveal>
  );
}
