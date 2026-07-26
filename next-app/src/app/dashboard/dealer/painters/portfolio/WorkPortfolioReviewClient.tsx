"use client";

import React, { useState, useTransition, useEffect, useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  FolderOpen, Plus, Search, MapPin, Star, Sparkles, CheckCircle2, X,
  ArrowRight, ShieldCheck, FileText, Image as ImageIcon, Layers, Eye,
  Paintbrush, ThumbsUp, ChevronRight, Share2, Award, UserCheck
} from "lucide-react";
import { createDealerWorkPortfolio } from "../../actions";

interface PortfolioProject {
  id: string;
  painter_name: string;
  painter_phone: string;
  painter_photo: string;
  project_title: string;
  site_location: string;
  category: string;
  area_sqft: number;
  liters_used: number;
  products_used: string;
  before_photo: string;
  after_photo: string;
  rating: number;
  status: string;
  testimonial: string;
  date: string;
}

interface Painter {
  id: string;
  name: string;
  phone: string;
  profile_photo?: string;
}

interface Props {
  initialData: PortfolioProject[];
  paintersList?: Painter[];
}

export function WorkPortfolioReviewClient({ initialData, paintersList = [] }: Props) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [portfolios, setPortfolios] = useState<PortfolioProject[]>(initialData || []);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [selectedProjectModal, setSelectedProjectModal] = useState<PortfolioProject | null>(null);
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState<"after" | "before">("after");

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    if (initialData && initialData.length > 0) setPortfolios(initialData);
  }, [initialData]);

  // Filtered Portfolios
  const filteredProjects = useMemo(() => {
    return portfolios.filter(p => {
      const s = search.toLowerCase();
      const matchSearch = !search || p.project_title.toLowerCase().includes(s) || p.painter_name.toLowerCase().includes(s) || p.site_location.toLowerCase().includes(s) || p.products_used.toLowerCase().includes(s);
      const matchCategory = categoryFilter === "all" || p.category.toLowerCase() === categoryFilter.toLowerCase();
      return matchSearch && matchCategory;
    });
  }, [portfolios, search, categoryFilter]);

  // Aggregate Metrics
  const totalSqft = useMemo(() => portfolios.reduce((acc, p) => acc + Number(p.area_sqft || 0), 0), [portfolios]);
  const totalLiters = useMemo(() => portfolios.reduce((acc, p) => acc + Number(p.liters_used || 0), 0), [portfolios]);
  const avgRating = useMemo(() => {
    if (portfolios.length === 0) return 5.0;
    const sum = portfolios.reduce((acc, p) => acc + Number(p.rating || 5), 0);
    return (sum / portfolios.length).toFixed(1);
  }, [portfolios]);

  // Upload Form State
  const [form, setForm] = useState({
    painter_name: "Rajesh Kumar Painter",
    painter_phone: "+91 98290 88123",
    project_title: "",
    site_location: "Civil Lines, Alwar",
    category: "Royale Texture Art",
    area_sqft: "1800",
    liters_used: "90",
    products_used: "Royale Play Stucco Gold, Royale Luxury Emulsion Shimmer",
    before_photo: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80",
    after_photo: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
    rating: "5.0",
    testimonial: "Outstanding texture work on the main living room wall!"
  });

  const handlePainterSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pName = e.target.value;
    const found = paintersList.find(p => p.name === pName);
    setForm(f => ({
      ...f,
      painter_name: pName,
      painter_phone: found?.phone || f.painter_phone
    }));
  };

  const handleImageFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setForm(f => ({ ...f, [field]: uploadEvent.target?.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.project_title || !form.painter_name) return;

    startTransition(async () => {
      const res = await createDealerWorkPortfolio(form);
      if (res.success && res.data) {
        setPortfolios(prev => [res.data, ...prev]);
        setIsCreatingModal(false);
        setForm({
          painter_name: "Rajesh Kumar Painter",
          painter_phone: "+91 98290 88123",
          project_title: "",
          site_location: "Civil Lines, Alwar",
          category: "Royale Texture Art",
          area_sqft: "1800",
          liters_used: "90",
          products_used: "Royale Play Stucco Gold, Royale Luxury Emulsion Shimmer",
          before_photo: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80",
          after_photo: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
          rating: "5.0",
          testimonial: "Outstanding texture work on the main living room wall!"
        });
      }
    });
  };

  if (!mounted) {
    return (
      <div className="p-12 text-center text-xs font-bold text-muted-foreground animate-pulse bg-card rounded-2xl border border-border">
        Loading Painters Work Portfolio & Before/After Showcase...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── Top Header Navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Painters</span><span className="opacity-40">/</span><span className="text-foreground">Work Portfolio Showcase</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <FolderOpen size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                Painters Work Portfolio & Showcase Gallery
              </h1>
              <p className="text-xs text-muted-foreground">
                Inspect high-res before & after site photos, paint shade breakdowns, coverage sq. ft., and customer reviews
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCreatingModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-2xs cursor-pointer"
        >
          <Plus size={15} /> + Upload Painter Work Project
        </button>
      </div>

      {/* ── Key Metrics Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Completed Site Showcase</span>
          <p className="text-2xl font-black text-foreground font-mono">{portfolios.length} Projects</p>
          <p className="text-[11px] text-emerald-600 font-bold">Verified Painter Sites</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Area Covered</span>
          <p className="text-2xl font-black text-primary font-mono">{totalSqft.toLocaleString("en-IN")} Sq. Ft.</p>
          <p className="text-[11px] text-muted-foreground">Wall Surface Area Painted</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Paint Volume Used</span>
          <p className="text-2xl font-black text-amber-500 font-mono">{totalLiters.toLocaleString("en-IN")} Liters</p>
          <p className="text-[11px] text-muted-foreground">Emulsion & Primer Buckets</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Customer Satisfaction</span>
          <p className="text-2xl font-black text-emerald-600 font-mono flex items-center gap-1">
            <Star size={20} className="fill-amber-500 text-amber-500" /> {avgRating} / 5.0
          </p>
          <p className="text-[11px] text-muted-foreground">Verified Client Rating</p>
        </div>
      </div>

      {/* ── Search & Category Filter Controls ───────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search project title, painter name, products, or site location..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold bg-muted/60 p-1 rounded-xl border border-border">
          {[
            { id: "all", label: "All Projects" },
            { id: "Royale Texture Art", label: "🎨 Royale Texture" },
            { id: "PU Exterior Waterproofing", label: "🛡️ PU Exterior" },
            { id: "Interior Velvet Finish", label: "✨ Interior Velvet" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setCategoryFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                categoryFilter === t.id
                  ? "bg-primary text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── PORTFOLIO PROJECTS GRID ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <div
            key={project.id}
            onClick={() => setSelectedProjectModal(project)}
            className="bg-card border border-border hover:border-primary/50 rounded-3xl overflow-hidden shadow-2xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              {/* Before & After Photo Header */}
              <div className="relative h-48 w-full bg-muted overflow-hidden">
                <img
                  src={project.after_photo}
                  alt={project.project_title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 border border-white/20">
                  <CheckCircle2 size={12} className="text-emerald-400" /> {project.category}
                </div>

                <div className="absolute bottom-3 right-3 bg-amber-500 text-white px-2.5 py-1 rounded-lg text-xs font-mono font-black flex items-center gap-1 shadow-md">
                  <Star size={12} className="fill-white" /> {project.rating}
                </div>
              </div>

              {/* Card Body Info */}
              <div className="p-5 space-y-3">
                <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {project.project_title}
                </h3>

                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin size={13} className="text-emerald-500 shrink-0" />
                  <span>{project.site_location} ({project.area_sqft} Sq. Ft.)</span>
                </p>

                {/* Products Used */}
                <div className="bg-muted/40 p-2.5 rounded-xl border border-border/40 text-[11px] font-mono text-foreground font-semibold">
                  <span className="text-[9px] font-black text-muted-foreground uppercase block mb-0.5">Products Applied</span>
                  <span className="line-clamp-1">{project.products_used}</span>
                </div>

                {/* Painter Info Footer */}
                <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                  <img
                    src={project.painter_photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                    alt={project.painter_name}
                    className="w-9 h-9 rounded-xl object-cover border border-border shrink-0"
                  />
                  <div className="overflow-hidden">
                    <span className="text-xs font-black text-foreground block truncate">{project.painter_name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{project.painter_phone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/20 border-t border-border/40 flex items-center justify-between text-xs font-bold text-primary">
              <span>Inspect Before/After Photos</span>
              <ChevronRight size={16} />
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-16 border border-dashed border-border rounded-2xl">
            <FolderOpen size={36} className="mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-bold text-foreground">No Painter Work Projects Found</p>
            <p className="text-xs text-muted-foreground mt-1">Click "+ Upload Painter Work Project" to add completed site showcases.</p>
          </div>
        )}
      </div>

      {/* ── BEFORE & AFTER HIGH-RES PROJECT INSPECTION MODAL ────────────── */}
      {selectedProjectModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-wider">{selectedProjectModal.category}</span>
                <h2 className="text-xl font-black text-foreground">{selectedProjectModal.project_title}</h2>
                <p className="text-xs text-muted-foreground">{selectedProjectModal.site_location} • {selectedProjectModal.area_sqft} Sq. Ft. • {selectedProjectModal.liters_used} Liters Used</p>
              </div>
              <button
                onClick={() => setSelectedProjectModal(null)}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Before vs After Photo Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-primary" /> High-Resolution Before & After Site Photos
                </h3>
                <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
                  <button
                    onClick={() => setActiveImageTab("after")}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                      activeImageTab === "after" ? "bg-emerald-500 text-white shadow-2xs" : "text-muted-foreground"
                    }`}
                  >
                    ✨ After Finish Coat
                  </button>
                  <button
                    onClick={() => setActiveImageTab("before")}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                      activeImageTab === "before" ? "bg-amber-500 text-white shadow-2xs" : "text-muted-foreground"
                    }`}
                  >
                    🏚️ Before Raw Wall
                  </button>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-border h-72 bg-black">
                <img
                  src={activeImageTab === "after" ? selectedProjectModal.after_photo : selectedProjectModal.before_photo}
                  alt="Site Photo"
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur text-white px-3 py-1 rounded-lg text-xs font-bold">
                  {activeImageTab === "after" ? "Finished Coating Result" : "Raw Wall Surface Before Application"}
                </div>
              </div>
            </div>

            {/* Products & Testimonial */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-background border border-border rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase block">Products & Shade Details</span>
                <p className="font-mono font-bold text-foreground">{selectedProjectModal.products_used}</p>
                <div className="pt-2 border-t border-border flex items-center justify-between text-muted-foreground">
                  <span>Rating:</span>
                  <span className="font-black text-amber-500 flex items-center gap-1">
                    <Star size={14} className="fill-amber-500" /> {selectedProjectModal.rating} / 5.0
                  </span>
                </div>
              </div>

              <div className="bg-background border border-border rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase block">Customer Testimonial</span>
                <p className="italic text-foreground">"{selectedProjectModal.testimonial}"</p>
                <div className="pt-2 border-t border-border flex items-center justify-between text-muted-foreground">
                  <span>Contractor:</span>
                  <span className="font-bold text-foreground">{selectedProjectModal.painter_name}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-border">
              <button
                onClick={() => setSelectedProjectModal(null)}
                className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Showcase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── + UPLOAD NEW PAINTER WORK PROJECT MODAL ─────────────────────── */}
      {isCreatingModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <FolderOpen size={20} className="text-primary" /> Upload Painter Work Project Showcase
              </h2>
              <button
                onClick={() => setIsCreatingModal(false)}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Select Store Painter *</label>
                <select
                  value={form.painter_name}
                  onChange={handlePainterSelectChange}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                >
                  {paintersList.map(p => (
                    <option key={p.id} value={p.name}>{p.name} ({p.phone})</option>
                  ))}
                  {paintersList.length === 0 && (
                    <option value="Rajesh Kumar Painter">Rajesh Kumar Painter (+91 98290 88123)</option>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Project Showcase Title *</label>
                <input
                  required
                  type="text"
                  value={form.project_title}
                  onChange={e => setForm({ ...form, project_title: e.target.value })}
                  placeholder="E.g. Modern Villa Velvet Texture Interior Wall"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Category / Finish Type *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                  >
                    <option value="Royale Texture Art">Royale Texture Art</option>
                    <option value="PU Exterior Waterproofing">PU Exterior Waterproofing</option>
                    <option value="Interior Velvet Finish">Interior Velvet Finish</option>
                    <option value="Wood Finish & Polish">Wood Finish & Polish</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Site Location *</label>
                  <input
                    required
                    type="text"
                    value={form.site_location}
                    onChange={e => setForm({ ...form, site_location: e.target.value })}
                    placeholder="Civil Lines, Alwar"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Area Covered (Sq. Ft.)</label>
                  <input
                    type="number"
                    value={form.area_sqft}
                    onChange={e => setForm({ ...form, area_sqft: e.target.value })}
                    placeholder="1800"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Paint Volume Used (Liters)</label>
                  <input
                    type="number"
                    value={form.liters_used}
                    onChange={e => setForm({ ...form, liters_used: e.target.value })}
                    placeholder="90"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Products & Shades Applied *</label>
                <input
                  required
                  type="text"
                  value={form.products_used}
                  onChange={e => setForm({ ...form, products_used: e.target.value })}
                  placeholder="Royale Play Stucco Gold, Royale Luxury Emulsion"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              {/* Before & After Photo Upload Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-muted/40 border border-border rounded-xl p-3 space-y-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase block">Before Raw Wall Photo *</span>
                  <img src={form.before_photo} alt="Before Preview" className="w-full h-24 rounded-lg object-cover border border-border" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageFileChange("before_photo", e)}
                    className="text-[10px] text-muted-foreground file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-primary/10 file:text-primary"
                  />
                </div>

                <div className="bg-muted/40 border border-border rounded-xl p-3 space-y-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase block">After Finished Coat Photo *</span>
                  <img src={form.after_photo} alt="After Preview" className="w-full h-24 rounded-lg object-cover border border-border" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageFileChange("after_photo", e)}
                    className="text-[10px] text-muted-foreground file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-primary/10 file:text-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Customer Testimonial & Review</label>
                <textarea
                  value={form.testimonial}
                  onChange={e => setForm({ ...form, testimonial: e.target.value })}
                  placeholder="Client feedback note..."
                  rows={2}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs outline-none focus:border-primary text-foreground resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 border border-border text-foreground font-bold rounded-xl hover:bg-muted text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 bg-primary text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <CheckCircle2 size={15} /> {isPending ? "Uploading Project..." : "Publish Project Showcase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
