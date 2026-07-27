"use client";

import React, { useState, useTransition, useMemo } from "react";
import {
  FolderOpen, Plus, Search, Sparkles, X, PlusCircle, CheckCircle2, Star, User, Share2, Copy, Check,
  Paintbrush, Building2, MapPin, Shield, Loader2, Award, ArrowRight, Eye, Clock, Phone, Calculator,
  TrendingUp, CheckSquare
} from "lucide-react";
import { createPainterProject } from "../../actions";

interface Project {
  id: number;
  project_name: string;
  customer_name: string | null;
  project_type: string;
  area_sqft: number | null;
  description: string | null;
  status: string;
  rating: number;
  swatch_series?: string;
  locality?: string;
  progress_pct?: number;
  buckets_needed?: number;
  phone?: string;
}

interface Props {
  initialData: {
    profile: { id: string; name: string };
    projects: Project[];
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Painter Active Site & Execution Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_PROJECT_OBJECTIONS = [
  {
    id: "PRJ_OBJ_1",
    category: "Wall Area Measurement Dispute",
    title: "What if homeowner claims wall area measurement is less than your estimate?",
    problemText: "Client argues that total wall paintable area is smaller than quoted 2,400 sq ft.",
    strategy: "Swatch Digital Laser Measurement Protocol + Transparent Sq Ft Rate Card",
    solutionHindi: "Ma'am/Sir, hum Swatch Paints Digital Laser Distance Meter use karke 100% exact wall area measure karte hain. Window/door subtractions ke sath detailed room-by-room measurement sheet verifiable hai!",
    salesPitch: "Digital Laser Distance Meter Verification + Room-by-Room Measurement Transparency.",
    whatsappTemplate: "Namaste Sir! Here is the digital laser measurement breakdown for your site: Total Paintable Wall Area: 2,400 Sq Ft. Transparent room-by-room calculations attached! 📐"
  },
  {
    id: "PRJ_OBJ_2",
    category: "Shade Code Verification",
    title: "How to ensure Swatch dealer dispatches correct tint shade code for the site?",
    problemText: "Homeowner is worried that mixed paint color won't match shade card.",
    strategy: "Swatch Computerized Color Lock & Factory Tinting Code Guarantee",
    solutionHindi: "Sir, hum Shree Ram Paints store se Swatch Computerized Tinting Machine ke zariye exact shade code lock karwate hain. Bucket label par computerized shade ID and batch code printed milta hai!",
    salesPitch: "Swatch Computerized Shade Lock & Store Counter Verification.",
    whatsappTemplate: "Sir, Swatch Color Guarantee: Your chosen shade code (Swatch Royal Shine #8812) is locked on Shree Ram Paints computerized dispenser for 100% exact color match! 🎨"
  },
  {
    id: "PRJ_OBJ_3",
    category: "Monsoon Humidity Delay",
    title: "What if unseasonal rain delays exterior painting work by 3 days?",
    problemText: "High wall moisture during monsoon season threatens paint peeling.",
    strategy: "Swatch Quick-Damp Dry Primer System for High-Humidity Sites",
    solutionHindi: "Sir, damp weather mein hum Swatch Quick-Damp Dry Hydro Primer apply karte hain jo wall moisture barrier create karta hai. Weather clear hone par zero peeling guarantee ke sath work finish hoga!",
    salesPitch: "Swatch Quick-Damp Hydro Primer Moisture Barrier Protection.",
    whatsappTemplate: "Sir, Site Humidity Protection: We are using Swatch Quick-Damp Primer to seal wall moisture before final coat. Zero peeling guarantee even in monsoon! 🛡️"
  }
];

export function ProjectsClient({ initialData }: Props) {
  const [profile] = useState(initialData.profile);
  const [projects, setProjects] = useState<Project[]>(() => {
    if (initialData.projects && initialData.projects.length > 0) {
      return initialData.projects.map((p, idx) => ({
        ...p,
        swatch_series: idx === 0 ? "Swatch Royal Shine Luxury Emulsion" : "Swatch Damp Kicker 7-Yr Waterproofing",
        locality: idx === 0 ? "Malviya Nagar, Jaipur" : "Tonk Road, Jaipur",
        progress_pct: idx === 0 ? 65 : 30,
        buckets_needed: Math.ceil((Number(p.area_sqft || 2000)) / 350),
        phone: idx === 0 ? "9829011223" : "9829033445"
      }));
    }
    return [
      { id: 201, project_name: "Royal Villa Full Interior", customer_name: "Vikram Sharma", project_type: "Residential Villa", area_sqft: 2400, description: "Swatch Royal Shine Emulsion + Stencil Wall in living room.", status: "In Progress", rating: 5, swatch_series: "Swatch Royal Shine Luxury Emulsion", locality: "Malviya Nagar, Jaipur", progress_pct: 65, buckets_needed: 7, phone: "9829011223" },
      { id: 202, project_name: "Green Park Seepage Waterproofing", customer_name: "Anil Agarwal", project_type: "Apartment Exterior", area_sqft: 1800, description: "Swatch Damp Kicker 7-Year Hydro-Lok exterior damp proofing.", status: "In Progress", rating: 5, swatch_series: "Swatch Damp Kicker 7-Yr Waterproofing", locality: "Tonk Road, Jaipur", progress_pct: 30, buckets_needed: 5, phone: "9829033445" }
    ];
  });

  const [activeTab, setActiveTab] = useState<"projects" | "playbook">("projects");
  const [filterStatus, setFilterStatus] = useState<"All" | "In Progress" | "Completed">("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    project_name: "",
    customer_name: "",
    phone: "",
    project_type: "Residential House",
    area_sqft: "",
    swatch_series: "Swatch Royal Shine Luxury Emulsion",
    locality: "Jaipur Central",
    description: ""
  });

  const filteredProjects = useMemo(() => {
    if (filterStatus === "All") return projects;
    return projects.filter(p => p.status === filterStatus);
  }, [projects, filterStatus]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.project_name) return;

    startTransition(async () => {
      const sqft = Number(form.area_sqft || 1800);
      const res = await createPainterProject({
        project_name: form.project_name,
        customer_name: form.customer_name,
        project_type: form.project_type,
        area_sqft: sqft,
        description: form.description
      });

      const newP: Project = {
        id: Date.now(),
        project_name: form.project_name,
        customer_name: form.customer_name || "Homeowner",
        project_type: form.project_type,
        area_sqft: sqft,
        description: form.description || "Active Swatch Paints site execution.",
        status: "In Progress",
        rating: 5,
        swatch_series: form.swatch_series,
        locality: form.locality || "Jaipur Territory",
        progress_pct: 10,
        buckets_needed: Math.ceil(sqft / 350),
        phone: form.phone || "9829000000"
      };

      setProjects(prev => [newP, ...prev]);
      setShowAddModal(false);
      setForm({
        project_name: "",
        customer_name: "",
        phone: "",
        project_type: "Residential House",
        area_sqft: "",
        swatch_series: "Swatch Royal Shine Luxury Emulsion",
        locality: "Jaipur Central",
        description: ""
      });
      alert(`🎉 New Active Job Site "${newP.project_name}" registered on Swatch Applicator Hub!`);
    });
  };

  const copyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-28 max-w-md mx-auto font-sans text-xs text-foreground px-1 sm:px-0">

      {/* ══ MOBILE QUICK HEADER & BRAND BANNER ═══════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-4 shadow-xl text-white">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
              ● Swatch Site Tracker
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-black font-mono">
              {projects.length} Active Sites
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              <Building2 size={18} className="text-indigo-400" /> Swatch Job Site Command
            </h1>
            <p className="text-[10px] text-slate-400">Track active sites, calculate bucket requirements, and send WhatsApp quotations.</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all cursor-pointer border border-emerald-400/30 active:scale-95 shrink-0"
          >
            <Plus size={14} /> New Site
          </button>
        </div>
      </div>

      {/* ══ MOBILE TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto text-[10px]">
        {[
          { id: "projects", label: "Active Job Sites", icon: Building2, badge: projects.length },
          { id: "playbook", label: "Site Execution Playbook", icon: Shield, badge: "3 Strategies" }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1 rounded-full text-[8px] font-mono ${isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: ACTIVE JOB SITES & BUCKET ESTIMATOR
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "projects" && (
        <div className="space-y-3">
          {/* Status Filter Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px]">
              {(["All", "In Progress", "Completed"] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    filterStatus === st
                      ? "bg-foreground text-background font-black"
                      : "bg-muted/50 border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              + Add Site
            </button>
          </div>

          {/* Job Sites Cards */}
          <div className="space-y-3">
            {filteredProjects.map(p => (
              <div key={p.id} className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {p.swatch_series || "Swatch Royal Shine Emulsion"}
                    </span>
                    <h3 className="font-extrabold text-foreground text-xs sm:text-sm mt-1">{p.project_name}</h3>
                    <p className="text-[10px] text-muted-foreground">Client: <strong className="text-foreground">{p.customer_name || "Homeowner"}</strong> • {p.locality || "Jaipur"}</p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-black text-[9px] border border-indigo-500/20">
                    {p.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 bg-muted/30 p-2.5 rounded-2xl border border-border/50">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-muted-foreground">Site Progress</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{p.progress_pct || 65}%</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border/40">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${p.progress_pct || 65}%` }} />
                  </div>
                </div>

                {/* Material Metrics */}
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-muted-foreground">
                  <div className="bg-muted/20 p-2 rounded-xl border border-border/40">
                    <span>Wall Area: <strong className="text-foreground">{p.area_sqft || 2000} Sq Ft</strong></span>
                  </div>
                  <div className="bg-muted/20 p-2 rounded-xl border border-border/40">
                    <span>Buckets Required: <strong className="text-emerald-600 font-bold">{p.buckets_needed || 6} Buckets (20L)</strong></span>
                  </div>
                </div>

                {/* Send WhatsApp Quotation Button */}
                <button
                  onClick={() => {
                    const quoteTxt = `*SWATCH PAINTS OFFICIAL SITE ESTIMATE* 🎨\nSite: ${p.project_name}\nClient: ${p.customer_name}\nLocality: ${p.locality}\nPaint Series: ${p.swatch_series}\nWall Area: ${p.area_sqft} Sq. Ft.\nBuckets Required: ${p.buckets_needed} Buckets (20L)\n\nApplicator: ${profile.name} (Swatch Certified Master Applicator)\nCall for site inspection & 100% Swatch Warranty application!`;
                    navigator.clipboard.writeText(quoteTxt);
                    alert(`Site Quotation for ${p.project_name} copied! Ready to paste & send on WhatsApp.`);
                  }}
                  className="w-full py-2 bg-indigo-600 text-white font-black text-[10px] rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Share2 size={12} /> Send Site Quotation to Client on WhatsApp
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: SITE EXECUTION OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-md space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white">Site Measurement & Tinting Counters</h2>
            </div>
            <p className="text-[10px] text-slate-300">
              Address client doubts regarding wall area measurement accuracy, shade tint matching, and weather delays.
            </p>
          </div>

          <div className="space-y-3">
            {SWATCH_PROJECT_OBJECTIONS.map((obj, idx) => (
              <div key={obj.id} className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {obj.category}
                  </span>
                  <h3 className="font-extrabold text-foreground text-xs mt-0.5 flex-1">
                    {idx + 1}. {obj.title}
                  </h3>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-2.5 text-[10px] text-rose-600 dark:text-rose-300 font-medium">
                  <strong className="block text-[8px] font-black uppercase text-rose-500 mb-0.5">Site Challenge:</strong>
                  "{obj.problemText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 text-[10px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Painter Counter Strategy (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.solutionHindi}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[9px] font-bold text-muted-foreground">Share Execution Script</span>
                  <button
                    onClick={() => copyScript(obj.id, obj.whatsappTemplate)}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-600 text-white font-black text-[9px] hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedObjId === obj.id ? (
                      <>
                        <Check size={11} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={11} /> Copy Script
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
          ADD NEW ACTIVE JOB SITE MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-foreground text-xs flex items-center gap-1.5">
                <Building2 size={16} className="text-emerald-500" /> Add Active Job Site
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">
                  Site Project Title *
                </label>
                <input
                  required
                  type="text"
                  value={form.project_name}
                  onChange={e => setForm(prev => ({ ...prev, project_name: e.target.value }))}
                  placeholder="e.g. Royal Villa Interior Painting"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={form.customer_name}
                    onChange={e => setForm(prev => ({ ...prev, customer_name: e.target.value }))}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">
                    Wall Area (Sq. Ft.)
                  </label>
                  <input
                    type="number"
                    value={form.area_sqft}
                    onChange={e => setForm(prev => ({ ...prev, area_sqft: e.target.value }))}
                    placeholder="2400"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">
                  Swatch Paint Series Applied
                </label>
                <select
                  value={form.swatch_series}
                  onChange={e => setForm(prev => ({ ...prev, swatch_series: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
                >
                  <option value="Swatch Royal Shine Luxury Emulsion">Swatch Royal Shine Luxury Emulsion</option>
                  <option value="Swatch Damp Kicker 7-Yr Waterproofing">Swatch Damp Kicker 7-Yr Waterproofing</option>
                  <option value="Swatch Rustic Royale Stencils">Swatch Rustic Royale Stencils</option>
                  <option value="Swatch Premium Interior Shine">Swatch Premium Interior Shine</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">
                  Site Locality & City
                </label>
                <input
                  type="text"
                  value={form.locality}
                  onChange={e => setForm(prev => ({ ...prev, locality: e.target.value }))}
                  placeholder="e.g. Malviya Nagar, Jaipur"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                {isPending ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />} Register Active Job Site
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
