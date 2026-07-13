"use client";

import React, { useState, useTransition } from "react";
import { Sparkles, Wallet, Award, CheckCircle, Clock, Calendar, ArrowRight, Scan, PlusCircle, HelpCircle, X } from "lucide-react";
import { scanPainterCoupon } from "./actions";

interface Props {
  initialData: {
    profile: {
      name: string;
      phone: string;
      locality: string | null;
    };
    metrics: {
      cashWallet: number;
      rewardPoints: number;
      pendingCoupons: number;
      approvedCoupons: number;
      currentRank: string;
      referralEarnings: number;
      completedProjects: number;
    };
    activities: { id: string; type: string; desc: string; time: string }[];
    upcomingMeeting: { name: string; date: string; time: string; venue: string } | null;
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export function PainterDashboardClient({ initialData }: Props) {
  const [profile, setProfile] = useState(initialData.profile);
  const [metrics, setMetrics] = useState(initialData.metrics);
  const [activities, setActivities] = useState(initialData.activities);
  const [showScanModal, setShowScanModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;

    startTransition(async () => {
      const res = await scanPainterCoupon(couponCode);
      if (res.success) {
        alert(`Coupon ${couponCode} submitted for approval. Estimated reward: ${res.points} points.`);
        setShowScanModal(false);
        setCouponCode("");
        // Optimistically increment pending
        setMetrics(m => ({ ...m, pendingCoupons: m.pendingCoupons + 1 }));
      } else {
        alert(res.error || "Failed to scan coupon");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-primary to-primary-focus text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-15">
          <Award size={150} />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black tracking-widest uppercase opacity-75">Welcome back</p>
          <h2 className="text-lg font-black">{profile.name}</h2>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 border border-white/10 text-[9px] font-black uppercase tracking-wider mt-1">
            <Sparkles size={9} /> {metrics.currentRank}
          </div>
        </div>
      </div>

      {/* Wallets grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-muted-foreground uppercase">Cash balance</span>
            <Wallet size={12} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-black text-foreground font-mono">{fmt(metrics.cashWallet)}</p>
            <p className="text-[8px] text-muted-foreground mt-0.5">Click to withdraw cash</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-muted-foreground uppercase">Reward points</span>
            <Award size={12} className="text-amber-500" />
          </div>
          <div>
            <p className="text-lg font-black text-foreground font-mono">{metrics.rewardPoints} Pts</p>
            <p className="text-[8px] text-muted-foreground mt-0.5">Redeem for Swatch gifts</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-3.5 shadow-sm">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button onClick={() => setShowScanModal(true)} className="flex items-center justify-center gap-2 p-3.5 border border-border hover:bg-muted/10 rounded-xl font-bold text-foreground transition-all cursor-pointer">
            <Scan size={14} className="text-primary" /> Scan Coupon
          </button>
          <button onClick={() => alert("Redirecting to project upload...")} className="flex items-center justify-center gap-2 p-3.5 border border-border hover:bg-muted/10 rounded-xl font-bold text-foreground transition-all cursor-pointer">
            <PlusCircle size={14} className="text-primary" /> Add Project
          </button>
        </div>
      </div>

      {/* Timeline Activites */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Recent Activity</h3>
        <div className="space-y-3 text-xs">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start gap-3 border-b border-border/40 pb-3 last:border-b-0 last:pb-0">
              <div className="p-1.5 bg-muted rounded-lg text-primary"><Clock size={11} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">{act.type}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{act.desc}</p>
              </div>
              <span className="text-[9px] text-muted-foreground font-mono shrink-0">{act.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in scale-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Scan size={14} className="text-primary" /> Scan Swatch Coupon</h3>
              <button onClick={() => setShowScanModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleScanSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Enter Coupon Code</label>
                <input required value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="E.g. COUP-500-XXXX" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors font-mono uppercase" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowScanModal(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Submitting..." : "Submit Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
