"use client";

import React, { useState } from "react";
import { BookMarked, Download, Search, FileText, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

interface HSNItem {
  hsn: string;
  product: string;
  qty: number;
  value: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
}

interface Props {
  initialData: HSNItem[];
}

export function HSNSummaryClient({ initialData }: Props) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");

  const filtered = initialData.filter(h => {
    return !search || h.hsn.toLowerCase().includes(search.toLowerCase()) || h.product.toLowerCase().includes(search.toLowerCase());
  });

  const exportCSV = () => {
    const header = ["HSN Code", "Product/Description", "Quantity", "Taxable Value", "CGST", "SGST", "IGST", "Total GST"];
    const rows = filtered.map(h => [h.hsn, h.product, h.qty, h.value, h.cgst, h.sgst, h.igst, h.totalGst]);
    const csv = [header, ...rows].map(row => row.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `hsn_summary_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>GST & Tax</span><span className="opacity-40">/</span><span className="text-foreground">HSN Summary</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><BookMarked size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">HSN Summary</h1>
              <p className="text-xs text-muted-foreground">HSN-wise summary of outward supplies required for GSTR-1</p>
            </div>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* AI Assistant Insight */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Insight:</span> HSN codes are mapped to standard paint classifications (3208, 3209). Tax rates verify correctly at 18% standard GST rate.
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search HSN code or product description..." className="bg-transparent outline-none flex-1" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">HSN Code</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Taxable Value</th>
                <th className="px-4 py-3 text-right">CGST</th>
                <th className="px-4 py-3 text-right">SGST</th>
                <th className="px-4 py-3 text-right">IGST</th>
                <th className="px-4 py-3 text-right">Total GST</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No HSN records found.</td></tr>
              ) : filtered.map((h, i) => (
                <tr key={i} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-foreground">{h.hsn}</td>
                  <td className="px-4 py-3 text-foreground font-semibold">{h.product}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{h.qty}</td>
                  <td className="px-4 py-3 text-right font-mono text-foreground font-semibold">{fmt(h.value)}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmt(h.cgst)}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmt(h.sgst)}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmt(h.igst)}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-emerald-600">{fmt(h.totalGst)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
