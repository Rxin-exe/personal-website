"use client";

import { useEffect, useRef, useState } from "react";
import { Check, LinkIcon } from "./icons";
import { sound } from "@/lib/sound";

/** Copies the current page URL (which includes the write-up's hash). */
export default function CopyLink() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      return;
    }
    setCopied(true);
    sound.success();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button type="button" className={`btn btn-ghost btn-sm ${copied ? "is-done" : ""}`} onClick={copy} aria-live="polite">
      {copied ? <Check size={14} /> : <LinkIcon size={14} />}
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}
