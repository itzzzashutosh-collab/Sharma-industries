"use client";

import React, { useState, useTransition } from "react";
import { Users, Plus, Download, Search, Sparkles, MessageCircle, Phone, ArrowRight, Eye, Calendar, EyeOff, UserPlus, Filter, X } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { createDealerCustomer } from "../actions";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string;
  projectsCount: number;
  outstanding: number;
  status: string;
}

interface Props {
  initialData: Customer[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export function CustomersClient({ initialData }: Props) {
  const { t } = useLanguage();
  const [list, setList] = useState<Customer[]>(initialData);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    gstin: ""
  });

  const filtered = list.filter(c => {
    return !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.city.toLowerCase().includes(search.toLowerCase());
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    startTransition(async () => {
      const res = await createDealerCustomer(form);
      if (res.success) {
        setList(prev => [...prev, {
          id: `CUST_${Date.now()}`,
          name: form.name,
          phone: form.phone,
          city: form.city || "Alwar",
          projectsCount: 0,
          outstanding: 0,
          status: "Active"
        }]);
        setShowAddModal(false);
        setForm({ name: "", phone: "", email: "", address: "", city: "", gstin: "" });
      } else {
        alert(res.error || "Failed to add customer");
      }
    });
  };

  const exportCSV = () => {
    const header = ["Customer Name", "Phone", "City", "Active Projects", "Outstanding Balance", "Status"];
    const rows = filtered.map(c => [c.name, c.phone, c.city, c.projectsCount, c.outstanding, c.status]);
    const csv = [header, ...rows].map(row => row.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `customers_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Customers</span><span className="opacity-40">/</span><span className="text-foreground">Registry</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Users size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Customer Relationship Center</h1>
              <p className="text-xs text-muted-foreground">Manage leads, project history, outstanding files and followups</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
              <Plus size={13} /> Add Customer
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold cursor-pointer hover:bg-primary/20 transition-all">
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Widget */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI CRM Insight:</span> 2 followups are due today. Customer <span className="font-bold text-foreground">Rajesh Verma</span> has 1 pending quotation awaiting confirmation.
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: list.length, desc: "Registered accounts" },
          { label: "Active Projects", value: list.reduce((s, c) => s + c.projectsCount, 0), desc: "Sites currently painting" },
          { label: "Pending Followups", value: 2, desc: "Due today" },
          { label: "Total Outstanding", value: fmt(0), desc: "Awaiting checkout" },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{s.label}</span>
            <p className="text-2xl font-black text-foreground">{s.value}</p>
            <p className="text-[9px] text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers by name, phone or city..." className="bg-transparent outline-none flex-1" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Phone Number</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3 text-center">Active Projects</th>
                <th className="px-4 py-3 text-right">Outstanding</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No customers found.</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-bold text-foreground">
                    <Link href={`/dashboard/dealer/customers/${c.id}`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                      {c.name} <Eye size={12} className="text-muted-foreground hover:text-primary" />
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-muted-foreground">{c.phone}</td>
                  <td className="px-4 py-3 text-foreground">{c.city}</td>
                  <td className="px-4 py-3 text-center font-bold text-foreground">{c.projectsCount}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-foreground">{fmt(c.outstanding)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 uppercase">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <a href={`tel:${c.phone}`} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors" title="Call"><Phone size={12} /></a>
                      <a href={`https://wa.me/91${c.phone}`} target="_blank" rel="noreferrer" className="p-1 rounded hover:bg-muted text-emerald-600" title="WhatsApp"><MessageCircle size={12} /></a>
                      <Link href={`/dashboard/dealer/customers/${c.id}`} className="flex items-center gap-1 px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-black hover:bg-primary/20 transition-all">
                        Details <ArrowRight size={10} />
                      </Link>
                    </div>
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
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><UserPlus size={14} className="text-primary" /> Create Customer Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Customer Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="E.g. Sanjay Mehta" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Phone Number *</label>
                <input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="E.g. 9911223344" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Email Address</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="E.g. sanjay@mehta.com" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">City</label>
                  <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="E.g. Jaipur" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">GSTIN</label>
                  <input value={form.gstin} onChange={e => setForm(f => ({ ...f, gstin: e.target.value }))} placeholder="Optional" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors" />
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Creating..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
