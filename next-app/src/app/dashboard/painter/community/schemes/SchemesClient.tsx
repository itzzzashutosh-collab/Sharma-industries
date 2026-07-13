"use client";

import React, { useState } from "react";
import { Sparkles, Calendar, ArrowRight } from "lucide-react";

interface Scheme {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
}

interface Props {
  initialData: {
    schemes: Scheme[];
  };
}

export function SchemesClient({ initialData }: Props) {
  const [schemes] = useState(initialData.schemes);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Community</span><span className="opacity-40">/</span><span className="text-foreground">Schemes</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Active Loyalty Schemes</h1>
      </div>

      {/* Schemes List */}
      <div className="space-y-4">
        {schemes.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">No active schemes currently available.</p>
        ) : schemes.map((s) => (
          <div key={s.id} className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden">
            <div className="space-y-1">
              <h3 className="font-black text-foreground text-xs">{s.title}</h3>
              {s.description && <p className="text-[10px] text-muted-foreground leading-relaxed">{s.description}</p>}
            </div>

            <div className="border-t border-border/40 pt-3 flex items-center gap-2 text-[9px] font-mono text-primary font-bold">
              <Calendar size={11} />
              <span>Valid from {s.start_date} to {s.end_date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
