"use client";

import React, { useState, useTransition } from "react";
import { MapPin, CheckCircle2, Clock, Calendar, AlertCircle, Plus, Sparkles, CheckSquare, X } from "lucide-react";
import { createSalesVisit, updateSalesVisitStatus } from "../actions";

interface Dealer {
  id: string;
  name: string;
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
  };
}

export function VisitsClient({ initialData }: Props) {
  const [visits, setVisits] = useState<Visit[]>(initialData.visits);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isPending, startTransition] = useTransition();

  // Checklist states
  const [checklist, setChecklist] = useState({
    stockChecked: false,
    competitorDiscussed: false,
    outstandingDiscussed: false,
    schemeExplained: false
  });
  const [competitorBrand, setCompetitorBrand] = useState("Asian Paints");
  const [competitorPriceDiff, setCompetitorPriceDiff] = useState("5%");
  const [visitOutcomeNotes, setVisitOutcomeNotes] = useState("");

  const handleCompleteVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;

    const summaryNotes = `[Checklist: Stock=${checklist.stockChecked ? "Yes" : "No"}, Comp=${checklist.competitorDiscussed ? "Yes" : "No"}] CompBrand=${competitorBrand} Diff=${competitorPriceDiff} | Notes: ${visitOutcomeNotes}`;

    startTransition(async () => {
      const res = await updateSalesVisitStatus(selectedVisit.id, "Completed", summaryNotes);
      if (res.success) {
        alert("Visit outcome and checklist logged successfully!");
        setVisits(prev => prev.map(v => v.id === selectedVisit.id ? { ...v, status: "Completed", outcome: summaryNotes } : v));
        setSelectedVisit(null);
        setVisitOutcomeNotes("");
        setChecklist({ stockChecked: false, competitorDiscussed: false, outstandingDiscussed: false, schemeExplained: false });
      } else {
        alert(res.error || "Failed to complete visit");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground font-sans">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Salesman Workspace</span><span className="opacity-40">/</span><span className="text-foreground">Visits</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Field Route Planner</h1>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex gap-3 bg-primary/5">
        <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-muted-foreground">
          <p className="font-bold text-foreground">Route Optimization Coach</p>
          <p>• Based on geographic clusters, visiting your dealers in the order listed will reduce overall commute duration by 20 minutes.</p>
        </div>
      </div>

      {/* Visits Queue List */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> Today's Route Timeline</h3>
        {visits.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">No visits scheduled for today.</p>
        ) : visits.map((v, idx) => (
          <div key={v.id} className="bg-card border border-border rounded-2xl p-4 space-y-3.5 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-[9px] font-mono shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="font-bold text-foreground">{v.dealer_name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{v.purpose}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase font-mono ${
                v.status === "Completed" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              }`}>
                {v.status}
              </span>
            </div>

            {v.status === "Pending" && (
              <div className="border-t border-border/40 pt-3 flex justify-end">
                <button onClick={() => setSelectedVisit(v)} className="px-3.5 py-1.5 bg-primary text-white font-bold rounded-xl text-center text-[10px] hover:opacity-90 transition-opacity cursor-pointer">
                  Start Check-in & Review
                </button>
              </div>
            )}

            {v.outcome && (
              <div className="border-t border-border/40 pt-3 text-[10px] text-muted-foreground bg-muted/20 p-2.5 rounded-xl">
                <p className="font-bold text-foreground">Logged Outcome:</p>
                <p className="mt-1 leading-relaxed">{v.outcome}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Check-in Outcome log Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in scale-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><CheckSquare size={14} className="text-primary" /> Dealer Check-in Checklist</h3>
              <button onClick={() => setSelectedVisit(null)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleCompleteVisitSubmit} className="p-5 space-y-4 text-xs">
              {/* Checklist inputs */}
              <div className="space-y-2 border-b border-border/40 pb-3">
                <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Standard Tasks</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={checklist.stockChecked} onChange={e => setChecklist(c => ({ ...c, stockChecked: e.target.checked }))} className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5" />
                  <span>Current stock inventory checked</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={checklist.competitorDiscussed} onChange={e => setChecklist(c => ({ ...c, competitorDiscussed: e.target.checked }))} className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5" />
                  <span>Competitor activity discussed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={checklist.outstandingDiscussed} onChange={e => setChecklist(c => ({ ...c, outstandingDiscussed: e.target.checked }))} className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5" />
                  <span>Outstanding payments reviewed</span>
                </label>
              </div>

              {/* Competitor Intel inputs */}
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-border/40">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Top Competitor</label>
                  <select value={competitorBrand} onChange={e => setCompetitorBrand(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground transition-colors">
                    <option value="Asian Paints">Asian Paints</option>
                    <option value="Berger Paints">Berger Paints</option>
                    <option value="Nerolac">Nerolac</option>
                    <option value="Birla Opus">Birla Opus</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Price Difference</label>
                  <input type="text" value={competitorPriceDiff} onChange={e => setCompetitorPriceDiff(e.target.value)} placeholder="E.g. 5% cheaper" className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground transition-colors font-mono" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Discussion Notes</label>
                <textarea required value={visitOutcomeNotes} onChange={e => setVisitOutcomeNotes(e.target.value)} placeholder="E.g. Placed new order, complained about primer packaging size" rows={3} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors resize-none" />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setSelectedVisit(null)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Logging..." : "Log Visit Complete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
