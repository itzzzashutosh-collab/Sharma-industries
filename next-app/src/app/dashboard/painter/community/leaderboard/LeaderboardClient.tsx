"use client";

import React, { useState } from "react";
import { BarChart2, Star, Trophy, Medal } from "lucide-react";

export function LeaderboardClient() {
  const [board] = useState([
    { rank: 1, name: "Rajesh Kumar", points: 850, rating: 4.9, active: true },
    { rank: 2, name: "Amit Sharma", points: 1200, rating: 4.8, active: false },
    { rank: 3, name: "Mahendra Choudhary", points: 1100, rating: 4.7, active: false }
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Community</span><span className="opacity-40">/</span><span className="text-foreground">Leaderboard</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Top Painter Standings</h1>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><BarChart2 size={14} className="text-primary" /> City Rank Standings</h3>
        <div className="space-y-3">
          {board.map((item) => (
            <div key={item.rank} className={`flex items-center justify-between p-3 rounded-2xl border ${
              item.active ? "border-primary bg-primary/5" : "border-border/40 bg-muted/20"
            }`}>
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  item.rank === 1 ? "bg-amber-500 text-white" :
                  item.rank === 2 ? "bg-slate-400 text-white" :
                  "bg-orange-400 text-white"
                }`}>
                  {item.rank}
                </span>
                <div>
                  <p className="font-bold text-foreground">{item.name} {item.active && "(You)"}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{item.points} Points</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-500 font-mono font-bold text-[10px]">
                <Star size={11} className="fill-amber-500" /> {item.rating}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
