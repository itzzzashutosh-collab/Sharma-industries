"use client";

import React, { useState, useMemo } from "react";
import {
  Award, Compass, Zap, Flame, Info, TrendingUp, ArrowDownCircle, ArrowUpRight, DollarSign, Wallet,
  Shield, Copy, Check, Share2, Sparkles, RefreshCw, CheckCircle2, Gift
} from "lucide-react";

interface Props {
  initialData: {
    profile: {
      total_tokens: number;
      total_redeemed: number;
    };
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Painter Reward Points & Dealer Scheme Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_POINTS_OBJECTIONS = [
  {
    id: "PTS_OBJ_1",
    category: "Points Expiry Policy",
    title: "Do Swatch Reward Points expire at the end of the financial year?",
    problemText: "Painter is worried that unused token points will expire on 31st March.",
    strategy: "0% Point Expiry — Swatch Points Carry Forward Indefinitely",
    solutionHindi: "Bhaiya, Swatch Paints mein Points Expiry Zero hai! Aapke saare Reward Points lifetime carry forward hote hain aur kisi bhi mahine mein UPI cash mein convert kar sakte hain!",
    salesPitch: "0% Points Expiry + Lifetime Point Validity for Certified Applicators.",
    whatsappTemplate: "Bhaiya, Swatch Reward Points Guarantee: 0% Expiry! Aapke points lifetime safe rahenge. Jab chahein instant PhonePe UPI cash mein convert karein! 📱"
  },
  {
    id: "PTS_OBJ_2",
    category: "Team Points Transfer",
    title: "Can I transfer points to another painter or contractor in my team?",
    problemText: "Contractor wants to pool points from 3 helper painters into one master account.",
    strategy: "Contractor Team Points Pooling via Zonal Executive Authorization",
    solutionHindi: "Bhaiya, bilkul! Swatch Zonal Executive authorization se aap apne sub-contractor team members ke points apne master account mein pool karke large gift claims unlock kar sakte hain!",
    salesPitch: "Contractor Team Points Pooling & Master Account Transfer System.",
    whatsappTemplate: "Bhaiya, Swatch Contractor Team Feature: Team helper points ek jagah pool karke Spray Machine & Large Gifts claim karein! Executive authorization supported. 🤝"
  },
  {
    id: "PTS_OBJ_3",
    category: "Token vs Festival Bonus Points",
    title: "What is the difference between Bucket Token Points and Scheme Bonus Points?",
    problemText: "Difference between bucket QR scan points and Monsoon Scheme bonus points.",
    strategy: "Both Token & Scheme Bonus Points Convert 1:1 to Direct Cash (1 PTS = ₹1.5)",
    solutionHindi: "Bhaiya, dono points bilkul same cash value rakhte hain (1 Point = ₹1.5 Cash). Bucket Scan se direct cash milti hai aur Scheme Bonus se extra festival cashback milti hai!",
    salesPitch: "Both Bucket Tokens & Scheme Bonus Points Convert 1:1 to Direct Cash.",
    whatsappTemplate: "Bhaiya, Swatch Points Value: 1 Point = ₹1.5 Cash! Bucket Scan + Monsoon Scheme Bonus = Double cash credit in your wallet. 💰"
  }
];

export function PointsClient({ initialData }: Props) {
  const [profile, setProfile] = useState(initialData.profile);
  const totalTokens = Number(profile.total_tokens || 3420);
  const totalRedeemed = Number(profile.total_redeemed || 1380);
  const lifetimeEarned = totalTokens + totalRedeemed;
  const cashEquivalent = totalTokens * 1.5;

  const [activeTab, setActiveTab] = useState<"ledger" | "converter" | "playbook">("ledger");
  const [filterType, setFilterType] = useState<"All" | "Earned" | "Redeemed">("All");
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);

  // Ledger History
  const [transactions, setTransactions] = useState([
    { id: 1, title: "Swatch Damp Kicker 20L Bucket QR Scan", type: "Earned", points: 500, cash: 750, date: "Today, 2:30 PM", remarks: "7-Year Waterproofing Token" },
    { id: 2, title: "Monsoon Double Points Festival Scheme", type: "Earned", points: 300, cash: 450, date: "Yesterday", remarks: "Shree Ram Paints Dealer Bonus" },
    { id: 3, title: "Redeemed for Swatch Master Safety Apron Kit", type: "Redeemed", points: -500, cash: -750, date: "3 days ago", remarks: "Store Counter Claim" },
    { id: 4, title: "Swatch Royal Shine 20L Bucket QR Scan", type: "Earned", points: 300, cash: 450, date: "5 days ago", remarks: "Luxury Interior Emulsion" }
  ]);

  const filteredTransactions = useMemo(() => {
    if (filterType === "All") return transactions;
    if (filterType === "Earned") return transactions.filter(t => t.points > 0);
    return transactions.filter(t => t.points < 0);
  }, [transactions, filterType]);

  const copyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  const handleInstantConversion = () => {
    alert(`🎉 Success! ${totalTokens.toLocaleString()} Swatch Points converted into ${fmt(cashEquivalent)} Cash Wallet balance! You can now withdraw directly to your UPI ID.`);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-28 max-w-md mx-auto font-sans text-xs text-foreground px-1 sm:px-0">

      {/* ══ MOBILE QUICK HEADER & POINTS BANNER ═══════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-4 shadow-xl text-white">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
              ● Swatch Points Wallet
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-black font-mono">
            1 PTS = ₹1.5 Cash
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 block">Available Reward Points</span>
            <h1 className="text-xl font-black text-white font-mono tracking-tight flex items-center gap-1.5">
              <Award size={20} className="text-amber-400" /> {totalTokens.toLocaleString()} PTS
            </h1>
            <p className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">Equivalent Cash: {fmt(cashEquivalent)}</p>
          </div>

          <button
            onClick={handleInstantConversion}
            className="flex items-center gap-1 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-[10px] hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all cursor-pointer border border-emerald-400/30 shrink-0"
          >
            <RefreshCw size={13} /> Convert to Cash
          </button>
        </div>

        {/* Lifetime Stats Card */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 text-[10px]">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5">
            <span className="text-[8px] font-black uppercase text-slate-400 block">Lifetime Earned</span>
            <p className="text-sm font-black text-white font-mono">{lifetimeEarned.toLocaleString()} PTS</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5">
            <span className="text-[8px] font-black uppercase text-indigo-300 block">Total Redeemed</span>
            <p className="text-sm font-black text-indigo-200 font-mono">{totalRedeemed.toLocaleString()} PTS</p>
          </div>
        </div>
      </div>

      {/* ══ MOBILE TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto text-[10px]">
        {[
          { id: "ledger", label: "Points History", icon: Award, badge: transactions.length },
          { id: "converter", label: "Points Converter", icon: RefreshCw },
          { id: "playbook", label: "Scheme Playbook", icon: Shield, badge: "3 Strategies" }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1 rounded-full text-[8px] font-mono ${isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: POINTS TRANSACTION LEDGER HISTORY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "ledger" && (
        <div className="space-y-3">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
            {(["All", "Earned", "Redeemed"] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterType(st)}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  filterType === st
                    ? "bg-foreground text-background font-black"
                    : "bg-muted/50 border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Transactions List */}
          <div className="space-y-2.5">
            {filteredTransactions.map(t => (
              <div key={t.id} className="bg-card border border-border rounded-3xl p-3.5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-foreground text-xs">{t.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black border ${
                    t.points > 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                  }`}>
                    {t.points > 0 ? `+${t.points} PTS` : `${t.points} PTS`}
                  </span>
                </div>

                <div className="bg-muted/30 border border-border/50 rounded-2xl p-2.5 flex items-center justify-between text-[9px] font-mono">
                  <span className="text-muted-foreground">{t.date} • {t.remarks}</span>
                  <span className={t.points > 0 ? "font-bold text-emerald-600 dark:text-emerald-400" : "font-bold text-rose-500"}>
                    {t.cash > 0 ? `+${fmt(t.cash)} Cash` : `${fmt(t.cash)} Cash`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: POINTS TO CASH CONVERTER & RULES
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "converter" && (
        <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="space-y-1 border-b border-border pb-3">
            <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider">Cash Conversion Calculator</span>
            <h2 className="text-xs font-black text-foreground flex items-center gap-1.5">
              <RefreshCw size={15} className="text-indigo-500" /> Swatch Points to UPI Cash Converter
            </h2>
          </div>

          <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 space-y-3 text-center text-white">
            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-300 block">Current Swatch Conversion Rate</span>
            <p className="text-xl font-black font-mono text-emerald-300">1 Swatch Point = ₹1.50 Direct Cash</p>
            <p className="text-[10px] text-slate-300">Your {totalTokens.toLocaleString()} Points = <strong className="text-emerald-300 font-mono">{fmt(cashEquivalent)} Cash Wallet Credit</strong></p>

            <button
              onClick={handleInstantConversion}
              className="w-full py-3 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              Convert Points to Cash Wallet Now
            </button>
          </div>

          <div className="space-y-2 text-[10px]">
            <span className="font-black uppercase text-muted-foreground block text-[9px]">Swatch Multipliers & Bonus Rules:</span>
            {[
              "Bucket QR scans award 100 to 500 points depending on bucket size (20L / 10L / 4L).",
              "Monsoon Waterproofing Campaign awards 2x Double Reward Points on Swatch Damp Kicker.",
              "Gold Partner Applicators receive +15% extra bonus points on monthly scans.",
              "0% Expiry — Reward points carry forward indefinitely for certified applicators."
            ].map((r, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-muted/30 p-2.5 rounded-xl border border-border/40">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-foreground font-medium">{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: SCHEME & POINTS OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-md space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white">Points Expiry & Scheme Counters</h2>
            </div>
            <p className="text-[10px] text-slate-300">
              Resolve contractor questions regarding point expiry, team pooling, and festival scheme bonus rates.
            </p>
          </div>

          <div className="space-y-3">
            {SWATCH_POINTS_OBJECTIONS.map((obj, idx) => (
              <div key={obj.id} className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {obj.category}
                  </span>
                  <h3 className="font-extrabold text-foreground text-xs mt-0.5 flex-1">
                    {idx + 1}. {obj.title}
                  </h3>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-2.5 text-[10px] text-rose-600 dark:text-rose-300 font-medium">
                  <strong className="block text-[8px] font-black uppercase text-rose-500 mb-0.5">Painter Concern:</strong>
                  "{obj.problemText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 text-[10px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Painter Counter Strategy (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.solutionHindi}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[9px] font-bold text-muted-foreground">Share Scheme Script</span>
                  <button
                    onClick={() => copyScript(obj.id, obj.whatsappTemplate)}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-600 text-white font-black text-[9px] hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedObjId === obj.id ? (
                      <>
                        <Check size={11} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={11} /> Copy Script
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
