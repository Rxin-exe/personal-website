"use client";

import { useEffect, useState } from "react";
import { contact, nav, profile } from "@/content/site";

export default function Nav() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
      // The active section is the last one whose top has passed ~40% of the viewport.
      const marker = window.innerHeight * 0.4;
      let current = "";
      for (const { id } of nav) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= marker) current = id;
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

  return (
    <header className="nav">
      <nav className="container" aria-label="Primary">
        <div className="nav-panel">
          <a href="/" className="logo" aria-label={`${profile.name}, back to top`}>
            {profile.initials}
          </a>
          <ul className="nav-links">
            {nav.map(({ id, label }) => (
              <li key={id} className="nav-section">
                <a href={`/#${id}`} aria-current={active === id ? "true" : undefined}>
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${contact.email}`} className="btn btn-primary btn-sm">
                Email me
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
