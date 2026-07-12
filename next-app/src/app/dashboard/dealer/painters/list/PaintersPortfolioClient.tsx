"use client";

import React, { useState, useTransition } from "react";
import { Users, Plus, Search, Sparkles, X, PlusCircle, Award } from "lucide-react";
import { createDealerPainter } from "../../actions";

interface Painter {
  id: string;
  name: string;
  phone: string;
  locality: string | null;
  total_tokens: number;
  total_redeemed: number;
  status: string;
}

interface Props {
  initialData: Painter[];
}

export function PaintersPortfolioClient({ initialData }: Props) {
  const [list, setList] = useState<Painter[]>(initialData);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    locality: "",
    aadhar_no: ""
  });

  const filtered = list.filter(p => {
    return !search || p.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;

    startTransition(async () => {
      const res = await createDealerPainter(form);
      if (res.success) {
        setList(prev => [{
          id: `PAINTER_${Date.now()}`,
          name: form.name,
          phone: form.phone,
          locality: form.locality || null,
          total_tokens: 0,
          total_redeemed: 0,
          status: "Active"
        }, ...prev]);
        setShowAddModal(false);
        setForm({
          name: "",
          phone: "",
          address: "",
          locality: "",
          aadhar_no: ""
        });
      } else {
        alert(res.error || "Failed to register painter");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Painters</span><span className="opacity-40">/</span><span className="text-foreground">Directory</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Users size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Painter Loyalty Directory</h1>
              <p className="text-xs text-muted-foreground">Register local contractor painters, distribute rewards, and check token redemptions</p>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
            <Plus size={13} /> Register Painter
          </button>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI loyalty Guide:</span> Active database tracking {list.length} registered painters.
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm text-xs text-foreground">
        <Search size={13} className="text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by painter name..." className="flex-1 bg-transparent outline-none" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Painter Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Locality</th>
                <th className="px-4 py-3 text-right">Loyalty Tokens</th>
                <th className="px-4 py-3 text-right">Redeemed</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No painters registered.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-bold text-foreground">{p.name}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-muted-foreground">{p.phone}</td>
                  <td className="px-4 py-3 text-foreground">{p.locality || "—"}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-foreground">{Number(p.total_tokens || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{Number(p.total_redeemed || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[8px] font-black border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 uppercase font-mono">
                      {p.status || "Active"}
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
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><PlusCircle size={14} className="text-primary" /> Onboard Contractor Painter</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Full Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="E.g. Vikram Singh" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Phone *</label>
                  <input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="E.g. 9876543211" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Aadhar Number</label>
                  <input value={form.aadhar_no} onChange={e => setForm(f => ({ ...f, aadhar_no: e.target.value }))} placeholder="Optional" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Locality</label>
                <input value={form.locality} onChange={e => setForm(f => ({ ...f, locality: e.target.value }))} placeholder="E.g. Shivaji Nagar" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Address</label>
                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Enter painter full address..." rows={2} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors resize-none" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Registering..." : "Save Painter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
