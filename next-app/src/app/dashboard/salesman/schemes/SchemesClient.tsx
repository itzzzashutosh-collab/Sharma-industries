"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  Award, Plus, X, BookOpen, AlertCircle, FileText, ChevronRight,
  Sparkles, Shield, Copy, Check, Share2, Upload, TrendingUp,
  Building2, Users, Flame, Zap, HelpCircle, CheckCircle2, Gift,
  Calendar, Percent, ArrowRight, DollarSign, Tag, Info, Trophy
} from "lucide-react";
import { proposeDealerGrowthProgram } from "../actions";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface GrowthProgram {
  id: string;
  name: string;
  category: "Volume Booster" | "Tier Upgrade" | "Painter Cashback" | "Seasonal Dhamaka" | "Festive Dhamaka" | "Focus SKU";
  details: string;
  criteria: string;
  eligibility: string;
  rewards: string;
  status: "Active" | "Proposed" | "Upcoming" | "Completed";
  minVolumeLiters?: number;
  bonusValueAmount?: number;
  durationDays?: number;
  enrolledDealersCount?: number;
  code?: string;
}

interface DealerProgress {
  id: string;
  dealer_name: string;
  locality: string;
  program_name: string;
  target_volume: number;
  current_volume: number;
  days_left: number;
  reward: string;
  status: "On Track" | "Near Milestone" | "Behind Target" | "Achieved";
}

interface Props {
  initialPrograms: any[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Paints B2B Growth Program Objections & Negotiation Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_SCHEME_OBJECTIONS = [
  {
    id: "SCH_OBJ_1",
    category: "High Target Threshold",
    title: "Scheme target threshold (200L) is too high for small shop",
    problemText: "Bhaiya, mera Chhota counter hai. 200 Litres Swatch Shine Emulsion target main 1 mahine mein achieve nahi kar sakta.",
    strategy: "Offer Staggered 45-Day Window or Sub-Dealer Pool Booking",
    solutionHindi: "Sir, aapke liye special 45-Day Extended Staggered Window activate kar denge. Aap 50L x 4 split orders karke target hit kar sakte hain. Sath mein local painters ke sub-orders bhi ismein combine count honge!",
    salesPitch: "Staggered 45-Day Booking + Contractor Pool Orders = 100% Guaranteed Reward Hit without inventory stress.",
    whatsappTemplate: "Namaste Sir! Swatch Paints Special 45-Day Extended Scheme Window active ho gaya hai. Ab aap 50L split orders karke full ₹7,500 Cash Rebate reward unlock kar sakte hain. First 50L order aaj book karein? 🎨"
  },
  {
    id: "SCH_OBJ_2",
    category: "Reward Preference",
    title: "Prefers Instant Cash Rebate over Gold Coin / Gift Item",
    problemText: "Mujhe Gold Coin ya TV gift nahi chahiye, mujhe direct order bill par cash discount do.",
    strategy: "Convert Physical Gift to Equivalent Credit Note (2.5% Extra Bill Rebate)",
    solutionHindi: "Sir, bilkul possible hai! Scheme achieve hote hi Gift Item ki jagah direct ₹6,000 ka Swatch Paints Credit Note generate hoke aapke next order invoice mein adjust ho jayega.",
    salesPitch: "Instant Credit Note Settlement = Immediate Cash Flow Improvement.",
    whatsappTemplate: "Sir, Swatch Paints Scheme Reward Direct Credit Note option available hai! Achieve karne par ₹6,000 instant invoice deduction milega. Let's start the volume drive today! 💰"
  },
  {
    id: "SCH_OBJ_3",
    category: "Near Milestone Gap",
    title: "What if I miss scheme target by 10% at month end?",
    problemText: "Agar main 180L pe ruk gaya aur 200L complete nahi hua, toh mera pura scheme bonus zero ho jayega kya?",
    strategy: "Provide 10-Day Grace Window if 80% Achieved by 25th",
    solutionHindi: "Sir, agar aap 25th date tak 80% (160L) complete kar lete hain toh Company 10-Day Grace Extension deti hai taaki aapka ₹7,500 bonus zero na ho aur aap easily finish line cross karein.",
    salesPitch: "80% Early Milestone Guarantee = Safety Net against target miss.",
    whatsappTemplate: "Sirji, Swatch Paints Scheme Protection Policy: 25th tak 80% hit karne par 10-day grace extension milta hai! Full bonus safe rahega. Current progress 140L hai, just 20L left for safety net! 🛡️"
  },
  {
    id: "SCH_OBJ_4",
    category: "Competitor Cashback Comparison",
    title: "Asian Paints gives instant cashback on every single bucket",
    problemText: "Asian Paints har 20L bucket par instant ₹100 cashback deta hai, tumhari scheme ka wait kyun karun?",
    strategy: "Highlight Dual Stacking: Instant Painter Cashback + Dealer Volume Kicker",
    solutionHindi: "Sir, Swatch Paints mein double benefit hai: 1st, Painter Ko App par Instant ₹150 Cashback milta hai (jo shop pe demand khinchta hai). 2nd, Month end par Dealer ko ₹5,000 Volume Kicker milta hai. Net profit 2x hai!",
    salesPitch: "Instant Painter App Pull + End-Month Dealer Kicker = Higher Net Profit per Bucket.",
    whatsappTemplate: "Sir, Swatch Paints Double Benefit Scheme: Instant Painter App Pull (₹150/bucket) + End-Month Dealer Bonus (₹5,000). Competitor se double net profit! Offer details attached. 🚀"
  },
  {
    id: "SCH_OBJ_5",
    category: "Scheme Stacking",
    title: "Can I combine Festive Dhamaka with Gold Partner Tier Discount?",
    problemText: "Main Gold Partner dealer hoon (3.5% margin), kya mujhe Festive Dhamaka Scheme bonus bhi milega?",
    strategy: "Confirm 100% Stackable Bonus Policy for Gold Partners",
    solutionHindi: "Sir, YES! Swatch Paints Gold Partners ke liye sabhi Growth Schemes 100% Stackable hain. Aapko aapka regular 3.5% Gold Margin milega, PLUS Festive Dhamaka ka ₹7,500 bonus alag se milega!",
    salesPitch: "Stackable Gold Partner Policy = Highest Profitability per Liter in the Market.",
    whatsappTemplate: "Great news Sir! Swatch Paints Gold Partners for 100% STACKABLE BONUS: Regular 3.5% Margin + ₹7,500 Festive Dhamaka Bonus together! Booking order now to maximize profit? 🏆"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function SchemesClient({ initialPrograms }: Props) {
  // Default Swatch Paints Schemes
  const defaultSwatchPrograms: GrowthProgram[] = [
    {
      id: "PROG_1",
      name: "Swatch Paints Festive Volume Dhamaka 2026",
      category: "Festive Dhamaka",
      details: "High-volume festival booster program for Swatch Emulsion & Luxury finishes. Hit 200 Litres in 30 days.",
      criteria: "Cumulative booking of 200L Swatch Shine / Rustic Royale",
      eligibility: "Open to all verified Swatch Paints dealers",
      rewards: "5L Free Acrylic Primer + ₹7,500 Direct Credit Note Rebate",
      status: "Active",
      minVolumeLiters: 200,
      bonusValueAmount: 7500,
      durationDays: 30,
      enrolledDealersCount: 8,
      code: "SWATCH-FEST-200"
    },
    {
      id: "PROG_2",
      name: "Swatch Paints Gold Partner Tier Upgrade",
      category: "Tier Upgrade",
      details: "Upgrade from Silver (2.5%) to Gold Partner (3.5%) permanent order margin tier.",
      criteria: "Achieve ₹4,500,000 quarterly Swatch Paints order turnover",
      eligibility: "Silver Tier Swatch Dealers",
      rewards: "Permanent 3.5% Margin Tier + Free LED Glow Sign Board",
      status: "Active",
      minVolumeLiters: 500,
      bonusValueAmount: 18000,
      durationDays: 90,
      enrolledDealersCount: 4,
      code: "SWATCH-GOLD-TIER"
    },
    {
      id: "PROG_3",
      name: "Swatch Paints Painter App Double Cashback Boost",
      category: "Painter Cashback",
      details: "Double token points on Swatch Painter Loyalty App for all 20L Emulsion & Waterproofing buckets.",
      criteria: "Minimum 15 Painter Registrations in territory",
      eligibility: "All Dealers with active Painter Network",
      rewards: "Double Wallet Points for Painters + ₹3,000 Dealer Event Fund",
      status: "Active",
      minVolumeLiters: 150,
      bonusValueAmount: 5000,
      durationDays: 30,
      enrolledDealersCount: 12,
      code: "SWATCH-PAINTER-2X"
    },
    {
      id: "PROG_4",
      name: "Swatch Damp Shield Waterproofing Monsoon Kicker",
      category: "Focus SKU",
      details: "Monsoon special scheme on Damp Shield Waterproofing range. Earn special per-bucket kicker.",
      criteria: "Order 25 Buckets (20L) Swatch Damp Shield",
      eligibility: "Open to all Dealers",
      rewards: "₹250 Extra Cash Kicker per Bucket (Total ₹6,250)",
      status: "Active",
      minVolumeLiters: 500,
      bonusValueAmount: 6250,
      durationDays: 45,
      enrolledDealersCount: 6,
      code: "SWATCH-DAMP-MONSOON"
    }
  ];

  // Merge initial programs from server if available with unique IDs
  const mergedPrograms: GrowthProgram[] = useMemo(() => {
    const map = new Map<string, GrowthProgram>();

    if (initialPrograms && initialPrograms.length > 0) {
      initialPrograms.forEach((p: any, idx: number) => {
        const id = p.id ? String(p.id) : `PROG_SRV_${idx}`;
        map.set(id, {
          id,
          name: p.name && p.name.includes("Swatch") ? p.name : `Swatch Paints ${p.name || "Growth Program"}`,
          category: (p.category || "Volume Booster") as any,
          details: p.details || "Swatch Paints Growth Program",
          criteria: p.criteria || "Standard Target Criteria",
          eligibility: p.eligibility || "Open to all verified Swatch Paints dealers",
          rewards: p.rewards || "Special Scheme Bonus",
          status: p.status || "Active",
          minVolumeLiters: 200,
          bonusValueAmount: 5000,
          durationDays: 30,
          enrolledDealersCount: 3,
          code: `SWATCH-PROG-${idx}`
        });
      });
    }

    defaultSwatchPrograms.forEach((p, idx) => {
      if (!map.has(p.id)) {
        map.set(p.id, p);
      } else {
        const altId = `PROG_DEF_${idx + 1}_${p.id}`;
        map.set(altId, { ...p, id: altId });
      }
    });

    return Array.from(map.values());
  }, [initialPrograms]);

  // Dealer Progress Tracking Mock Data
  const dealerProgressList: DealerProgress[] = [
    { id: "DP1", dealer_name: "Shree Ram Paints", locality: "Malviya Nagar", program_name: "Swatch Paints Festive Volume Dhamaka 2026", target_volume: 200, current_volume: 165, days_left: 8, reward: "₹7,500 Credit Note", status: "Near Milestone" },
    { id: "DP2", dealer_name: "Sharma Colour House", locality: "Sanganer", program_name: "Swatch Paints Gold Partner Tier Upgrade", target_volume: 500, current_volume: 420, days_left: 24, reward: "3.5% Margin Tier", status: "On Track" },
    { id: "DP3", dealer_name: "Ravi Paint & Hardware", locality: "Tonk Road", program_name: "Swatch Damp Shield Waterproofing Monsoon Kicker", target_volume: 25, current_volume: 25, days_left: 12, reward: "₹6,250 Cash Kicker", status: "Achieved" },
    { id: "DP4", dealer_name: "Rajasthan Paint Depot", locality: "Vaishali Nagar", program_name: "Swatch Paints Painter App Double Cashback Boost", target_volume: 150, current_volume: 60, days_left: 10, reward: "Double Points", status: "Behind Target" }
  ];

  // States
  const [programs, setPrograms] = useState<GrowthProgram[]>(mergedPrograms);
  const [activeTab, setActiveTab] = useState<"schemes" | "propose" | "playbook" | "progress" | "analytics">("schemes");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState<GrowthProgram | null>(null);
  const [selectedEnrollDealer, setSelectedEnrollDealer] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // Proposal Form State
  const [propName, setPropName] = useState("");
  const [propDetails, setPropDetails] = useState("");
  const [propCriteria, setPropCriteria] = useState("");
  const [propEligibility, setPropEligibility] = useState("");
  const [propRewards, setPropRewards] = useState("");
  const [propCategory, setPropCategory] = useState<any>("Volume Booster");

  // Metrics
  const metrics = useMemo(() => {
    const activeCount = programs.filter(p => p.status === "Active").length;
    const totalEnrolled = dealerProgressList.length;
    const totalBonusValue = programs.reduce((s, p) => s + (p.bonusValueAmount || 5000), 0);
    return { activeCount, totalEnrolled, totalBonusValue };
  }, [programs, dealerProgressList]);

  // Filtered Programs
  const filteredPrograms = useMemo(() => {
    return programs.filter(p => categoryFilter === "ALL" || p.category === categoryFilter);
  }, [programs, categoryFilter]);

  // Handlers
  const handleProposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propName || !propDetails || !propCriteria) {
      alert("Please fill in Program Name, Description, and Target Criteria.");
      return;
    }

    const swatchName = propName.startsWith("Swatch") ? propName : `Swatch Paints ${propName}`;

    startTransition(async () => {
      await proposeDealerGrowthProgram({
        name: swatchName,
        details: propDetails,
        criteria: propCriteria,
        eligibility: propEligibility || "Open to all verified Swatch Paints dealers",
        rewards: propRewards || "TBD Scheme Incentive"
      });

      const newProg: GrowthProgram = {
        id: `PROG_${Date.now()}`,
        name: swatchName,
        category: propCategory,
        details: propDetails,
        criteria: propCriteria,
        eligibility: propEligibility || "Open to all verified Swatch Paints dealers",
        rewards: propRewards || "TBD Scheme Incentive",
        status: "Proposed",
        minVolumeLiters: 150,
        bonusValueAmount: 5000,
        durationDays: 30,
        enrolledDealersCount: 0,
        code: `SWATCH-PROP-${Math.floor(100 + Math.random() * 900)}`
      };

      setPrograms(prev => [newProg, ...prev]);
      setActiveTab("schemes");
      setPropName("");
      setPropDetails("");
      setPropCriteria("");
      setPropEligibility("");
      setPropRewards("");
      alert(`Territory Growth Program "${swatchName}" proposed to CEO successfully! Awaiting review.`);
    });
  };

  const copyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 text-xs font-sans text-foreground">

      {/* ══ HERO BANNER ═══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-r from-slate-950 via-amber-950/70 to-slate-950 p-5 sm:p-6 shadow-2xl text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.2),_transparent_70%)]" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[9px] font-black uppercase tracking-widest text-amber-300">
                Swatch Paints Growth Hub
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black">
                ● ACTIVE SCHEMES
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Gift size={22} className="text-amber-400" /> Swatch Paints Dealer Growth Programs
            </h1>
            <p className="text-slate-400 text-[11px] max-w-xl">
              Pitch high-volume Swatch Paints schemes, track dealer milestone progress, handle scheme objections, and propose territory-custom schemes to CEO.
            </p>
          </div>

          <button
            onClick={() => setActiveTab("propose")}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-xs hover:opacity-95 shadow-lg shadow-amber-500/25 transition-all cursor-pointer border border-amber-400/30"
          >
            <Plus size={16} /> Propose Scheme to CEO
          </button>
        </div>

        {/* Dynamic Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Active Schemes</span>
            <p className="text-lg font-black text-white font-mono">{metrics.activeCount} Active</p>
            <span className="text-[9px] text-slate-400">Available for enrollment</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-amber-400 block mb-0.5">Participating Dealers</span>
            <p className="text-lg font-black text-amber-300 font-mono">{metrics.totalEnrolled} Dealers</p>
            <span className="text-[9px] text-slate-400">In territory volume drives</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-emerald-400 block mb-0.5">Unlocked Rewards</span>
            <p className="text-lg font-black text-emerald-300 font-mono">{fmt(metrics.totalBonusValue)}</p>
            <span className="text-[9px] text-slate-400">Total scheme bonus value</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-indigo-300 block mb-0.5">Brand Identity</span>
            <p className="text-lg font-black text-indigo-200 font-mono">Swatch Paints</p>
            <span className="text-[9px] text-slate-400">Official dealer & painter brand</span>
          </div>
        </div>
      </div>

      {/* ══ TAB NAVIGATION ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1.5 bg-muted/60 p-1.5 rounded-2xl border border-border overflow-x-auto">
        {[
          { id: "schemes", label: "Active Growth Schemes", icon: Gift, badge: metrics.activeCount },
          { id: "propose", label: "Propose Scheme to CEO", icon: Plus, highlight: true },
          { id: "playbook", label: "Scheme Objection Master", icon: Shield, badge: "5 Strategies" },
          { id: "progress", label: "Dealer Milestone Progress", icon: TrendingUp, badge: `${metrics.totalEnrolled} Enrolled` },
          { id: "analytics", label: "Scheme ROI Analytics", icon: Award }
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
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: ACTIVE SWATCH GROWTH SCHEMES
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "schemes" && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {["ALL", "Festive Dhamaka", "Tier Upgrade", "Painter Cashback", "Focus SKU"].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Scheme Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPrograms.map(prog => {
              const isActive = prog.status === "Active";

              return (
                <div key={prog.id} className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-[9px] border border-amber-500/20">
                        {prog.category}
                      </span>
                      <span className="font-mono text-[9px] text-muted-foreground font-bold">{prog.code}</span>
                    </div>

                    <h3 className="font-extrabold text-foreground text-xs sm:text-sm flex items-center gap-1.5">
                      <Award size={15} className="text-amber-500" /> {prog.name}
                    </h3>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">{prog.details}</p>
                  </div>

                  <div className="border-t border-border/40 pt-3 space-y-2 text-[10px]">
                    <div>
                      <span className="font-bold text-foreground">Target Criteria:</span>
                      <p className="text-muted-foreground mt-0.5">{prog.criteria}</p>
                    </div>
                    <div>
                      <span className="font-bold text-foreground">Eligibility Rules:</span>
                      <p className="text-muted-foreground mt-0.5">{prog.eligibility}</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-amber-700 dark:text-amber-300 font-bold">
                      <span>🎁 Scheme Incentive Reward:</span>
                      <p className="text-xs font-black font-mono mt-0.5">{prog.rewards}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-border/40">
                    <button
                      onClick={() => {
                        const txt = `*SWATCH PAINTS GROWTH SCHEME ANNOUNCEMENT* 🎨\nProgram: ${prog.name}\nCriteria: ${prog.criteria}\nReward: ${prog.rewards}\n\nContact your Swatch Paints Sales Executive today to enroll!`;
                        navigator.clipboard.writeText(txt);
                        alert(`WhatsApp Scheme Announcement copied for ${prog.name}!`);
                      }}
                      className="flex-1 py-2 rounded-xl border border-border bg-background hover:bg-muted font-bold text-foreground text-[10px] cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Share2 size={12} /> Share Announcement
                    </button>

                    <button
                      onClick={() => setShowEnrollModal(prog)}
                      className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-[10px] hover:bg-amber-400 transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      <UserPlusIcon /> Enroll Dealer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: PROPOSE CUSTOM TERRITORY SCHEME TO CEO
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "propose" && (
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                <Plus size={18} className="text-amber-500" /> Propose Custom Territory Scheme to CEO
              </h2>
              <p className="text-muted-foreground text-[11px]">
                Design and submit custom Swatch Paints volume booster schemes tailored for your specific market area.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("schemes")}
              className="px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:bg-muted font-bold text-[10px]"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleProposeSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                1. Program / Scheme Title *
              </label>
              <input
                required
                type="text"
                value={propName}
                onChange={e => setPropName(e.target.value)}
                placeholder="e.g. Swatch Paints Jaipur Monsoon Waterproofing Drive"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                  Scheme Category
                </label>
                <select
                  value={propCategory}
                  onChange={e => setPropCategory(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
                >
                  <option value="Volume Booster">Volume Booster</option>
                  <option value="Tier Upgrade">Tier Upgrade</option>
                  <option value="Painter Cashback">Painter Cashback</option>
                  <option value="Seasonal Dhamaka">Seasonal Dhamaka</option>
                  <option value="Focus SKU">Focus SKU Special</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                  Eligibility Rule
                </label>
                <input
                  type="text"
                  value={propEligibility}
                  onChange={e => setPropEligibility(e.target.value)}
                  placeholder="e.g. Open to Tier 1 & Tier 2 Swatch Dealers"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                2. Program Description & Details *
              </label>
              <textarea
                required
                value={propDetails}
                onChange={e => setPropDetails(e.target.value)}
                placeholder="Describe the market opportunity and campaign objective for Swatch Paints products..."
                rows={3}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                  3. Target Volume Criteria *
                </label>
                <input
                  required
                  type="text"
                  value={propCriteria}
                  onChange={e => setPropCriteria(e.target.value)}
                  placeholder="e.g. Cumulative order of 150L Damp Shield in 30 days"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                  4. Dealer Incentive Rewards Value *
                </label>
                <input
                  type="text"
                  value={propRewards}
                  onChange={e => setPropRewards(e.target.value)}
                  placeholder="e.g. ₹6,000 Direct Credit Note + 5L Primer Free"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 bg-amber-500 text-slate-950 font-black text-xs rounded-2xl hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} /> Submit Scheme Proposal to CEO / Management
            </button>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: SWATCH SCHEME OBJECTION & NEGOTIATION MASTER PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-950 via-amber-950 to-slate-950 text-white rounded-3xl p-5 border border-amber-500/30 shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-amber-400" />
              <h2 className="text-base font-black text-white">Swatch Paints Growth Program Objection Master</h2>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Negotiate scheme thresholds, handle reward preference objections, and send instant WhatsApp pitches to enroll dealers.
            </p>
          </div>

          <div className="space-y-4">
            {SWATCH_SCHEME_OBJECTIONS.map((obj, idx) => (
              <div key={obj.id} className="bg-card border border-border rounded-3xl p-5 space-y-3.5 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {obj.category}
                  </span>
                  <h3 className="font-extrabold text-foreground text-xs sm:text-sm mt-1 flex-1">
                    {idx + 1}. {obj.title}
                  </h3>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 text-[11px] text-rose-600 dark:text-rose-300 font-medium">
                  <strong className="block text-[9px] font-black uppercase text-rose-500 mb-0.5">Dealer Scheme Objection:</strong>
                  "{obj.problemText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-[11px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Swatch Counter Strategy (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.solutionHindi}</p>
                </div>

                <div className="bg-muted/40 border border-border rounded-2xl p-3 text-[10px] text-muted-foreground space-y-0.5">
                  <strong className="block text-[9px] font-black uppercase text-foreground">
                    🎯 Pitch Value Proposition:
                  </strong>
                  <p>{obj.salesPitch}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-[10px] font-bold text-muted-foreground">WhatsApp Scheme Enrollment Pitch</span>
                  <button
                    onClick={() => copyScript(obj.id, obj.whatsappTemplate)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-[10px] hover:bg-amber-400 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedObjId === obj.id ? (
                      <>
                        <Check size={12} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy WhatsApp Pitch
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
          TAB 4: DEALER MILESTONE PROGRESS TRACKER
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "progress" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <TrendingUp size={16} className="text-amber-500" /> Participating Dealer Milestone Tracker
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Monitor enrolled dealers, their volume progress bars, and days remaining to hit bonus thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dealerProgressList.map(dp => {
              const pct = Math.min(100, Math.round((dp.current_volume / dp.target_volume) * 100));
              const isAchieved = pct >= 100;

              return (
                <div key={dp.id} className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground">{dp.locality}</span>
                      <h3 className="font-extrabold text-foreground text-xs">{dp.dealer_name}</h3>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">{dp.program_name}</p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                        isAchieved
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : dp.status === "Near Milestone"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      }`}
                    >
                      {dp.status}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="w-full h-2.5 bg-muted/60 rounded-full overflow-hidden border border-border/50">
                      <div
                        className={`h-full rounded-full ${isAchieved ? "bg-emerald-500" : "bg-amber-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground font-bold">
                      <span>Volume: {dp.current_volume}L / {dp.target_volume}L ({pct}%)</span>
                      <span>Days Left: {dp.days_left}d</span>
                    </div>
                  </div>

                  <div className="bg-muted/30 border border-border/50 rounded-2xl p-3 flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground font-medium">Locked Reward:</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{dp.reward}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 5: SCHEME ROI ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Award size={16} className="text-amber-500" /> Scheme ROI & Territory Impact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Scheme Order Volume Growth</span>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">+34.2% YoY</p>
                <span className="text-[9px] text-emerald-500 font-bold">Top growth driver in territory</span>
              </div>
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Top Scheme SKU</span>
                <p className="text-base font-black text-foreground font-mono">Swatch Shine 20L</p>
                <span className="text-[9px] text-muted-foreground">420 Liters ordered in schemes</span>
              </div>
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Dealer Incentive ROI</span>
                <p className="text-base font-black text-amber-500 font-mono">4.8x Volume Return</p>
                <span className="text-[9px] text-amber-400 font-bold">Per ₹1 incentive spent</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ENROLL DEALER MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showEnrollModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowEnrollModal(null)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border bg-amber-500/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest">Enroll Dealer in Scheme</span>
                <h3 className="text-xs font-black text-foreground">{showEnrollModal.name}</h3>
              </div>
              <button onClick={() => setShowEnrollModal(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={14} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                  Select Target Dealer *
                </label>
                <select
                  value={selectedEnrollDealer}
                  onChange={e => setSelectedEnrollDealer(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
                >
                  <option value="">-- Choose Dealer Store --</option>
                  {dealerProgressList.map(d => (
                    <option key={d.id} value={d.dealer_name}>
                      {d.dealer_name} ({d.locality})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-muted/40 border border-border rounded-2xl p-3 space-y-1 text-[10px]">
                <p className="font-bold text-foreground">Target: {showEnrollModal.criteria}</p>
                <p className="text-amber-600 dark:text-amber-400 font-bold">Reward: {showEnrollModal.rewards}</p>
              </div>

              <button
                onClick={() => {
                  if (!selectedEnrollDealer) {
                    alert("Please select a dealer to enroll.");
                    return;
                  }
                  alert(`Dealer "${selectedEnrollDealer}" successfully enrolled in ${showEnrollModal.name}! Target tracking initiated.`);
                  setShowEnrollModal(null);
                  setSelectedEnrollDealer("");
                }}
                className="w-full py-2.5 bg-amber-500 text-slate-950 font-black text-[11px] rounded-xl hover:bg-amber-400 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Confirm Dealer Scheme Enrollment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function UserPlusIcon() {
  return <Users size={12} />;
}
