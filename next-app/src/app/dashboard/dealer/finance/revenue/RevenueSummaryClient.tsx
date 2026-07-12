"use client";

import React, { useState } from "react";
import { ClipboardList, Download, Search, Sparkles, TrendingUp } from "lucide-react";

interface Invoice {
  id: string;
  invoice_no: string;
  date: string;
  grand_total: number;
  payment_mode: string;
}

interface Props {
  initialData: Invoice[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export function RevenueSummaryClient({ initialData }: Props) {
  const [search, setSearch] = useState("");

  const filtered = initialData.filter(inv => {
    return !search || inv.invoice_no.toLowerCase().includes(search.toLowerCase());
  });

  const totalRev = initialData.reduce((s, i) => s + Number(i.grand_total || 0), 0);
  const upiRev = initialData.filter(i => i.payment_mode === "UPI").reduce((s, i) => s + Number(i.grand_total || 0), 0);
  const cashRev = totalRev - upiRev;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Finance</span><span className="opacity-40">/</span><span className="text-foreground">Revenue</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><TrendingUp size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Revenue Summary</h1>
              <p className="text-xs text-muted-foreground">Trace billing cashflow receipts and average ticket sizes</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Revenue Guide:</span> Total revenue from invoices generated is {fmt(totalRev)}.
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: fmt(totalRev), desc: "All invoiced sales" },
          { label: "UPI Collections", value: fmt(upiRev), desc: "Direct bank settlements" },
          { label: "Cash Collections", value: fmt(cashRev), desc: "Handheld drawer balances" }
        ].map((s, idx) => (
          <div key={idx} className="bg-card border border-border rounded-2xl p-5 space-y-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{s.label}</span>
            <p className="text-xl font-black text-foreground font-mono">{s.value}</p>
            <p className="text-[9px] text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm text-xs text-foreground">
        <Search size={13} className="text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by invoice code..." className="flex-1 bg-transparent outline-none" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Invoice Number</th>
                <th className="px-4 py-3">Billing Date</th>
                <th className="px-4 py-3 text-right">Invoiced Amount</th>
                <th className="px-4 py-3">Mode</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No invoices registered.</td></tr>
              ) : filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-foreground">{inv.invoice_no}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{inv.date}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-foreground">{fmt(inv.grand_total)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.payment_mode || "UPI"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
