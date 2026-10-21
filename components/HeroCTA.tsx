"use client";

import { useEffect } from "react";
import { experiment } from "@/content/site";
import { track } from "./abClient";

/** The hero's primary button, rendered in both variants; CSS shows the visitor's one. */
export default function HeroCTA() {
  useEffect(() => track("exposure"), []);

  return (
    <a href="#breakdowns" className="btn btn-primary" onClick={() => track("click")}>
      <span className="ab-A">{experiment.variants.A}</span>
      <span className="ab-B">{experiment.variants.B}</span>
    </a>
  );
}
