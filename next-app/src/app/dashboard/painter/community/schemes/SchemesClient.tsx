"use client";

import React, { useState } from "react";
import {
  Sparkles, Calendar, ArrowRight, Shield, Copy, Check, Share2, Award, Gift, Flame, Trophy, Clock,
  CheckCircle2, Target
} from "lucide-react";

interface Scheme {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  target_buckets?: number;
  current_scanned?: number;
  reward?: string;
  days_left?: number;
}

interface Props {
  initialData: {
    schemes: Scheme[];
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Painter Loyalty Schemes & Target Slab Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_SCHEME_OBJECTIONS = [
  {
    id: "SCH_OBJ_1",
    category: "Near-Miss Target Extension",
    title: "What happens if I reach 18 bags out of 20 target slab by the deadline?",
    problemText: "Painter is 2 bags short of target slab on final scheme day.",
    strategy: "3-Day Grace Period Extension via Zonal Sales Executive",
    solutionHindi: "Namaste bhaiya, agar aap 1-2 bags short rehte hain, toh Swatch Zonal Sales Executive 3-day grace extension issue karte hain taaki aapka target reward miss na ho!",
    salesPitch: "3-Day Target Grace Period Extension via Zonal Sales Executive Authorization.",
    whatsappTemplate: "Namaste bhaiya! Swatch Scheme Protection: 1-2 bag short hone par 3-Day Grace Period Extension! Complete your slab & claim cash bonus at your authorized counter! 🎁"
  },
  {
    id: "SCH_OBJ_2",
    category: "Painters Growth Tokens Credit",
    title: "How do ₹50 cash tokens work inside Swatch Rustic Texture bags?",
    problemText: "Painter is asking how ₹50 cash token inside bag is credited.",
    strategy: "Instant ₹50 Token Inside Every 25kg Bag + Instant Scan Payout",
    solutionHindi: "Bhaiya, Swatch Rustic Texture 25kg bag mein ₹50 ka physical cash token andar rehta hai, aur bag QR scan karte hi direct wallet cash credit ho jaata hai!",
    salesPitch: "Instant ₹50 Cash Token Inside Every 25kg Bag + Direct Digital Cashback.",
    whatsappTemplate: "Bhaiya, Swatch Rustic Texture 25kg bag: ₹50 Token inside every bag + instant wallet payout! Track balance directly on your Swatch App! ⚡"
  },
  {
    id: "SCH_OBJ_3",
    category: "Store Counter Cash Bonus Claim",
    title: "Can I collect cash bonuses directly at the retail store counter?",
    problemText: "Painter wants instant cash bonus collection at retail counter.",
    strategy: "Generate Instant Store QR Voucher for Over-the-Counter Settlement",
    solutionHindi: "Bhaiya, bilkul! Target complete hote hi app se 'Cash Bonus Claim Voucher' generate karein aur authorized counter par dikha kar instant cash collect karein!",
    salesPitch: "Instant Store QR Voucher for Over-the-Counter Cash Bonus Settlement.",
    whatsappTemplate: "Bhaiya, Swatch Milestone Reward: App se Claim Voucher generate karein aur retail counter se direct cash bonus collect karein! 🏆"
  }
];

export function SchemesClient({ initialData }: Props) {
  const [schemes] = useState<Scheme[]>(() => {
    if (initialData.schemes && initialData.schemes.length > 0) {
      return initialData.schemes;
    }
    return [
      {
        id: "sch_1",
        title: "Painters Growth Tokens — Rustic Texture Volume Slab",
        description: "Scan 50 bags of Swatch Rustic Texture (25kg) with ₹50 token inside to unlock +₹2,500 Cash Milestone + FREE Master Texture Sample Kit.",
        start_date: "2026-09-01",
        end_date: "2026-10-31",
        target_buckets: 50,
        current_scanned: 0,
        reward: "+₹2,500 Cash Milestone + Sample Kit",
        days_left: 41
      },
      {
        id: "sch_2",
        title: "Swatch Weatherguard Exterior 20L Target Club",
        description: "Scan 20 buckets of Swatch Weatherguard Exterior (20L) to unlock +₹2,000 Direct Bank Transfer + Official Painter Jacket.",
        start_date: "2026-09-01",
        end_date: "2026-10-15",
        target_buckets: 20,
        current_scanned: 0,
        reward: "+₹2,000 Cash Transfer + Painter Jacket",
        days_left: 25
      },
      {
        id: "sch_3",
        title: "Swatch Texture Mastery Milestone (100 Bags)",
        description: "Achieve 100 bags of Swatch Rustic & Roller Coat across your project sites to receive ₹5,000 Milestone Bonus + Swatch Certified Applicator Badge.",
        start_date: "2026-09-01",
        end_date: "2026-11-30",
        target_buckets: 100,
        current_scanned: 0,
        reward: "₹5,000 Milestone Bonus + Certified Badge",
        days_left: 71
      }
    ];
  });

  const [activeTab, setActiveTab] = useState<"schemes" | "playbook">("schemes");
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);

  const copyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-28 max-w-md mx-auto font-sans text-xs text-foreground px-1 sm:px-0">

      {/* ══ MOBILE QUICK HEADER & SCHEMES BANNER ═════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-4 shadow-xl text-white">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
              ● Swatch Active Loyalty Schemes
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black font-mono">
            {schemes.length} Live Schemes
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              <Trophy size={18} className="text-amber-400" /> Swatch Applicator Target Schemes
            </h1>
            <p className="text-[10px] text-slate-400">Scan buckets to complete target slabs and unlock cash bonuses & gold coins.</p>
          </div>
        </div>
      </div>

      {/* ══ MOBILE TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto text-[10px]">
        {[
          { id: "schemes", label: "Active Schemes", icon: Target, badge: schemes.length },
          { id: "playbook", label: "Scheme Playbook", icon: Shield, badge: "3 Strategies" }
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
          TAB 1: ACTIVE LOYALTY SCHEMES & TARGET PROGRESS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "schemes" && (
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Live Swatch Target Slabs</span>

          <div className="space-y-3">
            {schemes.map(s => {
              const scanned = s.current_scanned || 11;
              const target = s.target_buckets || 15;
              const pct = Math.min(100, Math.round((scanned / target) * 100));

              return (
                <div key={s.id} className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        🔥 {s.days_left || 14} Days Left
                      </span>
                      <h3 className="font-extrabold text-foreground text-xs sm:text-sm mt-1">{s.title}</h3>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-black text-[10px]">
                      {pct}%
                    </span>
                  </div>

                  <p className="text-[10px] text-muted-foreground bg-muted/30 p-2.5 rounded-2xl border border-border/50 leading-relaxed">
                    {s.description}
                  </p>

                  {/* Target Bucket Progress Gauge */}
                  <div className="space-y-1 bg-muted/20 p-2.5 rounded-2xl border border-border/40">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-muted-foreground">Slab Progress: <strong>{scanned} / {target} Buckets</strong></span>
                      <span className="font-bold text-amber-500">{target - scanned} Buckets Short</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border/40">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Reward & Share Row */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                      <Gift size={13} />
                      <span className="truncate max-w-[180px]">{s.reward}</span>
                    </div>

                    <button
                      onClick={() => {
                        const shareTxt = `*SWATCH PAINTS ACTIVE APPLICATOR SCHEME* 🏆\nScheme: ${s.title}\nTarget Slab: ${target} Buckets\nReward: ${s.reward}\nDays Left: ${s.days_left} Days\n\nValid at Shree Ram Paints! Scan buckets today.`;
                        navigator.clipboard.writeText(shareTxt);
                        alert(`Scheme details for "${s.title}" copied for WhatsApp sharing!`);
                      }}
                      className="px-2.5 py-1 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 text-[9px] cursor-pointer flex items-center gap-1"
                    >
                      <Share2 size={11} /> Share
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: SCHEME TARGET OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-md space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white">Target Slab & Double Cashback Counters</h2>
            </div>
            <p className="text-[10px] text-slate-300">
              Address painter questions regarding target extensions, monsoon double tokens, and gold coin counter claims.
            </p>
          </div>

          <div className="space-y-3">
            {SWATCH_SCHEME_OBJECTIONS.map((obj, idx) => (
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
