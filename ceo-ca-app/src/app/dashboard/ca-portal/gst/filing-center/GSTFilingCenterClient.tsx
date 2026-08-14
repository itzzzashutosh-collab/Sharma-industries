"use client";

import React, { useState } from "react";
import { Calculator, Download, CheckCircle, AlertCircle, FileText, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface FilingRecord {
  period: string;
  type: string;
  status: string;
  due: string;
  filedDate: string;
}

interface Props {
  initialData: FilingRecord[];
}

export function GSTFilingCenterClient({ initialData }: Props) {
  const { t } = useLanguage();
  const [filings] = useState(initialData);

  const exportCSV = () => {
    const header = ["Filing Period", "Return Type", "Filing Status", "Due Date", "Filed Date"];
    const rows = filings.map(f => [f.period, f.type, f.status, f.due, f.filedDate]);
    const csv = [header, ...rows].map(row => row.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `gst_filing_status_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>GST & Tax</span><span className="opacity-40">/</span><span className="text-foreground">Filing Center</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Calculator size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">GST Filing Center</h1>
              <p className="text-xs text-muted-foreground">Filing-ready GSTR return templates and historical logs</p>
            </div>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
            <Download size={13} /> Export History
          </button>
        </div>
      </div>

      {/* AI Assistant Insight */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Assistant:</span> GSTR-1 returns for the current period are ready for filing. All HSN and sales records match.
        </div>
      </div>

      {/* Return Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-emerald-500/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-600 uppercase">GSTR-1</span>
            <CheckCircle size={15} className="text-emerald-500" />
          </div>
          <p className="text-lg font-black text-foreground">Filing Ready</p>
          <p className="text-xs text-muted-foreground">Period: June 2026 • Due: 11-Jul-2026</p>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold cursor-pointer hover:opacity-90 mt-2">
            <Download size={11} /> Generate GSTR-1 JSON
          </button>
        </div>
        <div className="bg-card border border-amber-500/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-600 uppercase">GSTR-3B</span>
            <AlertCircle size={15} className="text-amber-500" />
          </div>
          <p className="text-lg font-black text-foreground">Draft State</p>
          <p className="text-xs text-muted-foreground">Period: June 2026 • Due: 20-Jul-2026</p>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-[10px] font-bold cursor-pointer hover:opacity-90 mt-2">
            <Download size={11} /> Generate GSTR-3B Template
          </button>
        </div>
      </div>

      {/* Historical Filings Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border bg-muted/20 text-xs font-bold text-foreground">Historical GSTR filings</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Filing Type</th>
                <th className="px-4 py-3">Filing Status</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Filed Date</th>
              </tr>
            </thead>
            <tbody>
              {filings.map((f, i) => (
                <tr key={i} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">{f.period}</td>
                  <td className="px-4 py-3 font-bold text-foreground">{f.type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${f.status === "Filed" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : f.status === "Filing Ready" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{f.due}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{f.filedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
