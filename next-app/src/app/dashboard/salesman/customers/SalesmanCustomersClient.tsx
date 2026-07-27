"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  Store, Users, PlusCircle, Search, Sparkles, Phone, MessageSquare, ClipboardList, Target, AlertCircle,
  ShieldCheck, Shield, Copy, Check, Share2, Upload, TrendingUp, Building2, Flame, Zap, HelpCircle,
  Award, Wallet, Gift, QrCode, CreditCard, ArrowRight, DollarSign, CheckCircle2, Calendar, UserPlus, Clock, RefreshCw, X
} from "lucide-react";
import { createSalesVisit } from "../actions";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface DBDealer {
  id: string;
  name: string;
  address: string;
  localities: string;
  designation: string;
  gst_number: string;
  pan_card_url?: string;
  aadhaar_front_url?: string;
  tier?: "Gold Partner" | "Silver Partner" | "Standard Partner";
  annual_revenue?: number;
  credit_limit?: number;
  credit_used?: number;
  health_status?: "Healthy" | "Payment Overdue" | "Inactive Warning";
}

interface ProspectLead {
  id: string;
  name: string;
  owner: string;
  phone: string;
  locality: string;
  stage: "Lead Captured" | "Initial Pitch" | "Sample Fanalyser Shared" | "Negotiation" | "Ready for Onboarding";
  est_monthly_volume: number;
  probability: number; // percentage
  notes: string;
}

interface FollowUpTask {
  id: string;
  target_name: string;
  target_type: "Dealer" | "Prospect Lead";
  due_date: string;
  purpose: string;
  status: "Pending" | "Completed";
  priority: "High" | "Medium" | "Low";
}

interface Props {
  initialData: {
    dealers: any[];
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Paints B2B Customer Acquisition Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_CUSTOMER_OBJECTIONS = [
  {
    id: "CUST_OBJ_1",
    category: "Display Space Replacement",
    title: "Why should I replace my existing Berger display with Swatch Paints?",
    problemText: "Bhaiya, mere counter par Berger ka display rack pehle se hai, usko hata ke Swatch Paints kyun lagayein?",
    strategy: "Highlight 12% Retail Margin (4% Higher) + Free Heavy Metal Rack + 48-Hour Delivery",
    solutionHindi: "Sir, Berger aapko 8% margin aur slow replenishment deta hai. Swatch Paints bilkul same space se aapko 12% retail margin + 48-Hour Store Delivery + Free 4-Tier Heavy Metal Display Rack de raha hai. Margin 1.5x badhega!",
    salesPitch: "12% High Retail Margin (vs 8% Berger) + Free 4-Tier Display Rack + 48-Hour Order Fulfillment.",
    whatsappTemplate: "Namaste Sir! Swatch Paints Retail Partner Advantage: 12% Margin (4% higher than Berger!) + Free 4-Tier Heavy Display Rack + 48h Store Delivery! Trial display rack slot lock karein? 🎨"
  },
  {
    id: "CUST_OBJ_2",
    category: "GST Registration Requirement",
    title: "I don't have GST registration yet, can I still buy Swatch Paints?",
    problemText: "Meri shop nayi hai, abhi GST number nahi mila hai, kya bina GST ke bill ban sakta hai?",
    strategy: "Offer Unregistered Starter Composition Billing + PAN Based Onboarding",
    solutionHindi: "Sir, bilkul! Swatch Paints Composition Scheme under unregistered retail dealers ko PAN & Aadhaar basis par Starter Billing allowed karti hai. Aage GST milte hi B2B Tax Credit update kar denge!",
    salesPitch: "PAN-Based Starter Onboarding = Zero GST Blocking for New Retail Counter Openings.",
    whatsappTemplate: "Sir, Swatch Paints New Retailer Special: PAN & Aadhaar basis par instant order billing start! No GST required initially. Opening order process karein? 📦"
  },
  {
    id: "CUST_OBJ_3",
    category: "Inventory Risk & Stock Exchange",
    title: "Will Swatch Paints compensate me if stock doesn't sell in 90 days?",
    problemText: "Agar Swatch Paints ka stock 3 mahine tak nahi bika, toh mera paisa fas jayega kya?",
    strategy: "Offer 90-Day Slow-Moving Stock Exchange Guarantee",
    solutionHindi: "Sir, Swatch Paints 100% Risk-Free Guarantee deti hai: Agar koi shade 90 days tak nahi bikta hai toh company use Fast-Selling Swatch Shine Emulsion / Wall Putty buckets se FREE SWAP kar degi!",
    salesPitch: "90-Day Stock Swap Guarantee = 100% Zero Dead Stock Risk for Dealer.",
    whatsappTemplate: "Great news Sir! Swatch Paints 90-Day Stock Protection Policy: Fast-selling products se 100% free inventory swap guarantee! Zero stock risk. Order today! 🛡️"
  },
  {
    id: "CUST_OBJ_4",
    category: "Minimum Opening Investment",
    title: "How much minimum investment is required to open a Swatch Paints Agency?",
    problemText: "Swatch Paints agency start karne ke liye kitna lakhs rupees lagana padega?",
    strategy: "Pitch Swatch Dealer Starter Trial Pack (Just ₹25,000 Opening Order + Free Glow Board)",
    solutionHindi: "Sir, lakhon rupaye lagane ki zaroorat nahi hai! Swatch Paints Starter Trial Pack sirf ₹25,000 se start hota hai jismein aapko Fast-Selling Paints + FREE LED Glow Board + Shade Fanners milte hain!",
    salesPitch: "Just ₹25,000 Starter Trial Order + Free LED Glow Sign Board + Shade Books Pack.",
    whatsappTemplate: "Sir, Swatch Paints Agency Starter Pack: Only ₹25,000 opening order + FREE LED Glow Sign Board + Master Shade Fanners! Affordable agency launch today! 🚀"
  },
  {
    id: "CUST_OBJ_5",
    category: "Territory Territory Protection",
    title: "Can I get exclusive dealership rights for my entire pincode area?",
    problemText: "Kya Swatch Paints mere pincode mein kisi aur dukaan ko supply nahi karega?",
    strategy: "Enforce Strict 2km Radius Price & Territory Protection Policy",
    solutionHindi: "Sir, Swatch Paints strict 2km Radius Territory Protection enforce karti hai. Aapke 2km radius mein koi naya Swatch dealer open nahi hoga aur aapka market margin 100% safe rahega!",
    salesPitch: "Strict 2km Radius Territory Protection = Zero Price Undercutting or Dealer Competition.",
    whatsappTemplate: "Sir, Swatch Paints 2km Radius Territory Guarantee: Aapke area mein exclusive price & supply protection! Agency pincode slot reserve karein? 🏆"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Default Swatch Dealers Data
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_SWATCH_DEALERS: DBDealer[] = [
  { id: "D1", name: "Shree Ram Paints & Sanitary", address: "Malviya Nagar, Jaipur", localities: "Jaipur Central", designation: "Proprietor", gst_number: "08AABCS1429B1Z2", tier: "Gold Partner", annual_revenue: 650000, credit_limit: 200000, credit_used: 125000, health_status: "Healthy" },
  { id: "D2", name: "Ravi Paint & Hardware Store", address: "Tonk Road, Jaipur", localities: "Jaipur South", designation: "Partner", gst_number: "08AABCS9912C1Z4", tier: "Silver Partner", annual_revenue: 350000, credit_limit: 150000, credit_used: 145000, health_status: "Payment Overdue" },
  { id: "D3", name: "Sharma Colour House", address: "Main Market, Sanganer", localities: "Sanganer Hub", designation: "Owner", gst_number: "08AABCS7711D1Z8", tier: "Gold Partner", annual_revenue: 820000, credit_limit: 300000, credit_used: 180000, health_status: "Healthy" },
  { id: "D4", name: "Rajasthan Paint Depot", address: "Vaishali Nagar, Jaipur", localities: "Jaipur West", designation: "Proprietor", gst_number: "UNREGISTERED", tier: "Standard Partner", annual_revenue: 210000, credit_limit: 100000, credit_used: 45000, health_status: "Healthy" }
];

export default function SalesmanCustomersClient({ initialData }: Props) {
  // Normalize Dealers List
  const dealersList: DBDealer[] = useMemo(() => {
    if (initialData.dealers && initialData.dealers.length > 0) {
      return initialData.dealers.map((d: any, idx: number) => ({
        id: d.id || `D_${idx}`,
        name: d.name || `Dealer ${idx + 1}`,
        address: d.address || "Jaipur Territory",
        localities: d.localities || "Jaipur Central",
        designation: d.designation || "Owner",
        gst_number: d.gst_number || "UNREGISTERED",
        tier: idx === 0 ? "Gold Partner" : "Silver Partner",
        annual_revenue: d.annual_revenue || 450000,
        credit_limit: d.credit_limit || 200000,
        credit_used: d.credit_used || 95000,
        health_status: idx === 1 ? "Payment Overdue" : "Healthy"
      }));
    }
    return MOCK_SWATCH_DEALERS;
  }, [initialData.dealers]);

  // Prospect Leads State
  const [leads, setLeads] = useState<ProspectLead[]>([
    { id: "L1", name: "Jaipur Paint & Hardware Depot", owner: "Rakesh Verma", phone: "9829012345", locality: "Malviya Nagar", stage: "Negotiation", est_monthly_volume: 250000, probability: 85, notes: "Demanding 90-day stock exchange guarantee. Fanalyser shade cards delivered." },
    { id: "L2", name: "Marwar Color & Sanitary Mart", owner: "Gopal Joshi", phone: "9829054321", locality: "Kota South", stage: "Initial Pitch", est_monthly_volume: 150000, probability: 60, notes: "Interested in Swatch Damp Shield Monsoon Kicker scheme." },
    { id: "L3", name: "Bundi Paint Trading Co.", owner: "Satish Sharma", phone: "9829099887", locality: "Bundi Central", stage: "Ready for Onboarding", est_monthly_volume: 180000, probability: 95, notes: "PAN starter onboarding finalized. Opening order ₹25,000 ready." }
  ]);

  // Follow-ups State
  const [followups, setFollowups] = useState<FollowUpTask[]>([
    { id: "F1", target_name: "Ravi Paint & Hardware Store", target_type: "Dealer", due_date: "2026-07-28", purpose: "Collect overdue payment balance of ₹1,45,000", status: "Pending", priority: "High" },
    { id: "F2", target_name: "Jaipur Paint & Hardware Depot", target_type: "Prospect Lead", due_date: "2026-07-29", purpose: "Finalize ₹2.5L opening order contract & Glow Board placement", status: "Pending", priority: "High" },
    { id: "F3", target_name: "Sharma Colour House", target_type: "Dealer", due_date: "2026-07-30", purpose: "Deliver Swatch Rustic Royale Designer Shade Cards", status: "Pending", priority: "Medium" }
  ]);

  // States
  const [dealers, setDealers] = useState<DBDealer[]>(dealersList);
  const [activeTab, setActiveTab] = useState<"dealers" | "leads" | "followups" | "playbook" | "analytics">("dealers");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // New Lead Form State
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadOwner, setNewLeadOwner] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadLocality, setNewLeadLocality] = useState("");
  const [newLeadVolume, setNewLeadVolume] = useState(150000);

  // Metrics
  const metrics = useMemo(() => {
    const totalDealers = dealers.length;
    const totalLeads = leads.length;
    const totalPipelineVal = leads.reduce((s, l) => s + l.est_monthly_volume, 0);
    const overdueCount = dealers.filter(d => d.health_status === "Payment Overdue").length;
    return { totalDealers, totalLeads, totalPipelineVal, overdueCount };
  }, [dealers, leads]);

  // Filtered Dealers
  const filteredDealers = useMemo(() => {
    return dealers.filter(d =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.localities.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.gst_number && d.gst_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [dealers, searchTerm]);

  // Handlers
  const handleAddLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadPhone) {
      alert("Please fill in Lead Name and Phone Number.");
      return;
    }

    const newLead: ProspectLead = {
      id: `L_${Date.now()}`,
      name: newLeadName,
      owner: newLeadOwner || "Proprietor",
      phone: newLeadPhone,
      locality: newLeadLocality || "Jaipur Territory",
      stage: "Initial Pitch",
      est_monthly_volume: Number(newLeadVolume) || 150000,
      probability: 50,
      notes: "Newly captured Swatch Paints B2B prospect lead."
    };

    setLeads(prev => [newLead, ...prev]);
    setShowAddLeadModal(false);
    setNewLeadName("");
    setNewLeadOwner("");
    setNewLeadPhone("");
    setNewLeadLocality("");
    alert(`New Swatch B2B Lead "${newLead.name}" added to pipeline successfully!`);
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
                Swatch B2B Customer Hub
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black">
                ● OFFICIAL DEALER NETWORK
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Store size={22} className="text-indigo-400" /> Swatch Paints Partners & Lead Command Center
            </h1>
            <p className="text-slate-400 text-[11px] max-w-xl">
              Manage active Swatch dealer accounts, convert B2B prospect leads into agencies, conquer dealer acquisition objections, and schedule territory follow-ups.
            </p>
          </div>

          <button
            onClick={() => setShowAddLeadModal(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black text-xs hover:opacity-95 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer border border-indigo-400/30"
          >
            <UserPlus size={16} /> Add Swatch B2B Lead
          </button>
        </div>

        {/* Dynamic Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Active Dealers</span>
            <p className="text-lg font-black text-white font-mono">{metrics.totalDealers} Stores</p>
            <span className="text-[9px] text-emerald-400 font-bold">{metrics.overdueCount === 0 ? "100% Healthy" : `${metrics.overdueCount} Overdue Alert`}</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-indigo-300 block mb-0.5">Prospect Pipeline</span>
            <p className="text-lg font-black text-indigo-200 font-mono">{metrics.totalLeads} Hot Leads</p>
            <span className="text-[9px] text-slate-400">In conversion stage</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-emerald-400 block mb-0.5">Pipeline Value</span>
            <p className="text-lg font-black text-emerald-300 font-mono">{fmt(metrics.totalPipelineVal)}</p>
            <span className="text-[9px] text-slate-400">Est. monthly order volume</span>
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
          { id: "dealers", label: "Active Swatch Dealers", icon: Store, badge: metrics.totalDealers },
          { id: "leads", label: "Prospect Leads Pipeline", icon: UserPlus, badge: metrics.totalLeads },
          { id: "followups", label: "Territory Follow-ups", icon: Calendar, badge: followups.length },
          { id: "playbook", label: "Dealer Acquisition Playbook", icon: Shield, badge: "5 Strategies" },
          { id: "analytics", label: "Conversion Analytics", icon: TrendingUp }
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
          TAB 1: ACTIVE SWATCH DEALERS NETWORK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "dealers" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search dealers by shop name, locality, or GSTIN..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs outline-none focus:border-primary transition-colors text-foreground shadow-xs"
              />
            </div>
          </div>

          {/* Dealers Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDealers.map(d => {
              const usedPct = d.credit_limit ? Math.min(100, Math.round(((d.credit_used || 0) / d.credit_limit) * 100)) : 0;
              const isOverdue = d.health_status === "Payment Overdue";

              return (
                <div key={d.id} className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-[9px] border border-indigo-500/20">
                        {d.tier || "Gold Partner"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase font-mono ${
                          isOverdue
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        }`}
                      >
                        {d.health_status || "Healthy"}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-foreground text-xs sm:text-sm flex items-center gap-1.5">
                      <Building2 size={14} className="text-indigo-500" /> {d.name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">{d.address} • GST: <strong className="font-mono text-foreground">{d.gst_number}</strong></p>
                  </div>

                  <div className="space-y-1.5 bg-muted/30 border border-border/50 rounded-2xl p-3 text-[10px]">
                    <div className="flex justify-between font-mono">
                      <span className="text-muted-foreground">Credit Utilization:</span>
                      <span className={usedPct > 80 ? "text-rose-600 font-bold" : "text-foreground font-bold"}>
                        {fmt(d.credit_used || 0)} / {fmt(d.credit_limit || 200000)} ({usedPct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden border border-border/50">
                      <div
                        className={`h-full rounded-full ${usedPct > 80 ? "bg-rose-500" : "bg-emerald-500"}`}
                        style={{ width: `${usedPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-border/40 text-[10px]">
                    <button
                      onClick={() => {
                        const txt = `*SWATCH PAINTS B2B ORDER QUOTE* 🎨\nDealer: ${d.name}\nTier: ${d.tier || "Gold Partner"}\nGSTIN: ${d.gst_number}\n\nCall your Swatch Sales Executive to finalize your order booking with 2.5% PDC Cash Rebate!`;
                        navigator.clipboard.writeText(txt);
                        alert(`WhatsApp Order Quote generated for ${d.name}!`);
                      }}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-black text-[10px] hover:bg-indigo-700 transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Share2 size={12} /> Share Order Quote
                    </button>

                    <button
                      onClick={() => alert(`Redirecting to Field Visit logger for ${d.name}...`)}
                      className="px-3 py-2 rounded-xl border border-border bg-background hover:bg-muted font-bold text-foreground text-[10px] cursor-pointer"
                    >
                      Log Visit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: PROSPECT LEADS PIPELINE
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "leads" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <UserPlus size={16} className="text-indigo-500" /> Swatch B2B Dealer Acquisition Pipeline
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Track prospective paint & hardware stores, pitch Swatch Paints dealer starter kits, and convert leads to registered agencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leads.map(l => (
              <div key={l.id} className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 font-black text-[9px] border border-violet-500/20">
                      {l.stage}
                    </span>
                    <span className="font-mono text-[9px] font-black text-emerald-600 dark:text-emerald-400">{l.probability}% Probability</span>
                  </div>

                  <h3 className="font-extrabold text-foreground text-xs sm:text-sm">{l.name}</h3>
                  <p className="text-[10px] text-muted-foreground">Owner: {l.owner} • Phone: <strong className="font-mono text-foreground">{l.phone}</strong></p>
                  <p className="text-[10px] text-muted-foreground">{l.locality}</p>
                </div>

                <div className="bg-muted/30 border border-border/50 rounded-2xl p-3 space-y-1 text-[10px]">
                  <div className="flex justify-between font-mono">
                    <span className="text-muted-foreground">Est. Monthly Swatch Volume:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmt(l.est_monthly_volume)}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground pt-1 border-t border-border/40">Notes: {l.notes}</p>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-border/40">
                  <button
                    onClick={() => {
                      const newD: DBDealer = {
                        id: `D_${Date.now()}`,
                        name: l.name,
                        address: l.locality,
                        localities: l.locality,
                        designation: l.owner,
                        gst_number: "PENDING_GST",
                        tier: "Standard Partner",
                        annual_revenue: l.est_monthly_volume * 12,
                        credit_limit: 150000,
                        credit_used: 0,
                        health_status: "Healthy"
                      };
                      setDealers(prev => [newD, ...prev]);
                      setLeads(prev => prev.filter(item => item.id !== l.id));
                      alert(`Congratulations! Lead "${l.name}" converted into an Official Swatch Paints Dealer Store!`);
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-600 text-white font-black text-[10px] hover:bg-emerald-700 transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 size={13} /> Convert Lead to Official Swatch Dealer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: TERRITORY FOLLOW-UPS & REMINDERS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "followups" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Calendar size={16} className="text-indigo-500" /> Swatch Territory Follow-up Manager
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Scheduled calls, collection visits, and sample card deliveries for territory accounts.
            </p>
          </div>

          <div className="space-y-3">
            {followups.map(f => {
              const isPending = f.status === "Pending";

              return (
                <div key={f.id} className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider">{f.target_type}: {f.target_name}</span>
                      <h3 className="font-extrabold text-foreground text-xs sm:text-sm mt-0.5">{f.purpose}</h3>
                    </div>

                    <span className="font-mono text-[9px] font-bold text-amber-500 flex items-center gap-1">
                      <Clock size={11} /> Due: {f.due_date}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-border/40">
                    {isPending ? (
                      <button
                        onClick={() => {
                          setFollowups(prev => prev.map(item => item.id === f.id ? { ...item, status: "Completed" } : item));
                          alert(`Follow-up task for "${f.target_name}" marked COMPLETED!`);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 text-white font-black text-[10px] rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 size={12} /> Mark Completed
                      </button>
                    ) : (
                      <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 size={12} /> Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4: SWATCH B2B DEALER ACQUISITION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-5 border border-indigo-500/30 shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-indigo-400" />
              <h2 className="text-base font-black text-white">Swatch Paints Dealer Acquisition Playbook</h2>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Negotiate store display replacement, handle non-GST onboarding, and offer 90-day slow-moving stock exchange guarantees.
            </p>
          </div>

          <div className="space-y-4">
            {SWATCH_CUSTOMER_OBJECTIONS.map((obj, idx) => (
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
                  <strong className="block text-[9px] font-black uppercase text-rose-500 mb-0.5">Dealer Prospect Challenge:</strong>
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
                  <span className="text-[10px] font-bold text-muted-foreground">WhatsApp Prospect Outreach Pitch</span>
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
          TAB 5: CONVERSION ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" /> Lead Conversion & Retention Analytics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">B2B Conversion Win-Rate</span>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">68% Success</p>
                <span className="text-[9px] text-emerald-500 font-bold">From pitch to dealer onboarding</span>
              </div>
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Average Onboarding Time</span>
                <p className="text-base font-black text-foreground font-mono">4 Days</p>
                <span className="text-[9px] text-muted-foreground">Fastest agency setup</span>
              </div>
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Dealer Retention Index</span>
                <p className="text-base font-black text-indigo-500 font-mono">94% Retention</p>
                <span className="text-[9px] text-indigo-400 font-bold">Zero dealer churn</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ADD B2B PROSPECT LEAD MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showAddLeadModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddLeadModal(false)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border bg-indigo-500/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">Swatch B2B Lead Pipeline</span>
                <h3 className="text-xs font-black text-foreground">Add New Prospect Store Lead</h3>
              </div>
              <button onClick={() => setShowAddLeadModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleAddLeadSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                  Store / Shop Name *
                </label>
                <input
                  required
                  type="text"
                  value={newLeadName}
                  onChange={e => setNewLeadName(e.target.value)}
                  placeholder="e.g. Jaipur Paint & Hardware Depot"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={newLeadOwner}
                    onChange={e => setNewLeadOwner(e.target.value)}
                    placeholder="e.g. Rakesh Verma"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1">
                    Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    maxLength={10}
                    value={newLeadPhone}
                    onChange={e => setNewLeadPhone(e.target.value)}
                    placeholder="98290XXXXX"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1">
                    Locality Area
                  </label>
                  <input
                    type="text"
                    value={newLeadLocality}
                    onChange={e => setNewLeadLocality(e.target.value)}
                    placeholder="e.g. Malviya Nagar"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1">
                    Est. Monthly Vol (₹)
                  </label>
                  <input
                    type="number"
                    value={newLeadVolume}
                    onChange={e => setNewLeadVolume(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 text-white font-black text-[11px] rounded-xl hover:bg-indigo-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Save Swatch Prospect Lead
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
