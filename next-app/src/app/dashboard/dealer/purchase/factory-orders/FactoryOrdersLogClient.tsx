"use client";

import React, { useState, useTransition } from "react";
import { ShoppingCart, Plus, Search, Sparkles, X, Milestone, Truck, Check } from "lucide-react";
import { createDealerFactoryOrder } from "../../actions";

interface Order {
  id: string;
  date: string;
  total_amount: number;
  status: string;
}

interface Props {
  initialData: Order[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export function FactoryOrdersLogClient({ initialData }: Props) {
  const [list, setList] = useState<Order[]>(initialData);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    dealer_name: "Shree Ram Paints",
    total_amount: "",
  });

  const filtered = list.filter(ord => {
    return !search || ord.id.toLowerCase().includes(search.toLowerCase()) || ord.status.toLowerCase().includes(search.toLowerCase());
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.total_amount) return;

    startTransition(async () => {
      const res = await createDealerFactoryOrder({
        dealer_name: form.dealer_name,
        total_amount: Number(form.total_amount)
      });

      if (res.success) {
        setList(prev => [{
          id: `ORD_${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          total_amount: Number(form.total_amount),
          status: "pending"
        }, ...prev]);
        setShowAddModal(false);
        setForm({ dealer_name: "Shree Ram Paints", total_amount: "" });
      } else {
        alert(res.error || "Failed to submit factory order");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Purchases</span><span className="opacity-40">/</span><span className="text-foreground">Factory Orders</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><ShoppingCart size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Factory Orders Log</h1>
              <p className="text-xs text-muted-foreground">Order paints directly from Sharma Industries, track dispatch transit, and check deliveries</p>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
            <Plus size={13} /> Place Factory Order
          </button>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Refill Suggestion:</span> Based on low stock alerts, you have {list.filter(o => o.status === "pending").length} orders in queue.
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm text-xs text-foreground">
        <Search size={13} className="text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by order code or status..." className="flex-1 bg-transparent outline-none" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Order Code</th>
                <th className="px-4 py-3">Submit Date</th>
                <th className="px-4 py-3 text-right">Order Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No orders recorded.</td></tr>
              ) : filtered.map((ord) => (
                <tr key={ord.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-foreground">{ord.id}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{ord.date ? new Date(ord.date).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-foreground">{fmt(ord.total_amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase font-mono ${
                      ord.status === "approved" || ord.status === "delivered" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in scale-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Milestone size={14} className="text-primary" /> Submit Factory Order</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Dealer / Business Name</label>
                <input disabled value={form.dealer_name} className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 outline-none text-muted-foreground transition-colors cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Estimated Order Total (₹) *</label>
                <input required type="number" value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))} placeholder="E.g. 150000" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Submitting..." : "Submit Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
