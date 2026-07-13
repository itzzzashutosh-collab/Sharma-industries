"use client";

import React, { useState } from "react";
import { Award, CheckCircle2, Lock, Flame, ShieldCheck, Zap, Info } from "lucide-react";

interface Props {
  initialData: {
    profile: {
      total_tokens: number;
    };
  };
}

export function AchievementsClient({ initialData }: Props) {
  const [profile] = useState(initialData.profile);
  const totalTokens = Number(profile.total_tokens || 0);

  const milestones = [
    { id: "starter", title: "Swatch Starter", desc: "Scan your first Swatch paint coupon", req: 100, unlocked: totalTokens >= 100 },
    { id: "silver", title: "Silver Master", desc: "Reach 500 lifetime reward points", req: 500, unlocked: totalTokens >= 500 },
    { id: "gold", title: "Gold Partner", desc: "Reach 1,000 lifetime reward points", req: 1000, unlocked: totalTokens >= 1000 },
    { id: "platinum", title: "Platinum Legend", desc: "Reach 2,500 lifetime reward points", req: 2500, unlocked: totalTokens >= 2500 },
    { id: "elite", title: "Elite Club Member", desc: "Complete 10 projects and 5,000 points", req: 5000, unlocked: totalTokens >= 5000 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Profile</span><span className="opacity-40">/</span><span className="text-foreground">Achievements</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Unlocked Achievements</h1>
      </div>

      {/* Loyalty Score Card */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-3.5 shadow-sm">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><ShieldCheck size={14} className="text-primary" /> Loyalty Health Rating</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-black text-emerald-600 uppercase tracking-wide">Excellent Status</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">High coupon verification success rates</p>
          </div>
          <Flame size={28} className="text-orange-500 fill-orange-500/10" />
        </div>
      </div>

      {/* Milestones grid */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Growth Roadmap Milestones</h3>
        {milestones.map((m) => (
          <div key={m.id} className={`bg-card border rounded-2xl p-4 flex items-center gap-4 transition-all shadow-sm ${
            m.unlocked ? "border-border" : "border-border/40 opacity-60"
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
              m.unlocked ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted border-border/40 text-muted-foreground"
            }`}>
              {m.unlocked ? <Award size={18} /> : <Lock size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-foreground">{m.title}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
            </div>
            {m.unlocked && <CheckCircle2 size={15} className="text-primary fill-primary/10 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}
