"use client";

import React, { useState, useTransition } from "react";
import { Paintbrush, Plus, Download, Search, Sparkles, X, Layers, AlertCircle, RefreshCw, FileText, Check } from "lucide-react";
import { saveColorDesign, createDealerQuotation } from "../../actions";

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

export function ColorStudioClient({ customers, products }: Props) {
  const [customer, setCustomer] = useState(customers[0]?.id || "");
  const [projectName, setProjectName] = useState("Main Elevation Paint");
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || "");
  const [area, setArea] = useState("2000");
  const [wallColor, setWallColor] = useState("#b45309"); // Amber
  const [trimColor, setTrimColor] = useState("#ffffff"); // White
  const [wastage, setWastage] = useState("10"); // 10% wastage standard
  const [isPending, startTransition] = useTransition();

  const activeProduct = products.find(p => p.id === selectedProduct) || products[0];
  const rate = activeProduct ? Number(activeProduct.mrp || 350) : 350;

  // Simple paint quantity and cost estimator formulas based on wall area
  const areaNum = Number(area || 0);
  const wastageMultiplier = 1 + Number(wastage) / 100;
  
  const estimatedPuttyKg = Math.round((areaNum / 10) * wastageMultiplier); // 10 sqft per kg average
  const estimatedPrimerLtr = Math.round((areaNum / 12) * wastageMultiplier); // 12 sqft per ltr average
  const estimatedPaintLtr = Math.round((areaNum / 8) * wastageMultiplier); // 8 sqft per ltr average
  
  const puttyCost = estimatedPuttyKg * 50; // ₹50/kg
  const primerCost = estimatedPrimerLtr * 150; // ₹150/ltr
  const paintCost = estimatedPaintLtr * rate;
  const laborCost = areaNum * 12; // ₹12/sqft flat rate labor charges
  
  const grandTotal = puttyCost + primerCost + paintCost + laborCost;

  const handleSaveDesign = () => {
    startTransition(async () => {
      const res = await saveColorDesign({
        customer_id: customer,
        project_name: projectName,
        selected_colors: [{ element: "Walls", hex: wallColor }, { element: "Trims", hex: trimColor }],
        estimated_cost: grandTotal
      });
      if (res.success) {
        alert("AI Paint Visualizer design saved to project folder successfully!");
      } else {
        alert(res.error || "Failed to save design");
      }
    });
  };

  const handleConvertToQuotation = () => {
    startTransition(async () => {
      const custName = customers.find(c => c.id === customer)?.name || "Retail Customer";
      const res = await createDealerQuotation({
        customer_id: customer,
        customer_name: custName,
        items: [
          { id: "PUTTY", name: "Double Coat Putty (Standard)", qty: estimatedPuttyKg, rate: 50 },
          { id: "PRIMER", name: "Premium Exterior Primer", qty: estimatedPrimerLtr, rate: 150 },
          { id: selectedProduct, name: activeProduct?.name, qty: estimatedPaintLtr, rate }
        ],
        subtotal: grandTotal / 1.18,
        total_gst: grandTotal * 0.18,
        grand_total: grandTotal
      });
      if (res.success) {
        alert("Visualizer estimation successfully converted into an approved quotation!");
      } else {
        alert(res.error || "Failed to generate quotation");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Customers</span><span className="opacity-40">/</span><span className="text-foreground">AI Paint Studio</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Paintbrush size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">AI Paint Studio Experience</h1>
              <p className="text-xs text-muted-foreground">Select villa layouts, choose brand color schemes, and generate quotations instantly</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSaveDesign} disabled={isPending} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-bold cursor-pointer hover:bg-muted/40 transition-colors">
              Save Design Layout
            </button>
            <button onClick={handleConvertToQuotation} disabled={isPending} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
              <FileText size={13} /> Convert to Quotation
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Visualizer Canvas */}
        <div className="lg:col-span-2 space-y-4">
          {/* Visualizer Frame */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center p-6 bg-gradient-to-b from-muted/5 to-muted/20 shadow-inner">
            {/* Mock Villa SVG with customizable color overlays */}
            <div className="w-full max-w-lg aspect-video relative bg-card border border-border/60 rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
              {/* Outer boundary wall */}
              <div className="absolute inset-0 transition-colors duration-500" style={{ backgroundColor: wallColor }} />
              {/* Accent trims / pillars */}
              <div className="absolute top-0 bottom-0 left-12 w-6 border-r border-l border-white/20 transition-colors duration-500" style={{ backgroundColor: trimColor }} />
              <div className="absolute top-0 bottom-0 right-12 w-6 border-r border-l border-white/20 transition-colors duration-500" style={{ backgroundColor: trimColor }} />
              {/* Interior glass window panels */}
              <div className="w-48 h-32 bg-sky-950/40 border-2 border-white/30 rounded-xl backdrop-blur-sm flex items-center justify-center relative">
                <span className="text-[10px] font-black text-white/50 tracking-widest uppercase">Villa Facade</span>
              </div>
            </div>

            {/* Colors Swatches Bar */}
            <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-md border border-border/80 px-4 py-2.5 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-black text-muted-foreground uppercase">Walls:</span>
                <input type="color" value={wallColor} onChange={e => setWallColor(e.target.value)} className="w-6 h-6 rounded-lg cursor-pointer border border-border/80 outline-none" />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-black text-muted-foreground uppercase">Trim:</span>
                <input type="color" value={trimColor} onChange={e => setTrimColor(e.target.value)} className="w-6 h-6 rounded-lg cursor-pointer border border-border/80 outline-none" />
              </div>
              <button onClick={() => { setWallColor("#b45309"); setTrimColor("#ffffff"); }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-all" title="Reset Colors">
                <RefreshCw size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Studio Estimations Panel */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-black text-foreground uppercase tracking-wider border-b border-border pb-2 flex items-center gap-1.5"><Layers size={14} className="text-primary" /> Visualizer Cost Estimation</h3>
          
          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-muted-foreground uppercase">Selected Customer</label>
              <select value={customer} onChange={e => setCustomer(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground">
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-muted-foreground uppercase">Selected Product</label>
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground">
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.mrp}/L)</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Wall Area (Sq.ft.)</label>
                <input type="number" value={area} onChange={e => setArea(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Wastage %</label>
                <select value={wastage} onChange={e => setWastage(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-foreground">
                  {["5", "10", "15"].map(w => <option key={w} value={w}>{w}%</option>)}
                </select>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-muted/10 border border-border rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span>Putty Required</span>
                <span className="font-mono text-foreground font-bold">{estimatedPuttyKg} kg</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span>Primer Required</span>
                <span className="font-mono text-foreground font-bold">{estimatedPrimerLtr} Ltr</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span>Paint Required</span>
                <span className="font-mono text-foreground font-bold">{estimatedPaintLtr} Ltr</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground text-[11px] border-t border-border/40 pt-2">
                <span>Total Materials Cost</span>
                <span className="font-mono text-foreground font-bold">₹{(puttyCost + primerCost + paintCost).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span>Flat Labor Cost (₹12/sqft)</span>
                <span className="font-mono text-foreground font-bold">₹{laborCost.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-foreground text-[11px] border-t border-border pt-2.5 font-black">
                <span>Grand Total (Est.)</span>
                <span className="font-mono text-primary">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
