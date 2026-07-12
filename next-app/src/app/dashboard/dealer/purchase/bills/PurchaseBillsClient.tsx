"use client";

import React, { useState, useTransition } from "react";
import { FileText, Plus, Download, Search, Sparkles, X, PlusCircle, CreditCard } from "lucide-react";
import { createDealerPurchaseBill } from "../../actions";

interface Bill {
  id: string;
  invoice_no: string;
  bill_date: string;
  supplier_name: string;
  total_amount: number;
  payment_status: string;
}

interface Props {
  initialData: Bill[];
  suppliers: { id: string; name: string; gstin?: string | null }[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export function PurchaseBillsClient({ initialData, suppliers }: Props) {
  const [list, setList] = useState<Bill[]>(initialData);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    invoice_no: "",
    supplier_name: suppliers[0]?.name || "",
    bill_date: "",
    total_amount: "",
    payment_status: "pending",
    payment_type: "Bank Transfer"
  });

  const filtered = list.filter(bill => {
    return !search || bill.invoice_no.toLowerCase().includes(search.toLowerCase()) || bill.supplier_name.toLowerCase().includes(search.toLowerCase());
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.invoice_no || !form.supplier_name || !form.total_amount) return;
    
    startTransition(async () => {
      const gstin = suppliers.find(s => s.name === form.supplier_name)?.gstin || "";
      const res = await createDealerPurchaseBill({
        invoice_no: form.invoice_no,
        supplier_name: form.supplier_name,
        supplier_gstin: gstin,
        bill_date: form.bill_date,
        sub_total: Number(form.total_amount) / 1.18, // backwards compute standard 18% GST subtotal
        total_amount: Number(form.total_amount),
        payment_status: form.payment_status,
        payment_type: form.payment_type
      });

      if (res.success) {
        setList(prev => [{
          id: `BILL_${Date.now()}`,
          invoice_no: form.invoice_no,
          bill_date: form.bill_date || new Date().toISOString().slice(0, 10),
          supplier_name: form.supplier_name,
          total_amount: Number(form.total_amount),
          payment_status: form.payment_status
        }, ...prev]);
        setShowAddModal(false);
        setForm({
          invoice_no: "",
          supplier_name: suppliers[0]?.name || "",
          bill_date: "",
          total_amount: "",
          payment_status: "pending",
          payment_type: "Bank Transfer"
        });
      } else {
        alert(res.error || "Failed to save purchase bill");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Purchases</span><span className="opacity-40">/</span><span className="text-foreground">Bills</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><FileText size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Purchase Bills Registry</h1>
              <p className="text-xs text-muted-foreground">Trace dealer purchase expenses, supplier invoices and OCR matches</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
              <Plus size={13} /> Upload Purchase Bill
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Refill Suggestion:</span> You have 3 unpaid supplier invoices. Average purchase cycle expenses is {fmt(list.reduce((s,i) => s + Number(i.total_amount), 0) / (list.length || 1))}.
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm text-xs text-foreground">
        <Search size={13} className="text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by invoice no or supplier..." className="flex-1 bg-transparent outline-none" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Invoice Number</th>
                <th className="px-4 py-3">Bill Date</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3 text-right">Total Amount (Incl. Tax)</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No purchase bills found.</td></tr>
              ) : filtered.map((bill) => (
                <tr key={bill.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-foreground">{bill.invoice_no}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{bill.bill_date ? new Date(bill.bill_date).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{bill.supplier_name}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-foreground">{fmt(bill.total_amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase font-mono ${
                      bill.payment_status === "paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                      {bill.payment_status}
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
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><CreditCard size={14} className="text-primary" /> Record Purchase Invoice</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Select Supplier</label>
                <select required value={form.supplier_name} onChange={e => setForm(f => ({ ...f, supplier_name: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                  {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Invoice / Bill Number *</label>
                <input required value={form.invoice_no} onChange={e => setForm(f => ({ ...f, invoice_no: e.target.value }))} placeholder="E.g. TAX-2983" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Bill Date *</label>
                  <input type="date" required value={form.bill_date} onChange={e => setForm(f => ({ ...f, bill_date: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Total Amount *</label>
                  <input type="number" required value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))} placeholder="E.g. 50000" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Payment Status</label>
                  <select value={form.payment_status} onChange={e => setForm(f => ({ ...f, payment_status: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                    {["pending", "paid"].map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Payment Mode</label>
                  <select value={form.payment_type} onChange={e => setForm(f => ({ ...f, payment_type: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                    {["Bank Transfer", "UPI", "Cash", "Credit"].map(mode => <option key={mode} value={mode}>{mode}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Saving..." : "Save Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
