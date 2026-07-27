"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  MapPin, CheckCircle2, Clock, Plus, X, Phone, Navigation,
  Sparkles, CheckSquare, AlertCircle, Route, Target, Trophy,
  ChevronDown, ChevronUp, Star, Zap, TrendingUp, Package,
  IndianRupee, Users, FileText, Camera, Mic, Shield,
  ThumbsUp, BarChart3, Award, Handshake, Lightbulb, RefreshCw
} from "lucide-react";
import { createSalesVisit, updateSalesVisitStatus } from "../actions";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Dealer { id: string; name: string; localities?: string; }
interface Visit {
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
    visits: Visit[];
    success?: boolean;
  };
}

// ── Mock / fallback data ───────────────────────────────────────────────────────
const MOCK_VISITS: Visit[] = [
  { id: "V1", dealer_name: "Ravi Paint & Hardware", location: "Malviya Nagar, Jaipur", purpose: "Order Collection & New Scheme Pitch", status: "Completed", outcome: "Order ₹42,000 confirmed. Customer interested in Contractor Scheme. Next visit in 15 days." },
  { id: "V2", dealer_name: "Sharma Colour House", location: "Tonk Road, Jaipur", purpose: "Royale Luxury Introduction + Reorder", status: "Completed", outcome: "Placed repeat order ₹28,000. Painter KYC for 2 painters done." },
  { id: "V3", dealer_name: "Vikram Building Materials", location: "Sanganer, Jaipur", purpose: "Collection Drive — ₹18,500 pending", status: "In Progress", outcome: null },
  { id: "V4", dealer_name: "Rajasthan Paint Depot", location: "Sitapura RIICO, Jaipur", purpose: "Painter KYC — 3 New Registrations", status: "Pending", outcome: null },
  { id: "V5", dealer_name: "Mehta General Store", location: "Mansarovar, Jaipur", purpose: "Loyalty Points Redemption Support", status: "Pending", outcome: null },
  { id: "V6", dealer_name: "Gupta Traders", location: "Vaishali Nagar, Jaipur", purpose: "New SKU Introduction — Shyne Emulsion", status: "Skipped", outcome: "Dealer unavailable. Rescheduled to tomorrow morning." },
];

const VISIT_PURPOSES = [
  "Routine Follow-up",
  "Order Collection",
  "Outstanding Collection",
  "New Product Introduction",
  "Painter KYC Drive",
  "Festival Scheme Pitch",
  "Complaint Resolution",
  "New Dealer Onboarding",
  "Display Rack Setup",
  "Credit Renewal Discussion",
  "Competitor Intel Gathering",
  "Glow Sign / Branding Setup",
];

const COMPETITORS = ["Asian Paints", "Berger Paints", "Nerolac", "Birla Opus", "Indigo Paints", "British Paints", "Jotun", "None Observed"];

const OBJECTION_QUICK = [
  { label: "Price Too High", script: "Sir, coverage per liter is 350 sqft vs 200 for local brands — cost per wall is actually lower." },
  { label: "Competitor Discount", script: "Competitor gives discount once. Swatch credits painter wallet every 3 tins — painters prefer us over time." },
  { label: "Stock Full", script: "Perfect — festival season hits in 6 weeks. Stock now and get priority allocation before shortage hits." },
  { label: "Credit Days", script: "Sir, clear next 2 invoices on time and I'll personally nominate you for Gold Partner — 45-day credit unlocked." },
  { label: "Not Interested", script: "Totally understand. May I leave you our latest coverage comparison chart? Costs you nothing, saves your customer money." },
  { label: "Quality Issue", script: "I'm sorry to hear that. Give me the batch number right now — I'll raise a 100% replacement claim personally." },
];

const STATUS_STYLE: Record<string, { border: string; bg: string; badge: string; dot: string }> = {
  Completed:    { border: "border-emerald-500/20", bg: "bg-emerald-500/[0.03]", badge: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-500" },
  "In Progress":{ border: "border-blue-500/20",    bg: "bg-blue-500/[0.03]",    badge: "text-blue-600 bg-blue-500/10 border-blue-500/20",       dot: "bg-blue-500" },
  Pending:      { border: "border-amber-500/20",   bg: "bg-amber-500/[0.03]",   badge: "text-amber-600 bg-amber-500/10 border-amber-500/20",    dot: "bg-amber-500" },
  Skipped:      { border: "border-rose-500/20",    bg: "bg-rose-500/[0.03]",    badge: "text-rose-500 bg-rose-500/10 border-rose-500/20",       dot: "bg-rose-500" },
};

const EMPTY_CHECKLIST = {
  greetedOwner: false,
  stockVerified: false,
  competitorChecked: false,
  outstandingDiscussed: false,
  schemeExplained: false,
  paintersAsked: false,
  complaintLogged: false,
  orderConfirmed: false,
  collectionAttempted: false,
  followUpSet: false,
};

// ── Component ─────────────────────────────────────────────────────────────────
export function VisitsClient({ initialData }: Props) {
  const [visits, setVisits] = useState<Visit[]>(
    initialData.visits?.length ? initialData.visits : MOCK_VISITS
  );
  const dealers = initialData.dealers?.length ? initialData.dealers : [
    { id: "D1", name: "Ravi Paint & Hardware" },
    { id: "D2", name: "Sharma Colour House" },
    { id: "D3", name: "Vikram Building Materials" },
  ];

  // UI state
  const [activeTab, setActiveTab] = useState<"route" | "analytics" | "history">("route");
  const [expandedVisit, setExpandedVisit] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [checkInVisit, setCheckInVisit] = useState<Visit | null>(null);
  const [showObjSheet, setShowObjSheet] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Add visit form
  const [addForm, setAddForm] = useState({ dealer_name: dealers[0]?.name ?? "", location: "", purpose: VISIT_PURPOSES[0] });

  // Check-in form
  const [checklist, setChecklist] = useState({ ...EMPTY_CHECKLIST });
  const [checkInStatus, setCheckInStatus] = useState("Completed");
  const [competitor, setCompetitor] = useState("Asian Paints");
  const [compPriceDiff, setCompPriceDiff] = useState("");
  const [collectionAmt, setCollectionAmt] = useState("");
  const [orderAmt, setOrderAmt] = useState("");
  const [objectionFaced, setObjectionFaced] = useState("");
  const [objectionHandled, setObjectionHandled] = useState(false);
  const [notes, setNotes] = useState("");
  const [nextVisitDate, setNextVisitDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Computed stats
  const stats = useMemo(() => ({
    total: visits.length,
    completed: visits.filter(v => v.status === "Completed").length,
    inProgress: visits.filter(v => v.status === "In Progress").length,
    pending: visits.filter(v => v.status === "Pending").length,
    skipped: visits.filter(v => v.status === "Skipped").length,
  }), [visits]);

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const checklistDone = Object.values(checklist).filter(Boolean).length;
  const checklistTotal = Object.values(checklist).length;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.dealer_name || !addForm.location) return;
    try { await createSalesVisit(addForm); } catch { /* optimistic */ }
    setVisits(prev => [...prev, { id: `V_${Date.now()}`, ...addForm, status: "Pending", outcome: null }]);
    setShowAddModal(false);
    setAddForm(f => ({ ...f, location: "" }));
  };

  const handleCheckInSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInVisit) return;
    setIsSaving(true);

    const checkedTasks = Object.entries(checklist).filter(([, v]) => v).map(([k]) =>
      k.replace(/([A-Z])/g, ' $1').trim()
    ).join(", ");

    const summaryParts = [
      checkedTasks && `✅ Tasks: ${checkedTasks}`,
      competitor && competitor !== "None Observed" && `🏷️ Competitor: ${competitor}${compPriceDiff ? ` (${compPriceDiff} diff)` : ""}`,
      collectionAmt && `💳 Collected: ₹${collectionAmt}`,
      orderAmt && `📦 Order: ₹${orderAmt}`,
      objectionFaced && `⚔️ Objection: ${objectionFaced} — ${objectionHandled ? "Handled ✅" : "Pending follow-up"}`,
      nextVisitDate && `📅 Next visit: ${nextVisitDate}`,
      notes && `📝 Notes: ${notes}`,
    ].filter(Boolean).join(" | ");

    try { await updateSalesVisitStatus(checkInVisit.id, checkInStatus, summaryParts); } catch { /* optimistic */ }
    setVisits(prev => prev.map(v => v.id === checkInVisit.id ? { ...v, status: checkInStatus, outcome: summaryParts } : v));

    // reset
    setCheckInVisit(null);
    setChecklist({ ...EMPTY_CHECKLIST });
    setCheckInStatus("Completed");
    setCompetitor("Asian Paints");
    setCompPriceDiff("");
    setCollectionAmt("");
    setOrderAmt("");
    setObjectionFaced("");
    setObjectionHandled(false);
    setNotes("");
    setNextVisitDate("");
    setIsSaving(false);
  };

  const openCheckIn = (visit: Visit) => {
    setCheckInVisit(visit);
    setChecklist({ ...EMPTY_CHECKLIST });
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-24">

      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-violet-950/60 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.2),_transparent_65%)]" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative p-5 lg:p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30 shadow-lg flex-shrink-0">
                <Route size={24} className="text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-[3px]">Field Visit Command</span>
                  <span className="text-[9px] font-black text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-pulse">● LIVE</span>
                </div>
                <h1 className="text-xl font-black text-white">Today's Field Route</h1>
                <p className="text-[11px] text-blue-200/60 mt-0.5 flex items-center gap-2">
                  <MapPin size={10} className="text-blue-400" /> Jaipur Zone — Rajasthan East
                  <span className="opacity-30 mx-1">|</span>
                  {currentTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start lg:self-auto">
              <button
                onClick={() => setShowObjSheet(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 text-white text-[11px] font-black hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
              >
                <Shield size={13} /> Objection Kit
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-500 text-white text-[11px] font-black hover:bg-blue-400 transition-all shadow-lg cursor-pointer"
              >
                <Plus size={14} /> Add Stop
              </button>
            </div>
          </div>

          {/* Progress Strip */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-white/70">Daily Progress — {stats.completed}/{stats.total} visits done</span>
              <span className="text-[11px] font-black text-emerald-400">{completionPct}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000" style={{ width: `${completionPct}%` }} />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[
                { label: "Done", val: stats.completed, color: "text-emerald-400" },
                { label: "Active", val: stats.inProgress, color: "text-blue-400" },
                { label: "Pending", val: stats.pending, color: "text-amber-400" },
                { label: "Skipped", val: stats.skipped, color: "text-rose-400" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
                  <p className="text-[10px] text-white/50 font-bold">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Route Coach Card ───────────────────────────────────────────────── */}
      <div className="flex gap-3 p-4 bg-gradient-to-r from-violet-500/10 to-blue-500/5 border border-violet-500/20 rounded-2xl">
        <div className="p-2 bg-violet-500/20 rounded-xl flex-shrink-0">
          <Sparkles size={16} className="text-violet-500" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black text-foreground mb-1 flex items-center gap-1.5">
            <span>AI Route Coach</span>
            <span className="text-[9px] text-violet-500 font-bold bg-violet-500/10 px-1.5 py-0.5 rounded-full">Smart Insight</span>
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            📍 <strong className="text-foreground">Optimized route saves 22 min</strong> — Visit Vikram Building Materials before Rajasthan Paint Depot (same RIICO cluster). 
            <br />💡 Sharma Colour House has <strong className="text-amber-500">92% reorder probability</strong> — lead with Royale Glitz bundle pitch. 
            <br />⚠️ Outstanding ₹18,500 at Vikram — go before noon when owner is available.
          </p>
        </div>
      </div>

      {/* ── Tab Nav ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-2xl border border-border">
        {([
          { id: "route", label: "Route & Check-in", icon: Route },
          { id: "analytics", label: "Visit Analytics", icon: BarChart3 },
          { id: "history", label: "History Log", icon: FileText },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black whitespace-nowrap transition-all cursor-pointer flex-1 justify-center ${
              activeTab === tab.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon size={12} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: ROUTE & CHECK-IN                                               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "route" && (
        <div className="space-y-4">
          {/* Visual Route Rail */}
          <div className="flex items-center gap-1.5 bg-muted/30 border border-border rounded-2xl p-3 overflow-x-auto">
            {visits.map((v, idx) => {
              const s = STATUS_STYLE[v.status] ?? STATUS_STYLE["Pending"];
              return (
                <div key={v.id} className="flex items-center gap-1.5 flex-shrink-0">
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[11px] font-black transition-all cursor-pointer hover:scale-110 ${
                    v.status === "Completed" ? "border-emerald-500 bg-emerald-500/20 text-emerald-600" :
                    v.status === "In Progress" ? "border-blue-500 bg-blue-500/20 text-blue-600 animate-pulse" :
                    v.status === "Skipped" ? "border-rose-400 bg-rose-500/10 text-rose-400 opacity-60" :
                    "border-amber-500 bg-amber-500/10 text-amber-600"
                  }`} title={v.dealer_name}>
                    {v.status === "Completed" ? <CheckCircle2 size={14} /> : idx + 1}
                  </div>
                  {idx < visits.length - 1 && (
                    <div className={`h-0.5 w-6 rounded-full flex-shrink-0 ${v.status === "Completed" ? "bg-emerald-500" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Visit Cards */}
          <div className="space-y-3">
            {visits.map((visit, idx) => {
              const s = STATUS_STYLE[visit.status] ?? STATUS_STYLE["Pending"];
              const isExpanded = expandedVisit === visit.id;
              return (
                <div key={visit.id} className={`border ${s.border} ${s.bg} rounded-2xl overflow-hidden transition-all duration-200`}>
                  {/* Card Header */}
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer select-none"
                    onClick={() => setExpandedVisit(isExpanded ? null : visit.id)}
                  >
                    {/* Stop Number */}
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[11px] font-black flex-shrink-0 ${
                      visit.status === "Completed" ? "border-emerald-500 bg-emerald-500/20 text-emerald-600" :
                      visit.status === "In Progress" ? "border-blue-500 bg-blue-500/20 text-blue-600" :
                      visit.status === "Skipped" ? "border-rose-400 text-rose-400" :
                      "border-amber-500 bg-amber-500/10 text-amber-600"
                    }`}>
                      {visit.status === "Completed" ? <CheckCircle2 size={13} /> : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-xs font-black text-foreground">{visit.dealer_name}</p>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide flex-shrink-0 ${s.badge}`}>
                          {visit.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                        <MapPin size={9} className="flex-shrink-0" /> {visit.location}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{visit.purpose}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(visit.status === "Pending" || visit.status === "In Progress") && (
                        <button
                          onClick={e => { e.stopPropagation(); openCheckIn(visit); }}
                          className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-sm"
                        >
                          {visit.status === "In Progress" ? "Update" : "Check-in"}
                        </button>
                      )}
                      {isExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-border/40 px-4 pb-4 pt-3 space-y-3">
                      {visit.outcome && (
                        <div className="bg-muted/40 rounded-xl p-3">
                          <p className="text-[10px] font-black text-foreground uppercase tracking-wider mb-1.5">📋 Logged Outcome</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{visit.outcome}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer">
                          <Phone size={11} /> Call Dealer
                        </button>
                        <button className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer">
                          <Navigation size={11} /> Navigate
                        </button>
                        <button className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer">
                          <Camera size={11} /> Add Photo
                        </button>
                        {visit.status !== "Skipped" && (
                          <button
                            onClick={() => {
                              setVisits(prev => prev.map(v => v.id === visit.id ? { ...v, status: "Skipped", outcome: "Manually skipped." } : v));
                              setExpandedVisit(null);
                            }}
                            className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                          >
                            <X size={11} /> Mark Skipped
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* End of Day Summary */}
          {stats.completed + stats.skipped === stats.total && stats.total > 0 && (
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-3xl p-5 text-center space-y-2">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-sm font-black text-foreground">Route Complete!</p>
              <p className="text-[11px] text-muted-foreground">{stats.completed} visits done · {stats.skipped} skipped · Great work today, Rajesh!</p>
              <div className="flex justify-center gap-3 pt-1">
                <button className="px-4 py-2 bg-emerald-500 text-white text-[11px] font-black rounded-xl cursor-pointer hover:opacity-90">Submit Day Report</button>
                <button onClick={() => setShowAddModal(true)} className="px-4 py-2 border border-border text-[11px] font-black rounded-xl cursor-pointer hover:bg-muted/50">Add Extra Visit</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: ANALYTICS                                                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          {/* Today's KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Visits Done", val: `${stats.completed}/${stats.total}`, sub: `${completionPct}% complete`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Collected Today", val: "₹68,500", sub: "3 payments received", icon: IndianRupee, color: "text-amber-500", bg: "bg-amber-500/10" },
              { label: "Orders Placed", val: "₹70,000", sub: "2 confirmed orders", icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "KYCs Done", val: "3/5", sub: "painter registrations", icon: Users, color: "text-violet-500", bg: "bg-violet-500/10" },
            ].map((k, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{k.label}</span>
                  <div className={`p-1.5 rounded-lg ${k.bg}`}><k.icon size={13} className={k.color} /></div>
                </div>
                <p className="text-xl font-black text-foreground font-mono">{k.val}</p>
                <p className="text-[10px] text-muted-foreground">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Visit Funnel */}
          <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-2xs">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} className="text-primary" /> Today's Visit Funnel
            </h3>
            {[
              { label: "Total Planned", val: stats.total, max: stats.total, color: "bg-primary/60" },
              { label: "Completed", val: stats.completed, max: stats.total, color: "bg-emerald-500" },
              { label: "In Progress", val: stats.inProgress, max: stats.total, color: "bg-blue-500" },
              { label: "Pending", val: stats.pending, max: stats.total, color: "bg-amber-500" },
              { label: "Skipped", val: stats.skipped, max: stats.total, color: "bg-rose-400" },
            ].map((row, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[11px] text-foreground font-bold">{row.label}</span>
                  <span className="text-[11px] font-black text-foreground">{row.val}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${row.color} rounded-full transition-all duration-1000`} style={{ width: `${row.max > 0 ? (row.val / row.max) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Performance */}
          <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-2xs">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <BarChart3 size={14} className="text-primary" /> This Week's Performance
            </h3>
            <div className="flex items-end gap-2 h-28">
              {[
                { day: "Mon", done: 6, total: 7 },
                { day: "Tue", done: 5, total: 6 },
                { day: "Wed", done: 8, total: 8 },
                { day: "Thu", done: 4, total: 7 },
                { day: "Fri", done: 3, total: 6 },
                { day: "Sat", done: stats.completed, total: stats.total },
                { day: "Sun", done: 0, total: 0 },
              ].map((w, i) => {
                const pct = w.total > 0 ? (w.done / w.total) * 100 : 0;
                const isToday = i === 5;
                return (
                  <div key={w.day} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full flex flex-col items-center justify-end" style={{ height: "88px" }}>
                      <span className="text-[9px] text-muted-foreground mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{w.done}/{w.total}</span>
                      <div
                        className={`w-full rounded-t-lg transition-all duration-700 ${isToday ? "bg-primary shadow-lg shadow-primary/30" : "bg-primary/25 group-hover:bg-primary/50"}`}
                        style={{ height: `${pct}%`, minHeight: pct > 0 ? "4px" : "0" }}
                      />
                    </div>
                    <span className={`text-[10px] font-black ${isToday ? "text-primary" : "text-muted-foreground"}`}>{w.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Objection Insights */}
          <div className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-2xs">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <Shield size={14} className="text-rose-500" /> Objection Performance — MTD
            </h3>
            {[
              { obj: "Price Too High", faced: 12, handled: 9, color: "bg-amber-500" },
              { obj: "Competitor Discount", faced: 8, handled: 5, color: "bg-rose-500" },
              { obj: "Stock Full", faced: 6, handled: 6, color: "bg-emerald-500" },
              { obj: "Not Interested", faced: 4, handled: 2, color: "bg-violet-500" },
            ].map((o, i) => {
              const rate = Math.round((o.handled / o.faced) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-foreground">{o.obj}</span>
                    <span className="text-[11px] font-black text-foreground">{o.handled}/{o.faced} <span className="text-muted-foreground font-normal">({rate}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${o.color} rounded-full transition-all duration-1000`} style={{ width: `${rate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: HISTORY LOG                                                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "history" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-foreground uppercase tracking-widest">Recent Visit Logs</p>
            <span className="text-[10px] text-muted-foreground">{visits.filter(v => v.outcome).length} with outcomes logged</span>
          </div>
          {visits.map((visit, idx) => {
            const s = STATUS_STYLE[visit.status] ?? STATUS_STYLE["Pending"];
            return (
              <div key={visit.id} className={`bg-card border ${s.border} rounded-2xl p-4 space-y-2 shadow-2xs`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${s.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-xs font-black text-foreground">{visit.dealer_name}</p>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${s.badge}`}>{visit.status}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <MapPin size={9} /> {visit.location}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70">{visit.purpose}</p>
                    {visit.outcome && (
                      <div className="mt-2 bg-muted/40 rounded-xl p-2.5">
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{visit.outcome}</p>
                      </div>
                    )}
                    {!visit.outcome && (
                      <p className="text-[10px] text-muted-foreground/50 mt-1 italic">No outcome logged yet.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ADD VISIT MODAL                                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-foreground flex items-center gap-2"><MapPin size={16} className="text-primary" /> Add Visit Stop</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-muted cursor-pointer"><X size={16} className="text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleAddVisit} className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Dealer</label>
                <select value={addForm.dealer_name} onChange={e => setAddForm(f => ({ ...f, dealer_name: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary">
                  {dealers.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  <option value="New Prospect">-- New Prospect --</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Location / Area</label>
                <input type="text" required value={addForm.location} onChange={e => setAddForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Malviya Nagar, Jaipur" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Visit Purpose</label>
                <select value={addForm.purpose} onChange={e => setAddForm(f => ({ ...f, purpose: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary">
                  {VISIT_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted/50 cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 cursor-pointer">Add to Route</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* FULL CHECK-IN MODAL                                                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {checkInVisit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/70 backdrop-blur-sm" onClick={() => setCheckInVisit(null)}>
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()} style={{ maxHeight: "92vh" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
              <div>
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <CheckSquare size={16} className="text-primary" /> Dealer Check-in
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{checkInVisit.dealer_name} — {checkInVisit.location}</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Checklist Progress */}
                <div className="text-right">
                  <p className="text-[10px] font-black text-primary">{checklistDone}/{checklistTotal}</p>
                  <p className="text-[9px] text-muted-foreground">tasks</p>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-primary/30 flex items-center justify-center">
                  <span className="text-[11px] font-black text-primary">{Math.round((checklistDone / checklistTotal) * 100)}%</span>
                </div>
                <button onClick={() => setCheckInVisit(null)} className="p-1.5 rounded-lg hover:bg-muted cursor-pointer"><X size={16} className="text-muted-foreground" /></button>
              </div>
            </div>

            <form onSubmit={handleCheckInSave} className="overflow-y-auto" style={{ maxHeight: "calc(92vh - 72px)" }}>
              <div className="p-5 space-y-5">

                {/* Visit Status */}
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-2">Visit Status</label>
                  <div className="flex gap-2">
                    {["Completed", "In Progress", "Skipped"].map(s => (
                      <button key={s} type="button" onClick={() => setCheckInStatus(s)} className={`flex-1 py-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${checkInStatus === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted/50"}`}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* 10-Point Checklist */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Visit Checklist</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(Object.keys(EMPTY_CHECKLIST) as (keyof typeof EMPTY_CHECKLIST)[]).map(key => {
                      const labels: Record<string, string> = {
                        greetedOwner: "✅ Greeted owner/decision maker",
                        stockVerified: "📦 Verified current stock levels",
                        competitorChecked: "⚔️ Checked competitor activity",
                        outstandingDiscussed: "💳 Discussed outstanding payments",
                        schemeExplained: "🎁 Explained active schemes",
                        paintersAsked: "🎨 Asked about painter referrals",
                        complaintLogged: "⚠️ Any complaints noted",
                        orderConfirmed: "📋 Confirmed or placed new order",
                        collectionAttempted: "💰 Attempted payment collection",
                        followUpSet: "📅 Next visit date set",
                      };
                      return (
                        <label key={key} className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${checklist[key] ? "border-emerald-500/30 bg-emerald-500/5" : "border-border hover:bg-muted/30"}`}>
                          <div className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${checklist[key] ? "bg-emerald-500 border-emerald-500" : "border-border"}`}>
                            {checklist[key] && <CheckCircle2 size={10} className="text-white" />}
                          </div>
                          <input type="checkbox" checked={checklist[key]} onChange={e => setChecklist(c => ({ ...c, [key]: e.target.checked }))} className="sr-only" />
                          <span className="text-[10px] text-foreground leading-tight">{labels[key]}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Financial Intel */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Collection Amount (₹)</label>
                    <input type="number" value={collectionAmt} onChange={e => setCollectionAmt(e.target.value)} placeholder="0" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Order Amount (₹)</label>
                    <input type="number" value={orderAmt} onChange={e => setOrderAmt(e.target.value)} placeholder="0" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary font-mono" />
                  </div>
                </div>

                {/* Competitor Intel */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Competitor Brand Seen</label>
                    <select value={competitor} onChange={e => setCompetitor(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary">
                      {COMPETITORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Price Difference</label>
                    <input type="text" value={compPriceDiff} onChange={e => setCompPriceDiff(e.target.value)} placeholder="e.g. 5% cheaper" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary" />
                  </div>
                </div>

                {/* Objection Handling */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Objection Faced (if any)</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {["None", ...OBJECTION_QUICK.map(o => o.label)].map(obj => (
                      <button key={obj} type="button" onClick={() => setObjectionFaced(obj === "None" ? "" : obj)} className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${objectionFaced === (obj === "None" ? "" : obj) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>{obj}</button>
                    ))}
                  </div>

                  {objectionFaced && (() => {
                    const qo = OBJECTION_QUICK.find(o => o.label === objectionFaced);
                    return qo ? (
                      <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 border border-primary/20 rounded-xl p-3 space-y-2">
                        <p className="text-[10px] font-black text-primary">💡 Suggested Script</p>
                        <p className="text-[11px] text-foreground leading-relaxed">{qo.script}</p>
                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${objectionHandled ? "bg-emerald-500 border-emerald-500" : "border-border"}`}>
                            {objectionHandled && <CheckCircle2 size={9} className="text-white" />}
                          </div>
                          <input type="checkbox" checked={objectionHandled} onChange={e => setObjectionHandled(e.target.checked)} className="sr-only" />
                          <span className="text-[11px] font-bold text-foreground">I handled this objection successfully</span>
                        </label>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Next Visit */}
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Schedule Next Visit</label>
                  <input type="date" value={nextVisitDate} onChange={e => setNextVisitDate(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary" />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Visit Notes</label>
                  <textarea required={checkInStatus !== "Skipped"} rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="What happened? Order details, concerns, special requests, anything notable..." className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary resize-none" />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pb-2">
                  <button type="button" onClick={() => setCheckInVisit(null)} className="flex-1 py-3 rounded-2xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted/50 cursor-pointer transition-all">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-black hover:opacity-90 cursor-pointer transition-all disabled:opacity-50">
                    {isSaving ? "Saving..." : "✅ Save Check-in"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* OBJECTION QUICK-KIT SHEET                                              */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {showObjSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowObjSheet(false)}>
          <div className="bg-card border-t border-border rounded-t-3xl w-full max-w-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-200 overflow-hidden" onClick={e => e.stopPropagation()} style={{ maxHeight: "85vh" }}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-sm font-black text-foreground flex items-center gap-2"><Shield size={15} className="text-rose-500" /> Objection Quick Kit</h3>
              <button onClick={() => setShowObjSheet(false)} className="p-1.5 rounded-lg hover:bg-muted cursor-pointer"><X size={16} className="text-muted-foreground" /></button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: "calc(85vh - 64px)" }}>
              <p className="text-[11px] text-muted-foreground">Pull up the right script instantly when a dealer raises an objection. Memorize these — they work.</p>
              {OBJECTION_QUICK.map((obj, i) => (
                <div key={i} className="bg-muted/30 border border-border rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-black text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-[9px] font-black text-rose-500 flex-shrink-0">{i + 1}</span>
                    {obj.label}
                  </p>
                  <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 border border-primary/20 rounded-xl p-3">
                    <p className="text-[11px] text-foreground leading-relaxed">{obj.script}</p>
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
