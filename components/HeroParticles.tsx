"use client";

import dynamic from "next/dynamic";

// Loaded after hydration so the canvas never delays first paint.
const SignalTerrain = dynamic(() => import("./SignalTerrain"), { ssr: false });

export default function HeroParticles() {
  return <SignalTerrain />;
}
