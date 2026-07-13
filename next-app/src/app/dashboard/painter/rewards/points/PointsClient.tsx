"use client";

import React, { useState } from "react";
import { Award, Compass, Zap, Flame, Info } from "lucide-react";

interface Props {
  initialData: {
    profile: {
      total_tokens: number;
      total_redeemed: number;
    };
  };
}

export function PointsClient({ initialData }: Props) {
  const [profile] = useState(initialData.profile);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Rewards</span><span className="opacity-40">/</span><span className="text-foreground">Points</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Reward Points Wallet</h1>
      </div>

      {/* Points Card */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-muted-foreground uppercase">Available Balance</span>
            <p className="text-2xl font-black text-foreground font-mono mt-1">{profile.total_tokens || 0} Pts</p>
          </div>
          <Award size={28} className="text-amber-500" />
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4 font-mono text-[10px]">
          <div>
            <span className="text-muted-foreground">Lifetime Earned</span>
            <p className="font-bold text-foreground mt-0.5">{Number(profile.total_tokens || 0) + Number(profile.total_redeemed || 0)} Pts</p>
          </div>
          <div>
            <span className="text-muted-foreground">Total Redeemed</span>
            <p className="font-bold text-foreground mt-0.5">{profile.total_redeemed || 0} Pts</p>
          </div>
        </div>
      </div>

      {/* Rules Info */}
      <div className="bg-muted/30 border border-border/40 rounded-2xl p-4 flex gap-3 text-xs">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <div className="space-y-1.5 text-muted-foreground">
          <p className="font-bold text-foreground">Points Multipliers & Rules</p>
          <p>• Scanned coupons award between 100 to 500 points depending on Swatch Paint bucket sizes.</p>
          <p>• Double reward campaigns apply on waterproofing orders during Monsoon seasons.</p>
        </div>
      </div>
    </div>
  );
}
