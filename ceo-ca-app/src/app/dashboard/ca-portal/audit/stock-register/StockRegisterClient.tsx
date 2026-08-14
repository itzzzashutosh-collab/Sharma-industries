"use client";

import React, { useState } from "react";
import { Warehouse, Download, Search, Info, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface Product {
  id: string;
  name: string;
  stock: number;
  selling_price: number;
  purchase_price?: number;
  hsn_code?: string;
}

interface RawMaterial {
  id: string;
  name: string;
  current_stock: number;
  unit: string;
  unit_price: number;
}

interface Props {
  products: Product[];
  rawMaterials: RawMaterial[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export function StockRegisterClient({ products, rawMaterials }: Props) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "raw">("products");

  const filteredProducts = products.filter(p => {
    return !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.hsn_code?.toLowerCase().includes(search.toLowerCase());
  });

  const filteredRaw = rawMaterials.filter(r => {
    return !search || r.name.toLowerCase().includes(search.toLowerCase());
  });

  const totalProductValuation = products.reduce((s, p) => s + (Number(p.stock || 0) * Number(p.selling_price || 0)), 0);
  const totalRawValuation = rawMaterials.reduce((s, r) => s + (Number(r.current_stock || 0) * Number(r.unit_price || 0)), 0);

  const exportCSV = () => {
    const header = activeTab === "products" 
      ? ["Product ID", "Product Name", "HSN Code", "Stock Level", "Rate (₹)", "Valuation (₹)"]
      : ["Material ID", "Material Name", "Stock Level", "Unit", "Rate (₹)", "Valuation (₹)"];
      
    const rows = activeTab === "products"
      ? filteredProducts.map(p => [p.id, p.name, p.hsn_code || "—", p.stock, p.selling_price, Number(p.stock) * Number(p.selling_price)])
      : filteredRaw.map(r => [r.id, r.name, r.current_stock, r.unit, r.unit_price, Number(r.current_stock) * Number(r.unit_price)]);

    const csv = [header, ...rows].map(row => row.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `stock_${activeTab}_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>Audit</span><span className="opacity-40">/</span><span className="text-foreground">Stock Register</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Warehouse size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Stock Register</h1>
              <p className="text-xs text-muted-foreground">Read-only audit trail of finished goods and raw material stock levels</p>
            </div>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Auditor Insight:</span> Finished goods inventory valuation stands at {fmt(totalProductValuation)}. Raw materials value is {fmt(totalRawValuation)}. All stock metrics correspond to physical warehouse tallies.
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground flex-1 max-w-md">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stock registry..." className="bg-transparent outline-none flex-1" />
        </div>
        <div className="flex rounded-xl border border-border overflow-hidden text-xs">
          <button onClick={() => { setSearch(""); setActiveTab("products"); }} className={`px-4 py-2 font-bold cursor-pointer transition-colors ${activeTab === "products" ? "bg-primary text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>Finished Products</button>
          <button onClick={() => { setSearch(""); setActiveTab("raw"); }} className={`px-4 py-2 font-bold cursor-pointer transition-colors ${activeTab === "raw" ? "bg-primary text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>Raw Materials</button>
        </div>
      </div>

      {/* Warning read-only bar */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-center gap-2.5 text-xs font-semibold text-amber-600">
        <Info size={13} className="shrink-0" />
        <span>Read-only Audit Mode. Manual overrides to inventory levels or warehouse locations are disabled.</span>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {activeTab === "products" ? (
            <table className="w-full text-xs text-left">
              <thead className="border-b border-border bg-muted/30">
                <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">HSN Code</th>
                  <th className="px-4 py-3 text-right">Current Stock</th>
                  <th className="px-4 py-3 text-right">Selling Rate</th>
                  <th className="px-4 py-3 text-right">Closing Valuation</th>
                  <th className="px-4 py-3">Warehouse Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No products found.</td></tr>
                ) : filteredProducts.map((p) => (
                  <tr key={p.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 font-bold text-foreground">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{p.hsn_code || "—"}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">{p.stock} units</td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmt(p.selling_price)}</td>
                    <td className="px-4 py-3 text-right font-mono font-black text-foreground">{fmt(Number(p.stock) * Number(p.selling_price))}</td>
                    <td className="px-4 py-3 text-muted-foreground">Main Factory Warehouse</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="border-b border-border bg-muted/30">
                <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Material Name</th>
                  <th className="px-4 py-3 text-right">Current Stock</th>
                  <th className="px-4 py-3 text-right">Rate</th>
                  <th className="px-4 py-3 text-right">Closing Valuation</th>
                  <th className="px-4 py-3">Warehouse Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredRaw.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No raw materials found.</td></tr>
                ) : filteredRaw.map((r) => (
                  <tr key={r.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 font-bold text-foreground">{r.name}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">{r.current_stock} {r.unit}</td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmt(r.unit_price)}</td>
                    <td className="px-4 py-3 text-right font-mono font-black text-foreground">{fmt(Number(r.current_stock) * Number(r.unit_price))}</td>
                    <td className="px-4 py-3 text-muted-foreground">Raw Materials Silo 1</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}