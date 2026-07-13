"use client";

import React, { useState } from "react";
import { UserCheck, Copy, Share2, Sparkles, CheckCircle } from "lucide-react";

interface Props {
  initialData: {
    profile: {
      id: string;
      name: string;
    };
  };
}

export function ReferralsClient({ initialData }: Props) {
  const [profile] = useState(initialData.profile);
  const refCode = `SWATCH-${profile.name.slice(0, 3).toUpperCase()}-${profile.id.slice(0, 4).toUpperCase()}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(refCode);
    alert("Referral code copied to clipboard!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Rewards</span><span className="opacity-40">/</span><span className="text-foreground">Referrals</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Referral Program</h1>
      </div>

      {/* Refer Card */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm text-center relative overflow-hidden">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
          <UserCheck size={20} />
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Invite Other Painters</h3>
          <p className="text-[10px] text-muted-foreground">Share your code and get 200 bonus reward points once they scan their first Swatch Paint coupon!</p>
        </div>

        <div className="bg-muted/40 border border-border/40 rounded-xl p-3 flex items-center justify-between font-mono max-w-xs mx-auto">
          <span className="font-bold text-foreground">{refCode}</span>
          <button onClick={copyToClipboard} className="p-1 rounded hover:bg-muted text-muted-foreground"><Copy size={13} /></button>
        </div>
      </div>
    </div>
  );
}
