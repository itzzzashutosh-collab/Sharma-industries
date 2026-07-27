"use client";

import React, { useState, useTransition } from "react";
import {
  FolderOpen, Plus, Search, Sparkles, X, PlusCircle, CheckCircle2, Star, User, Share2, Copy, Check,
  Paintbrush, Building2, MapPin, Image as ImageIcon, Shield, Loader2, Award, ArrowRight, Eye, ThumbsUp
} from "lucide-react";
import { createPainterProject } from "../actions";

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
  image_before?: string;
  image_after?: string;
}

interface Review {
  id: number;
  reviewer_name: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

interface Props {
  initialData: {
    profile: { id: string; name: string };
    projects: Project[];
    reviews: Review[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Paints Portfolio & Homeowner Design Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_PORTFOLIO_OBJECTIONS = [
  {
    id: "PORT_OBJ_1",
    category: "Finish & Color Verification",
    title: "How do I know what Swatch Royal Shine finish looks like on actual home walls?",
    problemText: "Homeowner is asking if you have real finished wall photos, not just paper shade cards.",
    strategy: "Show High-Res Swatch Completed Site Gallery + Live 3D Texture Preview",
    solutionHindi: "Ma'am/Sir, mera Swatch Paints Completed Sites Portfolio dekhiye! Malviya Nagar & Vaishali Nagar ke 12+ luxury villas mein Swatch Royal Shine Emulsion apply kiya hai. Real wall lighting & finish photos available hain!",
    salesPitch: "Real Completed Site Photographs + High-Res Smooth Gloss Finish Verification.",
    whatsappTemplate: "Namaste Sir/Ma'am! View my completed Swatch Paints Royal Shine Emulsion projects & wall finish photographs here: https://swatchpaints.com/p/rajesh-kumar. Happy to share site references! 🎨"
  },
  {
    id: "PORT_OBJ_2",
    category: "Stencil Durability",
    title: "Will the Swatch Metallic Designer Stencil fade or peel in 2 years?",
    problemText: "Client wants feature wall stencil work but fears peeling or fading.",
    strategy: "Pitch Swatch Metallic Clear-Shield Coating (100% Scrub-Resistant)",
    solutionHindi: "Sir, Swatch Rustic Royale Metallic Stencils ke uppar hum Clear-Shield Protective Coat apply karte hain jo 100% Washable & Scrub-Resistant hoti hai. 10 saal tak koi fading ya peeling nahi hogi!",
    salesPitch: "100% Washable Clear-Shield Protective Coat + 10-Year Anti-Fade Guarantee.",
    whatsappTemplate: "Sir, Swatch Rustic Royale Stencil Guarantee: Clear-Shield Protective Coat ensures 100% washable, scrub-proof feature wall design that won't fade for 10 years! 🌟"
  },
  {
    id: "PORT_OBJ_3",
    category: "Seepage Waterproofing Proof",
    title: "Can you show me previous waterproofing work done in Jaipur?",
    problemText: "Homeowner wants proof of seepage control before hiring for full waterproofing.",
    strategy: "Showcase 100% Dry Wall Seepage Proof Sites with 7-Year Hydro-Lok Warranty",
    solutionHindi: "Sir, humare portfolio mein Tonk Road & Sanganer ke 5+ heavy seepage sites ke Before/After photos hain. Swatch Damp Kicker apply karne ke baad moisture level 0% ho chuka hai with 7-Year Hydro-Lok Warranty!",
    salesPitch: "Showcase 100% Zero-Moisture Seepage Proof Sites + 7-Year Warranty.",
    whatsappTemplate: "Sir, Swatch Damp Kicker Waterproofing Portfolio: Check 100% dry wall seepage transformation photos & 7-Year Hydro-Lok Warranty sites here! Book site moisture test today. 🛡️"
  }
];

export function PainterPortfolioClient({ initialData }: Props) {
  const [profile] = useState(initialData.profile);
  const [projects, setProjects] = useState<Project[]>(() => {
    if (initialData.projects && initialData.projects.length > 0) {
      return initialData.projects.map((p, idx) => ({
        ...p,
        swatch_series: idx === 0 ? "Swatch Royal Shine Luxury Emulsion" : idx === 1 ? "Swatch Damp Kicker 7-Yr Waterproofing" : "Swatch Rustic Royale Stencils",
        locality: idx === 0 ? "Malviya Nagar, Jaipur" : idx === 1 ? "Tonk Road, Jaipur" : "Vaishali Nagar",
        image_after: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80"
      }));
    }
    return [
      { id: 101, project_name: "Royal Villa Luxury Interior", customer_name: "Vikram Sharma", project_type: "Residential Villa", area_sqft: 2400, description: "Full interior painting using Swatch Royal Shine Emulsion + Feature Wall Stencils.", status: "Completed", rating: 5, swatch_series: "Swatch Royal Shine Luxury Emulsion", locality: "Malviya Nagar, Jaipur" },
      { id: 102, project_name: "Green Park Seepage Waterproofing", customer_name: "Anil Agarwal", project_type: "Apartment Waterproofing", area_sqft: 1800, description: "Exterior damp treatment with Swatch Damp Kicker 7-Year Hydro-Lok Warranty.", status: "Completed", rating: 5, swatch_series: "Swatch Damp Kicker 7-Yr Waterproofing", locality: "Tonk Road, Jaipur" }
    ];
  });

  const [activeTab, setActiveTab] = useState<"projects" | "playbook" | "reviews">("projects");
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    project_name: "",
    customer_name: "",
    project_type: "Residential House",
    area_sqft: "",
    swatch_series: "Swatch Royal Shine Luxury Emulsion",
    locality: "Jaipur Central",
    description: ""
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.project_name) return;

    startTransition(async () => {
      const res = await createPainterProject({
        project_name: form.project_name,
        customer_name: form.customer_name,
        project_type: form.project_type,
        area_sqft: Number(form.area_sqft || 0),
        description: form.description
      });

      const newP: Project = {
        id: Date.now(),
        project_name: form.project_name,
        customer_name: form.customer_name || "Homeowner Client",
        project_type: form.project_type,
        area_sqft: Number(form.area_sqft || 0),
        description: form.description || "Executed with Swatch Paints premium series.",
        status: "Completed",
        rating: 5,
        swatch_series: form.swatch_series,
        locality: form.locality || "Jaipur Territory"
      };

      setProjects(prev => [newP, ...prev]);
      setShowAddModal(false);
      setForm({
        project_name: "",
        customer_name: "",
        project_type: "Residential House",
        area_sqft: "",
        swatch_series: "Swatch Royal Shine Luxury Emulsion",
        locality: "Jaipur Central",
        description: ""
      });
      alert(`🎉 Project "${newP.project_name}" added to your Swatch Paints Work Portfolio!`);
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
              ● Swatch Work Gallery
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-black">
              {projects.length} Verified Sites
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              <FolderOpen size={18} className="text-indigo-400" /> {profile.name}'s Swatch Work Portfolio
            </h1>
            <p className="text-[10px] text-slate-400">Showcase completed Swatch Paints transformations to prospective homeowners.</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all cursor-pointer border border-emerald-400/30 active:scale-95 shrink-0"
          >
            <Plus size={14} /> Add Site
          </button>
        </div>

        <button
          onClick={() => {
            const shareTxt = `*SWATCH PAINTS CERTIFIED PORTFOLIO* 🎨\nApplicator: ${profile.name}\nCompleted Sites: ${projects.length} Verified Projects\nView Finished Work & Wall Photos: https://swatchpaints.com/p/rajesh-kumar\n\nCall for site inspection & 100% genuine Swatch warranty application!`;
            navigator.clipboard.writeText(shareTxt);
            alert("Swatch Portfolio Link copied to clipboard for WhatsApp sharing!");
          }}
          className="mt-3 w-full py-2 bg-white/10 border border-white/20 text-white font-black text-[10px] rounded-xl hover:bg-white/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Share2 size={12} /> Share Digital Portfolio Link on WhatsApp
        </button>
      </div>

      {/* ══ MOBILE TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto text-[10px]">
        {[
          { id: "projects", label: "Completed Sites", icon: FolderOpen, badge: projects.length },
          { id: "playbook", label: "Homeowner Playbook", icon: Shield, badge: "3 Strategies" },
          { id: "reviews", label: "Client Testimonials", icon: Star }
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
          TAB 1: COMPLETED SITES GALLERY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "projects" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Completed Swatch Projects</span>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              + Add New Site
            </button>
          </div>

          <div className="space-y-3">
            {projects.map(p => (
              <div key={p.id} className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {p.swatch_series || "Swatch Royal Shine Emulsion"}
                    </span>
                    <h3 className="font-extrabold text-foreground text-xs sm:text-sm mt-1">{p.project_name}</h3>
                    <p className="text-[10px] text-muted-foreground">Client: <strong className="text-foreground">{p.customer_name || "Homeowner"}</strong> • {p.locality || "Jaipur"}</p>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full text-[9px] font-mono font-black border border-amber-500/20">
                    <Star size={10} className="fill-amber-500" /> {p.rating || 5}.0
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground bg-muted/30 p-2.5 rounded-2xl border border-border/50">
                  {p.description}
                </p>

                <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                  <span>Area: <strong>{p.area_sqft || 1800} sq ft</strong></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Verified Swatch Site</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: HOMEOWNER DESIGN & FINISH OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-md space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white">Homeowner Design & Finish Counters</h2>
            </div>
            <p className="text-[10px] text-slate-300">
              Address client doubts regarding paint finish, stencil durability, and waterproofing proof.
            </p>
          </div>

          <div className="space-y-3">
            {SWATCH_PORTFOLIO_OBJECTIONS.map((obj, idx) => (
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
                  <strong className="block text-[8px] font-black uppercase text-rose-500 mb-0.5">Homeowner Objection:</strong>
                  "{obj.problemText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 text-[10px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Painter Counter Strategy (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.solutionHindi}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[9px] font-bold text-muted-foreground">Share Portfolio Pitch</span>
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
                        <Copy size={11} /> Copy Pitch
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
          TAB 3: CLIENT TESTIMONIALS & RATINGS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "reviews" && (
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider block">Client Satisfaction</span>
                <h2 className="text-base font-black text-foreground font-mono">5.0 Star Rating</h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-black text-[9px] border border-emerald-500/20">
                100% POSITIVE
              </span>
            </div>

            <div className="space-y-2 text-[10px]">
              {[
                { name: "Vikram Sharma (Malviya Nagar)", text: "Rajesh ji applied Swatch Royal Shine Emulsion in our villa. Exceptional finish, zero smell, and completed 1 day ahead of deadline!", rating: 5 },
                { name: "Anil Agarwal (Tonk Road)", text: "Swatch Damp Kicker 7-Year Waterproofing completely eliminated heavy wall seepage in our ground floor apartment. Highly recommended!", rating: 5 }
              ].map((r, i) => (
                <div key={i} className="bg-muted/30 border border-border/50 rounded-2xl p-3 space-y-1">
                  <div className="flex justify-between items-center font-bold text-foreground">
                    <span>{r.name}</span>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} size={10} className="fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-[9px] italic">"{r.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ADD NEW SWATCH SITE SHOWCASE MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-foreground text-xs flex items-center gap-1.5">
                <PlusCircle size={16} className="text-emerald-500" /> Add Swatch Site Showcase
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">
                  Project Title *
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
                  Project Description & Work Notes
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe colors used, wall preparation, and special texture work..."
                  className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground outline-none focus:border-primary resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                {isPending ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />} Save Site to Portfolio
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
