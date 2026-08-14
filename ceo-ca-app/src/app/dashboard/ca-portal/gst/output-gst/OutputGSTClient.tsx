"use client";

import React, { useState } from "react";
import { ArrowUpCircle, Download, FileText, Sparkles, TrendingUp } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

interface Props {
  initialData: {
    cgst: number;
    sgst: number;
    igst: number;
    collected: number;
    payable: number;
  };
}

export function OutputGSTClient({ initialData }: Props) {
  const { t } = useLanguage();
  const [data] = useState(initialData);

  const kpis = [
    { label: "Total Output GST", value: fmt(data.payable), desc: "CGST + SGST + IGST", icon: ArrowUpCircle, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
    { label: "GST Collected", value: fmt(data.collected), desc: "From sales invoices", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  ];

  const exportCSV = () => {
    const csv = [
      ["Metric", "Value (₹)"],
      ["Total Output GST", data.payable],
      ["GST Collected", data.collected],
    ].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `output_gst_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>GST & Tax</span><span className="opacity-40">/</span><span className="text-foreground">Output GST</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20"><ArrowUpCircle size={20} className="text-rose-500" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Output GST Ledger</h1>
              <p className="text-xs text-muted-foreground">Output tax compiled from sales invoices</p>
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
          <span className="font-bold text-foreground">AI Insight:</span> Output GST is matched with outward sales invoices. No discrepancy found between gross sales and computed output GST.
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{k.label}</span>
                <div className={`p-1.5 rounded-lg ${k.bg}`}><Icon size={12} className={k.color} /></div>
              </div>
              <div>
                <p className="text-xl font-black text-foreground">{k.value}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{k.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details breakdown */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-foreground">Detailed Component Breakup</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { component: "Output CGST", value: fmt(data.cgst) },
            { component: "Output SGST", value: fmt(data.sgst) },
            { component: "Output IGST", value: fmt(data.igst) },
          ].map((c, i) => (
            <div key={i} className="border border-border rounded-xl p-4 flex justify-between items-center bg-muted/20">
              <span className="text-xs font-semibold text-muted-foreground">{c.component}</span>
              <span className="text-sm font-black text-foreground">{c.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
