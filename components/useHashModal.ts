"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Ties a modal to the URL, so every project and breakdown has a link you can share:
 * `#project/sendo` opens Sendo on load, and opening a card writes that hash.
 */
export function useHashModal<T extends { id: string }>(prefix: string, items: T[], sectionId: string) {
  const [open, setOpen] = useState<T | null>(null);

  useEffect(() => {
    const sync = () => {
      const [head, id] = window.location.hash.slice(1).split("/");
      const item = head === prefix ? items.find((i) => i.id === decodeURIComponent(id ?? "")) : undefined;
      if (!item) return;
      // Put the section behind the modal, so closing it lands somewhere that makes sense.
      document.getElementById(sectionId)?.scrollIntoView({ block: "start", behavior: "instant" });
      setOpen(item);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [prefix, items, sectionId]);

  const show = useCallback(
    (item: T) => {
      history.replaceState(null, "", `#${prefix}/${item.id}`);
      setOpen(item);
    },
    [prefix]
  );

  const close = useCallback(() => {
    history.replaceState(null, "", `#${sectionId}`);
    setOpen(null);
  }, [sectionId]);

  return { open, show, close };
}
