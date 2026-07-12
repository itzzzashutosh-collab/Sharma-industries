"use client";

import React, { useState, useTransition } from "react";
import { Users, Plus, Search, Sparkles, X, PlusCircle, Phone, Mail } from "lucide-react";
import { createDealerSupplier } from "../../actions";

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  gstin: string | null;
  address: string | null;
  email: string | null;
}

interface Props {
  initialData: Supplier[];
}

export function SuppliersDirectoryClient({ initialData }: Props) {
  const [list, setList] = useState<Supplier[]>(initialData);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    gstin: ""
  });

  const filtered = list.filter(sup => {
    return !search || sup.name.toLowerCase().includes(search.toLowerCase()) || (sup.phone && sup.phone.includes(search));
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    
    startTransition(async () => {
      const res = await createDealerSupplier(form);
      if (res.success) {
        setList(prev => [{
          id: `SUP_${Date.now()}`,
          name: form.name,
          phone: form.phone || null,
          gstin: form.gstin || null,
          address: form.address || null,
          email: form.email || null
        }, ...prev]);
        setShowAddModal(false);
        setForm({ name: "", phone: "", email: "", address: "", gstin: "" });
      } else {
        alert(res.error || "Failed to create supplier");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Purchases</span><span className="opacity-40">/</span><span className="text-foreground">Suppliers</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Users size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Suppliers Directory</h1>
              <p className="text-xs text-muted-foreground">Manage logistics vendors, raw material suppliers and factory points of contact</p>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
            <Plus size={13} /> Add Supplier
          </button>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Supplier Suggestion:</span> {list.length} suppliers registered. Recommend auditing billing logs monthly.
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm text-xs text-foreground">
        <Search size={13} className="text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by supplier name or phone..." className="flex-1 bg-transparent outline-none" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Supplier Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">GSTIN</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Email</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No suppliers found.</td></tr>
              ) : filtered.map((sup) => (
                <tr key={sup.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-bold text-foreground">{sup.name}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-muted-foreground">{sup.phone || "—"}</td>
                  <td className="px-4 py-3 font-mono text-foreground">{sup.gstin || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{sup.address || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{sup.email || "—"}</td>
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
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><PlusCircle size={14} className="text-primary" /> Register Supplier</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Supplier Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="E.g. Jodhpur Logistics Co" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="E.g. 9876543210" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">GSTIN</label>
                  <input value={form.gstin} onChange={e => setForm(f => ({ ...f, gstin: e.target.value }))} placeholder="Optional" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="E.g. contact@supplier.com" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Address</label>
                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Enter full office/warehouse address..." rows={2} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors resize-none" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Creating..." : "Save Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
