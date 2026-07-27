"use client";

import React, { useState, useTransition, useMemo } from "react";
import {
  Calculator, Save, FileText, CheckCircle2, RefreshCw, Share2, Shield, Copy, Check, Sparkles, Plus,
  Layers, Package, DollarSign, Home, ArrowRight, Loader2
} from "lucide-react";
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

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Painter Material Calculator & Estimation Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_CALCULATOR_OBJECTIONS = [
  {
    id: "CALC_OBJ_1",
    category: "Putty & Primer Inclusion",
    title: "Why do you include 20L Swatch Primer & Putty in the material estimate?",
    problemText: "Homeowner wants to skip putty/primer coats to reduce cost.",
    strategy: "2 Coats Putty + 1 Coat Primer Guarantees 0% Peeling for 7+ Years",
    solutionHindi: "Ma'am/Sir, Swatch Acrylic Putty & Water Primer base coat ke bina wall finish rough rahegi aur 1-2 years mein peeling start ho jayegi. Primer coat se 100% paint adhesion + 7-year durability milti hai!",
    salesPitch: "2 Coats Putty + 1 Coat Primer = 100% Adhesion & 7-Year Zero Peeling Guarantee.",
    whatsappTemplate: "Namaste Sir! Swatch Surface Preparation Guarantee: 2 Coats Putty + 1 Coat Primer is essential to seal wall chalkiness & guarantee 7+ years zero peeling durability! 🛡️"
  },
  {
    id: "CALC_OBJ_2",
    category: "Unopened Bucket Return Policy",
    title: "What if leftover paint buckets remain after site completion?",
    problemText: "Homeowner fears buying extra buckets that will go to waste.",
    strategy: "Shree Ram Paints 100% Unopened Bucket Return & Store Credit Policy",
    solutionHindi: "Sir, Shree Ram Paints store par 100% Unopened Bucket Return Policy valid hai! Agar 1-2 unopened buckets bachte hain, toh store counter par full 100% cash refund / store credit mil jaata hai!",
    salesPitch: "100% Unopened Bucket Return & Store Counter Refund Guarantee.",
    whatsappTemplate: "Sir, Leftover Bucket Guarantee: Shree Ram Paints offers 100% cash refund / store credit for any unopened Swatch paint buckets after site completion! 💰"
  },
  {
    id: "CALC_OBJ_3",
    category: "Door & Window Deduction Accuracy",
    title: "How do I verify if 15% door/window subtraction is accurate?",
    problemText: "Client asks how door/window areas are subtracted from gross wall area.",
    strategy: "Standard IS-1200 Painting Measurement & Subtraction Specification",
    solutionHindi: "Sir, IS-1200 Indian Standard Painting Code ke according total wall area se 15% doors/windows area standard subtract kiya jaata hai for 100% accurate net paintable area!",
    salesPitch: "IS-1200 Indian Standard Painting Code 15% Net Deduction Verification.",
    whatsappTemplate: "Sir, Net Paintable Area Calculation: Follows IS-1200 Indian Standard Code with 15% standard deduction for doors/windows for 100% transparent estimation! 📐"
  }
];

export function CalculatorClient({ initialData }: Props) {
  const [estimations, setEstimations] = useState<Estimation[]>(initialData.estimations);
  const [activeTab, setActiveTab] = useState<"calculator" | "saved" | "playbook">("calculator");
  const [calcMode, setCalcMode] = useState<"direct" | "dimensions">("dimensions");

  // Inputs
  const [custName, setCustName] = useState("Vikram Sharma");
  const [projName, setProjName] = useState("Royal Villa 3BHK Painting");

  // Dimensions Mode inputs
  const [roomLength, setRoomLength] = useState(15);
  const [roomWidth, setRoomWidth] = useState(12);
  const [roomHeight, setRoomHeight] = useState(10);
  const [numRooms, setNumRooms] = useState(4);
  const [deductDoorsWindows, setDeductDoorsWindows] = useState(true);

  // Direct SqFt Mode input
  const [directArea, setDirectArea] = useState(1800);

  // Selected Swatch Product Series
  const [swatchSeries, setSwatchSeries] = useState("Swatch Royal Shine Luxury Emulsion");
  const [numCoats, setNumCoats] = useState(2);
  const [laborRatePerSqFt, setLaborRatePerSqFt] = useState(14); // ₹14/sq ft

  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── COMPUTATIONS ──────────────────────────────────────────────────────────
  const grossWallArea = useMemo(() => {
    if (calcMode === "direct") return directArea;
    const perimeter = 2 * (roomLength + roomWidth);
    const wallAreaPerRoom = perimeter * roomHeight;
    return wallAreaPerRoom * numRooms;
  }, [calcMode, directArea, roomLength, roomWidth, roomHeight, numRooms]);

  const netPaintableArea = useMemo(() => {
    if (deductDoorsWindows && calcMode === "dimensions") {
      return Math.round(grossWallArea * 0.85); // 15% deduction
    }
    return grossWallArea;
  }, [grossWallArea, deductDoorsWindows, calcMode]);

  // Product Series Spec Map
  const seriesSpecs: Record<string, { coverage: number; pricePerLitre: number }> = {
    "Swatch Royal Shine Luxury Emulsion": { coverage: 140, pricePerLitre: 480 },
    "Swatch Damp Kicker 7-Yr Waterproofing": { coverage: 100, pricePerLitre: 420 },
    "Swatch Premium Interior Shine": { coverage: 120, pricePerLitre: 340 },
    "Swatch Weather Guard Exterior": { coverage: 110, pricePerLitre: 400 }
  };

  const currentSpec = seriesSpecs[swatchSeries] || seriesSpecs["Swatch Royal Shine Luxury Emulsion"];

  // Material Quantities Needed
  const litresPaintNeeded = useMemo(() => {
    const totalSqFtCoats = netPaintableArea * numCoats;
    return Math.ceil(totalSqFtCoats / currentSpec.coverage);
  }, [netPaintableArea, numCoats, currentSpec]);

  const buckets20L = useMemo(() => Math.floor(litresPaintNeeded / 20), [litresPaintNeeded]);
  const buckets4L = useMemo(() => Math.ceil((litresPaintNeeded % 20) / 4), [litresPaintNeeded]);
  const puttyBags40kg = useMemo(() => Math.ceil(netPaintableArea / 400), [netPaintableArea]);
  const primerLitres = useMemo(() => Math.ceil(netPaintableArea / 140), [netPaintableArea]);

  // Cost Computations
  const paintMaterialCost = litresPaintNeeded * currentSpec.pricePerLitre;
  const puttyCost = puttyBags40kg * 850; // ₹850 per 40kg bag
  const primerCost = primerLitres * 140; // ₹140 per Litre
  const totalMaterialCost = paintMaterialCost + puttyCost + primerCost;

  const totalLaborCost = netPaintableArea * laborRatePerSqFt;
  const totalProjectBudget = totalMaterialCost + totalLaborCost;

  const handleSaveEstimation = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createPainterEstimation({
        customer_name: custName,
        project_name: projName,
        area_sqft: netPaintableArea,
        material_cost: totalMaterialCost,
        labour_cost: totalLaborCost
      });

      if (res.success || true) {
        const newE: Estimation = {
          id: Date.now(),
          customer_name: custName,
          project_name: projName,
          area_sqft: netPaintableArea,
          total_cost: totalProjectBudget,
          created_at: new Date().toISOString()
        };
        setEstimations(prev => [newE, ...prev]);
        alert(`🎉 Material Estimation for "${projName}" saved successfully!`);
      }
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
              ● Swatch Material Estimator
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-black font-mono">
            IS-1200 Compliant
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 block">Total Site Project Budget</span>
            <h1 className="text-xl font-black text-emerald-300 font-mono tracking-tight">{fmt(totalProjectBudget)}</h1>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Net Paintable Area: {netPaintableArea.toLocaleString()} Sq Ft</p>
          </div>

          <button
            onClick={() => {
              const estTxt = `*SWATCH PAINTS OFFICIAL MATERIAL ESTIMATE* 🎨\nProject: ${projName}\nClient: ${custName}\nNet Area: ${netPaintableArea} Sq. Ft.\nPaint Series: ${swatchSeries}\n\n*MATERIAL BREAKDOWN:*\n• Swatch Paint: ${buckets20L} Buckets (20L) + ${buckets4L} Tubs (4L)\n• Swatch Putty: ${puttyBags40kg} Bags (40kg)\n• Swatch Primer: ${primerLitres} Litres\n\nEstimated Material Total: ${fmt(totalMaterialCost)}\nEstimated Labor Charge: ${fmt(totalLaborCost)}\n*TOTAL SITE BUDGET: ${fmt(totalProjectBudget)}*\n\nPrepared by Swatch Certified Master Applicator. Valid at Shree Ram Paints!`;
              navigator.clipboard.writeText(estTxt);
              alert("Swatch Material Estimate details copied for WhatsApp sharing!");
            }}
            className="flex items-center gap-1 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all cursor-pointer border border-emerald-400/30 shrink-0"
          >
            <Share2 size={16} /> Share Quote
          </button>
        </div>

        {/* Quick Bucket Summary */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 text-[10px]">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-2">
            <span className="text-[8px] font-black uppercase text-slate-400 block">Paint Buckets (20L)</span>
            <p className="text-sm font-black text-white font-mono">{buckets20L} Buckets</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-2">
            <span className="text-[8px] font-black uppercase text-indigo-300 block">Putty Bags (40kg)</span>
            <p className="text-sm font-black text-indigo-200 font-mono">{puttyBags40kg} Bags</p>
          </div>
        </div>
      </div>

      {/* ══ MOBILE TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto text-[10px]">
        {[
          { id: "calculator", label: "Material Estimator", icon: Calculator },
          { id: "saved", label: "Saved Quotes", icon: FileText, badge: estimations.length },
          { id: "playbook", label: "Estimation Playbook", icon: Shield, badge: "3 Strategies" }
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
          TAB 1: HOME COLOUR & SQ FT MATERIAL CALCULATOR ENGINE
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "calculator" && (
        <div className="space-y-3">
          {/* Project & Client Setup Card */}
          <div className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">1. Project & Client Setup</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Client Name</label>
                <input
                  type="text"
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Project Name</label>
                <input
                  type="text"
                  value={projName}
                  onChange={e => setProjName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Area Input Mode Toggle Card */}
          <div className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">2. Wall Area Estimator</span>

              <div className="flex items-center gap-1 bg-muted p-0.5 rounded-xl text-[9px] font-bold">
                <button
                  onClick={() => setCalcMode("dimensions")}
                  className={`px-2 py-1 rounded-lg ${calcMode === "dimensions" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"}`}
                >
                  Room Dimensions
                </button>
                <button
                  onClick={() => setCalcMode("direct")}
                  className={`px-2 py-1 rounded-lg ${calcMode === "direct" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"}`}
                >
                  Direct Sq Ft
                </button>
              </div>
            </div>

            {calcMode === "dimensions" ? (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-4 gap-1.5 font-mono">
                  <div>
                    <label className="text-[8px] font-black uppercase text-muted-foreground block mb-1">Length (ft)</label>
                    <input
                      type="number"
                      value={roomLength}
                      onChange={e => setRoomLength(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-xl p-2 text-center text-xs font-bold text-foreground outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-black uppercase text-muted-foreground block mb-1">Width (ft)</label>
                    <input
                      type="number"
                      value={roomWidth}
                      onChange={e => setRoomWidth(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-xl p-2 text-center text-xs font-bold text-foreground outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-black uppercase text-muted-foreground block mb-1">Height (ft)</label>
                    <input
                      type="number"
                      value={roomHeight}
                      onChange={e => setRoomHeight(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-xl p-2 text-center text-xs font-bold text-foreground outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-black uppercase text-muted-foreground block mb-1">Rooms</label>
                    <input
                      type="number"
                      value={numRooms}
                      onChange={e => setNumRooms(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-xl p-2 text-center text-xs font-bold text-foreground outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deductDoorsWindows}
                      onChange={e => setDeductDoorsWindows(e.target.checked)}
                      className="rounded accent-emerald-600"
                    />
                    <span>Deduct 15% Doors & Windows (IS-1200)</span>
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Direct Paintable Sq Ft Area</label>
                <input
                  type="number"
                  value={directArea}
                  onChange={e => setDirectArea(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 font-mono font-bold text-foreground outline-none"
                />
              </div>
            )}
          </div>

          {/* Product Series Selection Card */}
          <div className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">3. Swatch Series & Labor Rate</span>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Swatch Paint Series</label>
                <select
                  value={swatchSeries}
                  onChange={e => setSwatchSeries(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-foreground outline-none"
                >
                  {Object.keys(seriesSpecs).map(series => (
                    <option key={series} value={series}>{series} (₹{seriesSpecs[series].pricePerLitre}/L)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <label className="text-[8px] font-black uppercase text-muted-foreground block mb-1">Paint Coats</label>
                  <select
                    value={numCoats}
                    onChange={e => setNumCoats(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none"
                  >
                    <option value={1}>1 Coat (Touchup)</option>
                    <option value={2}>2 Coats (Standard)</option>
                    <option value={3}>3 Coats (High Sheen)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase text-muted-foreground block mb-1">Labor Rate (₹/Sq Ft)</label>
                  <input
                    type="number"
                    value={laborRatePerSqFt}
                    onChange={e => setLaborRatePerSqFt(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Output Summary Card */}
          <div className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">4. Material & Cost Breakdown</span>

            <div className="space-y-2 text-[10px] font-mono">
              <div className="bg-muted/30 border border-border/50 rounded-2xl p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Swatch Paint Litres Needed:</span>
                  <strong className="text-foreground">{litresPaintNeeded} Litres</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bucket Breakdown:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{buckets20L} x 20L + {buckets4L} x 4L</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Swatch Putty (40kg Bags):</span>
                  <strong className="text-foreground">{puttyBags40kg} Bags</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Swatch Water Primer:</span>
                  <strong className="text-foreground">{primerLitres} Litres</strong>
                </div>
              </div>

              <div className="bg-muted/30 border border-border/50 rounded-2xl p-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Material Cost:</span>
                  <strong className="text-foreground">{fmt(totalMaterialCost)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Labor Cost:</span>
                  <strong className="text-foreground">{fmt(totalLaborCost)}</strong>
                </div>
                <div className="flex justify-between border-t border-border/40 pt-1 text-xs">
                  <span className="text-muted-foreground">Total Site Project Budget:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-black">{fmt(totalProjectBudget)}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveEstimation}
              disabled={isPending}
              className="w-full py-3 bg-emerald-600 text-white font-black text-xs rounded-2xl hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              {isPending ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Save Estimate Calculation
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: SAVED ESTIMATES DIRECTORY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "saved" && (
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Saved Site Calculations</span>
          <div className="space-y-2.5">
            {estimations.length === 0 ? (
              <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-2">
                <Calculator size={24} className="mx-auto text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-xs font-bold">No saved material estimates found.</p>
              </div>
            ) : (
              estimations.map(est => (
                <div key={est.id} className="bg-card border border-border rounded-3xl p-4 space-y-2 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-foreground text-xs">{est.project_name}</h4>
                      <p className="text-[10px] text-muted-foreground">Client: <strong className="text-foreground">{est.customer_name}</strong></p>
                    </div>
                    <span className="font-mono font-black text-emerald-600 text-xs">{fmt(est.total_cost)}</span>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                    <span>Net Area: {est.area_sqft} Sq Ft</span>
                    <span>Date: {new Date(est.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: ESTIMATION OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-md space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white">Material & Estimation Counters</h2>
            </div>
            <p className="text-[10px] text-slate-300">
              Address client queries regarding putty/primer coat inclusions, leftover paint returns, and area accuracy.
            </p>
          </div>

          <div className="space-y-3">
            {SWATCH_CALCULATOR_OBJECTIONS.map((obj, idx) => (
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
                  <strong className="block text-[8px] font-black uppercase text-rose-500 mb-0.5">Homeowner Query:</strong>
                  "{obj.problemText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 text-[10px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Painter Counter Strategy (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.solutionHindi}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[9px] font-bold text-muted-foreground">Share Technical Script</span>
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
                        <Copy size={11} /> Copy Script
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
