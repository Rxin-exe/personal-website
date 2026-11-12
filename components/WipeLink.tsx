"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ComponentProps } from "react";
import { coverWipe, revealWipe } from "@/lib/wipe";

/**
 * A normal link (middle-click, cmd-click and right-click still work) that plays the
 * dither wipe from the click point before navigating.
 */
export default function WipeLink({ href, onClick, ...rest }: ComponentProps<typeof Link> & { href: string }) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={async (e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        await coverWipe(e.clientX, e.clientY);
        router.push(href);
      }}
      {...rest}
    />
  );
}

/** Lives in the root layout: when a new page has rendered, dissolve the wipe away. */
export function WipeReveal() {
  const pathname = usePathname();
  useEffect(() => {
    const raf = requestAnimationFrame(() => revealWipe());
    return () => cancelAnimationFrame(raf);
  }, [pathname]);
  return null;
}
