"use client";

import React, { useState, useTransition } from "react";
import { Paintbrush, Send, Share2, Layers, AlertCircle, Sparkles, CheckCircle2, Sliders } from "lucide-react";
import { saveColorDesign, createDealerQuotation } from "@/app/dashboard/dealer/actions";

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  mrp: number;
}

interface Props {
  customers: Customer[];
  products: Product[];
}

export function PainterColorStudioClient({ customers, products }: Props) {
  const [customer, setCustomer] = useState(customers[0]?.id || "");
  const [projectName, setProjectName] = useState("Main House Paint Mockup");
  const [accentColor, setAccentColor] = useState("#4f46e5"); // Indigo
  const [wallColor, setWallColor] = useState("#f3f4f6"); // Cool Grey
  const [trimColor, setTrimColor] = useState("#ffffff"); // White
  const [textureType, setTextureType] = useState("None");
  const [wastage, setWastage] = useState("10"); // 10% default
  const [area, setArea] = useState("1200");

  const [isPending, startTransition] = useTransition();

  const handleSendToDealer = () => {
    if (!customer) {
      alert("Please select a customer first.");
      return;
    }

    startTransition(async () => {
      // Find selected customer name
      const custObj = customers.find(c => c.id === customer);
      const res = await saveColorDesign({
        customer_id: customer,
        project_name: projectName,
        selected_colors: [wallColor, accentColor, trimColor],
        estimated_cost: 35000 // Estimated budget base cost
      });

      if (res.success) {
        alert(`Design & material estimation successfully sent to dealer for customer ${custObj?.name || ""}!`);
      } else {
        alert(res.error || "Failed to submit request");
      }
    });
  };

  const colors = [
    { name: "Royale Classic White", hex: "#ffffff" },
    { name: "Monsoon Cool Grey", hex: "#f3f4f6" },
    { name: "Jaipur Ochre Gold", hex: "#eab308" },
    { name: "Terracotta Earth Red", hex: "#b91c1c" },
    { name: "Swatch Forest Green", hex: "#15803d" },
    { name: "Ocean Breeze Teal", hex: "#0f766e" },
    { name: "Royal Velvet Indigo", hex: "#4f46e5" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Work</span><span className="opacity-40">/</span><span className="text-foreground">Color Studio</span>
        </div>
        <h1 className="text-xl font-black text-foreground">AI House Color Studio</h1>
      </div>

      {/* Customer Picker */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Layers size={14} className="text-primary" /> Project Setup</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Select Customer</label>
            <select value={customer} onChange={e => setCustomer(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Project Name</label>
            <input value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
          </div>
        </div>
      </div>

      {/* Elevation Mockup Visualizer (Split Slider Simulator) */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm relative overflow-hidden">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Elevation Preview Mockup</h3>
        <div className="aspect-[4/3] rounded-2xl border border-border/40 relative overflow-hidden flex flex-col justify-end p-4 bg-muted/40">
          <div className="absolute inset-0 flex">
            {/* Left half: original */}
            <div className="w-1/2 h-full bg-slate-300 flex items-center justify-center border-r border-dashed border-white">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Before</span>
            </div>
            {/* Right half: styled with current wall color */}
            <div className="w-1/2 h-full transition-colors duration-300 flex items-center justify-center" style={{ backgroundColor: wallColor }}>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">After</span>
            </div>
          </div>
          <div className="z-10 bg-black/40 backdrop-blur-xs text-white p-2.5 rounded-xl text-[10px] space-y-1">
            <p className="font-bold flex items-center gap-1"><Sparkles size={11} className="text-amber-400" /> Active Selections</p>
            <p>Wall: <span className="font-mono">{wallColor}</span> | Accent: <span className="font-mono">{accentColor}</span> | Trim: <span className="font-mono">{trimColor}</span></p>
          </div>
        </div>
      </div>

      {/* Surface color swatches */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Color Swatches</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Main Wall Color</label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {colors.map((c) => (
                <button key={c.hex} onClick={() => setWallColor(c.hex)} className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                  wallColor === c.hex ? "border-primary scale-110" : "border-transparent"
                }`} style={{ backgroundColor: c.hex }} title={c.name} />
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Accent Wall / Boundary</label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {colors.map((c) => (
                <button key={c.hex} onClick={() => setAccentColor(c.hex)} className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                  accentColor === c.hex ? "border-primary scale-110" : "border-transparent"
                }`} style={{ backgroundColor: c.hex }} title={c.name} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Materials Estimation with wastage margins */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Sliders size={14} className="text-primary" /> Estimations & Wastage</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Est. Area (Sq.ft.)</label>
            <input type="number" value={area} onChange={e => setArea(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors font-mono" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Wastage Margin (%)</label>
            <select value={wastage} onChange={e => setWastage(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
              <option value="5">5% Wastage</option>
              <option value="10">10% Wastage</option>
              <option value="15">15% Wastage</option>
            </select>
          </div>
        </div>

        <div className="border-t border-border/40 pt-3 space-y-2 text-[10px] text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Waterproofing Base Needed</span>
            <span className="font-mono font-bold text-foreground">{Math.ceil((Number(area) * 2 / 50) * (1 + Number(wastage) / 100))} Litres</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Premium Putty Needed</span>
            <span className="font-mono font-bold text-foreground">{Math.ceil((Number(area) * 2 / 15) * (1 + Number(wastage) / 100))} Bags</span>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex gap-3">
        <button onClick={handleSendToDealer} disabled={isPending} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer">
          <Send size={13} /> {isPending ? "Sending..." : "Send design to Dealer"}
        </button>
      </div>
    </div>
  );
}
