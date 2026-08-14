"use client";

import React, { useState, useTransition } from "react";
import { CalendarDays, Download, Search, RefreshCw, Sparkles } from "lucide-react";
import { getDayBookData } from "../../actions";
import { useLanguage } from "@/components/LanguageProvider";

interface DayBookEntry {
  id: string;
  voucher: string;
  type: string;
  amount: number;
  status: string;
  date: string;
  desc: string;
}

interface Props {
  initialEntries: DayBookEntry[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtDate = (s: string) => new Date(s).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

export function DayBookClient({ initialEntries }: Props) {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<DayBookEntry[]>(initialEntries);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadDate = (d: string) => {
    setDate(d);
    startTransition(async () => {
      const res = await getDayBookData(d);
      if (res.success) {
        setEntries(res.data || []);
      }
    });
  };

  const filtered = entries.filter(e => {
    return !search || e.voucher.toLowerCase().includes(search.toLowerCase()) || e.desc.toLowerCase().includes(search.toLowerCase()) || e.type.toLowerCase().includes(search.toLowerCase());
  });

  const totalAmount = filtered.reduce((s, e) => s + e.amount, 0);

  const exportCSV = () => {
    const header = ["Time", "Voucher#", "Type", "Particulars", "Amount", "Status"];
    const rows = filtered.map(e => [new Date(e.date).toLocaleTimeString("en-IN"), e.voucher, e.type, e.desc, e.amount, e.status]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `daybook_${date}_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>Accounting</span><span className="opacity-40">/</span><span className="text-foreground">Day Book</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><CalendarDays size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">{t("Daily Day Book")}</h1>
              <p className="text-xs text-muted-foreground">{filtered.length} entries recorded today • Total transacted: {fmt(totalAmount)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={date} onChange={e => loadDate(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary" />
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
              <Download size={13} /> Export Day Book
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Insight */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Insight:</span> Day book entries align perfectly with your sales logs, purchase invoices, and bank balances.
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex-1 max-w-md flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Day Book by voucher, type, particulars..." className="bg-transparent outline-none flex-1" />
        </div>
        {isPending && <div className="text-xs text-muted-foreground flex items-center gap-1.5"><RefreshCw size={12} className="animate-spin" /> Syncing...</div>}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Voucher#</th>
                <th className="px-4 py-3">Voucher Type</th>
                <th className="px-4 py-3">Particulars / Narration</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No entries found for this date.</td></tr>
              ) : filtered.map((e) => (
                <tr key={e.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{fmtDate(e.date)}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">{e.voucher}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${e.type === "Receipt" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : e.type === "Payment" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : e.type === "Journal" ? "bg-violet-500/10 text-violet-600 border-violet-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"}`}>
                      {e.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{e.desc}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-foreground">{fmt(e.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 uppercase">
                      {e.status || "Completed"}
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
