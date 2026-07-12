"use client";

import React, { useState, useTransition } from "react";
import { FileText, Plus, Download, Search, Sparkles, X, ShoppingCart, User, AlertCircle } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { createDealerInvoice } from "../../actions";

interface Invoice {
  id: string;
  invoice_no: string;
  date: string;
  customer?: { name: string } | null;
  grand_total: number;
  payment_status: string;
}

interface ProductItem {
  id: string;
  name: string;
  selling_price: number;
}

interface Props {
  initialData: Invoice[];
  customers: { id: string; name: string }[];
  products: ProductItem[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export function InvoicesClient({ initialData, customers, products }: Props) {
  const { t } = useLanguage();
  const [list, setList] = useState<Invoice[]>(initialData);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    customer_id: customers[0]?.id || "",
    selected_product_id: products[0]?.id || "",
    qty: 1,
    payment_mode: "UPI",
    due_date: ""
  });

  const filtered = list.filter(inv => {
    const custName = inv.customer?.name || "";
    return !search || inv.invoice_no.toLowerCase().includes(search.toLowerCase()) || custName.toLowerCase().includes(search.toLowerCase());
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_id || !form.selected_product_id) return;
    
    startTransition(async () => {
      const prod = products.find(p => p.id === form.selected_product_id);
      const custName = customers.find(c => c.id === form.customer_id)?.name || "Direct Customer";
      const rate = prod ? Number(prod.selling_price || 0) : 0;
      const subtotal = rate * Number(form.qty);
      const total_gst = subtotal * 0.18; // 18% GST standard
      const grand_total = subtotal + total_gst;

      const res = await createDealerInvoice({
        customer_id: form.customer_id,
        customer_name: custName,
        items: [{ id: form.selected_product_id, name: prod?.name, qty: form.qty, rate }],
        subtotal,
        total_gst,
        grand_total,
        balance_due: 0,
        payment_status: "paid",
        payment_mode: form.payment_mode,
        due_date: form.due_date || new Date().toISOString().slice(0,10)
      });

      if (res.success) {
        setList(prev => [{
          id: `INV_${Date.now()}`,
          invoice_no: `SI-INV-${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString().slice(0, 10),
          customer: { name: custName },
          grand_total,
          payment_status: "paid"
        }, ...prev]);
        setShowAddModal(false);
        setForm({
          customer_id: customers[0]?.id || "",
          selected_product_id: products[0]?.id || "",
          qty: 1,
          payment_mode: "UPI",
          due_date: ""
        });
      } else {
        alert(res.error || "Failed to create invoice");
      }
    });
  };

  const exportCSV = () => {
    const header = ["Invoice No", "Date", "Customer", "Amount", "Status"];
    const rows = filtered.map(inv => [inv.invoice_no, inv.date, inv.customer?.name || "—", inv.grand_total, inv.payment_status]);
    const csv = [header, ...rows].map(row => row.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `invoices_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Sales</span><span className="opacity-40">/</span><span className="text-foreground">Invoices</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><FileText size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">GST Invoicing Terminal</h1>
              <p className="text-xs text-muted-foreground">Generate taxable invoices, trace payment settlements and download PDFs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
              <Plus size={13} /> New Invoice
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold cursor-pointer hover:bg-primary/20 transition-all">
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Sales Insight:</span> Average invoice checkout value is {fmt(list.reduce((s,i) => s+Number(i.grand_total), 0) / (list.length || 1))}.
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices by number or customer name..." className="bg-transparent outline-none flex-1" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Invoice Number</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-right">Grand Total (Incl. GST)</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No invoices generated.</td></tr>
              ) : filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-foreground">{inv.invoice_no}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{inv.date}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{inv.customer?.name || "Retail Customer"}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-foreground">{fmt(inv.grand_total)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[8px] font-black border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 uppercase font-mono">
                      {inv.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Invoice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in scale-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><ShoppingCart size={14} className="text-primary" /> Generate Tax Invoice</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Select Customer</label>
                <select required value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Select Product</label>
                <select required value={form.selected_product_id} onChange={e => setForm(f => ({ ...f, selected_product_id: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({fmt(p.selling_price)})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Quantity</label>
                  <input type="number" required min={1} value={form.qty} onChange={e => setForm(f => ({ ...f, qty: Number(e.target.value) }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Payment Mode</label>
                  <select value={form.payment_mode} onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                    {["Cash", "UPI", "SBI Bank Transfer", "Credit"].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Due Date</label>
                <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Generating..." : "Generate Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
