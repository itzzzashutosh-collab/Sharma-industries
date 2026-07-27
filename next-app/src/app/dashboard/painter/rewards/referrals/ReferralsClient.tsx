"use client";

import React, { useState, useMemo } from "react";
import {
  UserCheck, Copy, Share2, Sparkles, CheckCircle2, Smartphone, MapPin, Calendar, Award, DollarSign,
  Gift, Users, Shield, Check, Phone, TrendingUp, ArrowRight, UserPlus
} from "lucide-react";

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

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Painter Referral Program & Contractor Invite Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_REFERRAL_OBJECTIONS = [
  {
    id: "REF_OBJ_1",
    category: "Applicator Network Benefits",
    title: "Why should a fellow painter register on Swatch Applicator Network?",
    problemText: "Other painter asks what benefits they get after registering.",
    strategy: "Highlight 1.5x Token Cashback + 2-Minute Direct UPI Transfer + FREE Safety Kit",
    solutionHindi: "Bhaiya, Swatch Paints mein register karne par har bucket token par 1.5x Cash Payout + 2 minutes mein direct PhonePe UPI transfer milti hai + 1st scan par FREE Safety Apron Kit milti hai!",
    salesPitch: "1.5x Token Cashback + 2-Minute Direct UPI Transfer + FREE Safety Apron Kit.",
    whatsappTemplate: "Namaste Bhaiya! Join Swatch Paints Applicator Network using my code SWATCH-RAJESH-9876: 1.5x Token Cashback + 2-Minute Direct PhonePe UPI Payouts + FREE Safety Apron Kit on 1st scan! Register here: https://swatchpaints.com/join?ref=SWATCH-RAJESH-9876 🎨"
  },
  {
    id: "REF_OBJ_2",
    category: "Referral Bonus Credit Time",
    title: "When does the ₹500 referral bonus credit to my wallet?",
    problemText: "When will I get the ₹500 cash referral bonus after inviting a painter?",
    strategy: "Instant Automatic ₹500 Cash Wallet Credit upon Referred Painter's 1st Scan",
    solutionHindi: "Bhaiya, jaise hi aapka referred painter apna pehla Swatch Paint bucket QR scan karta hai, turant aapke Swatch Cash Wallet mein ₹500 Direct Cash Credit ho jaata hai!",
    salesPitch: "Instant Automatic ₹500 Cash Credit on 1st Bucket Scan.",
    whatsappTemplate: "Bhaiya, Swatch Referral Bonus: Jaise hi aapka referred painter 1st bucket scan karega, turant aapko ₹500 Cash + 500 Points bonus wallet mein credit honge! 💰"
  },
  {
    id: "REF_OBJ_3",
    category: "Simple 1-Minute Registration",
    title: "Do I need GST registration to invite other painters?",
    problemText: "Referred painter is worried about tax registration requirements.",
    strategy: "Zero GST Required — Simple 1-Minute Mobile Registration with PAN/Aadhaar",
    solutionHindi: "Bhaiya, koi GST ki zaroorat nahi hai! Mobile number + Aadhaar basis par 1 minute mein Swatch Applicator Registration complete hota hai. Direct painter signup!",
    salesPitch: "Zero GST Required = 1-Minute Mobile Registration.",
    whatsappTemplate: "Bhaiya, Swatch Painter Signup: No GST required! Only Mobile number & Aadhaar basis par 1 minute mein instant registration. Direct cash benefits start today! 📱"
  }
];

export function ReferralsClient({ initialData }: Props) {
  const [profile] = useState(initialData.profile);
  const [list, setList] = useState<ReferredPainter[]>(() => {
    if (initialData.list && initialData.list.length > 0) {
      return initialData.list;
    }
    return [
      { id: "ref_1", name: "Suresh Saini (Malviya Nagar)", phone: "9829011223", status: "Active", total_tokens: 450, created_at: "2026-07-20" },
      { id: "ref_2", name: "Mukesh Bairwa (Tonk Road)", phone: "9829033445", status: "Active", total_tokens: 300, created_at: "2026-07-22" },
      { id: "ref_3", name: "Ramesh Prajapat (Sanganer)", phone: "9829055667", status: "Registered", total_tokens: 0, created_at: "2026-07-25" }
    ];
  });

  const [activeTab, setActiveTab] = useState<"referrals" | "playbook">("referrals");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);

  const refCode = `SWATCH-${profile.name ? profile.name.slice(0, 6).toUpperCase() : "RAJESH"}-9876`;
  const activeReferralsCount = list.filter(p => p.status === "Active" || Number(p.total_tokens) > 0).length;
  const totalReferralEarnings = activeReferralsCount * 500;

  const copyRefCode = () => {
    navigator.clipboard.writeText(refCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const copyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-28 max-w-md mx-auto font-sans text-xs text-foreground px-1 sm:px-0">

      {/* ══ MOBILE QUICK HEADER & REFERRAL BANNER ════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-4 shadow-xl text-white">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
              ● Swatch Painter Referral Hub
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black font-mono">
            ₹500 Bonus / Painter
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 block">Total Referral Earnings</span>
            <h1 className="text-xl font-black text-emerald-300 font-mono tracking-tight">{fmt(totalReferralEarnings)}</h1>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{activeReferralsCount} Activated Painters</p>
          </div>

          <button
            onClick={() => {
              const inviteMsg = `Namaste Bhaiya! Register on Swatch Paints Applicator Network using my referral code: *${refCode}*\n\nGet 1.5x Token Cashback + 2-Minute Direct PhonePe UPI Transfer + FREE Safety Kit on 1st bucket scan!\n\nJoin Swatch Paints here: https://swatchpaints.com/join?ref=${refCode}`;
              navigator.clipboard.writeText(inviteMsg);
              alert("Swatch Referral Invite Link copied for WhatsApp sharing!");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all cursor-pointer border border-emerald-400/30 active:scale-95 shrink-0"
          >
            <Share2 size={16} /> Invite Painter
          </button>
        </div>

        {/* Unique Code Box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mt-4 flex items-center justify-between font-mono">
          <div>
            <span className="text-[8px] font-black uppercase text-slate-400 block">Your Unique Swatch Code</span>
            <span className="font-bold text-white text-xs">{refCode}</span>
          </div>
          <button
            onClick={copyRefCode}
            className="px-3 py-1.5 bg-indigo-600 text-white font-black text-[9px] rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer flex items-center gap-1"
          >
            {copiedCode ? <Check size={12} /> : <Copy size={12} />}
            {copiedCode ? "Copied" : "Copy Code"}
          </button>
        </div>
      </div>

      {/* ══ MOBILE TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto text-[10px]">
        {[
          { id: "referrals", label: "My Painter Network", icon: Users, badge: list.length },
          { id: "playbook", label: "Invite Playbook", icon: Shield, badge: "3 Strategies" }
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
          TAB 1: MY PAINTER NETWORK DIRECTORY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "referrals" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Referred Painters Directory</span>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {activeReferralsCount} / {list.length} Activated
            </span>
          </div>

          <div className="space-y-2.5">
            {list.map(ref => {
              const isActive = ref.status === "Active" || Number(ref.total_tokens) > 0;
              return (
                <div key={ref.id} className="bg-card border border-border rounded-3xl p-4 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-foreground text-xs flex items-center gap-1">
                        {ref.name} {isActive && <CheckCircle2 size={13} className="text-emerald-500 fill-emerald-500/10" />}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-mono">Mobile: {ref.phone}</p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase font-mono border ${
                      isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                      {isActive ? "₹500 Bonus Credited" : "Pending 1st Scan"}
                    </span>
                  </div>

                  <div className="bg-muted/30 border border-border/50 rounded-2xl p-2.5 flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                    <span>Joined: {ref.created_at}</span>
                    <span className={isActive ? "font-bold text-emerald-600 dark:text-emerald-400" : "font-bold text-amber-500"}>
                      {isActive ? "+₹500 Cash Bonus" : "Remind to Scan QR"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: CONTRACTOR INVITE OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-md space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white">Contractor Invite & Onboarding Counters</h2>
            </div>
            <p className="text-[10px] text-slate-300">
              Convince fellow painters to register on Swatch Applicator Network and earn ₹500 cash per referral.
            </p>
          </div>

          <div className="space-y-3">
            {SWATCH_REFERRAL_OBJECTIONS.map((obj, idx) => (
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
                  <span className="text-[9px] font-bold text-muted-foreground">Share Invite Script</span>
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
