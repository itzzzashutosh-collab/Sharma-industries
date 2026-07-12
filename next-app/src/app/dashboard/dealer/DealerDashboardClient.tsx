"use client";

import React, { useState } from "react";
import { LayoutDashboard, Users, FileText, ShoppingCart, TrendingUp, Sparkles, AlertTriangle, ArrowUpRight, Plus, FileSpreadsheet, Paintbrush, Receipt, Calculator, Settings, Clock, ArrowRight } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"all" | "sales">("all");

  const cards = [
    { label: "Today's Sales", value: fmt(metrics.todaySales), desc: "Direct customer bookings", color: "from-emerald-500/20 to-teal-500/20", text: "text-emerald-500", border: "border-emerald-500/20" },
    { label: "Today's Revenue", value: fmt(metrics.todayRevenue), desc: "Cleared cash & UPI checkouts", color: "from-blue-500/20 to-indigo-500/20", text: "text-blue-500", border: "border-blue-500/20" },
    { label: "Outstanding Payments", value: fmt(metrics.outstanding), desc: "Awaiting customer settlement", color: "from-rose-500/20 to-orange-500/20", text: "text-rose-500", border: "border-rose-500/20" },
    { label: "Today's Net Profit", value: fmt(metrics.todayProfit), desc: "Estimated operating margin", color: "from-amber-500/20 to-yellow-500/20", text: "text-amber-500", border: "border-amber-500/20" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Welcome Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>Dealer Workspace</span><span className="opacity-40">/</span><span className="text-foreground">Dashboard</span>
          </div>
          <h1 className="text-2xl font-black text-foreground">Welcome back, {session.name} 🏪</h1>
          <p className="text-xs text-muted-foreground">Sharma Industries Authorised Outlet Portal • Live Business Feed</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">POS Terminal Online</span>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div>
          <p className="text-xs font-bold text-foreground">AI Business Assistant Suggestion:</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Five products are running low in stock. You should place a factory reorder for <span className="font-bold text-foreground">Rustic Royale (Red)</span>. Outstanding balances increased by 8% this week.
          </p>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className={`bg-card border ${c.border} rounded-2xl p-5 hover:bg-muted/10 transition-all duration-300 shadow-sm relative group overflow-hidden`}>
            <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-br ${c.color} rounded-bl-full opacity-30 group-hover:scale-110 transition-transform`} />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{c.label}</p>
            <p className={`text-2xl font-black ${c.text} mt-2`}>{c.value}</p>
            <p className="text-[9px] text-muted-foreground mt-1">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* Quick Action Registry */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Quick Action Registry</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "New Invoice", icon: FileText, href: "/dashboard/dealer/sales/invoices", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
            { label: "New Quotation", icon: Receipt, href: "/dashboard/dealer/sales/quotations", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
            { label: "Add Customer", icon: Users, href: "/dashboard/dealer/customers", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
            { label: "Place Factory Order", icon: ShoppingCart, href: "/dashboard/dealer/purchase/factory-orders", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
          ].map((action, i) => (
            <Link key={i} href={action.href} className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card hover:bg-muted/30 hover:border-primary/20 transition-all text-center group">
              <div className={`p-2.5 rounded-lg mb-2 border ${action.color} group-hover:scale-110 transition-transform`}><action.icon size={16} /></div>
              <span className="text-xs font-bold text-foreground">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Operating Analytics & Recent Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simple Charts */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4 lg:col-span-2 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Weekly Sales Performance</h3>
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold">Estimated</span>
          </div>
          {/* SVG Line/Bar comparison */}
          <div className="h-48 flex items-end justify-between gap-2 pt-6 px-4">
            {[30, 45, 60, 50, 80, 95, 75].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full bg-primary/15 rounded-t-md hover:bg-primary/25 transition-colors relative group" style={{ height: `${val}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow z-10">
                    {fmt(val * 2000)}
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground font-mono">Day {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Clock size={12} className="text-primary" /> Live Feed</h3>
          </div>
          <div className="divide-y divide-border/40">
            {activities.map((a) => (
              <div key={a.id} className="py-2.5 flex items-start justify-between hover:bg-muted/10 transition-colors px-2 rounded-lg gap-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">{a.action}</p>
                  <p className="text-[9px] text-muted-foreground">{a.details}</p>
                </div>
                <div className="text-[9px] font-mono text-muted-foreground whitespace-nowrap">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
