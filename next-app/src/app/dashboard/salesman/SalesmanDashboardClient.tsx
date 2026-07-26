"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin, CheckCircle2, Plus, X, Phone, Sparkles, Target, Trophy, Zap,
  BarChart3, Users, Star, Navigation, Package,
  IndianRupee, Gift, Route, UserCheck, Map, Cpu, Award,
  ChevronDown, ChevronUp, Mic, Activity, FileText
} from "lucide-react";
import { updateSalesVisitStatus, createSalesVisit } from "./actions";
import Link from "next/link";

interface Dealer { id: string; name: string; localities: string; designation: string; }
interface Visit { id: string; dealer_name: string; location: string; purpose: string; status: string; outcome: string | null; }
interface Props {
  initialData: {
    dealers: Dealer[];
    visits: Visit[];
    activities: { id: string; activity_type: string; description: string; created_at: string }[];
    targetStats: { mtdRevenue: number; targetRevenue: number; visitsCompleted: number; visitsTarget: number; paintersRegistered: number; paintersTarget: number; };
    assignedTerritory?: string;
    success?: boolean;
  };
}

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const pct = (a: number, b: number) => b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0;

const MOCK_VISITS: Visit[] = [
  { id: "V1", dealer_name: "Ravi Paint & Hardware", location: "Malviya Nagar, Jaipur", purpose: "Order Collection & New Scheme Pitch", status: "Completed", outcome: "Order of ₹42,000 confirmed. Interested in Contractor Scheme." },
  { id: "V2", dealer_name: "Sharma Colour House", location: "Tonk Road, Jaipur", purpose: "Product Introduction - Luxury Emulsion", status: "Completed", outcome: "Demo done. Follow-up next week." },
  { id: "V3", dealer_name: "Vikram Building Materials", location: "Sanganer, Jaipur", purpose: "Collection Drive - ₹18,500 pending", status: "Pending", outcome: null },
  { id: "V4", dealer_name: "Rajasthan Paint Depot", location: "Sitapura RIICO, Jaipur", purpose: "KYC for 3 New Painters", status: "Pending", outcome: null },
  { id: "V5", dealer_name: "Mehta General Store", location: "Mansarovar, Jaipur", purpose: "Loyalty Points Redemption Support", status: "Skipped", outcome: "Dealer not available. Rescheduled." },
];

const MOCK_WEEKLY = [
  { day: "Mon", revenue: 82000, visits: 6, orders: 4 },
  { day: "Tue", revenue: 65000, visits: 5, orders: 3 },
  { day: "Wed", revenue: 118000, visits: 8, orders: 6 },
  { day: "Thu", revenue: 45000, visits: 4, orders: 2 },
  { day: "Fri", revenue: 97000, visits: 7, orders: 5 },
  { day: "Sat", revenue: 134000, visits: 9, orders: 7 },
  { day: "Sun", revenue: 28000, visits: 3, orders: 1 },
];

const TOP_DEALERS = [
  { rank: 1, name: "Ravi Paint & Hardware", revenue: 284000, orders: 18 },
  { rank: 2, name: "Sharma Colour House", revenue: 198000, orders: 14 },
  { rank: 3, name: "Vikram Building Materials", revenue: 156000, orders: 11 },
  { rank: 4, name: "Rajasthan Paint Depot", revenue: 124000, orders: 9 },
  { rank: 5, name: "Mehta General Store", revenue: 89000, orders: 6 },
];

const LEADERBOARD = [
  { rank: 1, name: "Ankit Sharma", territory: "Jaipur West", revenue: 845000, visits: 62, isMe: false },
  { rank: 2, name: "Rajesh Kumar", territory: "Jaipur East", revenue: 782000, visits: 58, isMe: true },
  { rank: 3, name: "Priya Verma", territory: "Sikar", revenue: 698000, visits: 51, isMe: false },
  { rank: 4, name: "Suresh Meena", territory: "Alwar", revenue: 612000, visits: 47, isMe: false },
  { rank: 5, name: "Kavita Joshi", territory: "Kota", revenue: 584000, visits: 44, isMe: false },
];

const QUICK_ACTIONS = [
  { label: "Log New Visit", icon: MapPin, href: "/dashboard/salesman/visits", color: "from-blue-500 to-cyan-500", desc: "Record dealer visit" },
  { label: "Create Order", icon: Package, href: "/dashboard/salesman/orders", color: "from-emerald-500 to-teal-500", desc: "New dealer order" },
  { label: "Register Painter", icon: UserCheck, href: "/dashboard/salesman/onboard", color: "from-violet-500 to-purple-500", desc: "KYC onboarding" },
  { label: "Record Collection", icon: IndianRupee, href: "/dashboard/salesman/collections", color: "from-amber-500 to-orange-500", desc: "Payment collected" },
  { label: "View Territory", icon: Map, href: "/dashboard/salesman/territory", color: "from-rose-500 to-pink-500", desc: "Area coverage map" },
  { label: "Customer Hub", icon: Users, href: "/dashboard/salesman/customers", color: "from-indigo-500 to-blue-500", desc: "Dealer directory" },
  { label: "Active Schemes", icon: Gift, href: "/dashboard/salesman/schemes", color: "from-fuchsia-500 to-pink-500", desc: "Current offers" },
  { label: "Performance", icon: BarChart3, href: "/dashboard/salesman/performance", color: "from-cyan-500 to-blue-500", desc: "My stats & KPIs" },
];

const STATUS_STYLE: Record<string, string> = {
  Completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Skipped: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  "In Progress": "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

export function SalesmanDashboardClient({ initialData }: Props) {
  const [mounted, setMounted] = useState(false);
  const [analyticsTab, setAnalyticsTab] = useState<"revenue" | "visits" | "orders">("revenue");
  const [visits, setVisits] = useState<Visit[]>(initialData.visits?.length ? initialData.visits : MOCK_VISITS);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [outcomeText, setOutcomeText] = useState("");
  const [visitStatus, setVisitStatus] = useState("Completed");
  const [expandedVisit, setExpandedVisit] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [aiExpanded, setAiExpanded] = useState(true);

  const stats = initialData.targetStats ?? {
    mtdRevenue: 782000, targetRevenue: 1200000,
    visitsCompleted: 38, visitsTarget: 60,
    paintersRegistered: 7, paintersTarget: 15,
  };
  const dealers = initialData.dealers?.length ? initialData.dealers : [
    { id: "D1", name: "Ravi Paint & Hardware", localities: "Malviya Nagar", designation: "Distributor" },
    { id: "D2", name: "Sharma Colour House", localities: "Tonk Road", designation: "Retailer" },
  ];
  const territory = initialData.assignedTerritory ?? "Rajasthan East — Jaipur Zone";
  const [addForm, setAddForm] = useState({ dealer_name: dealers[0]?.name ?? "", purpose: "Routine Follow-up", location: "" });

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const visitSummary = useMemo(() => ({
    total: visits.length,
    completed: visits.filter(v => v.status === "Completed").length,
    pending: visits.filter(v => v.status === "Pending").length,
    skipped: visits.filter(v => v.status === "Skipped").length,
  }), [visits]);

  const revenueAchievement = pct(stats.mtdRevenue, stats.targetRevenue);
  const visitAchievement = pct(stats.visitsCompleted, stats.visitsTarget);
  const painterAchievement = pct(stats.paintersRegistered, stats.paintersTarget);
  const maxBarVal = Math.max(...MOCK_WEEKLY.map(w =>
    analyticsTab === "revenue" ? w.revenue : analyticsTab === "visits" ? w.visits : w.orders
  ));

  const handleUpdateVisit = async () => {
    if (!selectedVisit) return;
    try { await updateSalesVisitStatus(selectedVisit.id, visitStatus, outcomeText); } catch { /* optimistic */ }
    setVisits(prev => prev.map(v => v.id === selectedVisit.id ? { ...v, status: visitStatus, outcome: outcomeText } : v));
    setSelectedVisit(null);
    setOutcomeText("");
  };

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await createSalesVisit(addForm); } catch { /* optimistic */ }
    setVisits(prev => [...prev, { id: `V_${Date.now()}`, ...addForm, status: "Pending", outcome: null }]);
    setShowAddVisit(false);
    setAddForm(f => ({ ...f, location: "" }));
  };

  if (!mounted) {
    return (
      <div className="p-12 text-center text-xs font-bold text-muted-foreground animate-pulse bg-card rounded-2xl border border-border">
        Loading Sales Command Center...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">

      {/* ── AI Coach Banner ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-950/60 via-indigo-950/50 to-blue-950/60 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.15),_transparent_60%)]" />
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative p-5 lg:p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-violet-500/20 rounded-2xl border border-violet-500/30 shadow-lg flex-shrink-0">
                <Cpu size={24} className="text-violet-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black text-violet-400 uppercase tracking-[3px]">AI Sales Coach</span>
                  <span className="text-[9px] font-black text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-pulse">● LIVE</span>
                </div>
                <h1 className="text-xl font-black text-white leading-tight">
                  Rajesh Kumar — <span className="text-violet-300">Sales Executive</span>
                </h1>
                <p className="text-[11px] text-white/50 mb-2 flex items-center gap-1.5">
                  <MapPin size={10} className="text-violet-400" />
                  {territory}
                  <span className="mx-1.5 opacity-30">|</span>
                  {currentTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
                  <span className="mx-1.5 opacity-30">|</span>
                  {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
                {aiExpanded && (
                  <div className="bg-white/5 border border-violet-500/20 rounded-xl p-3 max-w-xl">
                    <p className="text-xs text-violet-200/90 leading-relaxed">
                      <Sparkles size={11} className="inline mr-1 text-amber-400" />
                      <span className="font-black text-amber-300">Smart Insight: </span>
                      You are{" "}
                      <span className="text-emerald-300 font-black">{revenueAchievement}%</span>{" "}
                      to your monthly target.{" "}
                      {revenueAchievement < 80
                        ? `Push ${fmt(stats.targetRevenue - stats.mtdRevenue)} more to hit goal. Focus on Tonk Road & Sanganer dealers today for maximum conversion.`
                        : "Excellent pace! You are on track to exceed your monthly target. Push Painter KYCs to unlock the performance bonus."
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 self-start lg:self-auto flex-shrink-0">
              <button
                onClick={() => setAiExpanded(e => !e)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                {aiExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              <button
                onClick={() => setShowAddVisit(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-500 text-white text-xs font-black hover:bg-violet-400 transition-all shadow-lg cursor-pointer"
              >
                <Plus size={14} /> Log Visit
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 text-white text-xs font-black hover:bg-white/20 transition-all border border-white/10 cursor-pointer">
                <Mic size={14} /> Voice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          {
            label: "MTD Revenue", value: fmt(stats.mtdRevenue), sub: `of ${fmt(stats.targetRevenue)} target`,
            pctVal: revenueAchievement, trend: "+18.4% vs last month", trendUp: true,
            icon: IndianRupee, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500",
            barColor: "bg-emerald-500", badge: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
          },
          {
            label: "Today's Visits", value: `${visitSummary.completed}/${visitSummary.total}`, sub: `${visitSummary.pending} pending · ${visitSummary.skipped} skipped`,
            pctVal: pct(visitSummary.completed, visitSummary.total), trend: `${visitSummary.completed} done`, trendUp: true,
            icon: Route, iconBg: "bg-blue-500/10", iconColor: "text-blue-500",
            barColor: "bg-blue-500", badge: "text-blue-600 bg-blue-500/10 border-blue-500/20",
          },
          {
            label: "Painter KYCs", value: `${stats.paintersRegistered}/${stats.paintersTarget}`, sub: `${painterAchievement}% of monthly target`,
            pctVal: painterAchievement, trend: `${stats.paintersTarget - stats.paintersRegistered} remaining`, trendUp: painterAchievement >= 50,
            icon: UserCheck, iconBg: "bg-violet-500/10", iconColor: "text-violet-500",
            barColor: "bg-violet-500", badge: "text-violet-600 bg-violet-500/10 border-violet-500/20",
          },
          {
            label: "Collections Today", value: fmt(68500), sub: "3 payments collected",
            pctVal: 82, trend: "₹12,000 pending", trendUp: true,
            icon: Target, iconBg: "bg-amber-500/10", iconColor: "text-amber-500",
            barColor: "bg-amber-500", badge: "text-amber-600 bg-amber-500/10 border-amber-500/20",
          },
        ].map((card, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 lg:p-5 space-y-3 shadow-2xs hover:shadow-md transition-all duration-300 group">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1 truncate">{card.label}</span>
                <p className="text-xl lg:text-2xl font-black text-foreground font-mono leading-none">{card.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{card.sub}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.iconBg} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <card.icon size={18} className={card.iconColor} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-muted-foreground">{card.pctVal}% achieved</span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${card.badge}`}>
                  {card.trendUp ? "▲" : "▼"} {card.trend}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${card.barColor} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${card.pctVal}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Visit Route + Right Panel ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Visit Route */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-5 lg:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <Route size={14} className="text-blue-500" /> Today's Dealer Route
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {visitSummary.completed} done · {visitSummary.pending} pending · {visitSummary.skipped} skipped — Jaipur Zone
              </p>
            </div>
            <button
              onClick={() => setShowAddVisit(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-[11px] font-black hover:opacity-90 transition-all cursor-pointer flex-shrink-0"
            >
              <Plus size={13} /> Add Stop
            </button>
          </div>

          {/* Route Rail */}
          <div className="flex items-center bg-muted/30 border border-border rounded-2xl p-3 gap-1.5 overflow-x-auto">
            {visits.map((v, idx) => (
              <div key={v.id} className="flex items-center gap-1.5 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[11px] font-black transition-all ${
                  v.status === "Completed" ? "border-emerald-500 bg-emerald-500/20 text-emerald-600" :
                  v.status === "Skipped" ? "border-rose-500 bg-rose-500/10 text-rose-500" :
                  "border-amber-500 bg-amber-500/10 text-amber-600"
                }`}>{idx + 1}</div>
                {idx < visits.length - 1 && (
                  <div className={`w-8 h-0.5 rounded-full flex-shrink-0 ${v.status === "Completed" ? "bg-emerald-500" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Visit Cards */}
          <div className="space-y-2">
            {visits.map((visit, idx) => (
              <div key={visit.id} className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                visit.status === "Completed" ? "border-emerald-500/20 bg-emerald-500/[0.03]" :
                visit.status === "Skipped" ? "border-rose-500/20 bg-rose-500/[0.03]" :
                "border-amber-500/20 bg-amber-500/[0.03]"
              }`}>
                <div
                  className="flex items-center gap-3 p-3.5 cursor-pointer select-none"
                  onClick={() => setExpandedVisit(expandedVisit === visit.id ? null : visit.id)}
                >
                  <span className={`text-[11px] font-black w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    visit.status === "Completed" ? "border-emerald-500 text-emerald-600" :
                    visit.status === "Skipped" ? "border-rose-500 text-rose-500" : "border-amber-500 text-amber-600"
                  }`}>{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-black text-foreground">{visit.dealer_name}</p>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide flex-shrink-0 ${STATUS_STYLE[visit.status] ?? ""}`}>
                        {visit.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5 flex items-center gap-1">
                      <MapPin size={9} /> {visit.location}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 truncate">{visit.purpose}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {visit.status === "Pending" && (
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedVisit(visit); setOutcomeText(""); setVisitStatus("Completed"); }}
                        className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                      >Update</button>
                    )}
                    {expandedVisit === visit.id ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                  </div>
                </div>
                {expandedVisit === visit.id && (
                  <div className="px-4 pb-3.5 border-t border-border/40 pt-2.5 space-y-2">
                    {visit.outcome && (
                      <p className="text-[11px] text-muted-foreground">
                        <span className="font-bold text-foreground">Outcome: </span>{visit.outcome}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer">
                        <Phone size={10} /> Call
                      </button>
                      <button className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer">
                        <MapPin size={10} /> Navigate
                      </button>
                      <button className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer">
                        <FileText size={10} /> Notes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">

          {/* Monthly Targets */}
          <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-2xs">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <Target size={14} className="text-rose-500" /> Monthly Targets
            </h3>
            {[
              { label: "Revenue", current: stats.mtdRevenue, target: stats.targetRevenue, color: "bg-emerald-500", pctColor: "text-emerald-600", display: `${fmt(stats.mtdRevenue)} / ${fmt(stats.targetRevenue)}` },
              { label: "Dealer Visits", current: stats.visitsCompleted, target: stats.visitsTarget, color: "bg-blue-500", pctColor: "text-blue-600", display: `${stats.visitsCompleted} / ${stats.visitsTarget}` },
              { label: "Painter KYCs", current: stats.paintersRegistered, target: stats.paintersTarget, color: "bg-violet-500", pctColor: "text-violet-600", display: `${stats.paintersRegistered} / ${stats.paintersTarget}` },
              { label: "Collections", current: 68500, target: 120000, color: "bg-amber-500", pctColor: "text-amber-600", display: `${fmt(68500)} / ${fmt(120000)}` },
            ].map((t, i) => {
              const p = pct(t.current, t.target);
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground">{t.label}</span>
                    <span className={`text-[11px] font-black ${t.pctColor}`}>{p}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${t.color} rounded-full transition-all duration-1000`} style={{ width: `${p}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{t.display}</p>
                </div>
              );
            })}
          </div>

          {/* Incentive / Earnings Tracker */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-3xl p-5 space-y-3 shadow-2xs">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <Trophy size={14} className="text-amber-500" /> Earnings This Month
            </h3>
            <div className="space-y-2.5">
              {[
                { label: "Base Salary", amount: "₹28,000", note: "Confirmed", noteColor: "text-emerald-600" },
                { label: "Revenue Incentive", amount: "₹8,200", note: `${revenueAchievement}% of target`, noteColor: "text-blue-600" },
                { label: "Visit Bonus", amount: "₹3,500", note: `${visitAchievement}% done`, noteColor: "text-violet-600" },
                { label: "KYC Bonus", amount: "₹1,400", note: `${painterAchievement}% done`, noteColor: "text-amber-600" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-foreground">{item.label}</p>
                    <p className={`text-[10px] font-bold ${item.noteColor}`}>{item.note}</p>
                  </div>
                  <p className="text-[11px] font-black text-foreground">{item.amount}</p>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
              <span className="text-xs font-black text-foreground">Projected Total</span>
              <span className="text-base font-black text-amber-600">₹41,100</span>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-2xs">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <Award size={14} className="text-yellow-500" /> Company Ranking
            </h3>
            <div className="space-y-1.5">
              {LEADERBOARD.map((s, i) => (
                <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${s.isMe ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/40"}`}>
                  <span className="text-base w-7 text-center flex-shrink-0">
                    {s.rank === 1 ? "🥇" : s.rank === 2 ? "🥈" : s.rank === 3 ? "🥉" : `#${s.rank}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-black truncate ${s.isMe ? "text-primary" : "text-foreground"}`}>
                      {s.name} {s.isMe && <span className="text-[9px] opacity-60">(You)</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{s.territory}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] font-black text-foreground">{fmt(s.revenue)}</p>
                    <p className="text-[10px] text-muted-foreground">{s.visits} visits</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Weekly Analytics ───────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-3xl p-5 lg:p-6 space-y-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <BarChart3 size={14} className="text-primary" /> Weekly Performance Analytics
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Revenue, visit count, and order volume this week</p>
          </div>
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border">
            {(["revenue", "visits", "orders"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setAnalyticsTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-black capitalize transition-all cursor-pointer ${analyticsTab === tab ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >{tab}</button>
            ))}
          </div>
        </div>

        {/* Bars */}
        <div className="flex items-end gap-2 h-36">
          {MOCK_WEEKLY.map((w, i) => {
            const val = analyticsTab === "revenue" ? w.revenue : analyticsTab === "visits" ? w.visits : w.orders;
            const barH = maxBarVal > 0 ? Math.round((val / maxBarVal) * 100) : 0;
            const isToday = i === (new Date().getDay() + 6) % 7;
            return (
              <div key={w.day} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="w-full flex flex-col items-center justify-end" style={{ height: "104px" }}>
                  <span className="text-[10px] font-black text-muted-foreground mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {analyticsTab === "revenue" ? fmt(val) : val}
                  </span>
                  <div
                    className={`w-full rounded-t-xl transition-all duration-700 ease-out ${isToday ? "bg-primary shadow-lg shadow-primary/30" : "bg-primary/25 group-hover:bg-primary/50"}`}
                    style={{ height: `${barH}%`, minHeight: barH > 0 ? "4px" : "0" }}
                  />
                </div>
                <span className={`text-[11px] font-black ${isToday ? "text-primary" : "text-muted-foreground"}`}>{w.day}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
          {[
            { label: "Week Revenue", val: fmt(MOCK_WEEKLY.reduce((s, w) => s + w.revenue, 0)), dot: "bg-emerald-500" },
            { label: "Total Visits", val: `${MOCK_WEEKLY.reduce((s, w) => s + w.visits, 0)} visits`, dot: "bg-blue-500" },
            { label: "Orders Placed", val: `${MOCK_WEEKLY.reduce((s, w) => s + w.orders, 0)} orders`, dot: "bg-violet-500" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.dot}`} />
              <div>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                <p className="text-xs font-black text-foreground">{item.val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top Dealers + Quick Actions ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top Dealers */}
        <div className="bg-card border border-border rounded-3xl p-5 lg:p-6 space-y-4 shadow-2xs">
          <h2 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
            <Star size={14} className="text-amber-500" /> Top Performing Dealers — MTD
          </h2>
          <div className="space-y-2">
            {TOP_DEALERS.map((d) => (
              <div key={d.rank} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-all">
                <span className="text-base w-8 text-center flex-shrink-0">
                  {d.rank === 1 ? "🥇" : d.rank === 2 ? "🥈" : d.rank === 3 ? "🥉" : `#${d.rank}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-foreground truncate">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground">{d.orders} orders this month</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-black text-foreground font-mono">{fmt(d.revenue)}</p>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct(d.revenue, TOP_DEALERS[0].revenue)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-3xl p-5 lg:p-6 space-y-4 shadow-2xs">
          <h2 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
            <Zap size={14} className="text-yellow-500" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_ACTIONS.map((qa, i) => (
              <Link
                key={i}
                href={qa.href}
                className="group flex items-center gap-2.5 p-3 rounded-xl border border-border hover:border-primary/30 hover:shadow-md hover:bg-muted/30 transition-all duration-200"
              >
                <div className={`p-2 rounded-xl bg-gradient-to-br ${qa.color} flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  <qa.icon size={13} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-foreground truncate leading-tight">{qa.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{qa.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Add Visit Modal ─────────────────────────────────────────────────── */}
      {showAddVisit && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowAddVisit(false)}
        >
          <div
            className="bg-card border border-border rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                <MapPin size={16} className="text-primary" /> Schedule Dealer Visit
              </h3>
              <button onClick={() => setShowAddVisit(false)} className="p-1.5 rounded-lg hover:bg-muted cursor-pointer">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleAddVisit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Dealer</label>
                <select
                  value={addForm.dealer_name}
                  onChange={e => setAddForm(f => ({ ...f, dealer_name: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary transition-colors"
                >
                  {dealers.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  <option value="New Prospect">-- New Prospect --</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Visit Purpose</label>
                <select
                  value={addForm.purpose}
                  onChange={e => setAddForm(f => ({ ...f, purpose: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary transition-colors"
                >
                  {["Routine Follow-up", "Order Collection", "Collection Drive", "New Product Demo", "Painter KYC Drive", "Scheme Launch", "Complaint Resolution", "New Dealer Onboarding"].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Location / Area</label>
                <input
                  type="text"
                  value={addForm.location}
                  onChange={e => setAddForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Malviya Nagar, Jaipur"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddVisit(false)} className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 cursor-pointer transition-all">
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Update Visit Modal ──────────────────────────────────────────────── */}
      {selectedVisit && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedVisit(null)}
        >
          <div
            className="bg-card border border-border rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-foreground">Update Visit</h3>
                <p className="text-[11px] text-muted-foreground">{selectedVisit.dealer_name}</p>
              </div>
              <button onClick={() => setSelectedVisit(null)} className="p-1.5 rounded-lg hover:bg-muted cursor-pointer">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Visit Outcome</label>
                <div className="flex gap-2">
                  {["Completed", "In Progress", "Skipped"].map(s => (
                    <button
                      key={s}
                      onClick={() => setVisitStatus(s)}
                      className={`flex-1 py-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${visitStatus === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                    >{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Notes / Outcome Details</label>
                <textarea
                  rows={3}
                  value={outcomeText}
                  onChange={e => setOutcomeText(e.target.value)}
                  placeholder="Order placed, collection done, follow-up needed..."
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary resize-none transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedVisit(null)} className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-all">
                  Cancel
                </button>
                <button onClick={handleUpdateVisit} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 cursor-pointer transition-all">
                  Save Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
