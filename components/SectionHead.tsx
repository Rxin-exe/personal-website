import { sections } from "@/content/site";
import DitherScene from "./DitherScene";

/** Section title, optional intro, and the dithered horizon line that echoes the hero. */
export default function SectionHead({ id }: { id: "experience" | "projects" | "breakdowns" }) {
  const s = sections[id];
  return (
    <div className="section-head">
      <h2 id={`${id}-title`} className="section-title">
        {s.title}
      </h2>
      {s.intro && <p className="section-intro">{s.intro}</p>}
      <DitherScene scene="rule" className="section-rule" />
    </div>
  );
}
