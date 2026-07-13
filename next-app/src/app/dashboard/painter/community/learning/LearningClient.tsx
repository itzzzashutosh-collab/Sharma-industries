"use client";

import React, { useState } from "react";
import { BookOpen, Search, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";

export function LearningClient() {
  const [lessons] = useState([
    { id: "1", title: "Monsoon Wall Waterproofing Steps", time: "15 mins", desc: "Guide on crack repair, base primer thickness and waterproofing mesh application." },
    { id: "2", title: "Applying Luxury Rustic Texture Finishes", time: "25 mins", desc: "Detailed step guide on using stencils and steel trowel strokes." },
    { id: "3", title: "Putty Prep & Sanding safety rules", time: "10 mins", desc: "Drying time indicators, dust protection masks and sandpaper grit selection." }
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Community</span><span className="opacity-40">/</span><span className="text-foreground">Learning</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Training & Learning Center</h1>
      </div>

      {/* Guides List */}
      <div className="space-y-4">
        {lessons.map((less) => (
          <div key={less.id} className="bg-card border border-border rounded-2xl p-4 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[8px] font-black border border-primary/20 bg-primary/10 text-primary uppercase flex items-center gap-1 font-mono">{less.time}</span>
              <CheckCircle2 size={13} className="text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-xs">{less.title}</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">{less.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
