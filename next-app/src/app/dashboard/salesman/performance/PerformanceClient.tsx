"use client";

import React, { useState } from "react";
import { TrendingUp, Target, CreditCard, Sparkles, CheckCircle2, Trophy, Clock, Wallet, Award } from "lucide-react";

interface Props {
  initialData: {
    mtdRevenue: number;
    targetRevenue: number;
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export function PerformanceClient({ initialData }: Props) {
  const [goals] = useState([
    { id: "1", title: "Monthly Sales Target", current: initialData.mtdRevenue, target: initialData.targetRevenue, unit: "₹" },
    { id: "2", title: "Collection Quota Target", current: 80000, target: 150000, unit: "₹" },
    { id: "3", title: "Dealer Acquisition", current: 1, target: 5, unit: "Dealers" }
  ]);

  const [salaryBreakdown] = useState({
    basicPay: 25000,
    travelAllowance: 4500,
    foodAllowance: 2200,
    earnedIncentive: 12450,
    deductions: 1800
  });

  const netPay = salaryBreakdown.basicPay + salaryBreakdown.travelAllowance + salaryBreakdown.foodAllowance + salaryBreakdown.earnedIncentive - salaryBreakdown.deductions;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground font-sans">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Salesman Workspace</span><span className="opacity-40">/</span><span className="text-foreground">Performance</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Target & Salary Ledger</h1>
      </div>

      {/* Target Progress Card */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Target size={14} className="text-primary" /> Monthly Quota Progress</h3>
        <div className="space-y-3.5">
          {goals.map((g) => {
            const percent = Math.min(100, Math.ceil((g.current / g.target) * 100));
            return (
              <div key={g.id} className="space-y-2 border-b border-border/40 pb-3 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-foreground">{g.title}</span>
                  <span className="text-primary font-mono">{percent}%</span>
                </div>
                <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden border border-border/40">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${percent}%` }} />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
                  <span>{g.unit === "₹" ? fmt(g.current) : `${g.current} Mapped`}</span>
                  <span>Target: {g.unit === "₹" ? fmt(g.target) : `${g.target} Mapped`}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Assistant Coach */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex gap-3 bg-primary/5">
        <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-muted-foreground">
          <p className="font-bold text-foreground">AI Performance Coach</p>
          <p>• Securing ₹35,000 more in collections this week will bump your monthly collection quota success bracket to 80%, triggering a flat ₹3,000 extra bonus modifier!</p>
        </div>
      </div>

      {/* Salary Breakdown */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><CreditCard size={14} className="text-primary" /> Salary Slip (Forecast)</h3>
        <div className="space-y-2 text-[10px]">
          <div className="flex justify-between border-b border-border/40 pb-2">
            <span className="text-muted-foreground">Basic Pay Rate</span>
            <span className="font-mono text-foreground font-bold">{fmt(salaryBreakdown.basicPay)}</span>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-2">
            <span className="text-muted-foreground">Travel Allowance (TA)</span>
            <span className="font-mono text-foreground font-bold">{fmt(salaryBreakdown.travelAllowance)}</span>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-2">
            <span className="text-muted-foreground">Food Allowance (DA)</span>
            <span className="font-mono text-foreground font-bold">{fmt(salaryBreakdown.foodAllowance)}</span>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-2">
            <span className="text-muted-foreground">Earned Commissions (Sales + Collection)</span>
            <span className="font-mono text-emerald-600 font-bold">{fmt(salaryBreakdown.earnedIncentive)}</span>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-2">
            <span className="text-rose-600">Standard PF / PT Deductions</span>
            <span className="font-mono text-rose-600 font-bold">-{fmt(salaryBreakdown.deductions)}</span>
          </div>
          <div className="flex justify-between pt-2 text-xs font-black">
            <span className="text-foreground">Forecast Net Payout</span>
            <span className="font-mono text-primary text-sm">{fmt(netPay)}</span>
          </div>
        </div>
      </div>

      {/* Achievements Cabinet */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Trophy size={14} className="text-primary" /> Active Milestone Badges</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 shadow-sm">
            <Award size={24} className="text-amber-500 fill-amber-500/10" />
            <p className="font-bold text-foreground">Collection Champion</p>
            <p className="text-[9px] text-muted-foreground">Recovered ₹50,000+ outstanding in under 30 days.</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 shadow-sm opacity-60">
            <Trophy size={24} className="text-slate-400" />
            <p className="font-bold text-foreground">Territory Legend</p>
            <p className="text-[9px] text-muted-foreground font-semibold">Locked: Complete ₹10 Lakh in sales value.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
