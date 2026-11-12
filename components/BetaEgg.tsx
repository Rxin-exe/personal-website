"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { coverWipe, revealWipe } from "@/lib/wipe";
import { breakdowns, experience, projects } from "@/content/site";
import Modal from "./Modal";

const WORD = "beta";

/**
 * Easter egg: type "beta" anywhere (climber slang for advice on a route) to see
 * everything on the site as a grade pyramid. All counts come from content/site.ts.
 */
export default function BetaEgg() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  /** Opens with the dither wipe, spreading from where it was found. */
  const reveal = async (x?: number, y?: number) => {
    await coverWipe(x, y);
    setOpen(true);
    requestAnimationFrame(() => revealWipe());
  };

  // The shooting star (or anything else) can open it.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<{ x: number; y: number }>).detail;
      reveal(d?.x, d?.y);
    };
    window.addEventListener("open-beta", onOpen);
    return () => window.removeEventListener("open-beta", onOpen);
  }, []);

  useEffect(() => {
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey || t?.closest("input, textarea, [contenteditable]")) return;
      if (e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-WORD.length);
      if (typed === WORD) {
        typed = "";
        reveal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  const [founded, ...hackathons] = projects;
  const roles = experience.filter((x) => x.org !== founded.title);
  const rows: { grade: string; label: string; blocks: { name: string; href: string }[] }[] = [
    { grade: "V6", label: "Founded", blocks: [{ name: founded.title, href: `/work/${founded.id}` }] },
    { grade: "V5", label: "Hackathon builds", blocks: hackathons.map((p) => ({ name: p.title.replace("Interactive ", "").replace(" Object", ""), href: `/work/${p.id}` })) },
    { grade: "V4", label: "Roles", blocks: roles.map((r) => ({ name: r.org, href: "#experience" })) },
    { grade: "V3", label: "Teardowns", blocks: breakdowns.map((b) => ({ name: b.product, href: `#breakdown/${b.id}` })) },
  ];

  const go = (href: string) => {
    setOpen(false);
    // Case studies are pages; teardowns and sections live on the home page.
    setTimeout(() => {
      if (href.startsWith("/work/")) router.push(href);
      else window.location.assign(`/${href}`);
    }, 50);
  };

  return (
    <Modal labelledBy="beta-title" onClose={() => setOpen(false)}>
      <div className="modal-content beta">
        <p className="card-context">You found the beta</p>
        <h2 id="beta-title">My grade pyramid</h2>
        <p className="modal-lede">Climbers chart their sends by grade: a few hard ones on top, more easier ones below. Here&apos;s everything on this site, charted the same way.</p>
        <div className="pyramid">
          {rows.map((row) => (
            <div key={row.grade} className="pyramid-row">
              <span className="grade">{row.grade}</span>
              <div className="pyramid-blocks">
                {row.blocks.map((b) => (
                  <button key={b.name} type="button" className="pyramid-block" onClick={() => go(b.href)}>
                    {b.name}
                  </button>
                ))}
              </div>
              <span className="pyramid-label">{row.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
