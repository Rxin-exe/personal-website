"use client";

import { useEffect, useState } from "react";
import { contact, nav, profile } from "@/content/site";

export default function Nav() {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      // The active section is the last one whose top has passed ~40% of the viewport.
      const marker = window.innerHeight * 0.4;
      let current = "";
      for (const { id } of nav) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= marker) current = id;
      }
      // At the very bottom, the last section wins even if it's short.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = nav[nav.length - 1].id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`nav ${scrolled ? "is-scrolled" : ""}`}>
      <nav className="container nav-inner" aria-label="Primary">
        <a href="#top" className="logo" aria-label={`${profile.name}, back to top`}>
          {profile.initials}
        </a>
        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-links"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
        <ul id="nav-links" className={`nav-links ${open ? "is-open" : ""}`}>
          {nav.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={active === id ? "is-active" : ""}
                aria-current={active === id ? "true" : undefined}
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            </li>
          ))}
          <li>
            <a href={contact.resume} className="nav-resume" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
              Resume
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
