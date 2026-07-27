"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  BookOpen, Search, Sparkles, CheckCircle2, Trophy, Clock, Download, Plus, X,
  Shield, Copy, Check, Share2, Upload, TrendingUp, Building2, Users, Flame, Zap,
  HelpCircle, Award, Play, ChevronRight, FileText, Star, Brain, Lightbulb, Target, RefreshCw
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Module {
  id: string;
  title: string;
  category: "Product Mastery" | "B2B Negotiation" | "Objection Handling" | "Painter Engagement" | "Merchandising";
  duration: string;
  progress: number;
  level: "Beginner" | "Intermediate" | "Advanced" | "Master";
  summary: string;
  keyTakeaway: string;
  certificateEarned?: boolean;
}

interface Certificate {
  id: string;
  title: string;
  issueDate: string;
  badgeCode: string;
  scorePercent: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Paints B2B Sales Academy Master Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const B2B_SALES_PLAYBOOK = [
  {
    id: "ACAD_OBJ_1",
    category: "Competitor Market Control",
    title: "Asian Paints & Berger already control 80% of my shop sales",
    problemText: "Bhaiya, mere yahan Asian Paints aur Berger ka fast rotation hai. Main Swatch Paints kyun rakhun?",
    strategy: "Position Swatch Paints as High-Margin Cash Engine (Extra 4% Margin + 48-Hour Order Delivery)",
    solutionHindi: "Sir, Asian Paints aapko low 8% margin aur credit lock deta hai. Swatch Paints aapko 12% retail margin + 2.5% Cash Payment Discount + 48-Hour Store Delivery deta hai. Swatch Paints aapke store ka high-margin cash engine banega!",
    salesPitch: "Asian Paints for Volume Rotation + Swatch Paints for 12% High Profit Cash Generation.",
    whatsappTemplate: "Namaste Sir! Swatch Paints Retail Partner Advantage: 12% Retail Margin (4% higher than Asian Paints!) + 48-Hour Order Delivery + Free Display Rack. Aaj trial 20L Emulsion order log karein? 🎨"
  },
  {
    id: "ACAD_OBJ_2",
    category: "Brand Trust & Warranty",
    title: "Why should contractors trust Swatch Paints durability over legacy brands?",
    problemText: "Contractor keh rahe hain Swatch Paints naya brand hai, Asian Paints ki tarah 7 saal tikega kya?",
    strategy: "Issue Swatch Official 7-Year Manufacturer Warranty + Free On-Site Painter Demo Kit",
    solutionHindi: "Sir, Swatch Weatherguard Exterior & Damp Shield par Company official 7-Year Stamp Warranty Certificate deti hai. Plus hum aapke top 3 contractors ke site par FREE Demonstration Kit and Waterproofing Specialist assign kar rahe hain!",
    salesPitch: "7-Year Stamped Manufacturer Warranty + Free On-Site Applicator Support = Zero Risk for Contractor.",
    whatsappTemplate: "Sirji, Swatch Paints 7-Year Official Manufacturer Warranty Certificate & Free On-Site Contractor Demo Team ready hai! Aapke key contractors ko complete confidence milega. Demo schedule karein? 🛡️"
  },
  {
    id: "ACAD_OBJ_3",
    category: "Credit Period Extension",
    title: "Dealer demands 60 days credit period instead of standard 30 days",
    problemText: "Mujhe 60 din ka udhaar do, tabhi main Swatch Paints ke 50 buckets ka order dunga.",
    strategy: "Credit Swap: Offer 2.5% Instant Cash Discount or 30-Day Credit with PDC Protection",
    solutionHindi: "Sir, 60-day credit mein aapka price block ho jata hai. Agar aap 30-Day PDC cheque se order confirm karte hain toh aapko extra 2.5% Early Clearance Rebate milega jo saal mein ₹45,000 extra bachat karwayega!",
    salesPitch: "30-Day PDC Cheque + 2.5% Early Clearance Rebate > 60-Day Credit Price Inflation.",
    whatsappTemplate: "Sir, Swatch Paints Early Clearance Special: 30-Day PDC Cheque order par instant 2.5% cash rebate discount! Yearly ₹45,000 extra savings. Let's lock this order today! 💰"
  },
  {
    id: "ACAD_OBJ_4",
    category: "Painter Reluctance & Switching",
    title: "Painters are reluctant to switch from Asian Paints TruCare to Swatch Damp Shield",
    problemText: "Painters keh rahe hain Swatch Damp Shield try nahi karenge kyunki old brand pe set hain.",
    strategy: "Leverage Swatch Painter App Double Wallet Cash Points + Zero-Dust Sanding Advantage",
    solutionHindi: "Sir, Swatch Damp Shield mein Zero-Dust Sanding Technology hai jisse painter ka kaam 30% faster hota hai. Plus Swatch Painter App par har 20L bucket par Painter ko DOUBLE Instant Cash Wallet reward (₹200) milta hai!",
    salesPitch: "Zero-Dust Applicator Ease + Double Wallet Rewards = 100% Painter Conversion Rate.",
    whatsappTemplate: "Sir, Swatch Painter App Special Drive: Har 20L Swatch Damp Shield Bucket par Painter ko instant ₹200 Wallet Points + Zero-Dust Sanding Advantage! Painters demand automatically create karenge. 🚀"
  },
  {
    id: "ACAD_OBJ_5",
    category: "Texture & Luxury Range Margin",
    title: "Why stock Swatch Rustic Royale Texture over cheap local textures?",
    problemText: "Local textures ₹800 mein mil jate hain, Swatch Rustic Royale Luxury Texture kyun bechen?",
    strategy: "Pitch 40% Higher Retail Margin + Swatch Master Applicator Team Support for Dealer Projects",
    solutionHindi: "Sir, cheap local texture pe 1 saal mein peeling complaints aati hain aur dealer reputation kharab hoti hai. Swatch Rustic Royale Designer Texture par 40% margin hai + Swatch Certified Master Applicator Team aapke dealer projects execution par help karegi!",
    salesPitch: "40% High Profit Margin + Swatch Master Applicator Deployment = Zero Complaint Luxury Sales.",
    whatsappTemplate: "Great news Sir! Swatch Rustic Royale Luxury Texture: 40% Margin + Swatch Certified Master Applicator Team support for your key projects. Zero complaints, maximum prestige! Catalog attached. 👑"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Interactive B2B Sales Simulator Questions
// ─────────────────────────────────────────────────────────────────────────────
const SIMULATOR_QUESTIONS = [
  {
    id: "SIM_1",
    scenario: "A Tier-1 Dealer says: 'Asian Paints gives me 30 days credit. What special benefit will Swatch Paints give if I place a ₹1.5 Lakh order today?'",
    options: [
      { text: "Offer 90 days credit to win the order at any cost.", correct: false, feedback: "Incorrect. Over-extending credit hurts cash flow and breaks company credit guidelines." },
      { text: "Pitch 12% Retail Margin (4% higher than Asian) + 2.5% Instant Cash Rebate for 30-day PDC.", correct: true, feedback: "Excellent! Position Swatch Paints as the high-margin cash engine while securing PDC protection." },
      { text: "Tell the dealer to reduce Asian Paints inventory immediately.", correct: false, feedback: "Incorrect. Direct attack on legacy brands creates dealer resistance." }
    ]
  },
  {
    id: "SIM_2",
    scenario: "A Painting Contractor states: 'My painters only know Asian Paints TruCare. They won't use Swatch Damp Shield.'",
    options: [
      { text: "Highlight Zero-Dust Sanding Tech (30% faster work) + 2x Instant Swatch Painter App Cash Points.", correct: true, feedback: "Spot on! Painter ease + Instant Wallet Cash Points triggers instant applicator adoption." },
      { text: "Offer the contractor a free bucket without explaining product benefits.", correct: false, feedback: "Incorrect. Free samples without educating on product advantage creates low value perception." },
      { text: "Suggest buying local cheap primer instead.", correct: false, feedback: "Incorrect. Compromising quality damages brand reputation." }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function LearningClient() {
  const [modules, setModules] = useState<Module[]>([
    { id: "M1", title: "Swatch Paints Waterproofing & Damp Shield Certification", category: "Product Mastery", duration: "45 mins", progress: 85, level: "Advanced", summary: "Master Swatch Damp Shield 2mm crack-bridging technology, 7-year manufacturer warranty certificates, and contractor application workflows.", keyTakeaway: "Offer stamped 7-year warranty certificates to lock contractor retention.", certificateEarned: true },
    { id: "M2", title: "Swatch B2B Dealer Objection Handling & Counter Pitching", category: "Objection Handling", duration: "30 mins", progress: 100, level: "Master", summary: "Overcome legacy brand dominance (Asian/Berger), negotiate margin upgrades, and pivot dealer credit demands into PDC cash rebates.", keyTakeaway: "Position Swatch Paints as the 12% high-margin cash engine alongside legacy volume brands.", certificateEarned: true },
    { id: "M3", title: "Swatch Rustic Royale Luxury Texture & Designer Finishes", category: "Product Mastery", duration: "35 mins", progress: 60, level: "Intermediate", summary: "Pitch 40% margin luxury textures, deploy Swatch Certified Applicator Teams for dealer projects, and showcase 2026 designer shade cards.", keyTakeaway: "Combine 40% margin texture sales with company applicator support for zero-complaint projects.", certificateEarned: false },
    { id: "M4", title: "Swatch Painter App Loyalty & Contractor Network Building", category: "Painter Engagement", duration: "25 mins", progress: 100, level: "Advanced", summary: "Drive painter KYC registrations, explain 2x instant wallet cashback points, and organize Swatch Contractor Meet events in territory.", keyTakeaway: "Instant painter app points pull demand directly to dealer stores.", certificateEarned: true },
    { id: "M5", title: "Swatch Store Merchandising & Glow Signboard Frontage Rights", category: "Merchandising", duration: "20 mins", progress: 40, level: "Beginner", summary: "Audit store facade visibility, negotiate side-wall ACP glow boards, and install Swatch Paints 4-tier heavy metal display racks.", keyTakeaway: "Side-wall LED glow boards capture customer eye-level without disturbing main frontage.", certificateEarned: false }
  ]);

  const certificates: Certificate[] = [
    { id: "CERT_1", title: "Swatch Certified Waterproofing & Damp Shield Expert", issueDate: "June 2026", badgeCode: "SWATCH-WPF-9082", scorePercent: 96 },
    { id: "CERT_2", title: "Swatch B2B Dealer Negotiation & Objection Specialist", issueDate: "July 2026", badgeCode: "SWATCH-B2B-4410", scorePercent: 98 },
    { id: "CERT_3", title: "Swatch Painter Loyalty & Applicator Network Leader", issueDate: "May 2026", badgeCode: "SWATCH-PLM-1120", scorePercent: 92 }
  ];

  // States
  const [activeTab, setActiveTab] = useState<"modules" | "playbook" | "simulator" | "certificates" | "analytics">("modules");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);
  const [simQuestionIdx, setSimQuestionIdx] = useState(0);
  const [simSelectedOption, setSimSelectedOption] = useState<number | null>(null);
  const [simScore, setSimScore] = useState(100);

  // Filtered Modules
  const filteredModules = useMemo(() => {
    return modules.filter(m => categoryFilter === "ALL" || m.category === categoryFilter);
  }, [modules, categoryFilter]);

  // Handlers
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
                Swatch Paints Sales Academy
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black">
                ● B2B SALES MASTERY
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Brain size={22} className="text-violet-400" /> Swatch Paints Sales Academy
            </h1>
            <p className="text-slate-400 text-[11px] max-w-xl">
              Master B2B paint sales, conquer dealer objections against legacy brands, earn Swatch Sales Certifications, and test skills with AI Roleplay Simulator.
            </p>
          </div>

          <button
            onClick={() => setActiveTab("simulator")}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-xs hover:opacity-95 shadow-lg shadow-violet-500/25 transition-all cursor-pointer border border-violet-400/30"
          >
            <Play size={16} /> Start B2B Roleplay Simulator
          </button>
        </div>

        {/* Dynamic Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">B2B Skill Score</span>
            <p className="text-lg font-black text-white font-mono">88% (Senior Pro)</p>
            <span className="text-[9px] text-slate-400">High objection mastery</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-violet-300 block mb-0.5">Certifications</span>
            <p className="text-lg font-black text-violet-200 font-mono">3 Badges Earned</p>
            <span className="text-[9px] text-slate-400">Official Swatch Certified</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-emerald-400 block mb-0.5">Training Completed</span>
            <p className="text-lg font-black text-emerald-300 font-mono">14.5 Hours</p>
            <span className="text-[9px] text-slate-400">Continuous learning</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-amber-300 block mb-0.5">Brand Identity</span>
            <p className="text-lg font-black text-amber-200 font-mono">Swatch Paints</p>
            <span className="text-[9px] text-slate-400">Official dealer & painter brand</span>
          </div>
        </div>
      </div>

      {/* ══ TAB NAVIGATION ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1.5 bg-muted/60 p-1.5 rounded-2xl border border-border overflow-x-auto">
        {[
          { id: "modules", label: "Training Modules", icon: BookOpen, badge: modules.length },
          { id: "playbook", label: "Master Objection Playbook", icon: Shield, badge: "5 Strategies" },
          { id: "simulator", label: "Roleplay Simulator", icon: Brain, highlight: true },
          { id: "certificates", label: "Certifications Hall", icon: Trophy, badge: certificates.length },
          { id: "analytics", label: "Skill Analytics", icon: Target }
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
          TAB 1: TRAINING MODULES & CERTIFICATION LIBRARY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "modules" && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {["ALL", "Product Mastery", "B2B Negotiation", "Objection Handling", "Painter Engagement", "Merchandising"].map(cat => (
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

          {/* Module Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredModules.map(m => {
              const isCompleted = m.progress === 100;

              return (
                <div key={m.id} className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 font-black text-[9px] border border-violet-500/20">
                        {m.category}
                      </span>
                      <span className="font-mono text-[9px] text-muted-foreground font-bold">{m.duration} • {m.level}</span>
                    </div>

                    <h3 className="font-extrabold text-foreground text-xs sm:text-sm flex items-center gap-1.5">
                      <BookOpen size={15} className="text-violet-500" /> {m.title}
                    </h3>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">{m.summary}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/40 text-[10px]">
                    <div className="bg-muted/30 border border-border/50 rounded-xl p-2.5 space-y-1">
                      <span className="font-bold text-foreground block">💡 Key Sales Takeaway:</span>
                      <p className="text-muted-foreground font-medium">{m.keyTakeaway}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-mono font-bold text-[9px]">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className={isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}>
                          {m.progress}% {isCompleted && "✓ Completed"}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden border border-border/50">
                        <div
                          className={`h-full rounded-full ${isCompleted ? "bg-emerald-500" : "bg-violet-500"}`}
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-border/40">
                    <button
                      onClick={() => setSelectedModule(m)}
                      className="flex-1 py-2 rounded-xl bg-violet-600 text-white font-black text-[10px] hover:bg-violet-700 transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      {isCompleted ? "Review Material" : "Resume Learning"} <ChevronRight size={13} />
                    </button>

                    {m.certificateEarned && (
                      <button
                        onClick={() => alert(`Downloading Swatch Certified Badge PDF for "${m.title}"...`)}
                        className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-amber-500 cursor-pointer"
                        title="Download Certificate"
                      >
                        <Trophy size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: MASTER B2B SALES & DEALER OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-950 via-violet-950 to-slate-950 text-white rounded-3xl p-5 border border-violet-500/30 shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-violet-400" />
              <h2 className="text-base font-black text-white">Swatch Paints Master B2B Sales Playbook</h2>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Battle-tested responses to counter legacy brand dominance, negotiate margin upgrades, and pivot dealer credit demands into PDC cash rebates.
            </p>
          </div>

          <div className="space-y-4">
            {B2B_SALES_PLAYBOOK.map((obj, idx) => (
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
                  <strong className="block text-[9px] font-black uppercase text-rose-500 mb-0.5">Dealer / Contractor Challenge:</strong>
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
                    🎯 Value Proposition Pitch:
                  </strong>
                  <p>{obj.salesPitch}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-[10px] font-bold text-muted-foreground">WhatsApp Roleplay Practice Pitch</span>
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
          TAB 3: INTERACTIVE B2B SALES ROLEPLAY SIMULATOR
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "simulator" && (
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="text-[9px] font-black uppercase text-violet-500 tracking-widest block mb-0.5">AI Interactive Pitch Simulator</span>
              <h2 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                <Brain size={18} className="text-violet-500" /> Test Your Swatch Paints B2B Counter Pitch
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 font-mono font-black text-[10px]">
              Score: {simScore}/100
            </span>
          </div>

          {/* Scenario Display */}
          <div className="space-y-4">
            <div className="bg-slate-950 text-white rounded-2xl p-4 border border-violet-500/30 space-y-2">
              <span className="text-[9px] font-black uppercase text-violet-400 tracking-wider">Scenario #{simQuestionIdx + 1}:</span>
              <p className="text-xs sm:text-sm font-bold text-slate-100 leading-relaxed">
                "{SIMULATOR_QUESTIONS[simQuestionIdx].scenario}"
              </p>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                Select Your Recommended Counter Response:
              </span>

              {SIMULATOR_QUESTIONS[simQuestionIdx].options.map((opt, optIdx) => {
                const isSelected = simSelectedOption === optIdx;

                return (
                  <button
                    key={optIdx}
                    onClick={() => setSimSelectedOption(optIdx)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? opt.correct
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                          : "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300"
                        : "bg-background border-border text-foreground hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="font-bold flex-1">{opt.text}</span>
                    </div>

                    {isSelected && (
                      <div className="pl-7 pt-1 text-[11px] font-medium border-t border-border/40">
                        <strong>Feedback:</strong> {opt.feedback}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 flex justify-between items-center">
              <button
                onClick={() => {
                  setSimQuestionIdx((prev) => (prev + 1) % SIMULATOR_QUESTIONS.length);
                  setSimSelectedOption(null);
                }}
                className="px-4 py-2 bg-violet-600 text-white font-black text-[11px] rounded-xl hover:bg-violet-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                Next Scenario <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4: CERTIFICATIONS HALL
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "certificates" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" /> Swatch Paints Certified Credentials
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Official sales certifications earned through Swatch Paints Sales Academy exams and B2B roleplay audits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map(cert => (
              <div key={cert.id} className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs hover:border-amber-500/40 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                      <Award size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-foreground text-xs">{cert.title}</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Issued: {cert.issueDate}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-black text-[9px]">
                    {cert.scorePercent}% Score
                  </span>
                </div>

                <div className="bg-muted/30 border border-border/50 rounded-2xl p-3 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-muted-foreground">Badge ID:</span>
                  <span className="font-bold text-foreground">{cert.badgeCode}</span>
                </div>

                <button
                  onClick={() => alert(`Downloading official Swatch Paints Certificate PDF for "${cert.title}"...`)}
                  className="w-full py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-[10px] hover:bg-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download size={13} /> Download Swatch Certificate Badge PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 5: SKILL ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Target size={16} className="text-violet-500" /> B2B Competency Benchmark
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Product Technical Knowledge</span>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">92% Mastery</p>
                <span className="text-[9px] text-emerald-500 font-bold">Top 5% in Territory</span>
              </div>
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Objection Counter Score</span>
                <p className="text-base font-black text-violet-500 font-mono">90% Efficiency</p>
                <span className="text-[9px] text-violet-400 font-bold">High dealer conversion</span>
              </div>
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Scheme Pitching Win-Rate</span>
                <p className="text-base font-black text-amber-500 font-mono">88% Enrollment</p>
                <span className="text-[9px] text-amber-400 font-bold">Strong scheme adoption</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODULE DETAIL MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedModule && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedModule(null)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border bg-violet-500/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-violet-600 dark:text-violet-400 tracking-widest">Swatch Training Module</span>
                <h3 className="text-xs font-black text-foreground">{selectedModule.title}</h3>
              </div>
              <button onClick={() => setSelectedModule(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={14} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <span className="font-bold text-foreground block">Module Overview:</span>
                <p className="text-muted-foreground leading-relaxed text-[11px]">{selectedModule.summary}</p>
              </div>

              <div className="bg-muted/40 border border-border rounded-2xl p-3 space-y-1 text-[11px]">
                <span className="font-bold text-foreground block">💡 Core Takeaway Strategy:</span>
                <p className="text-violet-600 dark:text-violet-400 font-medium">{selectedModule.keyTakeaway}</p>
              </div>

              <button
                onClick={() => {
                  alert(`Module "${selectedModule.title}" progress saved at 100%!`);
                  setSelectedModule(null);
                }}
                className="w-full py-2.5 bg-violet-600 text-white font-black text-[11px] rounded-xl hover:bg-violet-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Complete Module & Log Progress
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
