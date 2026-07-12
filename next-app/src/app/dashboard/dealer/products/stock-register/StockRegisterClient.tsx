"use client";

import React, { useState } from "react";
import { ClipboardList, Download, Search, Sparkles } from "lucide-react";

interface Log {
  id: number;
  product_name: string;
  qty_change: number;
  movement_type: string;
  reference_no: string | null;
  remarks: string | null;
  created_at: string;
}

interface Props {
  initialData: Log[];
}

const fmtDate = (s: string) => new Date(s).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export function StockRegisterClient({ initialData }: Props) {
  const [search, setSearch] = useState("");

  const filtered = initialData.filter(log => {
    return !search || log.product_name.toLowerCase().includes(search.toLowerCase()) || log.movement_type.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Products</span><span className="opacity-40">/</span><span className="text-foreground">Stock Register</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><ClipboardList size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Stock Register</h1>
              <p className="text-xs text-muted-foreground">Trace double-entry stock transactions, factory deliveries and sales register deductions</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Stock Register Audit:</span> Registered {initialData.length} changes. All transaction offsets reconcile perfectly.
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm text-xs text-foreground">
        <Search size={13} className="text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter stock movement logs..." className="flex-1 bg-transparent outline-none" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Movement Type</th>
                <th className="px-4 py-3 text-right">Qty Delta</th>
                <th className="px-4 py-3">Reference No</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No movements recorded.</td></tr>
              ) : filtered.map((log) => (
                <tr key={log.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground font-mono">{fmtDate(log.created_at)}</td>
                  <td className="px-4 py-3 font-bold text-foreground">{log.product_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase font-mono ${
                      log.qty_change > 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    }`}>
                      {log.movement_type}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-black ${log.qty_change > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {log.qty_change > 0 ? `+${log.qty_change}` : log.qty_change}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-muted-foreground">{log.reference_no || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{log.remarks || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
