"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { sound } from "@/lib/sound";

const HOVERABLE = 'a[href], button, [role="option"], summary, .scene-spot';
// These make their own sounds when clicked.
const OWN_CLICK = ".scene-spot, .shooting-star-catch, .sound-toggle";

/**
 * Wires sound to the whole page: starts the engine on the first gesture, ticks when the
 * mouse moves onto anything clickable, tocks on press, and pauses while the tab is hidden.
 */
export default function SoundFx() {
  useEffect(() => {
    const unlock = () => sound.unlock();
    // Capture, so the very first click (say, on the fire) is already audible.
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    window.addEventListener("touchstart", unlock, true);

    let current: Element | null = null;
    const leave = () => {
      if (current?.matches('[data-spot="fire"]')) sound.fireHover(false);
      current = null;
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = e.target instanceof Element ? e.target.closest(HOVERABLE) : null;
      if (el === current) return;
      leave();
      current = el;
      if (!el) return;
      const spot = el.getAttribute("data-spot");
      if (spot === "fire") sound.fireHover(true);
      else if (spot === "moon") sound.moon();
      else sound.hover();
    };
    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target.closest(HOVERABLE) : null;
      if (el && !el.closest(OWN_CLICK)) sound.press();
    };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        leave();
        sound.glow(0); // the cursor left the window
      }
    };
    const onVisibility = () => sound.visibility();

    document.addEventListener("pointerover", onOver);
    document.addEventListener("click", onClick, true);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      window.removeEventListener("touchstart", unlock, true);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}

const HINT_KEY = "sound-hint-seen";

/**
 * The nav's speaker button: sound on or off, remembered for next time. The icon waits for
 * the saved setting before drawing, so it never flashes "on" for someone who turned it off.
 * On a first visit (sound on) a small label points it out for a few seconds.
 */
export function SoundToggle() {
  const [on, setOn] = useState<boolean | null>(null);
  const [hint, setHint] = useState<{ top: number; right: number } | null>(null);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOn(sound.isOn());
    return sound.subscribe(setOn);
  }, []);

  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(HINT_KEY) === "1";
    } catch {
      // no storage: skip the hint
    }
    if (seen || !sound.isOn()) return;
    // Below the button, right-aligned to it. Fixed to the viewport: the nav panel clips.
    const place = () => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      setHint({ top: r.bottom + 12, right: window.innerWidth - r.right });
      // Only counts as seen once it has actually been shown.
      try {
        localStorage.setItem(HINT_KEY, "1");
      } catch {
        // ignore
      }
    };
    const show = setTimeout(place, 1200);
    const hide = setTimeout(() => setHint(null), 8000);
    const dismiss = () => setHint(null);
    window.addEventListener("scroll", dismiss, { once: true, passive: true });
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
      window.removeEventListener("scroll", dismiss);
    };
  }, []);

  const label = on === false ? "Turn sound on" : "Turn sound off";
  return (
    <>
      <button
        ref={ref}
        type="button"
        className="sound-toggle"
        aria-pressed={on ?? undefined}
        aria-label={label}
        title={on === false ? "Sound off" : "Sound on"}
        onClick={() => {
          setHint(null);
          sound.setOn(!sound.isOn());
        }}
      >
        {on !== null && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
            {on ? (
              <g className="sound-waves">
                <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
                <path d="M18 7a7 7 0 0 1 0 10" />
              </g>
            ) : (
              <path d="M16 9.5l5 5M21 9.5l-5 5" />
            )}
          </svg>
        )}
      </button>
      {hint &&
        createPortal(
          <p className="sound-hint" role="status" style={{ top: hint.top, right: hint.right }}>
            This site has sound. Click the speaker to mute.
          </p>,
          document.body
        )}
    </>
  );
}
