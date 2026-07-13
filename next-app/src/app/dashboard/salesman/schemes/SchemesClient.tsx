"use client";

import React, { useState, useTransition } from "react";
import { Award, Plus, X, BookOpen, AlertCircle, FileText, ChevronRight } from "lucide-react";
import { proposeDealerGrowthProgram } from "../actions";

interface GrowthProgram {
  id: string;
  name: string;
  details: string;
  criteria: string;
  eligibility: string;
  rewards: string;
  status: string;
}

interface Props {
  initialPrograms: GrowthProgram[];
}

export function SchemesClient({ initialPrograms }: Props) {
  const [programs, setPrograms] = useState<GrowthProgram[]>(initialPrograms);
  const [showProposeModal, setShowProposeModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [criteria, setCriteria] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [rewards, setRewards] = useState("");

  const [isPending, startTransition] = useTransition();

  const handleProposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !details || !criteria) {
      alert("Please fill in Name, Details, and Criteria fields.");
      return;
    }

    startTransition(async () => {
      const res = await proposeDealerGrowthProgram({
        name,
        details,
        criteria,
        eligibility: eligibility || "Open to all verified dealers",
        rewards: rewards || "TBD"
      });

      if (res.success) {
        setPrograms(prev => [
          {
            id: `PROG_${Date.now()}`,
            name,
            details,
            criteria,
            eligibility: eligibility || "Open to all verified dealers",
            rewards: rewards || "TBD",
            status: "Proposed"
          },
          ...prev
        ]);
        setShowProposeModal(false);
        setName("");
        setDetails("");
        setCriteria("");
        setEligibility("");
        setRewards("");
        alert("Dealer growth program proposed to CEO successfully!");
      } else {
        alert("Failed to propose growth program.");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground font-sans">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Salesman Workspace</span><span className="opacity-40">/</span><span className="text-foreground">Schemes</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Dealer Growth Programs</h1>
      </div>

      {/* Propose Action Banner */}
      <div className="flex gap-2">
        <button onClick={() => setShowProposeModal(true)} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer">
          <Plus size={14} /> Propose New Program
        </button>
      </div>

      {/* Programs List */}
      <div className="space-y-4">
        {programs.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No dealer growth programs active.</p>
        ) : programs.map((prog) => (
          <div key={prog.id} className="bg-card border border-border rounded-2xl p-5 space-y-3.5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-foreground text-sm flex items-center gap-1.5"><Award size={15} className="text-primary" /> {prog.name}</h3>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[8px] font-black border uppercase font-mono ${
                  prog.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                }`}>{prog.status}</span>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{prog.details}</p>

            <div className="border-t border-border/40 pt-3.5 space-y-2 text-[10px]">
              <div>
                <span className="font-bold text-foreground">Target Criteria:</span>
                <p className="text-muted-foreground mt-0.5">{prog.criteria}</p>
              </div>
              <div>
                <span className="font-bold text-foreground">Eligibility Parameters:</span>
                <p className="text-muted-foreground mt-0.5">{prog.eligibility}</p>
              </div>
              <div>
                <span className="font-bold text-foreground">Incentive Rewards:</span>
                <p className="text-primary font-bold mt-0.5">{prog.rewards}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Propose Modal */}
      {showProposeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-xl animate-in scale-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Plus size={14} className="text-primary" /> Propose Dealer Scheme</h3>
              <button onClick={() => setShowProposeModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleProposeSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Program / Scheme Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="E.g. Diwali Volume Supercharge" className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground transition-colors" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Description & Details</label>
                <textarea required value={details} onChange={e => setDetails(e.target.value)} placeholder="E.g. Quarterly volume booster campaign focused on exterior products." rows={3} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground transition-colors resize-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Target Criteria</label>
                <input required type="text" value={criteria} onChange={e => setCriteria(e.target.value)} placeholder="E.g. Cumulative order of 200L Shine Emulsion" className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground transition-colors" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Eligibility Rule</label>
                <input type="text" value={eligibility} onChange={e => setEligibility(e.target.value)} placeholder="E.g. Open to Tier 1 Dealers" className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground transition-colors" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Rewards / Commissions Value</label>
                <input type="text" value={rewards} onChange={e => setRewards(e.target.value)} placeholder="E.g. 3% extra trade discount" className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground transition-colors" />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowProposeModal(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Submitting..." : "Propose Scheme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
