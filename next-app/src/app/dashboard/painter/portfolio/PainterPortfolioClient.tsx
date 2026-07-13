"use client";

import React, { useState, useTransition } from "react";
import { FolderOpen, Plus, Search, Sparkles, X, PlusCircle, CheckCircle2, Star, User } from "lucide-react";
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

export function PainterPortfolioClient({ initialData }: Props) {
  const [projects, setProjects] = useState<Project[]>(initialData.projects);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    project_name: "",
    customer_name: "",
    project_type: "Residential House",
    area_sqft: "",
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

      if (res.success) {
        setProjects(prev => [{
          id: Date.now(),
          project_name: form.project_name,
          customer_name: form.customer_name || null,
          project_type: form.project_type,
          area_sqft: Number(form.area_sqft || 0),
          description: form.description || null,
          status: "Pending",
          rating: 5
        }, ...prev]);
        setShowAddModal(false);
        setForm({
          project_name: "",
          customer_name: "",
          project_type: "Residential House",
          area_sqft: "",
          description: ""
        });
      } else {
        alert(res.error || "Failed to save project");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Portfolio</span><span className="opacity-40">/</span><span className="text-foreground">My Gallery</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-foreground">My Work Portfolio</h1>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-[10px] font-bold cursor-pointer hover:opacity-90 transition-opacity">
            <Plus size={12} /> Add Project
          </button>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Portfolio Tip:</span> Uploading before-and-after photos of waterproofing and textures improves customer hire trust rate by 34%!
        </div>
      </div>

      {/* Projects Gallery */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Completed Projects</h3>
        {projects.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">No projects uploaded yet.</p>
        ) : projects.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-2xl p-4 space-y-2.5 relative group shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[8px] font-black border border-primary/20 bg-primary/10 text-primary uppercase">{p.project_type}</span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase font-mono ${
                p.status === "Verified" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              }`}>
                {p.status}
              </span>
            </div>
            <div>
              <h4 className="font-black text-foreground text-xs">{p.project_name}</h4>
              {p.customer_name && <p className="text-[10px] text-muted-foreground mt-0.5">Customer: {p.customer_name}</p>}
              {p.description && <p className="text-[10px] text-muted-foreground mt-1.5 italic">"{p.description}"</p>}
            </div>
            {p.area_sqft && (
              <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[10px]">
                <span className="text-muted-foreground">Total Painted Area</span>
                <span className="font-bold text-foreground font-mono">{p.area_sqft} Sq.ft.</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Customer Reviews</h3>
        {initialData.reviews.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">No customer reviews yet.</p>
        ) : initialData.reviews.map((rev) => (
          <div key={rev.id} className="bg-card border border-border rounded-2xl p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]"><User size={9} /></div>
                <span>{rev.reviewer_name}</span>
              </div>
              <div className="flex items-center gap-0.5 text-amber-500 font-mono text-[10px] font-bold">
                <Star size={10} className="fill-amber-500" /> {rev.rating}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">"{rev.review_text}"</p>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in scale-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><PlusCircle size={14} className="text-primary" /> Upload Completed Project</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Project Name *</label>
                <input required value={form.project_name} onChange={e => setForm(f => ({ ...f, project_name: e.target.value }))} placeholder="E.g. Main Hall Waterproofing" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Customer Name</label>
                  <input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="Optional" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Total Area (Sq.ft.)</label>
                  <input type="number" value={form.area_sqft} onChange={e => setForm(f => ({ ...f, area_sqft: e.target.value }))} placeholder="E.g. 800" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors font-mono" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Project Type</label>
                <select value={form.project_type} onChange={e => setForm(f => ({ ...f, project_type: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                  {["Residential House", "Villa", "Apartment", "Office", "Showroom", "Commercial Building"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Products used or waterproofing layers details..." rows={2} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors resize-none" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Saving..." : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
