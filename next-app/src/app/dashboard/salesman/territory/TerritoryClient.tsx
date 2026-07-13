"use client";

import React, { useState, useTransition } from "react";
import { BarChart2, Search, TrendingUp, Sparkles, Map, Target, AlertCircle, Plus, X, Award } from "lucide-react";

interface CityPerformance {
  city: string;
  dealers: number;
  painters: number;
  revenue: number;
  growth: string;
}

interface Props {
  initialData: {
    cities: CityPerformance[];
    targetStats: {
      mtdRevenue: number;
      targetRevenue: number;
    };
    assignedTerritory?: string;
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export function TerritoryClient({ initialData }: Props) {
  const [cities] = useState<CityPerformance[]>(initialData.cities);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [customGoals, setCustomGoals] = useState([
    { id: "1", title: "Onboard 5 new dealers in Jaipur South", progress: 60, status: "Active" },
    { id: "2", title: "Conduct painter awareness workshop in Kota", progress: 100, status: "Completed" }
  ]);

  const [isPending, startTransition] = useTransition();

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle) return;

    startTransition(async () => {
      setCustomGoals(prev => [...prev, {
        id: `GOAL_${Date.now()}`,
        title: newGoalTitle,
        progress: 0,
        status: "Active"
      }]);
      setShowGoalModal(false);
      setNewGoalTitle("");
      alert("New territory goal added!");
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground font-sans">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Salesman Workspace</span><span className="opacity-40">/</span><span className="text-foreground">Territory</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Territory Growth Center</h1>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-2 gap-4 bg-card border border-border rounded-3xl p-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-[9px] font-black text-muted-foreground uppercase">Assigned Region</span>
          <p className="text-lg font-black text-foreground">{initialData.assignedTerritory || "Rajasthan East"}</p>
        </div>
        <div className="space-y-1 text-right">
          <span className="text-[9px] font-black text-muted-foreground uppercase">MTD Revenue</span>
          <p className="text-lg font-black text-emerald-600 font-mono">{fmt(initialData.targetStats.mtdRevenue)}</p>
        </div>
      </div>

      {/* AI Advisor Coach tips */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex gap-3 bg-primary/5">
        <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-muted-foreground">
          <p className="font-bold text-foreground">AI Territory Advisor</p>
          <p>• Kota South has registered a 35% growth in real-estate construction. Direct dealer expansion drives there to secure high paint demand.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button onClick={() => setShowGoalModal(true)} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer">
          <Plus size={14} /> Create Territory Goal
        </button>
      </div>

      {/* City Performance list */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Map size={14} className="text-primary" /> City Distribution Coverage</h3>
        <div className="space-y-3">
          {cities.map((c) => (
            <div key={c.city} className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-foreground text-xs">{c.city}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Dealers: {c.dealers} | Painters: {c.painters}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[8px] font-black border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 uppercase font-mono">{c.growth} Growth</span>
              </div>
              <div className="border-t border-border/40 pt-3 flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                <span>Revenue: {fmt(c.revenue)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Territory Goal Trackers */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Target size={14} className="text-primary" /> Goal Center</h3>
        <div className="space-y-3">
          {customGoals.map((g) => (
            <div key={g.id} className="bg-card border border-border rounded-2xl p-4 space-y-2 shadow-sm">
              <div className="flex justify-between items-center font-bold">
                <span className="text-foreground">{g.title}</span>
                <span className="text-primary font-mono">{g.progress}%</span>
              </div>
              <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden border border-border/40">
                <div className="bg-primary h-full rounded-full" style={{ width: `${g.progress}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground pt-1">
                <span>Status: {g.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in scale-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Target size={14} className="text-primary" /> Add Territory Target</h3>
              <button onClick={() => setShowGoalModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleAddGoal} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Goal Objective</label>
                <input required type="text" value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} placeholder="E.g. Onboard 10 painters in Bundi" className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground transition-colors" />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowGoalModal(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Creating..." : "Save Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
