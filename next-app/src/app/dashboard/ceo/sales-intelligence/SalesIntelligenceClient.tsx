"use client";

import React, { useState, useTransition } from "react";
import { ExecutivePageTemplate } from "@/components/executive/ExecutivePageTemplate";
import { Edit3, MapPin, Target, Wallet, Users, X, CheckSquare } from "lucide-react";
import { updateSalesmanTarget } from "../actions";

interface SalesmanTarget {
  salesman_id: string;
  salesman_name: string;
  target_revenue: number;
  target_collections: number;
  assigned_territory: string;
  target_painters: number;
}

interface Props {
  initialTargets: SalesmanTarget[];
}

const KPIS = [
  { label: "Active Orders", value: "486", trend: "+9%", trendType: "up" as const },
  { label: "Quotation Conversion", value: "68.4%", trend: "+2.1%", trendType: "up" as const },
  { label: "Avg Order Value", value: "₹45,200", trend: "+1.8%", trendType: "up" as const },
  { label: "Collection Rate", value: "91.2%", trend: "+0.4%", trendType: "up" as const },
];

const RECOMMENDATIONS = [
  "Incentivize high-performing sales executives in Jaipur region.",
  "Launch promotional dealer packages in Kota to capture local seasonal demand.",
  "Automate SMS payment reminders to improve the dealer outstanding collection rate.",
];

const ACTIVITIES = [
  { time: "11:45 AM", category: "Order", title: "New Bulk Order registered", desc: "Karan Paints ordered 250 buckets of Rustic Royale." },
  { time: "Yesterday", category: "Conversion", title: "Quotation converted to Invoice", desc: "Converted Quotation #948 for ₹1,80,000." },
];

export function SalesIntelligenceClient({ initialTargets }: Props) {
  const [targets, setTargets] = useState<SalesmanTarget[]>(initialTargets);
  const [editingTarget, setEditingTarget] = useState<SalesmanTarget | null>(null);

  // Form states for modal
  const [revenueInput, setRevenueInput] = useState("");
  const [collectionsInput, setCollectionsInput] = useState("");
  const [paintersInput, setPaintersInput] = useState("");
  const [territoryInput, setTerritoryInput] = useState("");

  const [isPending, startTransition] = useTransition();

  const handleEditClick = (t: SalesmanTarget) => {
    setEditingTarget(t);
    setRevenueInput(t.target_revenue.toString());
    setCollectionsInput(t.target_collections.toString());
    setPaintersInput(t.target_painters.toString());
    setTerritoryInput(t.assigned_territory);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;

    startTransition(async () => {
      const res = await updateSalesmanTarget({
        salesmanId: editingTarget.salesman_id,
        targetRevenue: parseFloat(revenueInput) || 0,
        targetCollections: parseFloat(collectionsInput) || 0,
        targetPainters: parseInt(paintersInput) || 0,
        assignedTerritory: territoryInput || "Rajasthan East"
      });

      if (res.success) {
        setTargets(prev => prev.map(t => {
          if (t.salesman_id === editingTarget.salesman_id) {
            return {
              ...t,
              target_revenue: parseFloat(revenueInput) || 0,
              target_collections: parseFloat(collectionsInput) || 0,
              target_painters: parseInt(paintersInput) || 0,
              assigned_territory: territoryInput || "Rajasthan East"
            };
          }
          return t;
        }));
        setEditingTarget(null);
        alert("Sales targets and territory configurations updated successfully!");
      } else {
        alert("Failed to update target details.");
      }
    });
  };

  return (
    <>
      <ExecutivePageTemplate
        title="Sales Intelligence"
        subtitle="Dealer orders, conversion funnels, regional ranks, and live sales"
        summaryText="High-level dashboard monitoring the sales pipelines, regional sales distribution, dealer performance indices, and quotation-to-invoice conversion stats."
        kpis={KPIS}
        healthScore={90}
        healthStatus="Excellent"
        recommendations={RECOMMENDATIONS}
        activities={ACTIVITIES}
        detailedReportsTitle="Territory targets & Salesman Assignments"
        detailedReportsContent={
          <div className="space-y-6 text-xs">
            <p className="text-muted-foreground font-semibold">Assign areas, update monthly targets, and adjust quotas below. Changes revalidate dynamically on sales team smartphones.</p>
            <div className="space-y-4">
              {targets.map((t) => (
                <div key={t.salesman_id} className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-sm transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <span className="font-black text-sm text-foreground">{t.salesman_name}</span>
                      <span className="text-[9px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-lg border border-border/40 font-bold uppercase">{t.salesman_id}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin size={12} className="text-primary" /> Region: <b>{t.assigned_territory}</b></span>
                      <span className="flex items-center gap-1"><Target size={12} className="text-emerald-500" /> Revenue target: <b>₹{Number(t.target_revenue).toLocaleString("en-IN")}</b></span>
                      <span className="flex items-center gap-1"><Wallet size={12} className="text-indigo-500" /> Collection Target: <b>₹{Number(t.target_collections).toLocaleString("en-IN")}</b></span>
                      <span className="flex items-center gap-1"><Users size={12} className="text-amber-500" /> Painters: <b>{t.target_painters} target</b></span>
                    </div>
                  </div>
                  <button onClick={() => handleEditClick(t)} className="flex items-center justify-center gap-1.5 px-4 py-2 border border-border hover:bg-muted text-foreground font-bold rounded-xl transition-all w-full sm:w-auto text-[10px] cursor-pointer">
                    <Edit3 size={11} /> Adjust Quotas
                  </button>
                </div>
              ))}
            </div>
          </div>
        }
      />

      {/* Target config adjust modal */}
      {editingTarget && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-xl animate-in scale-in duration-200 text-xs">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="font-black text-foreground uppercase tracking-wider">Configure Quotas</h3>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Salesman: {editingTarget.salesman_name}</p>
              </div>
              <button onClick={() => setEditingTarget(null)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Assigned Territory / Region Name</label>
                <input required type="text" value={territoryInput} onChange={e => setTerritoryInput(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground transition-colors font-semibold" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Monthly Revenue Target (₹)</label>
                <input required type="number" value={revenueInput} onChange={e => setRevenueInput(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground transition-colors font-mono font-bold" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Collection Target (₹)</label>
                <input required type="number" value={collectionsInput} onChange={e => setCollectionsInput(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground transition-colors font-mono font-bold" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Painter Onboarding Target</label>
                <input required type="number" value={paintersInput} onChange={e => setPaintersInput(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground transition-colors font-mono font-bold" />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setEditingTarget(null)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-5 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Saving changes..." : "Save Quotas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
