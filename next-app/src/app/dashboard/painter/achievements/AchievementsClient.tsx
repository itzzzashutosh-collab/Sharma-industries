"use client";

import React, { useState } from "react";
import {
  Award, CheckCircle2, Lock, Flame, ShieldCheck, Zap, Info, Trophy, Target, Star, Compass, Sparkles,
  Share2, Copy, Check, Gift, Shield, ArrowRight, ThumbsUp, Crown, QrCode
} from "lucide-react";

interface Props {
  initialData: {
    profile: {
      total_tokens: number;
    };
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Painter Achievements & Negotiation Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_ACHIEVEMENT_OBJECTIONS = [
  {
    id: "ACH_OBJ_1",
    category: "Labor Rate Negotiation",
    title: "Why are your labor charges higher than non-certified painters?",
    problemText: "Homeowner is asking why your contract rate is ₹2/sq ft higher than local uncertified labor.",
    strategy: "Show Swatch Certified Applicator Badge + 0% Re-work Guarantee",
    solutionHindi: "Ma'am/Sir, mera Swatch Paints Certified Applicator Badge dekhiye! 7-Year Waterproofing & Royal Emulsion trained honing se 0% paint peeling ya re-work hota hai. Zero defect guarantee!",
    salesPitch: "Official Swatch Certification Badge + 0% Paint Peeling & Re-work Guarantee.",
    whatsappTemplate: "Namaste Sir! View my official Swatch Paints Certified Master Applicator Badge & 7-Year Waterproofing credentials here. Guaranteed zero-defect execution for your house! 🏆"
  },
  {
    id: "ACH_OBJ_2",
    category: "Priority Supply Dispatch",
    title: "Will Swatch dealer provide priority stock delivery for large sites?",
    problemText: "Dealer counter has high demand. Will your site order get priority dispatch?",
    strategy: "Show Swatch Gold VIP Applicator Badge for Direct Store Priority Dispatch",
    solutionHindi: "Sir, Swatch Gold VIP Applicator Badge holder hone ki wajah se mera store order priority base par 24 hours ke andar site par dispatch hota hai. Work delay 0% rahega!",
    salesPitch: "Swatch VIP Applicator Badge = 24-Hour Priority Store Dispatch Guarantee.",
    whatsappTemplate: "Sir, Swatch VIP Applicator Advantage: Direct priority order dispatch from Shree Ram Paints within 24 hours! Zero work delay at your site. 🚚"
  },
  {
    id: "ACH_OBJ_3",
    category: "Milestone Reward Claims",
    title: "What physical gifts & rewards do I get when reaching Gold Applicator Rank?",
    problemText: "How do I claim my Swatch Professional Spray Machine & Safety Apron Kit?",
    strategy: "Earn 1,000 Points to Unlock FREE Swatch Safety Kit + Spray Machine Subsidy",
    solutionHindi: "Bhaiya, 1,000 Swatch Points reach karte hi aapko FREE Swatch Professional Safety Kit + Spray Machine Voucher direct dealer counter se issue hota hai!",
    salesPitch: "1,000 Points = FREE Swatch Safety Kit + Professional Spray Machine Voucher.",
    whatsappTemplate: "Great news! Swatch Applicator Rewards: 1,000 Points reached! Claim your FREE Swatch Professional Safety Kit at Shree Ram Paints store today! 🎁"
  }
];

export function AchievementsClient({ initialData }: Props) {
  const [profile] = useState(initialData.profile);
  const totalTokens = Number(profile.total_tokens || 1480);
  const [activeTab, setActiveTab] = useState<"trophies" | "rewards" | "playbook">("trophies");
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);

  // Badges Data
  const badges = [
    { id: "b1", title: "100-Bucket Club Member", desc: "Scanned over 100 Swatch paint buckets", req: 1000, unlocked: totalTokens >= 1000, icon: Crown, level: "Gold Tier" },
    { id: "b2", title: "Waterproofing Master", desc: "Certified 7-Year Hydro-Lok Specialist", req: 500, unlocked: true, icon: ShieldCheck, level: "Specialist" },
    { id: "b3", title: "Royal Shine Stencil Expert", desc: "Mastered Metallic Feature Wall Stencils", req: 300, unlocked: true, icon: Sparkles, level: "Expert" },
    { id: "b4", title: "Swatch Platinum Applicator", desc: "Scan 2,500 lifetime bucket tokens", req: 2500, unlocked: totalTokens >= 2500, icon: Trophy, level: "Platinum Tier" }
  ];

  // Physical Milestone Rewards
  const physicalRewards = [
    { id: "r1", name: "Swatch Master Safety Kit & Apron", pointsReq: 1000, status: totalTokens >= 1000 ? "Ready to Claim" : "In Progress", progress: Math.min(100, Math.round((totalTokens / 1000) * 100)) },
    { id: "r2", name: "Swatch Airless Paint Spray Machine", pointsReq: 2500, status: totalTokens >= 2500 ? "Ready to Claim" : "In Progress", progress: Math.min(100, Math.round((totalTokens / 2500) * 100)) },
    { id: "r3", name: "Dealer Annual VIP Banquet Pass", pointsReq: 5000, status: totalTokens >= 5000 ? "Ready to Claim" : "In Progress", progress: Math.min(100, Math.round((totalTokens / 5000) * 100)) }
  ];

  const copyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-28 max-w-md mx-auto font-sans text-xs text-foreground px-1 sm:px-0">

      {/* ══ MOBILE QUICK HEADER & BRAND BANNER ═══════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-4 shadow-xl text-white">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
              ● Swatch Certified Milestones
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-black font-mono">
              {totalTokens.toLocaleString()} PTS
            </span>
          </div>

          <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase border border-amber-500/30">
            Gold Level Status
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              <Trophy size={18} className="text-indigo-400" /> Swatch Applicator Trophy Room
            </h1>
            <p className="text-[10px] text-slate-400">Earn certified badges, unlock physical reward kits, and prove expertise to clients.</p>
          </div>
        </div>

        <button
          onClick={() => {
            const badgeTxt = `*SWATCH PAINTS CERTIFIED APPLICATOR BADGES* 🏆\nApplicator: Rajesh Kumar\nBadges: 100-Bucket Club • Waterproofing Master • Stencil Specialist\nStatus: Swatch Gold Partner Applicator\n\nView official credentials & 7-Year Warranty certifications on Swatch Portal!`;
            navigator.clipboard.writeText(badgeTxt);
            alert("Swatch Certified Badges summary copied for WhatsApp sharing!");
          }}
          className="mt-3 w-full py-2 bg-white/10 border border-white/20 text-white font-black text-[10px] rounded-xl hover:bg-white/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Share2 size={12} /> Share Swatch Badges on WhatsApp
        </button>
      </div>

      {/* ══ MOBILE TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto text-[10px]">
        {[
          { id: "trophies", label: "Trophy Badges", icon: Award, badge: badges.filter(b => b.unlocked).length },
          { id: "rewards", label: "Reward Kits", icon: Gift },
          { id: "playbook", label: "Negotiation Playbook", icon: Shield, badge: "3 Strategies" }
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
          TAB 1: DIGITAL TROPHY ROOM & CERTIFIED BADGES
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "trophies" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Certified Swatch Badges</span>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
            </span>
          </div>

          <div className="space-y-2.5">
            {badges.map(b => {
              const Icon = b.icon;
              return (
                <div
                  key={b.id}
                  className={`bg-card border rounded-3xl p-4 flex items-start gap-3 transition-all shadow-xs ${
                    b.unlocked ? "border-emerald-500/30" : "border-border/50 opacity-60"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs ${
                    b.unlocked ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-muted border-border text-muted-foreground"
                  }`}>
                    {b.unlocked ? <Icon size={22} /> : <Lock size={18} />}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-foreground text-xs">{b.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-black ${
                        b.unlocked ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-muted text-muted-foreground"
                      }`}>
                        {b.level}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{b.desc}</p>
                    <p className="text-[9px] text-muted-foreground font-mono pt-1">Requirement: {b.req} Points</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: PHYSICAL REWARD KITS & GIFT PROGRESS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "rewards" && (
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider block">Physical Milestone Gifts</span>
                <h2 className="text-xs font-black text-foreground">Swatch Applicator Reward Tracker</h2>
              </div>
              <Gift size={18} className="text-indigo-500" />
            </div>

            <div className="space-y-3">
              {physicalRewards.map(r => (
                <div key={r.id} className="bg-muted/30 border border-border/50 rounded-2xl p-3 space-y-2 text-[10px]">
                  <div className="flex justify-between items-center font-bold text-foreground">
                    <span>{r.name}</span>
                    <span className={r.progress >= 100 ? "text-emerald-600 font-black" : "text-indigo-500 font-mono"}>
                      {r.progress}%
                    </span>
                  </div>

                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border/40">
                    <div
                      className={`h-full rounded-full ${r.progress >= 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                      style={{ width: `${r.progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
                    <span>Target: {r.pointsReq.toLocaleString()} PTS</span>
                    <span className={r.progress >= 100 ? "text-emerald-600 font-bold" : "text-amber-500 font-bold"}>
                      {r.status}
                    </span>
                  </div>

                  {r.progress >= 100 && (
                    <button
                      onClick={() => alert(`🎉 Reward "${r.name}" Claimed! Show coupon code SWATCH-REWARD-${Date.now().toString().slice(-5)} at Shree Ram Paints store counter.`)}
                      className="w-full py-1.5 bg-emerald-600 text-white font-black rounded-xl text-[9px] cursor-pointer hover:bg-emerald-700 shadow-xs mt-1"
                    >
                      Claim Reward at Store Counter
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: PAINTER NEGOTIATION OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-md space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white">Labor Rate & Store Priority Negotiation</h2>
            </div>
            <p className="text-[10px] text-slate-300">
              Use your Swatch Certified Badges to command higher labor rates and secure priority dealer stock dispatch.
            </p>
          </div>

          <div className="space-y-3">
            {SWATCH_ACHIEVEMENT_OBJECTIONS.map((obj, idx) => (
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
                  <strong className="block text-[8px] font-black uppercase text-rose-500 mb-0.5">Negotiation Challenge:</strong>
                  "{obj.problemText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 text-[10px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Painter Counter Strategy (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.solutionHindi}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[9px] font-bold text-muted-foreground">Share Negotiation Script</span>
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
