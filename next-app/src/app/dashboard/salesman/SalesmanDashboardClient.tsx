"use client";

import React, { useState, useTransition } from "react";
import { Sparkles, MapPin, ClipboardList, CheckCircle2, TrendingUp, Clock, Calendar, ShieldAlert, Plus, X, Phone } from "lucide-react";
import { updateSalesVisitStatus, createSalesVisit } from "./actions";

interface Dealer {
  id: string;
  name: string;
  localities: string;
  designation: string;
}

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
    activities: { id: string; activity_type: string; description: string; created_at: string }[];
    targetStats: {
      mtdRevenue: number;
      targetRevenue: number;
      visitsCompleted: number;
      visitsTarget: number;
      paintersRegistered: number;
      paintersTarget: number;
    };
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export function SalesmanDashboardClient({ initialData }: Props) {
  const [visits, setVisits] = useState<Visit[]>(initialData.visits);
  const [activities, setActivities] = useState(initialData.activities);
  const [stats, setStats] = useState(initialData.targetStats);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [outcomeText, setOutcomeText] = useState("");
  const [visitStatus, setVisitStatus] = useState("Completed");

  const [form, setForm] = useState({
    dealer_name: initialData.dealers[0]?.name || "",
    purpose: "Routine Follow-up",
    location: "Store Outlet"
  });

  const [isPending, startTransition] = useTransition();

  const handleAddVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createSalesVisit({
        dealer_name: form.dealer_name,
        purpose: form.purpose,
        location: form.location
      });

      if (res.success) {
        alert("Visit scheduled successfully for today's route!");
        setShowAddVisit(false);
        // Reload visits
        setVisits(prev => [...prev, {
          id: `VISIT_${Date.now()}`,
          dealer_name: form.dealer_name,
          location: form.location,
          purpose: form.purpose,
          status: "Pending",
          outcome: null
        }]);
      } else {
        alert(res.error || "Failed to schedule visit");
      }
    });
  };

  const handleUpdateVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;

    startTransition(async () => {
      const res = await updateSalesVisitStatus(selectedVisit.id, visitStatus, outcomeText);
      if (res.success) {
        alert("Visit updated successfully.");
        setVisits(prev => prev.map(v => v.id === selectedVisit.id ? { ...v, status: visitStatus, outcome: outcomeText } : v));
        setSelectedVisit(null);
        setOutcomeText("");
        if (visitStatus === "Completed") {
          setStats(s => ({ ...s, visitsCompleted: s.visitsCompleted + 1 }));
        }
      } else {
        alert(res.error || "Failed to update visit");
      }
    });
  };

  const progressPercent = Math.min(100, Math.ceil((stats.mtdRevenue / stats.targetRevenue) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Welcome & MTD Revenue Card */}
      <div className="bg-gradient-to-r from-primary to-primary-focus text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-15">
          <TrendingUp size={150} />
        </div>
        <div className="space-y-1 relative z-10">
          <p className="text-[10px] font-black tracking-widest uppercase opacity-75">Month-To-Date Target</p>
          <h2 className="text-lg font-black">{fmt(stats.mtdRevenue)} / {fmt(stats.targetRevenue)}</h2>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-white h-full rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-[9px] opacity-80 mt-1">{progressPercent}% of monthly sales quota target achieved</p>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Today's Mission Tasks</h3>
          <button onClick={() => setShowAddVisit(true)} className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary text-white text-[9px] font-black uppercase tracking-wider cursor-pointer hover:opacity-90">
            <Plus size={11} /> Visit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-muted/40 border border-border/40 rounded-xl space-y-1">
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Visits Completed</span>
            <p className="text-sm font-black text-foreground">{stats.visitsCompleted} / {stats.visitsTarget}</p>
          </div>
          <div className="p-3 bg-muted/40 border border-border/40 rounded-xl space-y-1">
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Painters Mapped</span>
            <p className="text-sm font-black text-foreground">{stats.paintersRegistered} / {stats.paintersTarget}</p>
          </div>
        </div>
      </div>

      {/* AI Sales Coach advisor */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex gap-3 bg-primary/5">
        <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-muted-foreground">
          <p className="font-bold text-foreground">AI Sales Coach</p>
          <p>• Sharma Paint Store has historically ordered waterproof emulsions in early July. Visit them first to secure a reorder quota!</p>
        </div>
      </div>

      {/* Today's Route List */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> Today's Field Route</h3>
        {visits.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">No visits scheduled for today's route.</p>
        ) : visits.map((v) => (
          <div key={v.id} onClick={() => v.status === "Pending" && setSelectedVisit(v)} className={`bg-card border rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer transition-all ${
            v.status === "Pending" ? "border-border hover:bg-muted/10" : "border-border/40 opacity-75 bg-muted/10"
          }`}>
            <div className="space-y-1.5">
              <h4 className="font-bold text-foreground">{v.dealer_name}</h4>
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                <Clock size={11} /> <span>{v.purpose}</span>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase font-mono border ${
              v.status === "Completed" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
            }`}>
              {v.status}
            </span>
          </div>
        ))}
      </div>

      {/* Add Visit Modal */}
      {showAddVisit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in scale-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Schedule Dealer Visit</h3>
              <button onClick={() => setShowAddVisit(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleAddVisitSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Select Dealer</label>
                <select value={form.dealer_name} onChange={e => setForm(f => ({ ...f, dealer_name: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                  {initialData.dealers.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Visit Purpose</label>
                <input required value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="E.g. Overdue payment collection check" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowAddVisit(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Scheduling..." : "Add to Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Outcome Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in scale-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Update Visit Status</h3>
              <button onClick={() => setSelectedVisit(null)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleUpdateVisitSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Status Outcome</label>
                <select value={visitStatus} onChange={e => setVisitStatus(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                  <option value="Completed">Completed</option>
                  <option value="Missed">Missed</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Notes / Summary</label>
                <textarea required value={outcomeText} onChange={e => setOutcomeText(e.target.value)} placeholder="E.g. Secured order for 20 buckets waterproofing primer" rows={3} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors resize-none" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setSelectedVisit(null)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Updating..." : "Save Outcome"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
