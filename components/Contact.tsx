"use client";

import { useEffect, useRef, useState } from "react";
import { contact, sections } from "@/content/site";
import DitherScene from "./DitherScene";
import { ArrowUpRight, Check, Copy } from "./icons";
import { sound } from "@/lib/sound";

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
    sound.success();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="contact-wrap" aria-labelledby="contact-title">
      <DitherScene scene="camp" className="contact-scene" />
      <div className="container contact">
        <h2 id="contact-title" className="section-title">
          {sections.contact.title}
        </h2>
        <p className="section-intro">{sections.contact.intro}</p>
        <div className="contact-email">
          <a href={`mailto:${contact.email}`} className="btn btn-primary btn-lg">
            {contact.email}
          </a>
          <button
            type="button"
            className={`btn btn-ghost btn-lg btn-icon ${copied ? "is-done" : ""}`}
            onClick={copy}
            aria-label={copied ? "Email copied" : "Copy email address"}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {copied ? "Email address copied" : ""}
          </span>
        </div>
        <ul className="contact-links">
          <li>
            <a href={contact.resume} target="_blank" rel="noopener noreferrer">
              Resume <ArrowUpRight size={14} />
            </a>
          </li>
          <li>
            <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn <ArrowUpRight size={14} />
            </a>
          </li>
          <li>
            <a href={contact.github} target="_blank" rel="noopener noreferrer">
              GitHub <ArrowUpRight size={14} />
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
