"use client";

import React, { useState } from "react";
import { Sparkles, Trophy, Calendar, Award } from "lucide-react";

interface Competition {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  reward_pool: string | null;
}

interface Props {
  initialData: {
    competitions: Competition[];
  };
}

export function CompetitionsClient({ initialData }: Props) {
  const [competitions] = useState(initialData.competitions);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Community</span><span className="opacity-40">/</span><span className="text-foreground">Competitions</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Active Painting Competitions</h1>
      </div>

      {/* Competitions List */}
      <div className="space-y-4">
        {competitions.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">No active competitions currently running.</p>
        ) : competitions.map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[8px] font-black border border-primary/20 bg-primary/10 text-primary uppercase flex items-center gap-1"><Trophy size={10} /> Active Event</span>
              {c.reward_pool && <span className="font-mono text-emerald-600 font-bold">{c.reward_pool}</span>}
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-foreground text-xs">{c.name}</h3>
              {c.description && <p className="text-[10px] text-muted-foreground leading-relaxed">{c.description}</p>}
            </div>

            <div className="border-t border-border/40 pt-3 flex items-center justify-between text-[9px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar size={11} /> Duration</span>
              <span className="font-bold text-foreground">{c.start_date} to {c.end_date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
