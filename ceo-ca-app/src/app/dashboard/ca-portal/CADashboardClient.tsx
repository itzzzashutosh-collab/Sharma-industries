"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, TrendingUp, TrendingDown, AlertCircle, CheckCircle,
  ArrowDownCircle, ArrowUpCircle, FileText, ShoppingCart, CreditCard,
  Sparkles, BookMarked, Calculator, FileSearch, FolderOpen, RefreshCw,
  Scale, Banknote, Calendar, Activity
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface DashboardData {
  monthlyRevenue: number;
  monthlyPurchases: number;
  monthlyExpenses: number;
  totalReceivables: number;
  totalPayables: number;
  pendingExpenses: number;
  totalInvoices: number;
  totalPurchases: number;
  activities: { action: string; description: string; time: string; type: string }[];
  nudges: string[];
  recentUsers: any[];
  financialYear: string;
}

interface Props { data: DashboardData; }

const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtDate = (s: string) => {
  const d = new Date(s);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  invoice: FileText,
  purchase: ShoppingCart,
  expense: CreditCard,
  default: Activity,
};

export function CADashboardClient({ data }: Props) {
  const { t } = useLanguage();
  const netProfit = data.monthlyRevenue - data.monthlyPurchases - data.monthlyExpenses;
  const profitPositive = netProfit >= 0;

  const kpis = [
    {
      label: "Monthly Revenue",
      value: fmt(data.monthlyRevenue),
      sub: `${data.totalInvoices} invoices`,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Monthly Purchases",
      value: fmt(data.monthlyPurchases),
      sub: `${data.totalPurchases} bills`,
      icon: ShoppingCart,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Monthly Expenses",
      value: fmt(data.monthlyExpenses),
      sub: `${data.pendingExpenses} pending`,
      icon: CreditCard,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    {
      label: "Net Profit",
      value: fmt(Math.abs(netProfit)),
      sub: profitPositive ? "Profit" : "Loss",
      icon: profitPositive ? TrendingUp : TrendingDown,
      color: profitPositive ? "text-emerald-500" : "text-rose-500",
      bg: profitPositive ? "bg-emerald-500/10" : "bg-rose-500/10",
      border: profitPositive ? "border-emerald-500/20" : "border-rose-500/20",
    },
    {
      label: "Outstanding Receivables",
      value: fmt(data.totalReceivables),
      sub: "Pending collections",
      icon: ArrowDownCircle,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Outstanding Payables",
      value: fmt(data.totalPayables),
      sub: "Pending payments",
      icon: ArrowUpCircle,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
  ];

  const quickLinks = [
    { label: "Ledger",         href: "/dashboard/ca-portal/accounting/ledger",    icon: BookMarked,   color: "text-blue-500",    bg: "bg-blue-500/10" },
    { label: "GST Dashboard",  href: "/dashboard/ca-portal/gst/dashboard",        icon: Calculator,   color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Purchase Bills", href: "/dashboard/ca-portal/audit/purchase-bills", icon: ShoppingCart, color: "text-amber-500",   bg: "bg-amber-500/10" },
    { label: "Sales Invoices", href: "/dashboard/ca-portal/audit/sales-invoices", icon: FileText,     color: "text-violet-500",  bg: "bg-violet-500/10" },
    { label: "Profit & Loss",  href: "/dashboard/ca-portal/reports/pnl",          icon: Scale,        color: "text-rose-500",    bg: "bg-rose-500/10" },
    { label: "Documents",      href: "/dashboard/ca-portal/documents/company",    icon: FolderOpen,   color: "text-slate-500",   bg: "bg-slate-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
          <LayoutDashboard size={10} />
          <span>CA Workspace</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-foreground">Dashboard</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">CA Command Center</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("Financial Year")}: <span className="font-bold text-foreground">{data.financialYear}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600">GST Compliant</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Calendar size={11} className="text-amber-600" />
              <span className="text-[10px] font-bold text-amber-600">{data.financialYear}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Nudges */}
      {data.nudges.length > 0 && (
        <div className="bg-card border border-primary/20 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1">
            <Sparkles size={13} className="animate-pulse" />
            <span>AI Assistant</span>
          </div>
          <div className="space-y-1.5">
            {data.nudges.map((nudge, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertCircle size={12} className="text-amber-500 mt-0.5 shrink-0" />
                <span>{nudge}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className={`bg-card border ${kpi.border} rounded-2xl p-5 space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{t(kpi.label)}</span>
                <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                  <Icon size={13} className={kpi.color} />
                </div>
              </div>
              <div>
                <p className="text-xl font-black text-foreground">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Links + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Quick Navigation */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <FileSearch size={14} className="text-primary" />
            {t("Quick Access")}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((ql, i) => {
              const Icon = ql.icon;
              return (
                <Link
                  key={i}
                  href={ql.href}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-border hover:bg-muted/40 transition-all group"
                >
                  <div className={`p-1.5 rounded-lg ${ql.bg} group-hover:scale-110 transition-transform`}>
                    <Icon size={12} className={ql.color} />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{t(ql.label)}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Activity size={14} className="text-primary" />
            {t("Recent Activity")}
          </h3>
          {data.activities.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No recent activity found.</p>
          ) : (
            <div className="space-y-2.5">
              {data.activities.slice(0, 6).map((act, i) => {
                const Icon = ACTIVITY_ICONS[act.type] || ACTIVITY_ICONS.default;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 shrink-0 mt-0.5">
                      <Icon size={11} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{act.action}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{act.description}</p>
                      <p className="text-[9px] text-muted-foreground/60 font-mono mt-0.5">{fmtDate(act.time)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 text-center">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">GST Status</p>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle size={16} className="text-emerald-500" />
            <span className="text-sm font-black text-emerald-600">Compliant</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">No pending returns</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 text-center">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">Pending Reconciliation</p>
          <p className="text-2xl font-black text-foreground">{data.pendingExpenses}</p>
          <p className="text-[10px] text-muted-foreground mt-1">items need review</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 text-center">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">Gross Margin</p>
          <p className="text-2xl font-black text-foreground">
            {data.monthlyRevenue > 0 ? (((data.monthlyRevenue - data.monthlyPurchases) / data.monthlyRevenue) * 100).toFixed(1) : "0"}%
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Current month</p>
        </div>
      </div>
    </div>
  );
}
