import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { 
  Shield, 
  Crown, 
  Store, 
  Factory, 
  CreditCard, 
  Package, 
  Users, 
  CheckCircle2, 
  ArrowUpRight, 
  FileText, 
  UserCog, 
  Globe, 
  Trophy, 
  BarChart2, 
  Activity
} from "lucide-react";
import { createAdminClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CEO Sovereign Command Center | Sharma Industries",
  description: "Executive Command Hub for Ashutosh Sharma (CEO) across all 8 Paperclip Divisions",
};

export default async function CeoDashboardPage() {
  // Fetch pending users/approvals if Supabase is connected
  let pendingApprovalsCount = 0;

  try {
    const supabase = await createAdminClient();
    const { count: pendingCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("is_approved", false);
    pendingApprovalsCount = pendingCount || 0;
  } catch {
    pendingApprovalsCount = 2;
  }

  const divisions = [
    {
      id: "div_vision",
      num: "01",
      name: "Vision & 10X Strategy",
      leads: "Elon Musk, Mukesh Ambani, Peter Drucker",
      href: "/dashboard/strategist",
      icon: Crown,
      color: "border-amber-500/30 text-amber-500",
      stats: "Rajasthan HQ + Kota Hub Expansion",
      action: "Strategist Radar",
    },
    {
      id: "div_sales",
      num: "02",
      name: "Sales & Negotiations",
      leads: "Brian Tracy, Alex Hormozi, Chris Voss",
      href: "/dashboard/crm/dealers",
      icon: Store,
      color: "border-emerald-500/30 text-emerald-500",
      stats: "3,500 Rajasthan Counters | 127K+ India",
      action: "Dealers Directory",
    },
    {
      id: "div_operations",
      num: "03",
      name: "Operations & Supply Chain",
      leads: "Taiichi Ohno (TPS), Eliyahu Goldratt",
      href: "/dashboard/factory/production",
      icon: Factory,
      color: "border-blue-500/30 text-blue-500",
      stats: "Production Batches & Stock Register",
      action: "Production Hub",
    },
    {
      id: "div_finance",
      num: "04",
      name: "Finance & Moat Economics",
      leads: "Warren Buffett, Aswath Damodaran",
      href: "/dashboard/dealer/finance/pnl",
      icon: CreditCard,
      color: "border-violet-500/30 text-violet-500",
      stats: "40–45% Dealer Margin Architecture",
      action: "Profit & Loss",
    },
    {
      id: "div_branding",
      num: "05",
      name: "Branding & Positioning",
      leads: "David Ogilvy, Piyush Pandey",
      href: "/dashboard/dealer/products/list",
      icon: Package,
      color: "border-pink-500/30 text-pink-500",
      stats: "Swatch Brand Charter & 6 Product Lines",
      action: "Product Catalog",
    },
    {
      id: "div_social",
      num: "06",
      name: "Social Marketing & Direct Response",
      leads: "Eugene Schwartz, Gary Vaynerchuk",
      href: "/dashboard/painter/community/schemes",
      icon: Trophy,
      color: "border-orange-500/30 text-orange-500",
      stats: "Painters Growth Tokens (₹50 inside 25kg)",
      action: "Loyalty Schemes",
    },
    {
      id: "div_hr",
      num: "07",
      name: "HR, Talent & Quota Governance",
      leads: "Jack Welch, Laszlo Bock",
      href: "/dashboard/employees",
      icon: Users,
      color: "border-teal-500/30 text-teal-500",
      stats: "Master Payroll & Sales Quota Ledger",
      action: "Employee Master",
    },
    {
      id: "div_research",
      num: "08",
      name: "Competitor Intelligence War Room",
      leads: "Michael Porter, Sun Tzu, Prime Research",
      href: "/dashboard/intelligence",
      icon: BarChart2,
      color: "border-red-500/30 text-red-500",
      stats: "Benchmarked vs Asian Paints & Birla Opus",
      action: "Competitor Radar",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* ── Executive Sovereign Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Crown className="w-3.5 h-3.5" />
              Sovereign Command Center
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              Real-time Active Cycle
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Ashutosh Sharma <span className="text-muted-foreground font-semibold text-xl">(CEO & Founder)</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Governing Authority &amp; Strategic Oversight across all 8 Paperclip Divisions — Sharma Industries
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/admin/approvals"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all"
          >
            <Shield className="w-4 h-4" />
            CEO Approvals Desk
            {pendingApprovalsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-amber-400 text-[10px] font-black">
                {pendingApprovalsCount}
              </span>
            )}
          </Link>
          <Link
            href="/dashboard/intelligence"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground font-semibold text-xs hover:border-primary transition-all"
          >
            <BarChart2 className="w-4 h-4 text-red-500" />
            Competitor War Room
          </Link>
          <Link
            href="/dashboard/crm"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground font-semibold text-xs hover:border-primary transition-all"
          >
            <Globe className="w-4 h-4 text-emerald-500" />
            Market B2B Network (1.25M)
          </Link>
        </div>
      </div>

      {/* ── Key Executive Metrics Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Market Network</p>
          <p className="text-2xl font-black text-foreground mt-1">1,250,810+</p>
          <p className="text-xs text-emerald-500 font-semibold mt-1 flex items-center gap-1">
            <Globe className="w-3 h-3" /> PAN-India Master Records
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rajasthan Trade Network</p>
          <p className="text-2xl font-black text-foreground mt-1">3,500</p>
          <p className="text-xs text-blue-500 font-semibold mt-1 flex items-center gap-1">
            <Store className="w-3 h-3" /> Bundi HQ, Kota, Hadoti Hubs
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verified High-Value Accounts</p>
          <p className="text-2xl font-black text-foreground mt-1">2,100</p>
          <p className="text-xs text-amber-500 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Priority B2B Accounts
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Standard Dealer Margin</p>
          <p className="text-2xl font-black text-emerald-500 mt-1">40% – 45%</p>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            vs 10-12% Corporate Giants
          </p>
        </div>
      </div>

      {/* ── 8 Paperclip Divisions Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">8 Paperclip Operational Divisions</h2>
            <p className="text-xs text-muted-foreground">Autonomous division execution commanded under Hermes Brain</p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground px-3 py-1 rounded-lg bg-secondary">
            86 Legends Unified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {divisions.map((div) => {
            const Icon = div.icon;
            return (
              <Link
                key={div.id}
                href={div.href}
                className="group relative p-5 rounded-2xl bg-card border border-border hover:border-primary shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">DIV {div.num}</span>
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {div.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1 font-medium">
                    {div.leads}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-foreground truncate max-w-[140px]">
                    {div.stats}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                    {div.action}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Strategic Quick Action Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sales Team Quota Tracking */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold text-foreground">Sales Field Force</h3>
            </div>
            <Link href="/dashboard/admin/sales-team" className="text-xs font-semibold text-primary hover:underline">
              View List →
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Monthly executive benchmark: ₹2,00,000 billing / 200 bags target. Managed via Alex Hormozi offer structures &amp; Brian Tracy daily discipline.
          </p>
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Wholesale Rate:</span>
            <span className="font-bold text-foreground">₹430.00 / bag floor</span>
          </div>
        </div>

        {/* Master Orders Processing */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-bold text-foreground">Master Order Book</h3>
            </div>
            <Link href="/dashboard/admin/orders" className="text-xs font-semibold text-primary hover:underline">
              Manage Orders →
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Monitor Swatch Rustic Texture, Roller Coat, and Emulsion orders, dispatch status, LR/bilty tracking, and e-way bill coordination.
          </p>
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Opening Stock Target:</span>
            <span className="font-bold text-foreground">100 units / variant</span>
          </div>
        </div>

        {/* Competitor War Room Brief */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-bold text-foreground">Competitor Radar</h3>
            </div>
            <Link href="/dashboard/intelligence" className="text-xs font-semibold text-primary hover:underline">
              Open War Room →
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Real-time benchmarking against Asian Paints Apex Duracast, Berger Flakeline, and Birla Opus Calista. 3x higher dealer profit proof point.
          </p>
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Dealer Profit Advantage:</span>
            <span className="font-bold text-emerald-500">+₹5,900 / 20 bags</span>
          </div>
        </div>
      </div>
    </div>
  );
}
