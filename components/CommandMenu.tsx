"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { breakdowns, contact, nav, projects } from "@/content/site";

type Item = { group: string; label: string; hint?: string; run: () => void };

const goTo = (id: string) => {
  history.replaceState(null, "", `#${id}`);
  document.getElementById(id)?.scrollIntoView({ block: "start" });
};
const openHash = (hash: string) => {
  window.location.hash = hash; // the section's useHashModal picks this up
};

/** ⌘K / Ctrl+K (or "/") jump menu: every section, project and breakdown in one list. */
export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const items = useMemo<Item[]>(
    () => [
      ...projects.map((p) => ({ group: "Projects", label: p.title, hint: `${p.metric.value} ${p.metric.label}`, run: () => openHash(`project/${p.id}`) })),
      ...breakdowns.map((b) => ({ group: "Breakdowns", label: b.title, hint: b.product, run: () => openHash(`breakdown/${b.id}`) })),
      ...nav.map((n) => ({ group: "Sections", label: n.label, run: () => goTo(n.id) })),
      { group: "Links", label: "Resume (PDF)", run: () => window.open(contact.resume, "_blank", "noopener") },
      { group: "Links", label: "Email", hint: contact.email, run: () => (window.location.href = `mailto:${contact.email}`) },
      { group: "Links", label: "LinkedIn", run: () => window.open(contact.linkedin, "_blank", "noopener") },
    ],
    []
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => `${i.label} ${i.hint ?? ""} ${i.group}`.toLowerCase().includes(q));
  }, [items, query]);

  // Open with ⌘K, Ctrl+K, "/" or the nav button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing && !document.body.classList.contains("modal-open"))) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-menu", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-menu", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setActive(0);
    inputRef.current?.focus();
    return () => openerRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    document.getElementById(`cmd-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const choose = (item: Item | undefined) => {
    if (!item) return;
    openerRef.current = null; // don't yank focus back to the opener after navigating
    setOpen(false);
    item.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === "Tab") {
      e.preventDefault(); // focus stays in the input; arrows move through results
    }
  };

  let lastGroup = "";
  return createPortal(
    <div className="cmd-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="cmd" role="dialog" aria-modal="true" aria-label="Jump to" onKeyDown={onKeyDown}>
        <div className="cmd-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a project, breakdown or section…"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-list"
            aria-activedescendant={results.length ? `cmd-${active}` : undefined}
            aria-autocomplete="list"
          />
          <kbd>esc</kbd>
        </div>
        <ul id="cmd-list" className="cmd-list" role="listbox" aria-label="Results">
          {results.length === 0 && <li className="cmd-empty">Nothing matches “{query}”.</li>}
          {results.map((item, i) => {
            const header = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            return (
              <li key={`${item.group}-${item.label}`} role="presentation">
                {header && <span className="cmd-group">{header}</span>}
                <div
                  id={`cmd-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={`cmd-item ${i === active ? "is-active" : ""}`}
                  onMouseMove={() => setActive(i)}
                  onClick={() => choose(item)}
                >
                  <span className="cmd-label">{item.label}</span>
                  {item.hint && <span className="cmd-hint">{item.hint}</span>}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="cmd-foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> move
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
