"use client";

import { useEffect } from "react";
import { contact, profile } from "@/content/site";

let said = false;

/** For anyone who opens the browser console: a pixel climber, a hello, and two secrets. */
export default function ConsoleHello() {
  useEffect(() => {
    if (said) return;
    said = true;
    const climber = ["    ▄▄", "   ████ ▄", "    ██ ▄▀", "   ████▀", "  ██████", "   █  █", "  ██  ██"].join("\n");
    console.log(
      `%c${climber}%c\n\nLooking under the hood? Hi, I'm ${profile.name.split(" ")[0]}.\n${profile.status}.\n${contact.email}\n\n%cPsst: try the Konami code, or type "beta".`,
      "color:#ff8b3d;font-family:monospace;line-height:1.1",
      "color:inherit;font-size:13px",
      "color:#949fc6;font-size:12px"
    );
  }, []);
  return null;
}
