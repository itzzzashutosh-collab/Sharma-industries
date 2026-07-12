"use client";

import React, { useState } from "react";
import { AlertCircle, Download, Search, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface RecordItem {
  id: string;
  ref: string;
  party: string;
  amount: number;
  date: string;
  status: string;
}

interface Props {
  initialData: RecordItem[];
  extraData: {
    receivables: RecordItem[];
    payables: RecordItem[];
    totalReceivables: number;
    totalPayables: number;
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function OutstandingClient({ extraData }: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"receivables" | "payables">("receivables");
  const [search, setSearch] = useState("");

  const list = activeTab === "receivables" ? extraData.receivables : extraData.payables;

  const filtered = list.filter(item => {
    return !search || item.party.toLowerCase().includes(search.toLowerCase()) || item.ref.toLowerCase().includes(search.toLowerCase());
  });

  const exportCSV = () => {
    const header = activeTab === "receivables" ? ["Invoice#", "Customer", "Amount", "Date", "Status"] : ["Bill#", "Supplier", "Amount", "Date", "Status"];
    const rows = filtered.map(item => [item.ref, item.party, item.amount, fmtDate(item.date), item.status]);
    const csv = [header, ...rows].map(row => row.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `outstanding_${activeTab}_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>Reports</span><span className="opacity-40">/</span><span className="text-foreground">Outstanding</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><AlertCircle size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Outstanding Reports</h1>
              <p className="text-xs text-muted-foreground">Traceable receivables from clients and payables to vendors</p>
            </div>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* AI Assistant Insight */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Insight:</span> Total outstanding receivables are {fmt(extraData.totalReceivables)}. Outstanding payables stand at {fmt(extraData.totalPayables)}.
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground flex-1 max-w-md">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search outstanding entries..." className="bg-transparent outline-none flex-1" />
        </div>
        <div className="flex rounded-xl border border-border overflow-hidden text-xs">
          <button onClick={() => { setSearch(""); setActiveTab("receivables"); }} className={`px-4 py-2 font-bold cursor-pointer transition-colors ${activeTab === "receivables" ? "bg-primary text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>Receivables ({fmt(extraData.totalReceivables)})</button>
          <button onClick={() => { setSearch(""); setActiveTab("payables"); }} className={`px-4 py-2 font-bold cursor-pointer transition-colors ${activeTab === "payables" ? "bg-primary text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>Payables ({fmt(extraData.totalPayables)})</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">{activeTab === "receivables" ? "Invoice#" : "Bill#"}</th>
                <th className="px-4 py-3">{activeTab === "receivables" ? "Customer" : "Supplier"}</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No outstanding balances found.</td></tr>
              ) : filtered.map((item) => (
                <tr key={item.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{fmtDate(item.date)}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">{item.ref}</td>
                  <td className="px-4 py-3 font-bold text-foreground">{item.party}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-foreground">{fmt(item.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black border bg-amber-500/10 text-amber-600 border-amber-500/20 uppercase">
                      {item.status || "Pending"}
                    </span>
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
