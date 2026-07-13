"use client";

import React, { useState } from "react";
import { Award, CheckCircle2, Lock, Flame, ShieldCheck, Zap, Info, Trophy, Target, Star, Compass, Sparkles } from "lucide-react";

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

  const goals = [
    { id: "g1", title: "Complete 20 Projects", progress: 75, target: "20 Projects", current: "15 Completed" },
    { id: "g2", title: "Earn 10,000 points", progress: 40, target: "10,000 Pts", current: "4,000 Earned" },
    { id: "g3", title: "Attend 5 Dealer Meetings", progress: 100, target: "5 Meetings", current: "5 Attended" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Profile</span><span className="opacity-40">/</span><span className="text-foreground">Growth Center</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Business Growth Center</h1>
      </div>

      {/* Performance Score Card */}
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

      {/* Goal Center */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Target size={14} className="text-primary" /> Goal Center Tracker</h3>
        <div className="space-y-3">
          {goals.map((g) => (
            <div key={g.id} className="space-y-2 border-b border-border/40 pb-3 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-center font-bold">
                <span className="text-foreground">{g.title}</span>
                <span className="text-primary font-mono">{g.progress}%</span>
              </div>
              <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden border border-border/40">
                <div className="bg-primary h-full rounded-full" style={{ width: `${g.progress}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>{g.current}</span>
                <span>Target: {g.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Growth Coach */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex gap-3 text-xs bg-primary/5">
        <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-muted-foreground">
          <p className="font-bold text-foreground">AI Growth Coach</p>
          <p>• You are only 150 points away from unlocking Gold Partner benefits! Complete your current texture wall project to speed up your rank progression.</p>
        </div>
      </div>

      {/* Milestones grid */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Trophy size={14} className="text-primary" /> Digital Trophy Room</h3>
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
