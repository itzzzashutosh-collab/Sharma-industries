"use client";

import React, { useState, useTransition } from "react";
import { Calculator, Save, FileText, CheckCircle2, RefreshCw } from "lucide-react";
import { createPainterEstimation } from "../../actions";

interface Estimation {
  id: number;
  customer_name: string;
  project_name: string;
  area_sqft: number;
  total_cost: number;
  created_at: string;
}

interface Props {
  initialData: {
    estimations: Estimation[];
  };
}

export function CalculatorClient({ initialData }: Props) {
  const [estimations, setEstimations] = useState<Estimation[]>(initialData.estimations);
  const [area, setArea] = useState("");
  const [paintType, setPaintType] = useState("Waterproofing");
  const [coats, setCoats] = useState("2");
  const [custName, setCustName] = useState("");
  const [projName, setProjName] = useState("");

  const [isPending, startTransition] = useTransition();

  // Dynamic calculations formulas
  const numArea = Number(area) || 0;
  const numCoats = Number(coats) || 2;

  // Coverage factors (sqft per litre/kg)
  const coverageMap: Record<string, number> = {
    Waterproofing: 50,
    Putty: 15,
    "Luxury Emulsion": 80,
    "Acrylic Primer": 120
  };

  const coverage = coverageMap[paintType] || 50;
  const totalQtyNeeded = Math.ceil((numArea * numCoats) / coverage);

  const unitRateMap: Record<string, number> = {
    Waterproofing: 220, // ₹220/L
    Putty: 40,          // ₹40/kg
    "Luxury Emulsion": 350, // ₹350/L
    "Acrylic Primer": 140   // ₹140/L
  };

  const rate = unitRateMap[paintType] || 220;
  const materialCost = totalQtyNeeded * rate;
  const labourCost = numArea * 15 * numCoats; // ₹15 per sq.ft. per coat labour charge
  const totalCost = materialCost + labourCost;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !projName || !area) {
      alert("Please enter customer name, project name and paintable area.");
      return;
    }

    startTransition(async () => {
      const res = await createPainterEstimation({
        customer_name: custName,
        project_name: projName,
        area_sqft: numArea,
        material_cost: materialCost,
        labour_cost: labourCost
      });

      if (res.success) {
        alert("Estimation calculation successfully saved!");
        setEstimations(prev => [{
          id: Date.now(),
          customer_name: custName,
          project_name: projName,
          area_sqft: numArea,
          total_cost: totalCost,
          created_at: new Date().toISOString()
        }, ...prev]);
        setCustName("");
        setProjName("");
      } else {
        alert(res.error || "Failed to save calculation");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Work</span><span className="opacity-40">/</span><span className="text-foreground">Calculator</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Material Site Estimator</h1>
      </div>

      {/* Input Form */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Calculator size={14} className="text-primary" /> Dimensions & System Parameters</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Paintable Area (Sq.ft.)</label>
            <input type="number" required value={area} onChange={e => setArea(e.target.value)} placeholder="E.g. 1500" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors font-mono" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Number of Coats</label>
            <select value={coats} onChange={e => setCoats(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
              <option value="1">1 Coat</option>
              <option value="2">2 Coats</option>
              <option value="3">3 Coats</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Paint System Category</label>
          <select value={paintType} onChange={e => setPaintType(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
            {["Waterproofing", "Putty", "Luxury Emulsion", "Acrylic Primer"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Calculated Results */}
      {numArea > 0 && (
        <div className="bg-card border border-primary/20 rounded-3xl p-5 space-y-3.5 shadow-sm bg-primary/5">
          <h3 className="text-xs font-black text-primary uppercase tracking-wider">Calculated Outputs</h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Estimated Quantity Needed</span>
              <span className="font-mono font-bold text-foreground">{totalQtyNeeded} {paintType === "Putty" ? "Kg" : "Litres"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Material Cost</span>
              <span className="font-mono font-bold text-foreground">₹{materialCost.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Estimated Labour Charges</span>
              <span className="font-mono font-bold text-foreground">₹{labourCost.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between border-t border-primary/20 pt-2.5 font-bold text-sm">
              <span className="text-primary uppercase tracking-wide">Total Estimated Cost</span>
              <span className="font-mono text-primary">₹{totalCost.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Save estimation details */}
      {numArea > 0 && (
        <form onSubmit={handleSave} className="bg-card border border-border rounded-3xl p-5 space-y-3.5 shadow-sm">
          <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Save size={14} className="text-primary" /> Save this Calculation</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Customer Name</label>
              <input required value={custName} onChange={e => setCustName(e.target.value)} placeholder="E.g. Harish Mehta" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Project Title</label>
              <input required value={projName} onChange={e => setProjName(e.target.value)} placeholder="E.g. Living Room waterproofing" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
            </div>
          </div>
          <button type="submit" disabled={isPending} className="w-full py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer">
            {isPending ? "Saving..." : "Save Estimate Details"}
          </button>
        </form>
      )}

      {/* Previous Estimations */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Historic Calculations</h3>
        {estimations.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">No saved estimations yet.</p>
        ) : estimations.map((est) => (
          <div key={est.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <h4 className="font-bold text-foreground">{est.project_name}</h4>
              <p className="text-[9px] text-muted-foreground mt-0.5">Customer: {est.customer_name} | {est.area_sqft} Sq.ft.</p>
            </div>
            <span className="font-mono font-bold text-foreground">₹{Number(est.total_cost).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
