"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Close } from "./icons";
import { sound } from "@/lib/sound";

type Props = {
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
};

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function Modal({ labelledBy, onClose, children }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    document.body.classList.add("modal-open");
    sound.open();
    dialog?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      // Keep Tab focus inside the dialog.
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
      sound.open(true);
      opener?.focus({ preventScroll: true });
    };
  }, []);

  // Reading progress: how far through the write-up the visitor has scrolled.
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const max = el.scrollHeight - el.clientHeight;
    progressRef.current?.style.setProperty("--read", String(max > 0 ? el.scrollTop / max : 1));
  };

  return createPortal(
    <>
    <div ref={progressRef} className="modal-progress" aria-hidden="true" />
    <div
      className="modal-backdrop"
      onScroll={onScroll}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <Close />
        </button>
        {children}
      </div>
    </div>
    </>,
    document.body
  );
}
