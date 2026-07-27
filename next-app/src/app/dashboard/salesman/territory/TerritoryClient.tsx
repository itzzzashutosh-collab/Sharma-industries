"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  BarChart2, Search, TrendingUp, Sparkles, Map, Target, AlertCircle, Plus, X, Award,
  Shield, Copy, Check, Share2, Upload, Building2, Users, Flame, Zap, HelpCircle, CheckCircle2,
  MapPin, Compass, Navigation, Radio, ArrowRight, DollarSign, Calendar, Percent, Layers
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface CityPerformance {
  city: string;
  subHubs: string;
  dealers: number;
  painters: number;
  revenue: number;
  growth: string;
  marketShare: number; // percentage
  topProduct: string;
}

interface TerritoryGoal {
  id: string;
  title: string;
  targetCity: string;
  targetMetric: string;
  progress: number;
  status: "Active" | "Near Completion" | "Completed";
  dueDate: string;
}

interface Props {
  initialData: {
    cities: any[];
    targetStats: {
      mtdRevenue: number;
      targetRevenue: number;
    };
    assignedTerritory?: string;
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Paints B2B Territory Expansion Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const B2B_TERRITORY_OBJECTIONS = [
  {
    id: "TERR_OBJ_1",
    category: "Exclusive Dealership",
    title: "Asian Paints has exclusive dealership rights in this sub-market area",
    problemText: "Bhaiya, mere paas Asian Paints ki exclusive dealership hai, main Swatch Paints ki alag agency nahi chala sakta.",
    strategy: "Offer Non-Exclusive Swatch Secondary Brand Partnering (Zero Conflict + Extra 4% Margin)",
    solutionHindi: "Sir, Swatch Paints secondary high-margin brand partner ki tarah add kariye. Asian Paints exclusive contracts retail margin restrict karte hain. Swatch Paints bilkul same store se aapko 12% retail margin dega bina legacy contract disturb kiye!",
    salesPitch: "Secondary High-Margin Brand Partnering = Zero Exclusive Conflict + Extra 4% Profit.",
    whatsappTemplate: "Namaste Sir! Swatch Paints Secondary Retail Partnership Offer: Same store se 12% extra margin earning without affecting legacy dealership! First trial 10 buckets slot lock karein? 🎨"
  },
  {
    id: "TERR_OBJ_2",
    category: "Logistics & Transport",
    title: "Transport & logistics delivery takes too long to reach satellite towns like Bundi",
    problemText: "Jaipur se Bundi/Kota transport bill and 4-5 din ka delay lagta hai, urgent site order nahi kar paate.",
    strategy: "Activate Express 24-Hour Direct Logistics Hub Route for Swatch Paints",
    solutionHindi: "Sir, Swatch Paints Dispatch Hub ne Jaipur-Kota Highway Express Route start kiya hai. 20L+ buckets order par 24-Hour Direct Store Delivery guaranteed hai with Zero Freight Cost!",
    salesPitch: "24-Hour Express Logistics Route + Zero Freight Charge on Bulk Orders.",
    whatsappTemplate: "Great news Sir! Swatch Paints 24-Hour Express Direct Delivery Route active for your area! Order before 2 PM -> Next morning store delivery with ZERO freight! Order now? 🚚"
  },
  {
    id: "TERR_OBJ_3",
    category: "Competitor Monopolization",
    title: "Competitor offered 45 days credit line to monopolize new hardware shops",
    problemText: "Dusri local brand ne naye hardware counter ko 45 days credit diya hai, tum wahan Swatch Kaise bechoge?",
    strategy: "Offer Swatch Dealer Growth Starter Kit (30-Day PDC + Free Glow Signboard + ₹5k Opening Discount)",
    solutionHindi: "Sir, 45-day credit dene wali brand quality mein fail ho kar store repute kharab karti hai. Swatch Starter Kit mein 30-Day PDC option + FREE LED Glow Sign Board + ₹5,000 Opening Discount milega!",
    salesPitch: "Starter Growth Kit + Free LED Signboard + 30-Day PDC > Risky 45-Day Unbranded Credit.",
    whatsappTemplate: "Sir, Swatch Paints Dealer Starter Kit Offer: 30-Day PDC Credit + FREE LED Glow Board + ₹5,000 Opening Discount! Premium quality brand partnership with zero risk. Let's start! 🚀"
  },
  {
    id: "TERR_OBJ_4",
    category: "Contractor Network Retention",
    title: "Contractors in satellite area are tied up with local cheap emulsion manufacturers",
    problemText: "Local contractors cheap ₹600 emulsion use karte hain, Swatch Shine Emulsion ke daam pe nahi aayenge.",
    strategy: "Deploy Swatch Master Applicator Team + 7-Year Stamp Warranty Certificate",
    solutionHindi: "Sir, local cheap emulsion 1 saal mein chhut jata hai. Swatch Shine Emulsion par 7-Year Warranty Certificate + Swatch Master Applicator Team assign karenge jo contractor ke customer ko 100% satisfy karegi!",
    salesPitch: "7-Year Warranty Certificate + Master Applicator Support = Upgrade Contractors from Cheap Local Paints.",
    whatsappTemplate: "Sir, Swatch Contractor Upgrade Drive: 7-Year Warranty Certificate + Master Applicator Team support! Local cheap paints se 3x better customer retention. Contractor meet schedule karein? 🛡️"
  },
  {
    id: "TERR_OBJ_5",
    category: "Territory Density",
    title: "High dealer density already exists in Jaipur main market area",
    problemText: "Main market mein pehle se 3 Swatch dealers hain, naya counter kholne par price war hoga.",
    strategy: "Enforce 2km Radius Price Protection & Exclusive Sub-Urban Territory Booking",
    solutionHindi: "Sir, Swatch Paints strict 2km Radius Territory Protection Policy enforce karti hai. Aapka price & margin 100% protected rahega, aur koi retailer aapke locality area mein same price undercut nahi kar sakta!",
    salesPitch: "Strict 2km Radius Price Protection = No Local Undercutting or Price Wars.",
    whatsappTemplate: "Sir, Swatch Paints 2km Radius Territory Price Protection Policy: Guaranteed no local dealer undercutting! Aapki agency margin 100% safe. Reserve your territory code now! 🏆"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function TerritoryClient({ initialData }: Props) {
  // Normalize Cities
  const defaultCities: CityPerformance[] = [
    { city: "Jaipur Central & Urban", subHubs: "Malviya Nagar, Mansarovar, Vaishali", dealers: 10, painters: 18, revenue: 245000, growth: "+16%", marketShare: 35, topProduct: "Swatch Shine Emulsion" },
    { city: "Kota Industrial & Educational", subHubs: "Vigyan Nagar, Talwandi, Groman", dealers: 5, painters: 10, revenue: 135000, growth: "+22%", marketShare: 28, topProduct: "Swatch Damp Shield" },
    { city: "Bundi & Satellite Hub", subHubs: "Main Market, Bus Stand Area", dealers: 3, painters: 6, revenue: 70000, growth: "+8%", marketShare: 20, topProduct: "Swatch Weatherguard" }
  ];

  const citiesList: CityPerformance[] = useMemo(() => {
    if (initialData.cities && initialData.cities.length > 0) {
      return initialData.cities.map((c: any, idx: number) => ({
        city: c.city || `City Hub ${idx + 1}`,
        subHubs: c.subHubs || "Central Commercial Area",
        dealers: c.dealers || 4,
        painters: c.painters || 8,
        revenue: c.revenue || 100000,
        growth: c.growth || "+12%",
        marketShare: c.marketShare || 25,
        topProduct: c.topProduct || "Swatch Shine Emulsion"
      }));
    }
    return defaultCities;
  }, [initialData.cities]);

  // Territory Goals State
  const [goals, setGoals] = useState<TerritoryGoal[]>([
    { id: "TG1", title: "Onboard 5 Tier-1 Swatch Dealers in Jaipur South", targetCity: "Jaipur", targetMetric: "5 Dealers", progress: 60, status: "Active", dueDate: "2026-08-15" },
    { id: "TG2", title: "Conduct Swatch Waterproofing Painter Meet in Kota", targetCity: "Kota", targetMetric: "15 Painters", progress: 100, status: "Completed", dueDate: "2026-07-20" },
    { id: "TG3", title: "Establish Express Delivery Logistics Hub in Bundi", targetCity: "Bundi", targetMetric: "24h Logistics", progress: 30, status: "Active", dueDate: "2026-08-30" }
  ]);

  // States
  const [activeTab, setActiveTab] = useState<"coverage" | "goals" | "playbook" | "competitor" | "analytics">("coverage");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalCity, setGoalCity] = useState("Jaipur");
  const [goalMetric, setGoalMetric] = useState("");
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Territory Metrics
  const metrics = useMemo(() => {
    const totalDealers = citiesList.reduce((s, c) => s + c.dealers, 0);
    const totalPainters = citiesList.reduce((s, c) => s + c.painters, 0);
    const totalMtd = initialData.targetStats.mtdRevenue || citiesList.reduce((s, c) => s + c.revenue, 0);
    const targetRev = initialData.targetStats.targetRevenue || 500000;
    const targetPct = Math.min(100, Math.round((totalMtd / targetRev) * 100));
    return { totalDealers, totalPainters, totalMtd, targetRev, targetPct };
  }, [citiesList, initialData]);

  // Handlers
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle) return;

    startTransition(async () => {
      setGoals(prev => [
        {
          id: `TG_${Date.now()}`,
          title: goalTitle,
          targetCity: goalCity,
          targetMetric: goalMetric || "Target Milestone",
          progress: 0,
          status: "Active",
          dueDate: "2026-08-30"
        },
        ...prev
      ]);
      setShowGoalModal(false);
      setGoalTitle("");
      setGoalMetric("");
      alert(`New territory goal "${goalTitle}" added to tracker!`);
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
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-slate-950 via-indigo-950/70 to-slate-950 p-5 sm:p-6 shadow-2xl text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.2),_transparent_70%)]" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[9px] font-black uppercase tracking-widest text-indigo-300">
                Swatch Paints Territory Hub
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black">
                ● {initialData.assignedTerritory || "Rajasthan East Zone"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <MapPin size={22} className="text-indigo-400" /> Swatch Paints Territory Command Center
            </h1>
            <p className="text-slate-400 text-[11px] max-w-xl">
              Track Swatch Paints dealer coverage across sub-markets, overcome territory expansion objections, monitor competitor market share, and set growth targets.
            </p>
          </div>

          <button
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black text-xs hover:opacity-95 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer border border-indigo-400/30"
          >
            <Plus size={16} /> Create Territory Target
          </button>
        </div>

        {/* Dynamic Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Active Swatch Dealers</span>
            <p className="text-lg font-black text-white font-mono">{metrics.totalDealers} Stores</p>
            <span className="text-[9px] text-slate-400">Across 3 major hubs</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-indigo-300 block mb-0.5">Verified Painters</span>
            <p className="text-lg font-black text-indigo-200 font-mono">{metrics.totalPainters} Onboarded</p>
            <span className="text-[9px] text-slate-400">Active on Painter App</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-emerald-400 block mb-0.5">MTD Revenue Quota</span>
            <p className="text-lg font-black text-emerald-300 font-mono">{fmt(metrics.totalMtd)}</p>
            <span className="text-[9px] text-slate-400">{metrics.targetPct}% of {fmt(metrics.targetRev)}</span>
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
          { id: "coverage", label: "City & Hub Coverage", icon: Map, badge: citiesList.length },
          { id: "goals", label: "Territory Goal Center", icon: Target, badge: goals.length },
          { id: "playbook", label: "Expansion Objection Master", icon: Shield, badge: "5 Strategies" },
          { id: "competitor", label: "Competitor Market Map", icon: Radio },
          { id: "analytics", label: "Territory Analytics", icon: TrendingUp }
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
          TAB 1: CITY & SUB-MARKET DISTRIBUTION COVERAGE
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "coverage" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Compass size={16} className="text-indigo-500" /> Swatch Paints Territory Coverage Breakdown
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Monitor active dealer outlets, painter network density, MTD revenue, and market share per city hub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {citiesList.map((c, idx) => (
              <div key={idx} className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs hover:border-primary/40 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider">Sub-Hub: {c.subHubs}</span>
                    <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 mt-0.5">
                      <Building2 size={14} className="text-indigo-400" /> {c.city}
                    </h3>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono font-black text-[9px]">
                    {c.growth} YoY
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-muted/30 border border-border/50 rounded-2xl p-3 text-[10px] text-center font-mono">
                  <div>
                    <span className="text-[8px] uppercase text-muted-foreground block">Dealers</span>
                    <span className="font-bold text-foreground text-xs">{c.dealers} Stores</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-muted-foreground block">Painters</span>
                    <span className="font-bold text-indigo-500 text-xs">{c.painters} Active</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-muted-foreground block">Market Share</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{c.marketShare}%</span>
                  </div>
                </div>

                <div className="space-y-1 pt-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MTD Sales Volume:</span>
                    <span className="font-bold font-mono text-foreground">{fmt(c.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Top Performing SKU:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{c.topProduct}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: TERRITORY GOAL CENTER
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "goals" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Target size={16} className="text-indigo-500" /> Swatch Paints Territory Target Center
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Track dealer onboarding, painter registration drives, and logistics expansion milestones in your territory.
            </p>
          </div>

          <div className="space-y-3">
            {goals.map(g => {
              const isCompleted = g.progress === 100;

              return (
                <div key={g.id} className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider">City: {g.targetCity}</span>
                      <h3 className="font-extrabold text-foreground text-xs sm:text-sm mt-0.5">{g.title}</h3>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                        isCompleted
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="w-full h-2.5 bg-muted/60 rounded-full overflow-hidden border border-border/50">
                      <div
                        className={`h-full rounded-full ${isCompleted ? "bg-emerald-500" : "bg-indigo-500"}`}
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground font-bold">
                      <span>Target: {g.targetMetric} ({g.progress}%)</span>
                      <span>Due: {g.dueDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: SWATCH B2B TERRITORY EXPANSION OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-5 border border-indigo-500/30 shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-indigo-400" />
              <h2 className="text-base font-black text-white">Swatch Paints Territory Expansion Objection Master</h2>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Break competitor exclusive dealership monopolies, resolve satellite transport delays, and protect 2km territory price boundaries.
            </p>
          </div>

          <div className="space-y-4">
            {B2B_TERRITORY_OBJECTIONS.map((obj, idx) => (
              <div key={obj.id} className="bg-card border border-border rounded-3xl p-5 space-y-3.5 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {obj.category}
                  </span>
                  <h3 className="font-extrabold text-foreground text-xs sm:text-sm mt-1 flex-1">
                    {idx + 1}. {obj.title}
                  </h3>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 text-[11px] text-rose-600 dark:text-rose-300 font-medium">
                  <strong className="block text-[9px] font-black uppercase text-rose-500 mb-0.5">Territory Dealer Challenge:</strong>
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
                  <span className="text-[10px] font-bold text-muted-foreground">WhatsApp Territory Pitch</span>
                  <button
                    onClick={() => copyScript(obj.id, obj.whatsappTemplate)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-black text-[10px] hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
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
          TAB 4: COMPETITOR MARKET SHARE MAPPING
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "competitor" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Radio size={16} className="text-indigo-500" /> Territory Brand Share & Competitor Mapping
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Comparative analysis of Swatch Paints vs legacy paint brands in your assigned territory.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { brand: "Swatch Paints", share: 32, margin: "12% - 40%", credit: "30 Days PDC", advantage: "24h Express Delivery + Double Painter Rewards", isSelf: true },
                { brand: "Asian Paints", share: 45, margin: "8%", credit: "30 Days Standard", advantage: "Legacy Brand Volume Rotation", isSelf: false },
                { brand: "Berger Paints", share: 15, margin: "9%", credit: "30 Days Standard", advantage: "Contractor Push", isSelf: false },
                { brand: "Nerolac & Others", share: 8, margin: "10%", credit: "45 Days Extended", advantage: "Price Discounting", isSelf: false }
              ].map((comp, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${comp.isSelf ? "bg-indigo-500/10 border-indigo-500/30" : "bg-muted/20 border-border"} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`font-extrabold text-xs ${comp.isSelf ? "text-indigo-600 dark:text-indigo-400" : "text-foreground"}`}>
                      {comp.brand} {comp.isSelf && "(OUR BRAND)"}
                    </h3>
                    <span className="font-mono font-black text-xs">{comp.share}% Market Share</span>
                  </div>

                  <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${comp.isSelf ? "bg-indigo-500" : "bg-slate-500"}`} style={{ width: `${comp.share}%` }} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground pt-1">
                    <div>Dealer Margin: <strong className="text-foreground">{comp.margin}</strong></div>
                    <div>Credit Policy: <strong className="text-foreground">{comp.credit}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 5: TERRITORY REVENUE & GROWTH ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" /> Territory Revenue & Growth Trends
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Territory Growth Rate</span>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">+18.4% YoY</p>
                <span className="text-[9px] text-emerald-500 font-bold">Top growing zone</span>
              </div>
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Avg Revenue per Dealer</span>
                <p className="text-base font-black text-foreground font-mono">₹25,000 / month</p>
                <span className="text-[9px] text-muted-foreground">18 Active outlets</span>
              </div>
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Top Expansion Hub</span>
                <p className="text-base font-black text-indigo-500 font-mono">Kota South</p>
                <span className="text-[9px] text-indigo-400 font-bold">+22% YoY growth</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CREATE TERRITORY GOAL MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showGoalModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowGoalModal(false)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border bg-indigo-500/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">Territory Target Center</span>
                <h3 className="text-xs font-black text-foreground">Create Swatch Territory Goal</h3>
              </div>
              <button onClick={() => setShowGoalModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                  Goal Objective / Description *
                </label>
                <input
                  required
                  type="text"
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                  placeholder="e.g. Onboard 5 new Swatch Dealers in Jaipur South"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1">
                    Target City Hub
                  </label>
                  <select
                    value={goalCity}
                    onChange={e => setGoalCity(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary"
                  >
                    <option value="Jaipur">Jaipur</option>
                    <option value="Kota">Kota</option>
                    <option value="Bundi">Bundi</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1">
                    Target Metric
                  </label>
                  <input
                    type="text"
                    value={goalMetric}
                    onChange={e => setGoalMetric(e.target.value)}
                    placeholder="e.g. 5 Dealers / 15 Painters"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 bg-indigo-600 text-white font-black text-[11px] rounded-xl hover:bg-indigo-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Save Swatch Territory Target Goal
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
