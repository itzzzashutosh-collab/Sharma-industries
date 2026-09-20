import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JARVIS Brain — Neural Skill Constellation | Sharma Industries",
  description: "Interactive 48+ Legend Neural Skill Mesh for Swatch Paints",
};

export default function JarvisBrainPage() {
  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-[#030712] overflow-hidden rounded-xl border border-cyan-500/20 shadow-2xl">
      <iframe
        src="/jarvis_brain.html"
        title="JARVIS Neural Core"
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
      />
    </div>
  );
}
