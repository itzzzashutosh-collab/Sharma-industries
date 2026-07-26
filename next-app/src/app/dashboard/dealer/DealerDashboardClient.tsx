"use client";

import React, { useState } from "react";
import {
  LayoutDashboard, Users, FileText, ShoppingCart, TrendingUp, Sparkles,
  AlertTriangle, ArrowUpRight, Plus, FileSpreadsheet, Paintbrush, Receipt,
  Calculator, Settings, Clock, ArrowRight, ShieldCheck, Zap, DollarSign,
  Award, PackageCheck, QrCode, Store, ChevronRight, Activity, PieChart, BarChart3
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";

interface Props {
  session: {
    name: string;
    role: string;
  };
  metrics: {
    todaySales: number;
    todayRevenue: number;
    todayCollections: number;
    outstanding: number;
    todayProfit: number;
    lowStock: number;
    pendingOrders: number;
    activeSchemes: number;
  };
  activities: {
    id: string;
    action: string;
    module: string;
    details: string;
    time: string;
  }[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export function DealerDashboardClient({ session, metrics, activities }: Props) {
  const { t } = useLanguage();
  const [analyticsTab, setAnalyticsTab] = useState<"sales" | "products" | "contractors">("sales");

  const cards = [
    {
      label: t("Today's Gross Sales"),
      value: fmt(metrics.todaySales),
      change: "+14.2% vs yesterday",
      trend: "up",
      desc: t("Direct checkout & contractor bookings"),
      icon: DollarSign,
      color: "from-emerald-500/20 to-teal-500/20",
      text: "text-emerald-500",
      border: "border-emerald-500/20",
      badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    },
    {
      label: t("Cash & UPI Collections"),
      value: fmt(metrics.todayCollections),
      change: "82.7% cleared rate",
      trend: "up",
      desc: t("Instant liquid cash inflow today"),
      icon: Zap,
      color: "from-blue-500/20 to-indigo-500/20",
      text: "text-blue-500",
      border: "border-blue-500/20",
      badge: "bg-blue-500/10 text-blue-600 border-blue-500/20"
    },
    {
      label: t("Outstanding Khata Balance"),
      value: fmt(metrics.outstanding),
      change: "4 active credit Khatas",
      trend: "neutral",
      desc: t("Awaiting contractor repayment"),
      icon: FileText,
      color: "from-rose-500/20 to-orange-500/20",
      text: "text-rose-500",
      border: "border-rose-500/20",
      badge: "bg-rose-500/10 text-rose-600 border-rose-500/20"
    },
    {
      label: t("Estimated Net Profit Margin"),
      value: fmt(metrics.todayProfit),
      change: "15% net margin",
      trend: "up",
      desc: t("Gross sales minus COGS & overheads"),
      icon: TrendingUp,
      color: "from-amber-500/20 to-yellow-500/20",
      text: "text-amber-500",
      border: "border-amber-500/20",
      badge: "bg-amber-500/10 text-amber-600 border-amber-500/20"
    },
  ];

  const topProducts = [
    { name: "Royale Luxury Emulsion (Silk Finish)", category: t("Interior Paint"), volume: "480 Liters", sales: "₹1,44,000", pct: 85 },
    { name: "Weather Proof Exterior Primer", category: t("Exterior Primer"), volume: "320 Liters", sales: "₹76,800", pct: 65 },
    { name: "Acrylic Wall Putty (Superfine 20kg)", category: t("Wall Putty"), volume: "1,200 Kg", sales: "₹54,000", pct: 50 },
    { name: "PU High Gloss Wood Finish", category: t("Wood Coating"), volume: "140 Liters", sales: "₹42,000", pct: 38 },
  ];

  const topContractors = [
    { name: "Rajesh Kumar (Verma Builders)", tier: t("Gold Contractor"), liters: "840 L", points: "4,200 Pts", status: t("Top #1 Rank") },
    { name: "Vikram Singh (Modern Painters)", tier: t("Silver Contractor"), liters: "620 L", points: "3,100 Pts", status: t("Top #2 Rank") },
    { name: "Suresh Sharma (Shree Interior)", tier: t("Silver Contractor"), liters: "450 L", points: "2,250 Pts", status: t("Top #3 Rank") },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── TOP HERO HEADER & OUTLET IDENTITY ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-card via-card to-primary/5 border border-border rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Store size={14} className="text-primary" />
              <span>{t("Dealer Workspace")}</span><span className="opacity-40">/</span><span className="text-foreground">{t("Command Center")}</span>
            </div>
            <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
              {t("Welcome back,")} {session.name} <span className="text-lg">🏪</span>
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span>{t("Authorized Store Outlet #SRP-9812")}</span>
              <span className="opacity-30">•</span>
              <span>{t("Sharma Industries ERP Portal")}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-2xl text-xs font-bold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t("POS Terminal Online")}</span>
            </div>

            <Link
              href="/dashboard/dealer/invoices/new"
              className="px-5 py-2.5 bg-primary text-white text-xs font-black rounded-2xl shadow-md hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus size={15} /> + {t("New POS Bill")}
            </Link>
          </div>
        </div>
      </div>

      {/* ── AI EXECUTIVE ADVISOR (NEXT-GEN INSIGHTS BANNER) ────────────────── */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-card border border-primary/20 rounded-3xl p-5 shadow-xs flex items-start gap-4">
        <div className="p-3 bg-primary/20 rounded-2xl border border-primary/30 text-primary shrink-0 animate-pulse">
          <Sparkles size={20} />
        </div>
        <div className="space-y-1 flex-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-black text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              {t("AI Dealer Executive Advisor")}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">{t("Live Telemetry")}</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            <span className="font-bold text-foreground">{t("Smart Sales Insight:")}</span> {t("Today's billing revenue is")} <span className="text-emerald-600 font-bold">{t("14.2% higher")}</span> {t("than average.")} <span className="font-bold text-foreground">Royale Acrylic Emulsion (Silk)</span> {t("is in high demand. Reorder suggested for 10 buckets before Tuesday to avoid stockout.")}
          </p>
        </div>
      </div>

      {/* ── 4 HERO KPI CARDS ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`bg-card border ${c.border} rounded-3xl p-5 hover:bg-muted/10 transition-all duration-300 shadow-xs relative group overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-br ${c.color} rounded-bl-full opacity-30 group-hover:scale-110 transition-transform`} />

              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{c.label}</span>
                <div className={`p-2 rounded-xl border ${c.badge}`}>
                  <Icon size={16} />
                </div>
              </div>

              <p className={`text-2xl font-black ${c.text} tracking-tight`}>{c.value}</p>

              <div className="flex items-center justify-between mt-3 text-[10px]">
                <span className="text-muted-foreground">{c.desc}</span>
                <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight size={12} /> {c.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── QUICK ACTION LAUNCHER GRID (1-CLICK SHORTCUTS) ───────────────── */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center justify-between">
          <span>{t("Quick Store Action Shortcuts")}</span>
          <span className="text-[10px] text-muted-foreground font-normal">1-Click Launchers</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: t("New POS Bill"), icon: FileText, href: "/dashboard/dealer/invoices/new", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
            { label: t("Bills History"), icon: Receipt, href: "/dashboard/dealer/invoices", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
            { label: t("Khata Ledger"), icon: Calculator, href: "/dashboard/dealer/finance/ledger", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
            { label: t("Painters List"), icon: Users, href: "/dashboard/dealer/painters/list", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
            { label: t("Painter KYC"), icon: ShieldCheck, href: "/dashboard/dealer/painters/register", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
            { label: t("Loyalty Schemes"), icon: Award, href: "/dashboard/dealer/painters/schemes", color: "text-teal-500 bg-teal-500/10 border-teal-500/20" },
            { label: t("Leaderboard"), icon: TrendingUp, href: "/dashboard/dealer/painters/competitions", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
            { label: t("Shop Profile"), icon: Store, href: "/dashboard/dealer/settings/shop", color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
          ].map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-border bg-card hover:bg-muted/30 hover:border-primary/40 transition-all text-center group cursor-pointer"
            >
              <div className={`p-2.5 rounded-xl mb-2 border ${action.color} group-hover:scale-110 transition-transform`}>
                <action.icon size={16} />
              </div>
              <span className="text-[11px] font-bold text-foreground truncate w-full">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── ADVANCED INTERACTIVE ANALYTICS & LIVE AUDIT STREAM ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Tabbed Analytics Panel */}
        <div className="bg-card border border-border rounded-3xl p-6 space-y-6 lg:col-span-2 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" /> {t("Store Analytics & Performance Insights")}
              </h3>
              <p className="text-xs text-muted-foreground">{t("Deep analysis of weekly sales, bestselling products, and contractor loyalty")}</p>
            </div>

            <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border text-xs font-bold">
              <button
                type="button"
                onClick={() => setAnalyticsTab("sales")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  analyticsTab === "sales" ? "bg-primary text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("Weekly Sales")}
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsTab("products")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  analyticsTab === "products" ? "bg-primary text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("Top Products")}
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsTab("contractors")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  analyticsTab === "contractors" ? "bg-primary text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("Contractors")}
              </button>
            </div>
          </div>

          {/* TAB 1: WEEKLY SALES CHART */}
          {analyticsTab === "sales" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="h-56 flex items-end justify-between gap-3 pt-8 px-2">
                {[
                  { day: t("Mon"), val: 45, sales: "₹90,000" },
                  { day: t("Tue"), val: 60, sales: "₹1,20,000" },
                  { day: t("Wed"), val: 55, sales: "₹1,10,000" },
                  { day: t("Thu"), val: 75, sales: "₹1,50,000" },
                  { day: t("Fri"), val: 90, sales: "₹1,80,000" },
                  { day: t("Sat"), val: 100, sales: "₹2,00,000" },
                  { day: t("Sun"), val: 72.5, sales: "₹1,45,000" },
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div
                      className="w-full bg-primary/20 group-hover:bg-primary rounded-t-xl transition-all duration-300 relative"
                      style={{ height: `${item.val}%` }}
                    >
                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-black px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-20">
                        {item.sales}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono font-bold">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BESTSELLING PAINT FORMULATIONS */}
          {analyticsTab === "products" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {topProducts.map((p, idx) => (
                <div key={idx} className="bg-muted/30 p-3.5 rounded-2xl border border-border/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-foreground block">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground">{p.category} • Volume: {p.volume}</span>
                    </div>
                    <span className="font-black text-primary font-mono">{p.sales}</span>
                  </div>
                  <div className="w-full bg-border/50 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: TOP STORE CONTRACTORS snapshot */}
          {analyticsTab === "contractors" && (
            <div className="space-y-3 animate-in fade-in duration-300">
              {topContractors.map((c, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-border bg-card flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-black">
                      #{idx + 1}
                    </div>
                    <div>
                      <span className="font-bold text-foreground block">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground">{c.tier} • Total Liters: {c.liters}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-600 block">{c.points}</span>
                    <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md font-bold">
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Live Activity Stream */}
        <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Activity size={14} className="text-primary" /> {t("Live Store Activity Log")}
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground">Real-Time</span>
          </div>

          <div className="divide-y divide-border/40">
            {activities.map((a) => (
              <div key={a.id} className="py-3 flex items-start justify-between hover:bg-muted/10 transition-colors px-2 rounded-xl gap-2 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{t(a.action)}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">{t(a.details)}</p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap bg-muted px-2 py-0.5 rounded-md">
                  {a.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
