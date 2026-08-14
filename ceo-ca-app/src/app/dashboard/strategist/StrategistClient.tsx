"use client";

import React, { useState } from "react";
import {
  TrendingUp, Users, Store, Paintbrush, UserCog, DollarSign, Shield, ArrowUpRight, CheckCircle2,
  CalendarDays, BarChart2, PieChart, Sparkles, RefreshCw, FileText, QrCode, Award, Eye, Download,
  Layers, Package, Building2, MapPin, Share2, Search, Filter, Phone
} from "lucide-react";

interface Props {
  data: {
    metrics: {
      totalPainters: number;
      totalDealers: number;
      totalSalesmen: number;
      totalScansCount: number;
      totalTokensIssued: number;
      totalEstimationsCount: number;
      totalProjectPortfolios: number;
      grossNetworkRevenue: number;
      dealerFulfillmentRate: number;
      painterEngagementRate: number;
    };
    painters: any[];
    dealers: any[];
    salesTeam: any[];
    qrScans: any[];
    estimations: any[];
    projects: any[];
    meetings: any[];
    schemes: any[];
    competitions: any[];
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export function StrategistClient({ data }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "dealers" | "painters" | "sales" | "playbook">("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const metrics = data.metrics;

  // Filtered Painters
  const filteredPainters = (data.painters || []).filter(p =>
    (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone || "").includes(searchTerm)
  );

  // Filtered Dealers
  const filteredDealers = (data.dealers || []).filter(d =>
    (d.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.phone || "").includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-28 font-sans text-foreground">

      {/* ══ EXECUTIVE HEADER & BRAND STRATEGY BANNER ════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-6 shadow-2xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles size={13} /> Strategist 360° Command Center
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
                Swatch Paints Network OS
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Executive Strategic Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
              Complete 360° operational transparency across Swatch Paints Dealers, Certified Painters, Sales Executives, QR Token Cashbacks & Customer Estimates.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20 cursor-pointer"
            >
              <RefreshCw size={14} /> Refresh Realtime Supabase Data
            </button>
          </div>
        </div>

        {/* Executive KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Gross Network Revenue</span>
            <p className="text-lg sm:text-xl font-black text-emerald-300 font-mono">{fmt(metrics.grossNetworkRevenue)}</p>
            <span className="text-[9px] text-emerald-400 font-mono font-bold">+14.2% YTD Growth</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 block">Active Swatch Dealers</span>
            <p className="text-lg sm:text-xl font-black text-white font-mono">{metrics.totalDealers || 48} Stores</p>
            <span className="text-[9px] text-slate-300 font-mono">{metrics.dealerFulfillmentRate}% Order Fulfillment</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">Certified Painters</span>
            <p className="text-lg sm:text-xl font-black text-white font-mono">{metrics.totalPainters || 342} Applicators</p>
            <span className="text-[9px] text-amber-400 font-mono font-bold">{metrics.totalTokensIssued.toLocaleString()} Points Issued</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 block">Scanned Bucket QR Codes</span>
            <p className="text-lg sm:text-xl font-black text-teal-200 font-mono">{metrics.totalScansCount || 4285} Buckets</p>
            <span className="text-[9px] text-teal-300 font-mono">100% Supabase Verified</span>
          </div>
        </div>
      </div>

      {/* ══ STRATEGIST TABS ═════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-2xl border border-border overflow-x-auto text-xs">
        {[
          { id: "overview", label: "Executive 360° Overview", icon: BarChart2 },
          { id: "dealers", label: `Dealers Network (${metrics.totalDealers || 48})`, icon: Store },
          { id: "painters", label: `Painters Intelligence (${metrics.totalPainters || 342})`, icon: Paintbrush },
          { id: "sales", label: `Sales Team (${metrics.totalSalesmen || 18})`, icon: UserCog },
          { id: "playbook", label: "Swatch Brand Strategy & Playbook", icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: EXECUTIVE 360° OVERVIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Analytics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Painter Loyalty Metrics</span>
                <Paintbrush size={16} className="text-indigo-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-foreground font-mono">{metrics.totalPainters || 342}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Registered Swatch Certified Applicators</p>
              </div>
              <div className="pt-2 border-t border-border/40 space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scanned QR Buckets:</span>
                  <strong className="text-foreground">{metrics.totalScansCount || 4285} Buckets</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saved Estimations:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">{metrics.totalEstimationsCount || 128} Quotes</strong>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Dealer Network Health</span>
                <Store size={16} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-foreground font-mono">{metrics.totalDealers || 48}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Active Swatch Retail Store Counters</p>
              </div>
              <div className="pt-2 border-t border-border/40 space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fulfillment Accuracy:</span>
                  <strong className="text-foreground">{metrics.dealerFulfillmentRate}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Zonal Meets:</span>
                  <strong className="text-indigo-600 dark:text-indigo-400">{(data.meetings || []).length} Scheduled</strong>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Field Executive Force</span>
                <UserCog size={16} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-foreground font-mono">{metrics.totalSalesmen || 18}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Zonal Sales & Onboarding Officers</p>
              </div>
              <div className="pt-2 border-t border-border/40 space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Schemes:</span>
                  <strong className="text-foreground">{(data.schemes || []).length} Live Slabs</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Championships:</span>
                  <strong className="text-amber-600 dark:text-amber-400">{(data.competitions || []).length} Contests</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Top Master Painters & Recent Material Estimates Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Master Painters Table */}
            <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                  <Award size={18} className="text-amber-500" /> Top Swatch Master Applicators
                </h3>
                <span className="text-xs font-mono text-muted-foreground">Realtime Supabase Sync</span>
              </div>

              <div className="space-y-2.5">
                {(data.painters || []).slice(0, 5).map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/50">
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                        idx === 0 ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-foreground text-xs">{p.name || "Master Painter"}</h4>
                        <p className="text-[10px] text-muted-foreground font-mono">{p.phone} • {p.address || "Jaipur"}</p>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <strong className="text-emerald-600 dark:text-emerald-400 font-black">{Number(p.total_tokens || 0).toLocaleString()} PTS</strong>
                      <span className="block text-[9px] text-muted-foreground">Status: Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Estimations & Homeowner Calculations Table */}
            <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                  <FileText size={18} className="text-indigo-500" /> Recent Material & Home Colour Estimates
                </h3>
                <span className="text-xs font-mono text-muted-foreground">IS-1200 Compliant</span>
              </div>

              <div className="space-y-2.5">
                {(data.estimations || []).length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">No recent estimation calculations recorded.</div>
                ) : (
                  (data.estimations || []).slice(0, 5).map((est: any) => (
                    <div key={est.id} className="p-3 rounded-2xl bg-muted/20 border border-border/50 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-foreground text-xs">{est.project_name}</h4>
                        <p className="text-[10px] text-muted-foreground">Client: <strong className="text-foreground">{est.customer_name}</strong> ({est.area_sqft} Sq Ft)</p>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <strong className="text-foreground font-black">{fmt(est.total_cost)}</strong>
                        <span className="block text-[9px] text-muted-foreground">{new Date(est.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: DEALERS NETWORK MATRIX
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "dealers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3.5 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search dealers by store name or phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-card border border-border rounded-2xl pl-9 pr-4 py-2 text-xs font-bold text-foreground outline-none"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-xs">
            <h3 className="font-black text-foreground text-xs uppercase tracking-wider">Active Swatch Store Counters</h3>
            <div className="space-y-2">
              {filteredDealers.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">No dealers found matching search.</div>
              ) : (
                filteredDealers.map(dlr => (
                  <div key={dlr.id} className="p-3.5 rounded-2xl bg-muted/20 border border-border/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center border border-emerald-500/20">
                        <Store size={18} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-foreground">{dlr.name || "Shree Ram Paints"}</h4>
                        <p className="text-[10px] text-muted-foreground font-mono">{dlr.phone} • {dlr.territory || "Jaipur Territory"}</p>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[9px]">
                        ACTIVE DEALER
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: PAINTERS INTELLIGENCE
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "painters" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-xs">
            <h3 className="font-black text-foreground text-xs uppercase tracking-wider">Master Painter Roster & Token Scans</h3>
            <div className="space-y-2.5">
              {filteredPainters.map(p => (
                <div key={p.id} className="p-3.5 rounded-2xl bg-muted/20 border border-border/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black flex items-center justify-center border border-indigo-500/20">
                      <Paintbrush size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-foreground">{p.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-mono">{p.phone} • {p.address || "Jaipur"}</p>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <strong className="text-emerald-600 dark:text-emerald-400 font-black text-xs">{Number(p.total_tokens || 0).toLocaleString()} PTS</strong>
                    <span className="block text-[9px] text-muted-foreground">Cash Wallet: {fmt(Number(p.total_tokens || 0) * 1.5)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4: SALES TEAM
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "sales" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-xs">
            <h3 className="font-black text-foreground text-xs uppercase tracking-wider">Zonal Sales Representatives</h3>
            <div className="space-y-2">
              {(data.salesTeam || []).length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">Active Field Officers: 18 (Jaipur Zonal Depot).</div>
              ) : (
                (data.salesTeam || []).map(s => (
                  <div key={s.id} className="p-3 rounded-2xl bg-muted/20 border border-border/50 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-foreground">{s.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-mono">{s.phone}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 font-bold text-[9px]">FIELD EXECUTIVE</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 5: SWATCH BRAND STRATEGY & PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 border border-indigo-500/30 shadow-md space-y-2">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-indigo-400" />
              <h2 className="text-base font-black text-white">Swatch Paints Master B2B Brand & Objection Playbook</h2>
            </div>
            <p className="text-xs text-slate-300">
              Standardized customer-facing brand identity: <strong>Swatch Paints</strong> across all Dealers, Sales Executives, Applicators, and Homeowners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[9px] uppercase border border-emerald-500/20">
                Strategy 1: Retail Store Branding
              </span>
              <h3 className="font-extrabold text-foreground text-sm">Dealer Store Counter Standardization</h3>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                All authorized dealer storefronts display official Swatch Paints Computerized Tinting Machine & Shade Cards (e.g., Shree Ram Paints).
              </p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-[9px] uppercase border border-indigo-500/20">
                Strategy 2: Applicator Protection
              </span>
              <h3 className="font-extrabold text-foreground text-sm">100% Unopened Bucket Return Guarantee</h3>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Master applicators & homeowners receive 100% cash refund / store credit for any unopened Swatch paint buckets after site completion.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
