"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  TrendingUp, Target, CreditCard, Sparkles, CheckCircle2, Trophy,
  Clock, Wallet, Award, Percent, DollarSign, ArrowUpRight, ArrowRight,
  Shield, AlertTriangle, FileText, ChevronRight, Download, Printer,
  Building2, Users, Flame, Zap, HelpCircle, Check, Copy, Calculator, Info, X
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  initialData: {
    mtdRevenue: number;
    targetRevenue: number;
  };
}

interface TargetGoal {
  id: string;
  title: string;
  category: "Revenue" | "Collection" | "Dealers" | "Painters" | "Focus SKU";
  current: number;
  target: number;
  unit: "₹" | "Dealers" | "Painters" | "Buckets";
  rewardBonus: number;
  kickerMultiplier: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// B2B Salary & Target Negotiation / Objection Scenarios
// ─────────────────────────────────────────────────────────────────────────────
const TARGET_SALARY_OBJECTIONS = [
  {
    id: "TS_OBJ_1",
    category: "Target Re-indexing",
    title: "Off-Season / Rain Month Target Set Too High",
    problemText: "Monsoon / Winter season mein market construction slow hoti hai, phir bhi target ₹5 Lakh fixed rakha hai.",
    strategy: "Request Seasonal Indexing & Focus SKU Bonus Weightage",
    solutionHindi: "Management ko Zonal Seasonal Factor data submit karein. Monsoon mein Emulsion ki jagah Waterproofing (Damp Shield) pe 1.5x target weightage aur ₹500/bucket extra kicker approve karwayen.",
    actionableAdvice: "Pitch Damp Shield & Exterior Protection to 5 Key Contractors during rains to achieve 100% quota weightage.",
    whatsappTemplate: "Respected Manager, Monsoon season regional slowdown index ke regard mein, I am targeting Damp Shield & Waterproofing range with 1.5x weightage to achieve ₹5L equivalent quota. Request approval for Focus SKU bonus rate! 🙏"
  },
  {
    id: "TS_OBJ_2",
    category: "Incentive Tier Upgrade",
    title: "How to Jump from Silver Tier (2.5%) to Gold Tier (3.5%) Commission",
    problemText: "Regular 2.5% commission milti hai, 3.5% Gold Tier Commission kaise unlock karein?",
    strategy: "Fulfill 3-Criteria Combo: ₹4L Sales + 80% Collection + 2 New Dealers",
    solutionHindi: "Gold Tier unlock karne ke liye 3 criteria complete karein: Total Sales > ₹4 Lakh, Collection Recovery > 80%, and minimum 2 New Dealer Onboardings. Isse base commission 2.5% se seedhe 3.5% ho jayegi!",
    actionableAdvice: "Focus on closing 2 dormant dealers this week using Gold Partner Scheme to cross the threshold.",
    whatsappTemplate: "Hello Sir! I am 1 new dealer and ₹45k collection away from unlocking Gold Tier (3.5% Commission). Closing both by Friday to hit the Gold Incentive Bracket! 🚀"
  },
  {
    id: "TS_OBJ_3",
    category: "Collection Quota Protection",
    title: "Dealer Cheque Delay Affecting Collection Incentive",
    problemText: "Dealer ne PDC Cheque de diya hai par bank clear nahi hua, collection incentive hold par chala gaya.",
    strategy: "Apply Account Protection Waiver with Verified Deposit Slip",
    solutionHindi: "System mein PDC Deposit Slip upload karke 'Waiver Hold' apply karein. Accounts team 48 hours ke liye collection status Verified mark kar degi taaki monthly incentive slab drop na ho.",
    actionableAdvice: "Attach bank deposit slip & cheque photo in collection log for automatic credit protection.",
    whatsappTemplate: "Respected Accounts Team, HDFC Cheque #001921 for ₹45,000 has been deposited today (Ref: INV-10824). Request Waiver Hold approval so collection quota slab is preserved for monthly payout. Thanks!"
  },
  {
    id: "TS_OBJ_4",
    category: "TA / DA Expense Claim",
    title: "Travel & Daily Allowance Claim Processing Delay",
    problemText: "Field visit ka TA/DA Allowance (₹4,500) reimbursement release hone mein late ho raha hai.",
    strategy: "Auto-verify via Daily Geo-Tag Route Logs",
    solutionHindi: "Visits tab mein Daily Geo-Tag & Dealer Check-in report sync karein. Verified GPS visits ka TA/DA salary cycle ke sath auto-credited ho jata hai, zero manual approval needed.",
    actionableAdvice: "Ensure morning route check-in and evening report submission are completed daily.",
    whatsappTemplate: "Sir, all 18 GPS Field Visit logs for the fortnight have been synced in the Visits Command Center. Request TA/DA allowance batch release for current payout cycle. 📍"
  }
];

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function PerformanceClient({ initialData }: Props) {
  // Target Goals State
  const [goals, setGoals] = useState<TargetGoal[]>([
    {
      id: "G1",
      title: "Monthly Revenue Quota",
      category: "Revenue",
      current: initialData.mtdRevenue || 385000,
      target: initialData.targetRevenue || 500000,
      unit: "₹",
      rewardBonus: 15000,
      kickerMultiplier: "Base 2.5% Commission"
    },
    {
      id: "G2",
      title: "Collection Recovery Target",
      category: "Collection",
      current: 240000,
      target: 350000,
      unit: "₹",
      rewardBonus: 5000,
      kickerMultiplier: "+0.5% Super Bonus"
    },
    {
      id: "G3",
      title: "New Dealer Onboarding",
      category: "Dealers",
      current: 3,
      target: 5,
      unit: "Dealers",
      rewardBonus: 4000,
      kickerMultiplier: "₹800 Per Dealer"
    },
    {
      id: "G4",
      title: "Painter KYC Registrations",
      category: "Painters",
      current: 7,
      target: 10,
      unit: "Painters",
      rewardBonus: 2000,
      kickerMultiplier: "₹200 Per Painter"
    },
    {
      id: "G5",
      title: "Focus SKU (Damp Shield Waterproofing)",
      category: "Focus SKU",
      current: 18,
      target: 25,
      unit: "Buckets",
      rewardBonus: 3500,
      kickerMultiplier: "₹140 Special Kicker"
    }
  ]);

  // Tab State
  const [activeTab, setActiveTab] = useState<"quotas" | "simulator" | "playbook" | "badges" | "analytics">("quotas");
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);
  const [showPayslipModal, setShowPayslipModal] = useState<boolean>(false);

  // Interactive Salary Simulator Inputs
  const [simulatedSales, setSimulatedSales] = useState<number>(initialData.mtdRevenue || 420000);
  const [simulatedCollections, setSimulatedCollections] = useState<number>(280000);
  const [simulatedDealers, setSimulatedDealers] = useState<number>(4);
  const [simulatedPainters, setSimulatedPainters] = useState<number>(8);

  // ── Computations ────────────────────────────────────────────────────────────
  // Overall Quota Progress
  const overallRevenuePct = useMemo(() => {
    const revGoal = goals.find(g => g.id === "G1");
    if (!revGoal || revGoal.target === 0) return 0;
    return Math.min(100, Math.round((revGoal.current / revGoal.target) * 100));
  }, [goals]);

  // Commission Tier Determination
  const currentCommissionTier = useMemo(() => {
    if (simulatedSales >= 600000) return { name: "Platinum Tier", rate: 0.05, badge: "👑 5.0%", min: 600000 };
    if (simulatedSales >= 450000) return { name: "Gold Tier", rate: 0.035, badge: "🥇 3.5%", min: 450000 };
    if (simulatedSales >= 300000) return { name: "Silver Tier", rate: 0.025, badge: "🥈 2.5%", min: 300000 };
    return { name: "Bronze Tier", rate: 0.02, badge: "🥉 2.0%", min: 0 };
  }, [simulatedSales]);

  // Next Tier Gap
  const nextTierGap = useMemo(() => {
    if (simulatedSales < 300000) return { nextTier: "Silver (2.5%)", needed: 300000 - simulatedSales };
    if (simulatedSales < 450000) return { nextTier: "Gold (3.5%)", needed: 450000 - simulatedSales };
    if (simulatedSales < 600000) return { nextTier: "Platinum (5.0%)", needed: 600000 - simulatedSales };
    return { nextTier: "MAX TIER REACHED", needed: 0 };
  }, [simulatedSales]);

  // Dynamic Salary Breakdown Calculation
  const salarySim = useMemo(() => {
    const basicPay = 25000;
    const travelAllowance = 4500;
    const foodAllowance = 2200;

    // Sales Commission
    const salesCommission = simulatedSales * currentCommissionTier.rate;

    // Collection Recovery Bonus (If > 75% of 3.5L target)
    const collectionPct = (simulatedCollections / 350000) * 100;
    const collectionBonus = collectionPct >= 75 ? 3500 : 0;

    // Dealer & Painter Onboarding Incentives
    const dealerIncentive = simulatedDealers * 800;
    const painterIncentive = simulatedPainters * 200;

    const totalGross = basicPay + travelAllowance + foodAllowance + salesCommission + collectionBonus + dealerIncentive + painterIncentive;
    const pfTdsDeduction = 1800;
    const netPayout = totalGross - pfTdsDeduction;

    return {
      basicPay,
      travelAllowance,
      foodAllowance,
      salesCommission,
      collectionBonus,
      dealerIncentive,
      painterIncentive,
      totalGross,
      pfTdsDeduction,
      netPayout
    };
  }, [simulatedSales, simulatedCollections, simulatedDealers, simulatedPainters, currentCommissionTier]);

  const copyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 text-xs font-sans text-foreground">

      {/* ══ HERO BANNER ═══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-r from-slate-950 via-violet-950/70 to-slate-950 p-5 sm:p-6 shadow-2xl text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.2),_transparent_70%)]" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-[9px] font-black uppercase tracking-widest text-violet-300">
                Salesman Earnings & Target Center
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black">
                ● ACTIVE MONTH
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Target size={22} className="text-violet-400" /> Target & Salary Command Center
            </h1>
            <p className="text-slate-400 text-[11px] max-w-xl">
              Track quota progress, simulate live salary & commission tiers, resolve target objections, and download pay advice slips.
            </p>
          </div>

          <button
            onClick={() => setShowPayslipModal(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-black text-xs hover:opacity-95 shadow-lg shadow-violet-500/25 transition-all cursor-pointer border border-violet-400/30"
          >
            <FileText size={16} /> View Forecast Payslip
          </button>
        </div>

        {/* Dynamic Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Forecast Net Payout</span>
            <p className="text-lg font-black text-emerald-400 font-mono">{fmt(salarySim.netPayout)}</p>
            <span className="text-[9px] text-slate-400">Basic + Commission + Allowances</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-violet-300 block mb-0.5">Revenue Quota</span>
            <p className="text-lg font-black text-white font-mono">{overallRevenuePct}% Done</p>
            <span className="text-[9px] text-slate-400">{fmt(initialData.mtdRevenue || 385000)} / {fmt(initialData.targetRevenue || 500000)}</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-amber-300 block mb-0.5">Commission Tier</span>
            <p className="text-lg font-black text-amber-200 font-mono">{currentCommissionTier.name}</p>
            <span className="text-[9px] text-slate-400">{currentCommissionTier.badge} Rate Rate</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-indigo-300 block mb-0.5">Next Tier Gap</span>
            <p className="text-lg font-black text-indigo-200 font-mono">
              {nextTierGap.needed > 0 ? fmt(nextTierGap.needed) : "MAX TIER"}
            </p>
            <span className="text-[9px] text-slate-400">To unlock {nextTierGap.nextTier}</span>
          </div>
        </div>
      </div>

      {/* ══ TAB NAVIGATION ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1.5 bg-muted/60 p-1.5 rounded-2xl border border-border overflow-x-auto">
        {[
          { id: "quotas", label: "Targets & Quotas", icon: Target, badge: `${overallRevenuePct}%` },
          { id: "simulator", label: "Salary Calculator", icon: Calculator, highlight: true },
          { id: "playbook", label: "Target & Salary Master", icon: Shield, badge: "4 Playbooks" },
          { id: "badges", label: "Trophy Cabinet", icon: Trophy, badge: "Unlocked" },
          { id: "analytics", label: "Earnings Trends", icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap text-[11px] ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : tab.highlight
                  ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: TARGETS & QUOTAS LEDGER
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "quotas" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-foreground flex items-center gap-2">
                <Target size={16} className="text-primary" /> Monthly Quota Matrix
              </h2>
              <span className="text-[10px] font-bold text-muted-foreground font-mono">July 2026 Cycle</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Complete individual target parameters to unlock high-tier commission multipliers and performance cash bonuses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map(g => {
              const pct = Math.min(100, Math.round((g.current / g.target) * 100));
              const isAchieved = pct >= 100;

              return (
                <div key={g.id} className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs hover:border-primary/40 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
                        {g.category}
                      </span>
                      <h3 className="font-extrabold text-foreground text-xs sm:text-sm mt-1.5">{g.title}</h3>
                    </div>
                    <span className={`text-base font-black font-mono ${isAchieved ? "text-emerald-500" : "text-primary"}`}>
                      {pct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-3 bg-muted/60 rounded-full overflow-hidden border border-border/50 p-0.5">
                      <div
                        className={`h-full rounded-full transition-all ${isAchieved ? "bg-emerald-500" : "bg-primary"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono font-bold text-muted-foreground">
                      <span>Achieved: {g.unit === "₹" ? fmt(g.current) : `${g.current} ${g.unit}`}</span>
                      <span>Quota: {g.unit === "₹" ? fmt(g.target) : `${g.target} ${g.unit}`}</span>
                    </div>
                  </div>

                  {/* Reward & Kicker Info */}
                  <div className="bg-muted/30 border border-border/50 rounded-2xl p-3 flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground font-medium">Reward Kicker:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      +{fmt(g.rewardBonus)} ({g.kickerMultiplier})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: SALARY & COMMISSION CALCULATOR (SIMULATOR)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "simulator" && (
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                <Calculator size={18} className="text-violet-500" /> Interactive Salary & Commission Calculator
              </h2>
              <p className="text-muted-foreground text-[11px]">
                Adjust projected sales, collections, and onboardings to calculate your exact expected take-home payout.
              </p>
            </div>
          </div>

          {/* Interactive Sliders / Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-muted/20 border border-border rounded-2xl p-4 sm:p-5">
            {/* Sales Volume */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold text-foreground">Projected Sales Revenue:</span>
                <span className="font-mono font-black text-violet-600 dark:text-violet-400 text-xs">{fmt(simulatedSales)}</span>
              </div>
              <input
                type="range"
                min="100000"
                max="800000"
                step="25000"
                value={simulatedSales}
                onChange={e => setSimulatedSales(Number(e.target.value))}
                className="w-full accent-violet-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
                <span>₹1L (2.0%)</span>
                <span>₹4.5L (3.5% Gold)</span>
                <span>₹6L (5.0% Plat)</span>
              </div>
            </div>

            {/* Collection Amount */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold text-foreground">Projected Collections:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">{fmt(simulatedCollections)}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="400000"
                step="25000"
                value={simulatedCollections}
                onChange={e => setSimulatedCollections(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
                <span>₹50k</span>
                <span>₹2.6L (75% Threshold)</span>
                <span>₹4L</span>
              </div>
            </div>

            {/* Dealers Onboarded */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold text-foreground">New Dealers Onboarded:</span>
                <span className="font-mono font-black text-indigo-500 text-xs">{simulatedDealers} Dealers</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={simulatedDealers}
                onChange={e => setSimulatedDealers(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Painter KYC */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold text-foreground">Painter KYCs Registered:</span>
                <span className="font-mono font-black text-indigo-500 text-xs">{simulatedPainters} Painters</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={simulatedPainters}
                onChange={e => setSimulatedPainters(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Live Calculated Payslip Breakdown */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-black text-foreground text-xs uppercase tracking-wider">Estimated Payslip Statement</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-300 font-bold text-[10px]">
                {currentCommissionTier.name} ({currentCommissionTier.badge})
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Base Fixed Salary:</span>
                <span className="font-mono font-bold text-foreground">{fmt(salarySim.basicPay)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Travel Allowance (TA) + Food Allowance (DA):</span>
                <span className="font-mono font-bold text-foreground">{fmt(salarySim.travelAllowance + salarySim.foodAllowance)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Sales Commission ({currentCommissionTier.name} @ {(currentCommissionTier.rate * 100).toFixed(1)}%):</span>
                <span className="font-mono font-bold">+{fmt(salarySim.salesCommission)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Collection Recovery Bonus:</span>
                <span className="font-mono font-bold">+{fmt(salarySim.collectionBonus)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Dealer & Painter Onboarding Bonus:</span>
                <span className="font-mono font-bold">+{fmt(salarySim.dealerIncentive + salarySim.painterIncentive)}</span>
              </div>
              <div className="flex justify-between text-rose-500">
                <span>PF & TDS Statutory Deductions:</span>
                <span className="font-mono font-bold">-{fmt(salarySim.pfTdsDeduction)}</span>
              </div>

              <div className="flex justify-between items-center border-t border-border pt-3 font-black text-sm">
                <span className="text-foreground">Forecast Net Payout:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">{fmt(salarySim.netPayout)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: TARGET & SALARY NEGOTIATION MASTER PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-950 via-violet-950 to-slate-950 text-white rounded-3xl p-5 border border-violet-500/30 shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-violet-400" />
              <h2 className="text-base font-black text-white">Target & Salary Negotiation Master</h2>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Resolve target weightage challenges, unlock higher commission tiers, and submit admin proposals for incentive waivers.
            </p>
          </div>

          <div className="space-y-4">
            {TARGET_SALARY_OBJECTIONS.map((obj, idx) => (
              <div key={obj.id} className="bg-card border border-border rounded-3xl p-5 space-y-3.5 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                    {obj.category}
                  </span>
                  <h3 className="font-extrabold text-foreground text-xs sm:text-sm mt-1 flex-1">
                    {idx + 1}. {obj.title}
                  </h3>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 text-[11px] text-rose-600 dark:text-rose-300 font-medium">
                  <strong className="block text-[9px] font-black uppercase text-rose-500 mb-0.5">Challenge Scenario:</strong>
                  "{obj.problemText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-[11px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Solution & Tactical Workaround (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.solutionHindi}</p>
                </div>

                <div className="bg-muted/40 border border-border rounded-2xl p-3 text-[10px] text-muted-foreground space-y-0.5">
                  <strong className="block text-[9px] font-black uppercase text-foreground">
                    🎯 Actionable Field Advice:
                  </strong>
                  <p>{obj.actionableAdvice}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-[10px] font-bold text-muted-foreground">Manager Alignment Template</span>
                  <button
                    onClick={() => copyScript(obj.id, obj.whatsappTemplate)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 text-white font-black text-[10px] hover:bg-violet-700 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedObjId === obj.id ? (
                      <>
                        <Check size={12} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy WhatsApp Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4: TROPHY CABINET & BADGES
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "badges" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" /> Milestone Trophy Cabinet
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Earn badges to boost your annual performance appraisal score and unlock luxury incentive trips.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-amber-500/30 rounded-3xl p-5 flex items-start gap-3 shadow-xs bg-amber-500/5">
              <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500 border border-amber-500/30 shrink-0">
                <Award size={24} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400">UNLOCKED</span>
                <h4 className="font-extrabold text-xs text-foreground">Collection Champion</h4>
                <p className="text-[10px] text-muted-foreground">Recovered ₹2,000,000+ outstanding invoices in under 30 days.</p>
              </div>
            </div>

            <div className="bg-card border border-indigo-500/30 rounded-3xl p-5 flex items-start gap-3 shadow-xs bg-indigo-500/5">
              <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-500 border border-indigo-500/30 shrink-0">
                <Flame size={24} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400">UNLOCKED</span>
                <h4 className="font-extrabold text-xs text-foreground">Painter Magnet</h4>
                <p className="text-[10px] text-muted-foreground">Registered 20+ painter contractor KYC profiles in 1 month.</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5 flex items-start gap-3 shadow-xs opacity-60">
              <div className="p-3 bg-muted rounded-2xl text-muted-foreground shrink-0">
                <Trophy size={24} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">LOCKED (₹6L / ₹10L)</span>
                <h4 className="font-extrabold text-xs text-foreground">Territory Legend</h4>
                <p className="text-[10px] text-muted-foreground">Achieve ₹10 Lakh total quarterly revenue milestone.</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5 flex items-start gap-3 shadow-xs opacity-60">
              <div className="p-3 bg-muted rounded-2xl text-muted-foreground shrink-0">
                <Zap size={24} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">LOCKED (3 / 5 DEALERS)</span>
                <h4 className="font-extrabold text-xs text-foreground">Dealer Expansion Pro</h4>
                <p className="text-[10px] text-muted-foreground">Onboard 5 new active dealers in a single month.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 5: EARNINGS ANALYTICS & TRENDS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <TrendingUp size={16} className="text-violet-500" /> Historical Earnings Breakdown
            </h2>

            <div className="space-y-3">
              {[
                { month: "June 2026", base: 25000, commission: 14800, allowances: 6700, total: 44700, status: "Paid" },
                { month: "May 2026", base: 25000, commission: 12200, allowances: 6700, total: 42100, status: "Paid" },
                { month: "April 2026", base: 25000, commission: 10500, allowances: 6700, total: 40400, status: "Paid" }
              ].map((m, idx) => (
                <div key={idx} className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-foreground">{m.month}</span>
                    <p className="text-[10px] text-muted-foreground">Base: {fmt(m.base)} | Comm: {fmt(m.commission)}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm block">{fmt(m.total)}</span>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase">● {m.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PAYSLIP STATEMENT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showPayslipModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPayslipModal(false)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border bg-violet-500/10 flex items-center justify-between">
              <h3 className="text-xs font-black text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                <FileText size={14} /> Official Payslip Forecast Statement
              </h3>
              <button onClick={() => setShowPayslipModal(false)} className="p-1 rounded-lg hover:bg-muted">
                <X size={14} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-muted/40 border border-border rounded-2xl p-4 font-mono text-[10px] text-foreground leading-relaxed whitespace-pre-line">
                {`*SHARMA INDUSTRIES - SALARY ADVICE SLIP* 📄
Employee: Rajesh Kumar (SM-101)
Territory: Rajasthan East | Cycle: July 2026

*EARNINGS BREAKDOWN:*
• Basic Fixed Salary: ${fmt(salarySim.basicPay)}
• Travel Allowance (TA): ${fmt(salarySim.travelAllowance)}
• Food Allowance (DA): ${fmt(salarySim.foodAllowance)}
• Sales Commission (${currentCommissionTier.name}): ${fmt(salarySim.salesCommission)}
• Collection Target Bonus: ${fmt(salarySim.collectionBonus)}
• Dealer & Painter Incentives: ${fmt(salarySim.dealerIncentive + salarySim.painterIncentive)}

*DEDUCTIONS:*
• Statutory PF & TDS: -${fmt(salarySim.pfTdsDeduction)}

*FORECAST NET PAYOUT:* ${fmt(salarySim.netPayout)}`}
              </div>

              <button
                onClick={() => {
                  alert("Payslip Statement downloaded as PDF!");
                  setShowPayslipModal(false);
                }}
                className="w-full py-2.5 bg-violet-600 text-white font-black text-[11px] rounded-xl hover:bg-violet-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download size={13} /> Download Official Payslip Statement
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
