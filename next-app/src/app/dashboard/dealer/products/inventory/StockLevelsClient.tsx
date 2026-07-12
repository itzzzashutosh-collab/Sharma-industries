"use client";

import React, { useState, useTransition } from "react";
import { ClipboardList, Plus, Search, Sparkles, X, PlusCircle, AlertTriangle } from "lucide-react";
import { adjustDealerStock } from "../../actions";

interface Product {
  id: string;
  name: string;
  actual_stock: number;
  min_stock_threshold: number;
}

interface Props {
  initialData: Product[];
}

export function StockLevelsClient({ initialData }: Props) {
  const [list, setList] = useState<Product[]>(initialData);
  const [search, setSearch] = useState("");
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    product_id: initialData[0]?.id || "",
    qty_change: "",
    remarks: ""
  });

  const filtered = list.filter(p => {
    return !search || p.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id || !form.qty_change) return;

    startTransition(async () => {
      const prodName = list.find(p => p.id === form.product_id)?.name || "Product";
      const res = await adjustDealerStock({
        product_id: form.product_id,
        product_name: prodName,
        qty_change: Number(form.qty_change),
        remarks: form.remarks
      });

      if (res.success) {
        setList(prev => prev.map(p => {
          if (p.id === form.product_id) {
            return { ...p, actual_stock: Number(p.actual_stock) + Number(form.qty_change) };
          }
          return p;
        }));
        setShowAdjustModal(false);
        setForm({
          product_id: initialData[0]?.id || "",
          qty_change: "",
          remarks: ""
        });
      } else {
        alert(res.error || "Failed to adjust stock");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Products</span><span className="opacity-40">/</span><span className="text-foreground">Inventory</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><ClipboardList size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Stock Levels & Inventory</h1>
              <p className="text-xs text-muted-foreground">Monitor current product stock counts, reserved orders and refill thresholds</p>
            </div>
          </div>
          <button onClick={() => setShowAdjustModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
            <Plus size={13} /> Adjust Stock
          </button>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Refill Suggestion:</span> Identified {list.filter(p => p.actual_stock <= p.min_stock_threshold).length} products running below threshold limit.
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm text-xs text-foreground">
        <Search size={13} className="text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter stock levels by product name..." className="flex-1 bg-transparent outline-none" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3 text-right">Actual Stock</th>
                <th className="px-4 py-3 text-right">Threshold Limit</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No stock logs found.</td></tr>
              ) : filtered.map((p) => {
                const isLow = p.actual_stock <= p.min_stock_threshold;
                return (
                  <tr key={p.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 font-bold text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-right font-mono font-black text-foreground">{Number(p.actual_stock || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">{Number(p.min_stock_threshold || 10).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase font-mono ${
                        isLow ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      }`}>
                        {isLow ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in scale-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle size={14} className="text-primary" /> Adjust Inventory Level</h3>
              <button onClick={() => setShowAdjustModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleAdjust} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Select Product</label>
                <select required value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                  {list.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.actual_stock})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Qty Change (Negative for deductions) *</label>
                <input required type="number" value={form.qty_change} onChange={e => setForm(f => ({ ...f, qty_change: e.target.value }))} placeholder="E.g. 20 or -10" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Adjustment Reason & Remarks</label>
                <textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="E.g. Physical audit corrections or transport damage" rows={3} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors resize-none" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowAdjustModal(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Adjusting..." : "Apply Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
