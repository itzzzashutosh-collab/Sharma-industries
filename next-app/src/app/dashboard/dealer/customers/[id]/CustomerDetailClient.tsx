"use client";

import React, { useState, useTransition } from "react";
import { User, ClipboardList, Clock, ShieldAlert, Sparkles, MessageCircle, Phone, ArrowLeft, Plus, CheckCircle, Save, X, Calendar, Paintbrush } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { createDealerFollowup } from "../../actions";
import Link from "next/link";

interface Profile {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  gstin: string | null;
}

interface Project {
  id: number;
  project_name: string;
  project_type: string;
  estimated_area: number;
  status: string;
  notes: string | null;
  expected_completion: string | null;
}

interface Followup {
  id: number;
  type: string;
  followup_date: string;
  followup_time: string;
  priority: string;
  status: string;
  notes: string | null;
}

interface Props {
  profile: Profile;
  projects: Project[];
  followups: Followup[];
}

export function CustomerDetailClient({ profile, projects, followups: initialFollowups }: Props) {
  const { t } = useLanguage();
  const [followups, setFollowups] = useState<Followup[]>(initialFollowups);
  const [showAddFollowup, setShowAddFollowup] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    customer_id: profile.id,
    type: "Call",
    followup_date: "",
    followup_time: "10:00:00",
    priority: "Medium",
    notes: ""
  });

  const handleAddFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.followup_date) return;
    startTransition(async () => {
      const res = await createDealerFollowup(form);
      if (res.success) {
        setFollowups(prev => [{
          id: Date.now(),
          customer_id: profile.id,
          type: form.type,
          followup_date: form.followup_date,
          followup_time: form.followup_time,
          priority: form.priority,
          status: "Pending",
          notes: form.notes || null
        } as any, ...prev]);
        setShowAddFollowup(false);
        setForm({
          customer_id: profile.id,
          type: "Call",
          followup_date: "",
          followup_time: "10:00:00",
          priority: "Medium",
          notes: ""
        });
      } else {
        alert(res.error || "Failed to schedule followup");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <Link href="/dashboard/dealer/customers" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mb-3 transition-colors">
          <ArrowLeft size={12} /> Back to Registry
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><User size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">{profile.name}</h1>
              <p className="text-xs text-muted-foreground">{profile.phone} • {profile.city || "Alwar"}, {profile.state || "Rajasthan"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAddFollowup(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
              <Plus size={13} /> Schedule Follow-up
            </button>
            <Link href="/dashboard/dealer/customers/color-studio" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold cursor-pointer hover:bg-primary/20 transition-all">
              <Paintbrush size={13} /> AI Color Studio
            </Link>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Customer Guide:</span> Sanjay Mehta prefers luxurious washable finishes. Recommended product line: <span className="font-bold text-foreground">Royale Luxury (Matt)</span>.
        </div>
      </div>

      {/* Grid of Profile, Projects & Followups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card & Property */}
        <div className="space-y-6">
          {/* General Information */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider border-b border-border pb-2">General Information</h3>
            <div className="space-y-3 text-xs">
              <div><span className="text-muted-foreground">GSTIN</span><p className="font-mono font-semibold text-foreground mt-0.5">{profile.gstin || "—"}</p></div>
              <div><span className="text-muted-foreground">Email Address</span><p className="font-semibold text-foreground mt-0.5">{profile.email || "—"}</p></div>
              <div><span className="text-muted-foreground">Shop / Site Address</span><p className="font-semibold text-foreground mt-0.5">{profile.address || "—"}</p></div>
              <div><span className="text-muted-foreground">Pincode</span><p className="font-mono font-semibold text-foreground mt-0.5">{profile.pincode || "—"}</p></div>
            </div>
          </div>

          {/* Color Studio Link */}
          <div className="bg-gradient-to-br from-primary/10 to-teal-500/10 border border-primary/20 rounded-2xl p-5 space-y-3 shadow-sm">
            <Paintbrush size={20} className="text-primary" />
            <h4 className="text-xs font-black text-foreground uppercase tracking-wider">AI Color Studio Integration</h4>
            <p className="text-[11px] text-muted-foreground">Generate quick previews of interior and exterior color combinations for this customer.</p>
            <Link href="/dashboard/dealer/customers/color-studio" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
              Launch Studio Preview <Sparkles size={12} />
            </Link>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm lg:col-span-2">
          <h3 className="text-xs font-black text-foreground uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2"><ClipboardList size={14} className="text-primary" /> Active Sites / Projects</h3>
          <div className="divide-y divide-border/40">
            {projects.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No projects scheduled for this customer.</p>
            ) : projects.map((p) => (
              <div key={p.id} className="py-3 flex items-start justify-between hover:bg-muted/10 px-2 rounded-xl transition-colors">
                <div>
                  <p className="text-xs font-bold text-foreground">{p.project_name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.project_type} • {p.estimated_area} sq.ft.</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[8px] font-black border border-primary/20 bg-primary/10 text-primary uppercase">{p.status}</span>
                  {p.expected_completion && (
                    <p className="text-[9px] text-muted-foreground mt-1 font-mono">Completion: {new Date(p.expected_completion).toLocaleDateString("en-IN")}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Follow-up Timeline */}
          <h3 className="text-xs font-black text-foreground uppercase tracking-wider border-b border-border pb-2 pt-4 flex items-center gap-2"><Clock size={14} className="text-primary" /> Follow-ups & Reminders</h3>
          <div className="divide-y divide-border/40">
            {followups.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No scheduled follow-ups.</p>
            ) : followups.map((f) => (
              <div key={f.id} className="py-3 flex items-start justify-between hover:bg-muted/10 px-2 rounded-xl transition-colors">
                <div>
                  <p className="text-xs font-bold text-foreground">{f.type} Reminder</p>
                  <p className="text-[10px] text-muted-foreground">{f.notes || "No notes recorded"}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[8px] font-black border border-amber-500/20 bg-amber-500/10 text-amber-600 uppercase">{f.priority}</span>
                  <p className="text-[9px] text-muted-foreground mt-1 font-mono">{f.followup_date} • {f.followup_time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Follow-up Modal */}
      {showAddFollowup && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in scale-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> Schedule Customer Follow-up</h3>
              <button onClick={() => setShowAddFollowup(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleAddFollowup} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Reminder Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                    {["Call", "WhatsApp", "Visit", "Meeting", "Site Inspection", "Quotation Reminder", "Payment Reminder"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                    {["High", "Medium", "Low"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Date *</label>
                  <input type="date" required value={form.followup_date} onChange={e => setForm(f => ({ ...f, followup_date: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Time</label>
                  <input type="time" value={form.followup_time} onChange={e => setForm(f => ({ ...f, followup_time: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Notes & Tasks</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Explain task..." rows={3} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors resize-none" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowAddFollowup(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Scheduling..." : "Save Follow-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
