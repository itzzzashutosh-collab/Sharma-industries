"use client";

import React, { useState } from "react";
import { UserCheck, Copy, Share2, Sparkles, CheckCircle, Smartphone, MapPin, Calendar, Award } from "lucide-react";

interface ReferredPainter {
  id: string;
  name: string;
  phone: string;
  status: string;
  total_tokens: number;
  created_at: string;
}

interface Props {
  initialData: {
    profile: {
      id: string;
      name: string;
    };
    list: ReferredPainter[];
  };
}

export function ReferralsClient({ initialData }: Props) {
  const [profile] = useState(initialData.profile);
  const [list] = useState(initialData.list);

  const refCode = `SWATCH-${profile.name.slice(0, 3).toUpperCase()}-${profile.id.slice(0, 4).toUpperCase()}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(refCode);
    alert("Referral code copied to clipboard!");
  };

  const activeReferralsCount = list.filter(p => p.status === "Active" || Number(p.total_tokens) > 0).length;

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
          <p className="text-[10px] text-muted-foreground">Share your code and earn 200 reward points once they scan their first Swatch Paint coupon!</p>
        </div>

        <div className="bg-muted/40 border border-border/40 rounded-xl p-3 flex items-center justify-between font-mono max-w-xs mx-auto">
          <span className="font-bold text-foreground">{refCode}</span>
          <button onClick={copyToClipboard} className="p-1 rounded hover:bg-muted text-muted-foreground"><Copy size={13} /></button>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-card border border-border rounded-xl p-3 shadow-xs">
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">Total Invited</span>
          <p className="font-mono font-black text-sm mt-0.5">{list.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 shadow-xs">
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">Active</span>
          <p className="font-mono font-black text-sm mt-0.5 text-emerald-600">{activeReferralsCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 shadow-xs">
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">Bonus Points</span>
          <p className="font-mono font-black text-sm mt-0.5 text-amber-500">+{activeReferralsCount * 200}</p>
        </div>
      </div>

      {/* Referred Painters Directory */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider">My Network Members</h3>
        {list.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">No referred painters yet.</p>
        ) : list.map((ref) => {
          const isActive = ref.status === "Active" || Number(ref.total_tokens) > 0;
          return (
            <div key={ref.id} className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-foreground">{ref.name}</h4>
                <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase font-mono border ${
                  isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                }`}>
                  {isActive ? "Activated" : "Registered"}
                </span>
              </div>

              <div className="border-t border-border/40 pt-2 grid grid-cols-2 gap-2 text-[10px] font-mono text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Smartphone size={11} /> <span>{ref.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <Calendar size={11} /> <span>{new Date(ref.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {isActive && (
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-xl flex items-center justify-between text-[10px] text-emerald-700 font-bold">
                  <span className="flex items-center gap-1"><Award size={12} /> Referral Reward Issued</span>
                  <span>+200 Pts</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
