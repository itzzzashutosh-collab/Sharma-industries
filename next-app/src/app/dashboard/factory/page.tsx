"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Factory, Package, AlertTriangle, DollarSign, Plus, CheckCircle, Clock, Download } from "lucide-react";
import { getRawMaterials } from "@/actions/purchaseActions";

// DUMMY DATA
const KPIs = {
  bucketsProduced: 850,
  activeBatches: 3,
  lowStockAlerts: 2,
  overheadCost: 12500,
};

const BATCHES = [
  { id: "BCH-1024", product: "Rustic Royale - 20L", status: "In-Progress", yield: 450, time: "Started 2h ago" },
  { id: "BCH-1023", product: "Wall Putty - 40kg", status: "Completed", yield: 800, time: "Completed today" },
  { id: "BCH-1022", product: "WeatherGuard - 10L", status: "In-Progress", yield: 120, time: "Started 4h ago" },
  { id: "BCH-1021", product: "Primer - 20L", status: "Completed", yield: 500, time: "Completed yesterday" },
];

const RAW_MATERIALS = [
  { id: "RM-01", name: "Titanium Dioxide", stock: 150, threshold: 200, unit: "kg" },
  { id: "RM-02", name: "Calcium Carbonate", stock: 1200, threshold: 500, unit: "kg" },
  { id: "RM-03", name: "Acrylic Emulsion", stock: 45, threshold: 100, unit: "Liters" },
  { id: "RM-04", name: "Thickener", stock: 300, threshold: 50, unit: "kg" },
];

const LABOR = [
  { id: "L-01", name: "Ramesh Singh", role: "Mixer Operator", status: "Present", wage: 600 },
  { id: "L-02", name: "Suresh Kumar", role: "Packaging", status: "Absent", wage: 450 },
  { id: "L-03", name: "Amit Patel", role: "Loader", status: "Present", wage: 400 },
];

const EXPENSES = [
  { id: "EXP-11", desc: "Electricity Bill (Advance)", amount: 5000, category: "Utilities" },
  { id: "EXP-12", desc: "Machine Maintenance", amount: 3500, category: "Repairs" },
  { id: "EXP-13", desc: "Tea & Snacks", amount: 250, category: "Misc" },
];

export default function FactoryOperationsPage() {
  const [activeTab, setActiveTab] = useState<"production" | "materials" | "labor" | "expenses">("production");
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProd, setSelectedProd] = useState("");
  const [quantity, setQuantity] = useState("");
  const [generating, setGenerating] = useState(false);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        if (data.success) setProducts(data.data);
      });

    getRawMaterials().then(res => {
      if (res.success) setRawMaterials(res.data || []);
    });
  }, []);

  const lowStockCount = useMemo(() => {
    return rawMaterials.filter(rm => {
      const stock = Number(rm.current_stock) || 0;
      const threshold = Number(rm.min_stock) || 100;
      return stock < threshold;
    }).length;
  }, [rawMaterials]);

  const handleGenerateQRs = async () => {
    if (!selectedProd || !quantity) {
      alert("Please select a product and enter the quantity.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/production/generate-qrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProd,
          quantity: parseInt(quantity, 10)
        })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qrs_${selectedProd}_${quantity}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        alert("QR codes generated and downloaded successfully!");
      } else {
        const err = await res.json();
        alert(err.error || "Generation failed.");
      }
    } catch (e) {
      alert("An error occurred during generation.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Factory className="text-primary" size={32} /> Factory Control Panel
          </h1>
          <p className="text-muted-foreground mt-2">Manage batches, raw materials, labor, and overheads.</p>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-primary/10 transition-all duration-300">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start">
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">Buckets Produced (Today)</p>
            <div className="bg-primary/10 p-2 rounded-lg"><Package size={20} className="text-primary" /></div>
          </div>
          <p className="text-3xl font-black text-foreground mt-2">{KPIs.bucketsProduced}</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start">
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">Active Batches</p>
            <div className="bg-emerald-500/10 p-2 rounded-lg"><Clock size={20} className="text-emerald-400" /></div>
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-2">{KPIs.activeBatches}</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-rose-500/10 transition-all duration-300">
          <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start">
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">Low Stock RM</p>
            <div className="bg-rose-500/10 p-2 rounded-lg"><AlertTriangle size={20} className="text-rose-500" /></div>
          </div>
          <p className="text-3xl font-black text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)] mt-2">{lowStockCount} Alerts</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-foreground/10 transition-all duration-300">
          <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start">
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">Today's Overhead</p>
            <div className="bg-muted p-2 rounded-lg border border-border"><DollarSign size={20} className="text-foreground" /></div>
          </div>
          <p className="text-3xl font-black text-foreground mt-2">₹{KPIs.overheadCost.toLocaleString()}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="flex overflow-x-auto border-b border-border hide-scrollbar">
          {(["production", "materials", "labor", "expenses"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-bold text-sm uppercase tracking-wider transition-all duration-300 border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {tab.replace("production", "Production Batches").replace("materials", "Raw Materials").replace("labor", "Labor Wages").replace("expenses", "Daily Expenses")}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-6 min-h-[400px]">
          
          {/* TAB 1: PRODUCTION BATCHES */}
          {activeTab === "production" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Side: Production Table */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-foreground">Current Production Run</h2>
                  <button className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-bold shadow-md hover:shadow-md transition-all">
                    <Plus size={18} /> Start New Batch
                  </button>
                </div>
                <div className="overflow-x-auto bg-card/50 border border-border/60 rounded-2xl p-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider font-bold">
                        <th className="pb-4 pr-4">Batch ID</th>
                        <th className="pb-4 px-4">Product</th>
                        <th className="pb-4 px-4">Status</th>
                        <th className="pb-4 pl-4 text-right">Yield (Buckets)</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {BATCHES.map(b => (
                        <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-4 pr-4 font-mono font-bold text-foreground">{b.id}</td>
                          <td className="py-4 px-4">
                            <p className="font-semibold text-foreground">{b.product}</p>
                            <p className="text-sm text-muted-foreground">{b.time}</p>
                          </td>
                          <td className="py-4 px-4">
                            {b.status === "Completed" ? (
                              <span className="flex items-center gap-1.5 w-fit bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md text-sm font-bold uppercase tracking-wider">
                                <CheckCircle size={12} /> Completed
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 w-fit bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md text-sm font-bold uppercase tracking-wider">
                                <Clock size={12} /> In-Progress
                              </span>
                            )}
                          </td>
                          <td className="py-4 pl-4 text-right font-black text-foreground">
                            {b.yield}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Side: QR Generator Engine */}
              <div className="bg-card/50 border border-border/60 rounded-2xl p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Package className="text-primary" size={22} /> QR Code Generator
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Generate and package QR code ranges for your products.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Select Product
                    </label>
                    <select
                      value={selectedProd}
                      onChange={(e) => setSelectedProd(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                    >
                      <option value="">Choose a product...</option>
                      {products.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Quantity / Stock Produced
                    </label>
                    <input
                      type="number"
                      placeholder="100"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>

                  <button
                    onClick={handleGenerateQRs}
                    disabled={generating}
                    className="w-full py-3 bg-primary text-black hover:bg-primary/95 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 text-sm mt-6"
                  >
                    <Download size={18} />
                    {generating ? "Generating..." : "Generate & Download ZIP"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RAW MATERIALS */}
          {activeTab === "materials" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-foreground mb-6">Raw Material Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rawMaterials.map(rm => {
                  const stock = Number(rm.current_stock) || 0;
                  const threshold = Number(rm.min_stock) || 100;
                  const isLow = stock < threshold;
                  const maxDisplay = threshold * 3;
                  const progress = Math.min((stock / maxDisplay) * 100, 100);
                  
                  return (
                    <div key={rm.id} className="border border-border p-5 rounded-2xl bg-background hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-foreground text-lg">{rm.material_name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">ID: {rm.id}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-black ${isLow ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'text-primary'}`}>
                            {stock} {rm.unit_of_measure || "KG"}
                          </p>
                          <p className="text-sm text-muted-foreground font-semibold">Min: {threshold} {rm.unit_of_measure || "KG"}</p>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-muted rounded-full h-2.5 mb-1 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full ${isLow ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-primary'}`} 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      {isLow && <p className="text-sm text-rose-400 font-bold mt-2">Critical Stock Level - Reorder Immediately</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: LABOR WAGES */}
          {activeTab === "labor" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-foreground">Labor & Attendance</h2>
                <button className="flex items-center gap-2 border-2 border-primary text-primary px-4 py-2 rounded-lg font-bold hover:bg-primary hover:text-black transition-all">
                  <Plus size={18} /> Mark Attendance
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider font-bold">
                      <th className="pb-4 pr-4">ID</th>
                      <th className="pb-4 px-4">Name & Role</th>
                      <th className="pb-4 px-4">Status</th>
                      <th className="pb-4 pl-4 text-right">Daily Wage (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {LABOR.map(l => (
                      <tr key={l.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-4 pr-4 font-mono font-bold text-muted-foreground">{l.id}</td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-foreground">{l.name}</p>
                          <p className="text-sm text-muted-foreground">{l.role}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-sm font-bold uppercase tracking-wider border ${
                            l.status === 'Present' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="py-4 pl-4 text-right font-black text-foreground">
                          ₹{l.wage}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DAILY EXPENSES */}
          {activeTab === "expenses" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-foreground">Daily Overheads</h2>
                <button className="flex items-center gap-2 border-2 border-primary text-primary px-4 py-2 rounded-lg font-bold hover:bg-primary hover:text-black transition-all">
                  <Plus size={18} /> Log Expense
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider font-bold">
                      <th className="pb-4 pr-4">ID</th>
                      <th className="pb-4 px-4">Description</th>
                      <th className="pb-4 px-4">Category</th>
                      <th className="pb-4 pl-4 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {EXPENSES.map(e => (
                      <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-4 pr-4 font-mono font-bold text-muted-foreground">{e.id}</td>
                        <td className="py-4 px-4 font-semibold text-foreground">{e.desc}</td>
                        <td className="py-4 px-4">
                          <span className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-sm font-bold uppercase tracking-wider border border-border">
                            {e.category}
                          </span>
                        </td>
                        <td className="py-4 pl-4 text-right font-black text-rose-400">
                          -₹{e.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
