"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  MapPin, CheckCircle2, Plus, X, Phone, Navigation,
  Sparkles, CheckSquare, Route, TrendingUp, Package,
  IndianRupee, Users, FileText, Shield, BarChart3,
  ChevronDown, ChevronUp, Sun, Moon, Clock, Star,
  AlertCircle, ThumbsUp, ThumbsDown, Edit3, Printer,
  Download, Send, User, Building2, Hash, Zap
} from "lucide-react";
import { createSalesVisit, updateSalesVisitStatus } from "../actions";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Dealer { id: string; name: string; localities?: string; }

interface DealerReport {
  id: string;
  // Contact info
  dealerName: string;
  address: string;
  phone: string;
  area: string;
  // Visit plan
  purpose: string;
  scheduledTime: string;
  // Status
  status: "planned" | "visited" | "skipped" | "not_available";
  // Outcome
  outcome: "agreed" | "partial" | "not_agreed" | "" ;
  rejectionReason: string;
  customRejectionReason: string;
  // Financial
  collectionAmount: string;
  orderAmount: string;
  orderProducts: string;
  // Intel
  competitorBrand: string;
  competitorNote: string;
  // Follow-up
  nextVisitDate: string;
  followUpAction: string;
  // General
  notes: string;
  // KYC
  paintersKYC: string;
  // Timestamps
  visitedAt: string;
}

interface VisitRecord {
  id: string;
  dealer_name: string;
  location: string;
  purpose: string;
  status: string;
  outcome: string | null;
}

interface Props {
  initialData: {
    dealers: Dealer[];
    visits: VisitRecord[];
    success?: boolean;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const VISIT_PURPOSES = [
  "Routine Follow-up", "Order Collection", "Outstanding Collection",
  "New Product Introduction", "Painter KYC Drive", "Festival Scheme Pitch",
  "Complaint Resolution", "New Dealer Onboarding", "Display Rack Setup",
  "Credit Renewal Discussion", "Competitor Intel", "Glow Sign / Branding",
];

const REJECTION_REASONS = [
  "Price Too High",
  "Competitor Discount / Better Rate",
  "Stock Already Full",
  "No Budget This Month",
  "Needs More Credit Days",
  "Bad Experience with Last Batch",
  "Owner Not Available",
  "Painter Not Recommending",
  "Will Decide Next Week",
  "Other (specify below)",
];

const COMPETITORS = ["Asian Paints", "Berger Paints", "Nerolac", "Birla Opus", "Indigo Paints", "British Paints", "Jotun", "None Observed"];

const OBJECTION_SCRIPTS: Record<string, string> = {
  "Price Too High": "Sir, Swatch Shine Emulsion ki coverage 350 sqft/L hai vs local ki 200 sqft/L. Per wall cost actually kam hai.",
  "Competitor Discount / Better Rate": "Competitor ek baar discount deta hai. Swatch mein painter ke wallet mein seedha cash jata hai — dealer ki bikanat apne aap badhti hai.",
  "Stock Already Full": "Perfect! Yahi sahi time hai — festival season 6 hafte mein hai. Abhi order karein toh priority allocation milegi.",
  "No Budget This Month": "Sir, chhota order bhi chalta hai — aur Gold Partner scheme mein 30-day credit milti hai. Koi pressure nahi.",
  "Needs More Credit Days": "Sir, next 2 orders time pe clear karein — main personally aapko Gold Partner (45-day credit) ke liye recommend karunga.",
  "Bad Experience with Last Batch": "Main abhi batch number le leta hoon — 100% replacement guarantee hai, 48 hours mein milega.",
  "Owner Not Available": "Kal subah 10 baje aaunga — kya owner ji tab available honge?",
  "Painter Not Recommending": "Painter trust build karne ke liye Swatch Painter App pe register karein — direct wallet rewards milenge.",
};

const STATUS_STYLE: Record<string, { border: string; bg: string; badge: string; dot: string }> = {
  planned:       { border: "border-amber-500/20",   bg: "bg-amber-500/[0.03]",   badge: "text-amber-600 bg-amber-500/10 border-amber-500/20",    dot: "bg-amber-500" },
  visited:       { border: "border-emerald-500/20", bg: "bg-emerald-500/[0.03]", badge: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-500" },
  skipped:       { border: "border-rose-500/20",    bg: "bg-rose-500/[0.03]",    badge: "text-rose-500 bg-rose-500/10 border-rose-500/20",       dot: "bg-rose-500" },
  not_available: { border: "border-slate-500/20",   bg: "bg-slate-500/[0.03]",   badge: "text-slate-500 bg-slate-500/10 border-slate-500/20",    dot: "bg-slate-400" },
};

const OUTCOME_STYLE: Record<string, string> = {
  agreed:     "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  partial:    "text-amber-600 bg-amber-500/10 border-amber-500/20",
  not_agreed: "text-rose-600 bg-rose-500/10 border-rose-500/20",
};

const emptyReport = (): DealerReport => ({
  id: `R_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
  dealerName: "", address: "", phone: "", area: "", purpose: VISIT_PURPOSES[0], scheduledTime: "",
  status: "planned", outcome: "", rejectionReason: "", customRejectionReason: "",
  collectionAmount: "", orderAmount: "", orderProducts: "", competitorBrand: "None Observed",
  competitorNote: "", nextVisitDate: "", followUpAction: "", notes: "", paintersKYC: "", visitedAt: "",
});

function todayStr() { return new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" }); }
function fmtAmt(s: string) { const n = parseFloat(s); return isNaN(n) ? "—" : `₹${n.toLocaleString("en-IN")}`; }

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function VisitsClient({ initialData }: Props) {
  const dealers = initialData.dealers?.length ? initialData.dealers : [
    { id: "D1", name: "Ravi Paint & Hardware" }, { id: "D2", name: "Sharma Colour House" },
    { id: "D3", name: "Vikram Building Materials" }, { id: "D4", name: "Rajasthan Paint Depot" },
  ];

  // ── Global state ────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<"plan" | "report" | "analytics" | "history">("plan");
  const [reports, setReports] = useState<DealerReport[]>([
    { ...emptyReport(), id: "R1", dealerName: "Ravi Paint & Hardware", address: "Shop 12, MI Road", phone: "9876543210", area: "Malviya Nagar", purpose: "Order Collection & Scheme Pitch", scheduledTime: "09:30", status: "visited", outcome: "agreed", rejectionReason: "", customRejectionReason: "", collectionAmount: "18500", orderAmount: "42000", orderProducts: "Royale Glitz 10L x4, Shyne Emulsion 20L x2", competitorBrand: "Asian Paints", competitorNote: "Asian Paints rep visited 2 days ago, offered 7% discount", nextVisitDate: "2026-08-10", followUpAction: "Deliver display rack on Thursday", notes: "Owner very happy with coverage comparison demo. Interested in Gold Partner upgrade.", paintersKYC: "2", visitedAt: "09:45 AM" },
    { ...emptyReport(), id: "R2", dealerName: "Sharma Colour House", address: "Plot 88, Tonk Road", phone: "9812345678", area: "Tonk Road", purpose: "Reorder + New Scheme", scheduledTime: "11:00", status: "visited", outcome: "partial", rejectionReason: "Needs More Credit Days", customRejectionReason: "", collectionAmount: "0", orderAmount: "28000", orderProducts: "Shyne Emulsion 20L x3", competitorBrand: "None Observed", competitorNote: "", nextVisitDate: "2026-08-05", followUpAction: "Bring Gold Partner credit upgrade form", notes: "Agreed to order but wants 45-day credit. Following up with Gold Partner status.", paintersKYC: "1", visitedAt: "11:20 AM" },
    { ...emptyReport(), id: "R3", dealerName: "Vikram Building Materials", address: "RIICO Industrial Area", phone: "9001234567", area: "Sanganer", purpose: "Collection Drive", scheduledTime: "13:00", status: "planned", outcome: "", rejectionReason: "", customRejectionReason: "", collectionAmount: "", orderAmount: "", orderProducts: "", competitorBrand: "None Observed", competitorNote: "", nextVisitDate: "", followUpAction: "", notes: "", paintersKYC: "", visitedAt: "" },
  ]);

  // ── Modal/sheet state ───────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal]     = useState(false);
  const [reportingOn, setReportingOn]       = useState<DealerReport | null>(null);  // evening report modal
  const [expandedId, setExpandedId]         = useState<string | null>(null);
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [showObjSheet, setShowObjSheet]     = useState(false);
  const [objSheetReason, setObjSheetReason] = useState("");

  // ── Add form ────────────────────────────────────────────────────────────────
  const [addForm, setAddForm] = useState({ dealerName: "", address: "", phone: "", area: "", purpose: VISIT_PURPOSES[0], scheduledTime: "" });

  // ── Computed totals ─────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const visited = reports.filter(r => r.status === "visited");
    const agreed  = reports.filter(r => r.outcome === "agreed" || r.outcome === "partial");
    const totalCollection = reports.reduce((s, r) => s + (parseFloat(r.collectionAmount) || 0), 0);
    const totalOrders     = reports.reduce((s, r) => s + (parseFloat(r.orderAmount) || 0), 0);
    const totalKYC        = reports.reduce((s, r) => s + (parseInt(r.paintersKYC) || 0), 0);
    return { total: reports.length, visited: visited.length, agreed: agreed.length, planned: reports.filter(r => r.status === "planned").length, skipped: reports.filter(r => r.status === "skipped").length, not_available: reports.filter(r => r.status === "not_available").length, totalCollection, totalOrders, totalKYC };
  }, [reports]);

  const completionPct = totals.total > 0 ? Math.round(((totals.visited + totals.skipped + totals.not_available) / totals.total) * 100) : 0;
  const conversionPct = totals.visited > 0 ? Math.round((totals.agreed / totals.visited) * 100) : 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────────
  const handleAddDealer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.dealerName) return;
    const nr = { ...emptyReport(), dealerName: addForm.dealerName, address: addForm.address, phone: addForm.phone, area: addForm.area, purpose: addForm.purpose, scheduledTime: addForm.scheduledTime };
    setReports(prev => [...prev, nr]);
    setShowAddModal(false);
    setAddForm({ dealerName: "", address: "", phone: "", area: "", purpose: VISIT_PURPOSES[0], scheduledTime: "" });
    // also persist via server action optimistically
    try { createSalesVisit({ dealer_name: addForm.dealerName, location: `${addForm.area}, Jaipur`, purpose: addForm.purpose }); } catch {}
  };

  const handleSaveReport = (updated: DealerReport) => {
    setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
    setReportingOn(null);
    // persist
    try {
      const summary = buildOutcomeSummary(updated);
      updateSalesVisitStatus(updated.id, updated.status === "visited" ? "Completed" : updated.status === "skipped" ? "Skipped" : "Pending", summary);
    } catch {}
  };

  const buildOutcomeSummary = (r: DealerReport): string => {
    const parts = [
      r.outcome && `Outcome: ${r.outcome.toUpperCase()}`,
      r.rejectionReason && `Rejection: ${r.rejectionReason}${r.customRejectionReason ? " — " + r.customRejectionReason : ""}`,
      r.collectionAmount && `Collected: ₹${r.collectionAmount}`,
      r.orderAmount && `Order: ₹${r.orderAmount}${r.orderProducts ? " ("+r.orderProducts+")" : ""}`,
      r.competitorBrand !== "None Observed" && `Competitor: ${r.competitorBrand}${r.competitorNote ? " — "+r.competitorNote : ""}`,
      r.paintersKYC && `KYC: ${r.paintersKYC} painters`,
      r.nextVisitDate && `Next visit: ${r.nextVisitDate}`,
      r.followUpAction && `Follow-up: ${r.followUpAction}`,
      r.notes && `Notes: ${r.notes}`,
    ].filter(Boolean).join(" | ");
    return parts;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-28">

      {/* ══ HERO BANNER ═══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-violet-950/60 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.18),_transparent_65%)]" />
        <div className="absolute -bottom-10 -right-10 w-52 h-52 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="relative p-5 lg:p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30 shadow-lg flex-shrink-0">
                <Route size={24} className="text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-[3px]">Field Visit Command</span>
                  <span className="text-[9px] font-black text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">● LIVE</span>
                </div>
                <h1 className="text-xl font-black text-white">Daily Route & Reporting</h1>
                <p className="text-[11px] text-blue-200/60 mt-0.5">{todayStr()} — Jaipur Zone, Rajasthan East</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
              <button onClick={() => { setObjSheetReason(""); setShowObjSheet(true); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 text-white text-[11px] font-black hover:bg-white/20 transition-all border border-white/10 cursor-pointer">
                <Shield size={13} /> Objection Kit
              </button>
              <button onClick={() => setShowDailyReport(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 text-white text-[11px] font-black hover:bg-white/20 transition-all border border-white/10 cursor-pointer">
                <FileText size={13} /> Day Report
              </button>
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 text-white text-[11px] font-black hover:bg-blue-400 transition-all shadow-lg cursor-pointer">
                <Plus size={14} /> Add Dealer
              </button>
            </div>
          </div>

          {/* Progress + KPI strip */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-white/70">Route Progress — {totals.visited + totals.skipped + totals.not_available}/{totals.total} done</span>
              <span className="text-[11px] font-black text-emerald-400">{completionPct}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${completionPct}%` }} />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-1">
              {[
                { label: "Planned", val: totals.planned, color: "text-amber-400" },
                { label: "Visited", val: totals.visited, color: "text-emerald-400" },
                { label: "Agreed", val: totals.agreed, color: "text-teal-300" },
                { label: "Skipped", val: totals.skipped, color: "text-rose-400" },
                { label: "Collected", val: `₹${(totals.totalCollection/1000).toFixed(0)}K`, color: "text-amber-300" },
                { label: "Orders", val: `₹${(totals.totalOrders/1000).toFixed(0)}K`, color: "text-blue-300" },
              ].map((s, i) => (
                <div key={i} className="text-center bg-white/5 rounded-xl px-2 py-1.5">
                  <p className={`text-sm font-black ${s.color}`}>{s.val}</p>
                  <p className="text-[9px] text-white/50 font-bold">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ AI COACH TIP ══════════════════════════════════════════════════════ */}
      <div className="flex gap-3 p-4 bg-violet-500/10 border border-violet-500/20 rounded-2xl">
        <div className="p-2 bg-violet-500/20 rounded-xl flex-shrink-0"><Sparkles size={15} className="text-violet-500" /></div>
        <div>
          <p className="text-[11px] font-black text-foreground mb-1">AI Route Coach</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            📍 Visit <strong className="text-foreground">Vikram Building Materials</strong> and <strong className="text-foreground">Rajasthan Paint Depot</strong> together — same RIICO cluster, saves 20 min.
            💡 <strong className="text-amber-500">Conversion tip:</strong> You're at {conversionPct}% conversion today. Push the Festival Pack to all Pending dealers for a quick win.
          </p>
        </div>
      </div>

      {/* ══ TAB NAV ═══════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-2xl border border-border overflow-x-auto">
        {([
          { id: "plan",      label: "Morning Plan",     icon: Sun  },
          { id: "report",    label: "Evening Report",   icon: Moon },
          { id: "analytics", label: "Analytics",        icon: BarChart3 },
          { id: "history",   label: "History",          icon: FileText },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setMode(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black whitespace-nowrap transition-all cursor-pointer flex-1 justify-center ${
              mode === tab.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            <tab.icon size={12} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: MORNING PLAN
      ══════════════════════════════════════════════════════════════════════ */}
      {mode === "plan" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-foreground uppercase tracking-widest">Today's Dealer Route</p>
              <p className="text-[11px] text-muted-foreground">{reports.length} dealers planned · Tap a card to view details</p>
            </div>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-[11px] font-black hover:opacity-90 cursor-pointer">
              <Plus size={13} /> Add
            </button>
          </div>

          {/* Route Rail */}
          <div className="flex items-center gap-1 bg-muted/30 border border-border rounded-2xl p-3 overflow-x-auto">
            {reports.map((r, idx) => (
              <div key={r.id} className="flex items-center gap-1 flex-shrink-0">
                <div onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[11px] font-black cursor-pointer hover:scale-110 transition-all ${
                  r.status === "visited" ? "border-emerald-500 bg-emerald-500/20 text-emerald-600" :
                  r.status === "skipped" ? "border-rose-400 bg-rose-500/10 text-rose-400 opacity-60" :
                  r.status === "not_available" ? "border-slate-400 bg-slate-500/10 text-slate-400" :
                  "border-amber-500 bg-amber-500/10 text-amber-600"
                }`} title={r.dealerName}>
                  {r.status === "visited" ? <CheckCircle2 size={14} /> : idx + 1}
                </div>
                {idx < reports.length - 1 && <div className={`h-0.5 w-5 rounded-full flex-shrink-0 ${r.status === "visited" ? "bg-emerald-500" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          {/* Dealer Cards */}
          <div className="space-y-3">
            {reports.map((r, idx) => {
              const s = STATUS_STYLE[r.status];
              const isExp = expandedId === r.id;
              return (
                <div key={r.id} className={`border ${s.border} ${s.bg} rounded-2xl overflow-hidden transition-all duration-200`}>
                  {/* Card Row */}
                  <div className="flex items-center gap-3 p-4 cursor-pointer select-none" onClick={() => setExpandedId(isExp ? null : r.id)}>
                    <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[11px] font-black flex-shrink-0 ${
                      r.status === "visited" ? "border-emerald-500 bg-emerald-500/20 text-emerald-600" :
                      r.status === "skipped" ? "border-rose-400 text-rose-400" :
                      r.status === "not_available" ? "border-slate-400 text-slate-400" :
                      "border-amber-500 bg-amber-500/10 text-amber-600"
                    }`}>
                      {r.status === "visited" ? <CheckCircle2 size={13} /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-xs font-black text-foreground">{r.dealerName || "Unnamed Dealer"}</p>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wide flex-shrink-0 ${s.badge}`}>
                          {r.status.replace("_", " ")}
                        </span>
                        {r.outcome && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border flex-shrink-0 ${OUTCOME_STYLE[r.outcome] ?? ""}`}>
                            {r.outcome === "agreed" ? "✅ Agreed" : r.outcome === "partial" ? "⚡ Partial" : "❌ Not Agreed"}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                        <MapPin size={9} className="flex-shrink-0" /> {r.area}{r.address ? ` — ${r.address}` : ""}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {r.scheduledTime && <span className="text-[10px] text-muted-foreground">🕐 {r.scheduledTime}</span>}
                        {r.phone && <span className="text-[10px] text-muted-foreground">📞 {r.phone}</span>}
                        <span className="text-[10px] text-muted-foreground/70 truncate">{r.purpose}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); setReportingOn({ ...r }); }} className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 cursor-pointer shadow-sm">
                        {r.status === "visited" ? "Edit" : "Report"}
                      </button>
                      {isExp ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded */}
                  {isExp && (
                    <div className="border-t border-border/40 px-4 pb-4 pt-3 space-y-3">
                      {/* Contact row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-xl">
                          <Building2 size={12} className="text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] text-muted-foreground">Address</p>
                            <p className="text-[11px] font-bold text-foreground truncate">{r.address || "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-xl">
                          <Phone size={12} className="text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="text-[9px] text-muted-foreground">Phone</p>
                            <p className="text-[11px] font-bold text-foreground">{r.phone || "—"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Outcome summary if visited */}
                      {r.status === "visited" && (
                        <div className="bg-muted/40 rounded-xl p-3 space-y-1.5">
                          <p className="text-[10px] font-black text-foreground uppercase tracking-wider mb-1">📋 Visit Report</p>
                          {r.collectionAmount && <p className="text-[11px] text-foreground">💳 Collected: <strong>{fmtAmt(r.collectionAmount)}</strong></p>}
                          {r.orderAmount && <p className="text-[11px] text-foreground">📦 Order: <strong>{fmtAmt(r.orderAmount)}</strong>{r.orderProducts ? ` (${r.orderProducts})` : ""}</p>}
                          {r.rejectionReason && <p className="text-[11px] text-rose-600">❌ {r.rejectionReason}{r.customRejectionReason ? ` — ${r.customRejectionReason}` : ""}</p>}
                          {r.paintersKYC && <p className="text-[11px] text-foreground">🎨 KYC: {r.paintersKYC} painters registered</p>}
                          {r.nextVisitDate && <p className="text-[11px] text-foreground">📅 Next: {r.nextVisitDate}{r.followUpAction ? ` — ${r.followUpAction}` : ""}</p>}
                          {r.notes && <p className="text-[11px] text-muted-foreground">📝 {r.notes}</p>}
                          {r.competitorBrand !== "None Observed" && <p className="text-[11px] text-amber-600">⚔️ {r.competitorBrand}{r.competitorNote ? ` — ${r.competitorNote}` : ""}</p>}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        {r.phone && (
                          <a href={`tel:${r.phone}`} className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer">
                            <Phone size={11} /> Call
                          </a>
                        )}
                        <button className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer">
                          <Navigation size={11} /> Navigate
                        </button>
                        <button onClick={() => setReportingOn({ ...r })} className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer">
                          <Edit3 size={11} /> Update Report
                        </button>
                        {r.status !== "skipped" && (
                          <button onClick={() => setReports(prev => prev.map(x => x.id === r.id ? { ...x, status: "skipped" } : x))} className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer">
                            <X size={11} /> Skip
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: EVENING REPORT SUMMARY
      ══════════════════════════════════════════════════════════════════════ */}
      {mode === "report" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-foreground uppercase tracking-widest">Evening Field Report</p>
              <p className="text-[11px] text-muted-foreground">Update outcomes for each dealer you visited today</p>
            </div>
            <button onClick={() => setShowDailyReport(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-[11px] font-black text-foreground hover:bg-muted/50 cursor-pointer">
              <Printer size={13} /> Preview Report
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Visited", val: totals.visited, icon: MapPin, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Conversions", val: `${totals.agreed}/${totals.visited}`, icon: ThumbsUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Total Collected", val: `₹${totals.totalCollection.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-amber-500", bg: "bg-amber-500/10" },
              { label: "Orders Value", val: `₹${totals.totalOrders.toLocaleString("en-IN")}`, icon: Package, color: "text-violet-500", bg: "bg-violet-500/10" },
            ].map((k, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-3 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{k.label}</span>
                  <div className={`p-1.5 rounded-lg ${k.bg}`}><k.icon size={12} className={k.color} /></div>
                </div>
                <p className="text-lg font-black text-foreground font-mono">{k.val}</p>
              </div>
            ))}
          </div>

          {/* Dealer-by-Dealer Report Cards */}
          <div className="space-y-3">
            {reports.map((r, idx) => {
              const s = STATUS_STYLE[r.status];
              return (
                <div key={r.id} className={`bg-card border ${s.border} rounded-2xl overflow-hidden shadow-2xs`}>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm w-6 text-center font-black text-muted-foreground">{idx + 1}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-black text-foreground">{r.dealerName}</p>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${s.badge}`}>{r.status.replace("_"," ")}</span>
                          {r.outcome && <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${OUTCOME_STYLE[r.outcome] ?? ""}`}>{r.outcome === "agreed" ? "✅ Agreed" : r.outcome === "partial" ? "⚡ Partial" : "❌ Not Agreed"}</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{r.area} {r.phone ? `· 📞 ${r.phone}` : ""}</p>
                      </div>
                    </div>
                    <button onClick={() => setReportingOn({ ...r })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border border-border text-foreground hover:bg-muted/50 cursor-pointer flex-shrink-0">
                      <Edit3 size={11} /> {r.status === "visited" ? "Edit" : "Fill Report"}
                    </button>
                  </div>

                  {r.status === "visited" && (
                    <div className="border-t border-border/40 px-4 pb-3 pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: "Collected", val: fmtAmt(r.collectionAmount), icon: "💳" },
                        { label: "Order", val: fmtAmt(r.orderAmount), icon: "📦" },
                        { label: "KYC", val: r.paintersKYC ? `${r.paintersKYC} painters` : "—", icon: "🎨" },
                        { label: "Competitor", val: r.competitorBrand !== "None Observed" ? r.competitorBrand : "None", icon: "⚔️" },
                      ].map((cell, ci) => (
                        <div key={ci} className="bg-muted/30 rounded-xl px-2.5 py-2">
                          <p className="text-[9px] text-muted-foreground">{cell.icon} {cell.label}</p>
                          <p className="text-[11px] font-black text-foreground truncate">{cell.val}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {r.status === "planned" && (
                    <div className="border-t border-border/40 px-4 pb-3 pt-2">
                      <p className="text-[10px] text-amber-600 font-bold">⏳ Not yet visited today — tap Edit to fill report</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      {mode === "analytics" && (
        <div className="space-y-4">
          {/* Weekly bar chart */}
          <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-2xs">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2"><BarChart3 size={14} className="text-primary" /> Weekly Visit Performance</h3>
            <div className="flex items-end gap-2 h-32">
              {[
                { day: "Mon", visited: 6, agreed: 4 }, { day: "Tue", visited: 5, agreed: 3 },
                { day: "Wed", visited: 8, agreed: 7 }, { day: "Thu", visited: 4, agreed: 2 },
                { day: "Fri", visited: 7, agreed: 5 }, { day: "Sat", visited: totals.visited, agreed: totals.agreed },
                { day: "Sun", visited: 0, agreed: 0 },
              ].map((w, i) => {
                const isToday = i === 5;
                const pct = 8 > 0 ? (w.visited / 8) * 100 : 0;
                const agrPct = w.visited > 0 ? (w.agreed / w.visited) * 100 : 0;
                return (
                  <div key={w.day} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full relative flex flex-col items-center justify-end" style={{ height: "96px" }}>
                      <span className="text-[9px] text-muted-foreground mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{w.visited}</span>
                      <div className="w-full rounded-t-xl overflow-hidden relative" style={{ height: `${pct}%`, minHeight: pct > 0 ? "4px" : "0" }}>
                        <div className={`absolute bottom-0 w-full rounded-t-xl ${isToday ? "bg-primary" : "bg-primary/25 group-hover:bg-primary/40"} transition-all`} style={{ height: "100%" }} />
                        <div className={`absolute bottom-0 w-full ${isToday ? "bg-emerald-500" : "bg-emerald-500/50"} transition-all`} style={{ height: `${agrPct}%` }} />
                      </div>
                    </div>
                    <span className={`text-[10px] font-black ${isToday ? "text-primary" : "text-muted-foreground"}`}>{w.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 pt-2 border-t border-border text-[10px] font-bold text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary/25 inline-block" /> Visited</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500/50 inline-block" /> Agreed</span>
            </div>
          </div>

          {/* Rejection Breakdown */}
          <div className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-2xs">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2"><ThumbsDown size={14} className="text-rose-500" /> Rejection Reasons — MTD</h3>
            {[
              { reason: "Price Too High", count: 8, color: "bg-rose-500" },
              { reason: "Competitor Discount", count: 6, color: "bg-amber-500" },
              { reason: "Stock Already Full", count: 4, color: "bg-blue-500" },
              { reason: "No Budget", count: 3, color: "bg-violet-500" },
              { reason: "Owner Not Available", count: 5, color: "bg-slate-400" },
            ].map((row, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[11px] text-foreground">{row.reason}</span>
                  <span className="text-[11px] font-black text-foreground">{row.count}x</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${row.color} rounded-full`} style={{ width: `${(row.count / 8) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Collection & Order Trend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-2xs">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2"><IndianRupee size={14} className="text-amber-500" /> Collections — This Week</h3>
              {[{ day: "Mon", amt: 45000 }, { day: "Tue", amt: 22000 }, { day: "Wed", amt: 78000 }, { day: "Thu", amt: 18500 }, { day: "Fri", amt: 55000 }, { day: "Sat", amt: totals.totalCollection }].map((w, i) => {
                const max = 80000;
                return (
                  <div key={w.day} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground w-8">{w.day}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (w.amt / max) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-foreground font-mono w-16 text-right">₹{(w.amt/1000).toFixed(0)}K</span>
                  </div>
                );
              })}
            </div>
            <div className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-2xs">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2"><Package size={14} className="text-blue-500" /> Orders — This Week</h3>
              {[{ day: "Mon", amt: 82000 }, { day: "Tue", amt: 65000 }, { day: "Wed", amt: 118000 }, { day: "Thu", amt: 45000 }, { day: "Fri", amt: 97000 }, { day: "Sat", amt: totals.totalOrders }].map((w, i) => {
                const max = 120000;
                return (
                  <div key={w.day} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground w-8">{w.day}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (w.amt / max) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-foreground font-mono w-16 text-right">₹{(w.amt/1000).toFixed(0)}K</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: HISTORY
      ══════════════════════════════════════════════════════════════════════ */}
      {mode === "history" && (
        <div className="space-y-3">
          <p className="text-xs font-black text-foreground uppercase tracking-widest">All Visit Records</p>
          {reports.map((r, idx) => {
            const s = STATUS_STYLE[r.status];
            return (
              <div key={r.id} className={`bg-card border ${s.border} rounded-2xl p-4 space-y-2 shadow-2xs`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${s.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-xs font-black text-foreground">{r.dealerName}</p>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${s.badge}`}>{r.status.replace("_"," ")}</span>
                      {r.outcome && <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${OUTCOME_STYLE[r.outcome] ?? ""}`}>{r.outcome === "agreed" ? "✅ Agreed" : r.outcome === "partial" ? "⚡ Partial" : "❌ Not Agreed"}</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                      {r.area && <span><MapPin size={9} className="inline mr-0.5" />{r.area}</span>}
                      {r.phone && <span><Phone size={9} className="inline mr-0.5" />{r.phone}</span>}
                      {r.visitedAt && <span><Clock size={9} className="inline mr-0.5" />{r.visitedAt}</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">{r.purpose}</p>
                    {r.status === "visited" && (
                      <div className="mt-2 bg-muted/30 rounded-xl p-2.5 space-y-1">
                        {r.collectionAmount && <p className="text-[11px] text-foreground">💳 Collected: <strong>{fmtAmt(r.collectionAmount)}</strong></p>}
                        {r.orderAmount && <p className="text-[11px] text-foreground">📦 Order: <strong>{fmtAmt(r.orderAmount)}</strong>{r.orderProducts ? ` — ${r.orderProducts}` : ""}</p>}
                        {r.rejectionReason && <p className="text-[11px] text-rose-600">❌ {r.rejectionReason}{r.customRejectionReason ? ` — ${r.customRejectionReason}` : ""}</p>}
                        {r.notes && <p className="text-[11px] text-muted-foreground">📝 {r.notes}</p>}
                        {r.nextVisitDate && <p className="text-[11px] text-blue-600">📅 Next: {r.nextVisitDate} {r.followUpAction && `— ${r.followUpAction}`}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ADD DEALER MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-foreground flex items-center gap-2"><Plus size={16} className="text-primary" /> Add Dealer to Route</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-muted cursor-pointer"><X size={16} className="text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleAddDealer} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Dealer Name *</label>
                <input required type="text" value={addForm.dealerName} onChange={e => setAddForm(f => ({ ...f, dealerName: e.target.value }))} placeholder="e.g. Ravi Paint & Hardware" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Area / Locality</label>
                  <input type="text" value={addForm.area} onChange={e => setAddForm(f => ({ ...f, area: e.target.value }))} placeholder="Malviya Nagar" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Phone Number</label>
                  <input type="tel" value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} placeholder="9876543210" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Full Address</label>
                <input type="text" value={addForm.address} onChange={e => setAddForm(f => ({ ...f, address: e.target.value }))} placeholder="Shop no., Street, City" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Visit Purpose</label>
                  <select value={addForm.purpose} onChange={e => setAddForm(f => ({ ...f, purpose: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary">
                    {VISIT_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Scheduled Time</label>
                  <input type="time" value={addForm.scheduledTime} onChange={e => setAddForm(f => ({ ...f, scheduledTime: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted/50 cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black hover:opacity-90 cursor-pointer">Add to Route</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          EVENING REPORT MODAL (Full Dealer Report)
      ══════════════════════════════════════════════════════════════════════ */}
      {reportingOn && (
        <EveningReportModal
          report={reportingOn}
          onSave={handleSaveReport}
          onClose={() => setReportingOn(null)}
          objectionScripts={OBJECTION_SCRIPTS}
          rejectionReasons={REJECTION_REASONS}
          competitors={COMPETITORS}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DAILY SUMMARY REPORT
      ══════════════════════════════════════════════════════════════════════ */}
      {showDailyReport && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowDailyReport(false)}>
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()} style={{ maxHeight: "90vh" }}>
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
              <div>
                <h3 className="text-sm font-black text-foreground">📋 Daily Field Report</h3>
                <p className="text-[11px] text-muted-foreground">{todayStr()} — Rajesh Kumar, Jaipur Zone</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-[10px] font-black text-muted-foreground hover:bg-muted/50 cursor-pointer"><Download size={11} /> Export</button>
                <button onClick={() => setShowDailyReport(false)} className="p-1.5 rounded-lg hover:bg-muted cursor-pointer"><X size={16} className="text-muted-foreground" /></button>
              </div>
            </div>
            <div className="overflow-y-auto p-5 space-y-5" style={{ maxHeight: "calc(90vh - 72px)" }}>
              {/* Summary row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-2xl">
                {[
                  { label: "Total Dealers", val: totals.total },
                  { label: "Visited", val: totals.visited },
                  { label: "Agreed/Partial", val: totals.agreed },
                  { label: "Conversion Rate", val: `${conversionPct}%` },
                  { label: "Total Collection", val: `₹${totals.totalCollection.toLocaleString("en-IN")}` },
                  { label: "Total Orders", val: `₹${totals.totalOrders.toLocaleString("en-IN")}` },
                  { label: "Painters KYC", val: totals.totalKYC },
                  { label: "Skipped", val: totals.skipped },
                ].map((s, i) => (
                  <div key={i}>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                    <p className="text-sm font-black text-foreground">{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Per dealer report table */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Dealer-wise Breakdown</p>
                {reports.map((r, idx) => (
                  <div key={r.id} className="border border-border rounded-2xl overflow-hidden">
                    <div className="flex items-start justify-between p-3 bg-muted/20">
                      <div>
                        <p className="text-xs font-black text-foreground">{idx + 1}. {r.dealerName}</p>
                        <p className="text-[10px] text-muted-foreground">{r.area} · {r.phone || "No phone"} · {r.address || "No address"}</p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${STATUS_STYLE[r.status]?.badge}`}>{r.status.replace("_"," ")}</span>
                        {r.outcome && <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${OUTCOME_STYLE[r.outcome] ?? ""}`}>{r.outcome}</span>}
                      </div>
                    </div>
                    {r.status === "visited" && (
                      <div className="px-3 pb-3 pt-1.5 space-y-1">
                        {r.collectionAmount && <p className="text-[11px] text-foreground">💳 Collection: <strong>{fmtAmt(r.collectionAmount)}</strong></p>}
                        {r.orderAmount && <p className="text-[11px] text-foreground">📦 Order: <strong>{fmtAmt(r.orderAmount)}</strong>{r.orderProducts ? ` — ${r.orderProducts}` : ""}</p>}
                        {r.paintersKYC && <p className="text-[11px] text-foreground">🎨 KYC: {r.paintersKYC} painters</p>}
                        {r.rejectionReason && <p className="text-[11px] text-rose-600">❌ Rejected: {r.rejectionReason}{r.customRejectionReason ? ` — ${r.customRejectionReason}` : ""}</p>}
                        {r.competitorBrand !== "None Observed" && <p className="text-[11px] text-amber-600">⚔️ Competitor: {r.competitorBrand}{r.competitorNote ? ` — ${r.competitorNote}` : ""}</p>}
                        {r.nextVisitDate && <p className="text-[11px] text-blue-600">📅 Follow-up: {r.nextVisitDate}{r.followUpAction ? ` — ${r.followUpAction}` : ""}</p>}
                        {r.notes && <p className="text-[11px] text-muted-foreground">📝 {r.notes}</p>}
                      </div>
                    )}
                    {r.status !== "visited" && r.notes && (
                      <div className="px-3 pb-2 pt-1"><p className="text-[11px] text-muted-foreground">📝 {r.notes}</p></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit button */}
              <button className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-black hover:opacity-90 cursor-pointer flex items-center justify-center gap-2">
                <Send size={15} /> Submit Day Report to Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          OBJECTION QUICK KIT
      ══════════════════════════════════════════════════════════════════════ */}
      {showObjSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowObjSheet(false)}>
          <div className="bg-card border-t border-border rounded-t-3xl w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom-4 duration-200 overflow-hidden" onClick={e => e.stopPropagation()} style={{ maxHeight: "80vh" }}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-sm font-black text-foreground flex items-center gap-2"><Shield size={15} className="text-rose-500" /> Objection Quick Kit</h3>
              <button onClick={() => setShowObjSheet(false)} className="p-1.5 rounded-lg hover:bg-muted cursor-pointer"><X size={16} className="text-muted-foreground" /></button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: "calc(80vh - 64px)" }}>
              {Object.entries(OBJECTION_SCRIPTS).map(([reason, script], i) => (
                <div key={i} className="bg-muted/30 border border-border rounded-2xl p-4 space-y-2">
                  <p className="text-[11px] font-black text-foreground">{i + 1}. {reason}</p>
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                    <p className="text-[11px] text-foreground leading-relaxed">{script}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Evening Report Modal — Separate Component
// ─────────────────────────────────────────────────────────────────────────────
function EveningReportModal({ report, onSave, onClose, objectionScripts, rejectionReasons, competitors }: {
  report: DealerReport;
  onSave: (r: DealerReport) => void;
  onClose: () => void;
  objectionScripts: Record<string, string>;
  rejectionReasons: string[];
  competitors: string[];
}) {
  const [form, setForm] = useState<DealerReport>({ ...report });
  const upd = (patch: Partial<DealerReport>) => setForm(f => ({ ...f, ...patch }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    onSave({ ...form, visitedAt: form.visitedAt || now });
  };

  const objScript = form.rejectionReason ? objectionScripts[form.rejectionReason] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()} style={{ maxHeight: "94vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <div>
            <h3 className="text-sm font-black text-foreground">📋 Dealer Visit Report</h3>
            <p className="text-[11px] text-muted-foreground">{form.dealerName} · {form.area}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted cursor-pointer"><X size={16} className="text-muted-foreground" /></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: "calc(94vh - 70px)" }}>
          <div className="p-5 space-y-5">

            {/* ── Dealer Contact Info ── */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Dealer Contact Info</p>
              <div className="grid grid-cols-1 gap-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Dealer Name</label>
                    <input value={form.dealerName} onChange={e => upd({ dealerName: e.target.value })} placeholder="Full dealer name" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Phone Number</label>
                    <input type="tel" value={form.phone} onChange={e => upd({ phone: e.target.value })} placeholder="9876543210" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Area / Locality</label>
                    <input value={form.area} onChange={e => upd({ area: e.target.value })} placeholder="Malviya Nagar" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Visit Time</label>
                    <input type="time" value={form.visitedAt} onChange={e => upd({ visitedAt: e.target.value })} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">Full Address</label>
                  <input value={form.address} onChange={e => upd({ address: e.target.value })} placeholder="Shop no., Street, Area, City" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
                </div>
              </div>
            </div>

            {/* ── Visit Status ── */}
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">Visit Status</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["visited", "planned", "not_available", "skipped"] as const).map(s => (
                  <button key={s} type="button" onClick={() => upd({ status: s })} className={`py-2 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${form.status === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted/50"}`}>
                    {s === "visited" ? "✅ Visited" : s === "planned" ? "⏳ Planned" : s === "not_available" ? "🚫 Not Available" : "⏭️ Skipped"}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Outcome ── */}
            {form.status === "visited" && (
              <>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">Dealer Outcome</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["agreed", "partial", "not_agreed"] as const).map(o => (
                      <button key={o} type="button" onClick={() => upd({ outcome: o })} className={`py-2.5 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${form.outcome === o ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted/50"}`}>
                        {o === "agreed" ? "✅ Agreed" : o === "partial" ? "⚡ Partial" : "❌ Not Agreed"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rejection Reason (shown if not agreed or partial) */}
                {(form.outcome === "not_agreed" || form.outcome === "partial") && (
                  <div className="space-y-2.5">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Rejection / Concern Reason</p>
                    <div className="flex flex-wrap gap-1.5">
                      {rejectionReasons.map(r => (
                        <button key={r} type="button" onClick={() => upd({ rejectionReason: r })} className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${form.rejectionReason === r ? "bg-rose-500 text-white border-rose-500" : "border-border text-muted-foreground hover:text-foreground"}`}>{r}</button>
                      ))}
                    </div>
                    {form.rejectionReason === "Other (specify below)" && (
                      <input value={form.customRejectionReason} onChange={e => upd({ customRejectionReason: e.target.value })} placeholder="Describe the reason..." className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary" />
                    )}
                    {/* Objection Script */}
                    {objScript && (
                      <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 border border-primary/20 rounded-2xl p-3.5">
                        <p className="text-[10px] font-black text-primary mb-1.5">💡 Counter Script for This Objection</p>
                        <p className="text-[11px] text-foreground leading-relaxed">{objScript}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Financial ── */}
                <div className="space-y-2.5">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Financial Details</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Collection Amount (₹)</label>
                      <input type="number" value={form.collectionAmount} onChange={e => upd({ collectionAmount: e.target.value })} placeholder="0" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary font-mono" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Order Amount (₹)</label>
                      <input type="number" value={form.orderAmount} onChange={e => upd({ orderAmount: e.target.value })} placeholder="0" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary font-mono" />
                    </div>
                  </div>
                  {form.orderAmount && parseFloat(form.orderAmount) > 0 && (
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Products Ordered</label>
                      <input value={form.orderProducts} onChange={e => upd({ orderProducts: e.target.value })} placeholder="e.g. Royale Glitz 10L x4, Shyne 20L x2" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
                    </div>
                  )}
                </div>

                {/* ── Painter KYC ── */}
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Painters KYC Registered</label>
                  <input type="number" value={form.paintersKYC} onChange={e => upd({ paintersKYC: e.target.value })} placeholder="0" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary" />
                </div>

                {/* ── Competitor Intel ── */}
                <div className="space-y-2.5">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Competitor Intelligence</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Competitor Brand</label>
                      <select value={form.competitorBrand} onChange={e => upd({ competitorBrand: e.target.value })} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary">
                        {competitors.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Price / Notes</label>
                      <input value={form.competitorNote} onChange={e => upd({ competitorNote: e.target.value })} placeholder="e.g. 7% cheaper" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>

                {/* ── Follow-up ── */}
                <div className="space-y-2.5">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Follow-up Schedule</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Next Visit Date</label>
                      <input type="date" value={form.nextVisitDate} onChange={e => upd({ nextVisitDate: e.target.value })} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Action Needed</label>
                      <input value={form.followUpAction} onChange={e => upd({ followUpAction: e.target.value })} placeholder="Bring credit form..." className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Notes (always shown) ── */}
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Visit Notes</label>
              <textarea rows={3} value={form.notes} onChange={e => upd({ notes: e.target.value })} placeholder="What happened? Key points from discussion, dealer mood, special requests, anything notable..." className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary resize-none" />
            </div>

            {/* ── Submit ── */}
            <div className="flex gap-3 pb-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted/50 cursor-pointer">Cancel</button>
              <button type="submit" className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-black hover:opacity-90 cursor-pointer">✅ Save Report</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
