"use client";

import { useEffect, useRef, useState } from "react";
import { contact } from "@/content/site";
import Reveal from "./Reveal";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
    } catch {
      // Fallback for browsers without the async clipboard API.
      const input = document.createElement("textarea");
      input.value = contact.email;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="container section" aria-labelledby="contact-title">
      <Reveal className="contact">
        <span className="eyebrow">Contact</span>
        <h2 id="contact-title" className="section-title">
          {contact.heading}
        </h2>
        <p className="section-intro">{contact.line}</p>
        <div className="email-row">
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <button className="btn btn-primary btn-sm" onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="contact-actions">
          <a href={contact.resume} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5M9 13h6M9 17h6" />
            </svg>
            Resume
          </a>
          <a href={contact.linkedin} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
            </svg>
            LinkedIn
          </a>
        </div>
      </Reveal>
      <div className={`toast ${copied ? "is-visible" : ""}`} role="status" aria-live="polite">
        {copied ? "Copied!" : ""}
      </div>
    </section>
  );
}
