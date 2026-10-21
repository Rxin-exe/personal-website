import { experiment } from "@/content/site";
import type { Variant } from "@/lib/experiment";

const storageKey = (suffix: string) => `ab:${experiment.id}:${suffix}`;

export function currentVariant(): Variant {
  return document.documentElement.getAttribute("data-ab") === "B" ? "B" : "A";
}

/** Sends an exposure or click once per visitor. */
export function track(event: "exposure" | "click") {
  if (navigator.webdriver) return;
  try {
    if (localStorage.getItem(storageKey(event))) return;
    localStorage.setItem(storageKey(event), "1");
  } catch {
    // Storage blocked: still count, at the cost of possible repeats.
  }
  const body = JSON.stringify({ variant: currentVariant(), event });
  const sent = navigator.sendBeacon?.("/api/experiment", new Blob([body], { type: "application/json" }));
  if (!sent) {
    fetch("/api/experiment", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  }
}
