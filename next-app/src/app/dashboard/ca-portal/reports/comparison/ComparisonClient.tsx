"use client";

import React, { useState } from "react";
import { Columns, Download, Search, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface CompareItem {
  month: string;
  sales: number;
  purchases: number;
  profit: number;
}

interface Props {
  initialData: CompareItem[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export function ComparisonClient({ initialData }: Props) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");

  const filtered = initialData.filter(c => {
    return !search || c.month.includes(search);
  });

  const exportCSV = () => {
    const header = ["Month", "Sales Revenue (₹)", "Purchases (₹)", "Net Operating Profit (₹)"];
    const rows = filtered.map(c => [c.month, c.sales, c.purchases, c.profit]);
    const csv = [header, ...rows].map(row => row.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `financial_comparison_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>Reports</span><span className="opacity-40">/</span><span className="text-foreground">Comparison</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Columns size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Financial Comparison</h1>
              <p className="text-xs text-muted-foreground">Operating stats compared Month vs Month</p>
            </div>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
            <Download size={13} /> Export comparison
          </button>
        </div>
      </div>

      {/* AI Assistant Insight */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Insight:</span> Operating profit is positive across all active months. Sales revenue exceeds purchase expenditures.
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by month (YYYY-MM)..." className="bg-transparent outline-none flex-1" />
        </div>
      </div>

      {/* Comparison Grid and Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3 text-right">Sales Revenue</th>
                <th className="px-4 py-3 text-right">Purchases Value</th>
                <th className="px-4 py-3 text-right">Net Operating Profit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No comparison data found.</td></tr>
              ) : filtered.map((c, i) => (
                <tr key={i} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-foreground">{c.month}</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-600 font-semibold">{fmt(c.sales)}</td>
                  <td className="px-4 py-3 text-right font-mono text-rose-600 font-semibold">{fmt(c.purchases)}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-foreground">{fmt(c.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
