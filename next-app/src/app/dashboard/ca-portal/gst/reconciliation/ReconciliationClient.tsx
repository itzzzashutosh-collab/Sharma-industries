"use client";

import React, { useState } from "react";
import { Scale, Download, CheckCircle, AlertCircle, FileText, Sparkles, Plus, Search } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface Anomaly {
  id: string;
  invoice_no: string;
  vendor: string;
  type: string;
  details: string;
  amount: number;
  status: string;
}

interface Props {
  initialAnomalies: Anomaly[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export function ReconciliationClient({ initialAnomalies }: Props) {
  const { t } = useLanguage();
  const [anomalies, setAnomalies] = useState<Anomaly[]>(initialAnomalies);
  const [search, setSearch] = useState("");

  const handleVerify = (id: string) => {
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status: "Verified" } : a));
  };

  const filtered = anomalies.filter(a => {
    return !search || a.vendor.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase()) || a.invoice_no.toLowerCase().includes(search.toLowerCase());
  });

  const exportCSV = () => {
    const header = ["Invoice#", "Vendor", "Issue Type", "Details", "Amount", "Status"];
    const rows = filtered.map(a => [a.invoice_no, a.vendor, a.type, a.details, a.amount, a.status]);
    const csv = [header, ...rows].map(row => row.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    link.download = `gst_recon_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>GST & Tax</span><span className="opacity-40">/</span><span className="text-foreground">GST Reconciliation</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Scale size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">GST Reconciliation (GSTR-2A vs Purchase Register)</h1>
              <p className="text-xs text-muted-foreground">Automated matching of purchase ledger bills with GST filing logs</p>
            </div>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
            <Download size={13} /> Export Report
          </button>
        </div>
      </div>

      {/* AI Assistant Insight */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Insight:</span> {filtered.filter(a => a.status !== "Verified").length} reconciliation anomalies require review. Auto-matched 90% of invoices based on date and GST amount.
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search anomalies by vendor, invoice#, issue type..." className="bg-transparent outline-none flex-1" />
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border bg-muted/20 text-xs font-bold text-foreground">Reconciliation anomalies list</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Invoice#</th>
                <th className="px-4 py-3">Supplier/Vendor</th>
                <th className="px-4 py-3">Issue Type</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No anomalies found. All entries match GSTR-2A!</td></tr>
              ) : filtered.map((a) => (
                <tr key={a.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">{a.invoice_no}</td>
                  <td className="px-4 py-3 font-bold text-foreground">{a.vendor}</td>
                  <td className="px-4 py-3 font-semibold text-rose-500">{a.type}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs">{a.details}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-foreground">{fmt(a.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${a.status === "Verified" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {a.status !== "Verified" ? (
                      <button onClick={() => handleVerify(a.id)} className="px-3 py-1 rounded bg-primary text-white text-[10px] font-bold hover:opacity-90">Mark Reconciled</button>
                    ) : (
                      <span className="text-emerald-600 text-xs font-bold">✓ Complete</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}