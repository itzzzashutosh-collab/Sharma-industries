"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart2, Star, Trophy, Medal, Shield, Copy, Check, Share2, Crown, Flame, Award, TrendingUp,
  MapPin, CheckCircle2, UserCheck
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Painter Leaderboard & Rank Leverage Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_LEADERBOARD_OBJECTIONS = [
  {
    id: "LDR_OBJ_1",
    category: "Store Priority Referrals",
    title: "How does being in the Top 3 Swatch Leaderboard help me get more site work?",
    problemText: "Painter is asking how high leaderboard rank converts to actual project contracts.",
    strategy: "Direct Dealer Store Referrals from Shree Ram Paints + Priority Builder Site Leads",
    solutionHindi: "Bhaiya, Top 3 Swatch Leaderboard rank holders ko Shree Ram Paints counter se direct walk-in customer leads & high-value villa painting contracts refer kiye jaate hain!",
    salesPitch: "Direct Dealer Store Referrals + Priority Villa Painting Site Leads.",
    whatsappTemplate: "Namaste Sir! View my official #1 Swatch Paints Applicator Rank Certificate in Jaipur Zone: https://swatchpaints.com/r/rajesh-kumar. Verified top-tier quality guarantee for your house! 🏆"
  },
  {
    id: "LDR_OBJ_2",
    category: "Real-Time Scan Updates",
    title: "How are Swatch Leaderboard rankings updated?",
    problemText: "Painter is asking when points and rankings update on the portal.",
    strategy: "Real-Time Instant Update on Every Verified Swatch Bucket QR Scan",
    solutionHindi: "Bhaiya, jaise hi aap Swatch Paint bucket QR scan karte hain, turant 5 seconds mein aapke points and regional rank real-time update ho jaati hai!",
    salesPitch: "Real-Time Instant Rank Update on Every Verified Bucket QR Scan.",
    whatsappTemplate: "Bhaiya, Swatch Real-Time Ranking: Every bucket QR scan updates your zonal rank instantly! Track live standings on Swatch Portal. 📱"
  },
  {
    id: "LDR_OBJ_3",
    category: "Hyper-Local Zonal Filters",
    title: "Can I filter rankings by Jaipur City or Malviya Nagar Zone?",
    problemText: "Painter wants to see local competition standings in their specific territory.",
    strategy: "Zonal, City & State-Level Leaderboard Filtering Support",
    solutionHindi: "Bhaiya, App mein Jaipur Zone, Malviya Nagar Territory & Rajasthan State options se hyper-local ranking filter karke apni local market authority build kar sakte hain!",
    salesPitch: "Hyper-Local Territory & City Level Leaderboard Filtering.",
    whatsappTemplate: "Bhaiya, Swatch Territory Ranking: #1 Master Applicator in Malviya Nagar Zone! Verified 14,850 Token Points & 5.0 Star Client Rating. 🌟"
  }
];

export function LeaderboardClient() {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "playbook">("leaderboard");
  const [filterRange, setFilterRange] = useState<"Monthly" | "All Time" | "Jaipur Zone">("Jaipur Zone");
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);

  const board = [
    { rank: 1, name: "Rajesh Kumar", points: 14850, rating: 5.0, locality: "Jaipur Central", badge: "100-Bucket Club", isUser: true },
    { rank: 2, name: "Suresh Saini", points: 12400, rating: 4.9, locality: "Malviya Nagar", badge: "Gold Master", isUser: false },
    { rank: 3, name: "Mukesh Bairwa", points: 9800, rating: 4.8, locality: "Tonk Road", badge: "Silver Master", isUser: false },
    { rank: 4, name: "Anil Prajapat", points: 8200, rating: 4.7, locality: "Sanganer", badge: "Silver Master", isUser: false },
    { rank: 5, name: "Vikram Sharma", points: 7100, rating: 4.7, locality: "Vaishali Nagar", badge: "Applicator", isUser: false }
  ];

  const copyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-28 max-w-md mx-auto font-sans text-xs text-foreground px-1 sm:px-0">

      {/* ══ MOBILE QUICK HEADER & LEADERBOARD BANNER ════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-4 shadow-xl text-white">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
              ● Swatch Applicator Standings
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black font-mono">
            #1 Jaipur Zone
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 block">Your Current Standings</span>
            <h1 className="text-xl font-black text-white font-mono tracking-tight flex items-center gap-1.5">
              <Crown size={20} className="text-amber-400" /> Rank #1 • Rajesh Kumar
            </h1>
            <p className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">14,850 Token Points Scanned</p>
          </div>

          <button
            onClick={() => {
              const rankTxt = `*SWATCH PAINTS OFFICIAL APPLICATOR RANK CARD* 🏆\nMaster Applicator: Rajesh Kumar\nZonal Rank: #1 in Jaipur Zone\nScanned Points: 14,850 PTS\nClient Rating: 5.0 Stars (100% Positive)\nBadge: 100-Bucket Club Gold Master\n\nCall for site inspection & 100% Swatch Warranty application!`;
              navigator.clipboard.writeText(rankTxt);
              alert("Swatch #1 Rank Card details copied for WhatsApp sharing!");
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-[10px] hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all cursor-pointer border border-emerald-400/30 shrink-0"
          >
            <Share2 size={13} /> Share Rank Card
          </button>
        </div>
      </div>

      {/* ══ MOBILE TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto text-[10px]">
        {[
          { id: "leaderboard", label: "Rank Standings", icon: BarChart2 },
          { id: "playbook", label: "Ranking Playbook", icon: Shield, badge: "3 Strategies" }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
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
          TAB 1: APPLICATOR RANK STANDINGS & PODIUM
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "leaderboard" && (
        <div className="space-y-3">
          {/* Time Filter Buttons */}
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5">
              {(["Jaipur Zone", "Monthly", "All Time"] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setFilterRange(st)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    filterRange === st
                      ? "bg-foreground text-background font-black"
                      : "bg-muted/50 border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            {/* Rank 2 */}
            <div className="bg-card border border-border rounded-2xl p-3 space-y-1 relative mt-4 shadow-xs">
              <span className="w-6 h-6 rounded-full bg-slate-400 text-white font-black text-[10px] mx-auto flex items-center justify-center -mt-6 border-2 border-card">
                2
              </span>
              <p className="font-extrabold text-foreground text-[10px] truncate">Suresh Saini</p>
              <p className="text-[9px] text-muted-foreground font-mono">12,400 PTS</p>
            </div>

            {/* Rank 1 (Podium Center) */}
            <div className="bg-gradient-to-b from-amber-500/20 via-card to-card border-2 border-amber-500/40 rounded-2xl p-3 space-y-1 relative shadow-md">
              <span className="w-7 h-7 rounded-full bg-amber-500 text-white font-black text-xs mx-auto flex items-center justify-center -mt-6 border-2 border-card shadow-sm">
                1
              </span>
              <p className="font-black text-foreground text-xs truncate">Rajesh (You)</p>
              <p className="text-[9px] text-amber-600 dark:text-amber-400 font-mono font-bold">14,850 PTS</p>
            </div>

            {/* Rank 3 */}
            <div className="bg-card border border-border rounded-2xl p-3 space-y-1 relative mt-6 shadow-xs">
              <span className="w-6 h-6 rounded-full bg-amber-700 text-white font-black text-[10px] mx-auto flex items-center justify-center -mt-6 border-2 border-card">
                3
              </span>
              <p className="font-extrabold text-foreground text-[10px] truncate">Mukesh B.</p>
              <p className="text-[9px] text-muted-foreground font-mono">9,800 PTS</p>
            </div>
          </div>

          {/* Full Rank Roster List */}
          <div className="space-y-2 pt-2">
            {board.map(item => (
              <div
                key={item.rank}
                className={`bg-card border rounded-3xl p-3.5 flex items-center justify-between transition-all shadow-xs ${
                  item.isUser ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-black text-xs border ${
                    item.rank === 1 ? "bg-amber-500 text-white border-amber-400" :
                    item.rank === 2 ? "bg-slate-400 text-white border-slate-300" :
                    item.rank === 3 ? "bg-amber-700 text-white border-amber-600" :
                    "bg-muted text-muted-foreground border-border"
                  }`}>
                    {item.rank}
                  </span>

                  <div>
                    <h4 className="font-extrabold text-foreground text-xs flex items-center gap-1">
                      {item.name} {item.isUser && <span className="text-emerald-600 font-black">(You)</span>}
                    </h4>
                    <p className="text-[9px] text-muted-foreground font-mono">{item.locality} • {item.badge}</p>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="font-black text-foreground text-xs block">{item.points.toLocaleString()} PTS</span>
                  <div className="flex items-center justify-end gap-1 text-[9px] text-amber-500 font-bold">
                    <Star size={10} className="fill-amber-500" /> {item.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: RANK LEVERAGE OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-md space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white">Rank Certificate & Store Referral Counters</h2>
            </div>
            <p className="text-[10px] text-slate-300">
              Leverage your Swatch Leaderboard rank to win premium villa painting contracts and direct store referrals.
            </p>
          </div>

          <div className="space-y-3">
            {SWATCH_LEADERBOARD_OBJECTIONS.map((obj, idx) => (
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
                  <strong className="block text-[8px] font-black uppercase text-rose-500 mb-0.5">Painter Question:</strong>
                  "{obj.problemText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 text-[10px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Painter Counter Strategy (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.solutionHindi}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[9px] font-bold text-muted-foreground">Share Rank Script</span>
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
