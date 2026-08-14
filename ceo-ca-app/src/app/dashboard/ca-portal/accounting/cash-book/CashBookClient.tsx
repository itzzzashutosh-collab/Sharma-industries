"use client";

import React, { useState, useTransition } from "react";
import { Banknote, Download, ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react";
import { getCashBook } from "../../actions";
import { useLanguage } from "@/components/LanguageProvider";

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

interface Props {
  initialReceipts: any[];
  initialPayments: any[];
  totalReceipts: number;
  totalPayments: number;
  closingBalance: number;
}

export function CashBookClient({ initialReceipts, initialPayments, totalReceipts, totalPayments, closingBalance }: Props) {
  const { t } = useLanguage();
  const [receipts, setReceipts] = useState(initialReceipts);
  const [payments, setPayments] = useState(initialPayments);
  const [totals, setTotals] = useState({ receipts: totalReceipts, payments: totalPayments, balance: closingBalance });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [isPending, startTransition] = useTransition();

  const loadDate = (d: string) => {
    setSelectedDate(d);
    startTransition(async () => {
      const res = await getCashBook(d) as any;
      if (res.success) {
        setReceipts(res.receipts || []);
        setPayments(res.payments || []);
        setTotals({ receipts: res.totalReceipts || 0, payments: res.totalPayments || 0, balance: res.closingBalance || 0 });
      }
    });
  };

  const exportCSV = () => {
    const rows = [
      ["Type", "Party", "Amount", "Date"],
      ...receipts.map((r: any) => ["Receipt", r.party, r.amount, fmtDate(r.date)]),
      ...payments.map((p: any) => ["Payment", p.party, p.amount, fmtDate(p.date)]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `cash_book_${selectedDate}.csv`; a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>Accounting</span><span className="opacity-40">/</span><span className="text-foreground">Cash Book</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Banknote size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">{t("Cash Book")}</h1>
              <p className="text-xs text-muted-foreground">Daily cash receipts and payments — read-only</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={selectedDate} onChange={e => loadDate(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary" />
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
              <Download size={13} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Opening + Receipts", value: fmt(totals.receipts), icon: ArrowDownCircle, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Total Payments", value: fmt(totals.payments), icon: ArrowUpCircle, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
          { label: "Closing Balance", value: fmt(Math.abs(totals.balance)), icon: Scale, color: totals.balance >= 0 ? "text-blue-500" : "text-rose-500", bg: "bg-blue-500/10 border-blue-500/20" },
        ].map((s, i) => { const Icon = s.icon; return (
          <div key={i} className={`bg-card border ${s.bg} rounded-2xl p-4 flex items-center gap-3`}>
            <div className={`p-2 rounded-xl ${s.bg}`}><Icon size={16} className={s.color} /></div>
            <div><p className="text-[10px] font-black text-muted-foreground uppercase">{s.label}</p><p className="text-lg font-black text-foreground">{s.value}</p></div>
          </div>
        );})}
      </div>

      {isPending && <div className="text-center text-xs text-muted-foreground py-4">Loading...</div>}

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receipts */}
        <div className="bg-card border border-emerald-500/20 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 bg-emerald-500/5 border-b border-emerald-500/20 flex items-center gap-2">
            <ArrowDownCircle size={13} className="text-emerald-500" />
            <span className="text-xs font-black text-emerald-600">RECEIPTS</span>
            <span className="ml-auto text-xs font-bold text-emerald-600">{fmt(totals.receipts)}</span>
          </div>
          <div className="divide-y divide-border/40">
            {receipts.length === 0 ? <p className="text-center py-8 text-xs text-muted-foreground">No receipts for this date.</p>
              : receipts.map((r: any, i: number) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div><p className="text-xs font-semibold text-foreground">{r.party}</p><p className="text-[10px] text-muted-foreground font-mono">{fmtDate(r.date)}</p></div>
                  <span className="text-sm font-bold text-emerald-600">{fmt(r.amount)}</span>
                </div>
              ))}
          </div>
        </div>
        {/* Payments */}
        <div className="bg-card border border-rose-500/20 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 bg-rose-500/5 border-b border-rose-500/20 flex items-center gap-2">
            <ArrowUpCircle size={13} className="text-rose-500" />
            <span className="text-xs font-black text-rose-600">PAYMENTS</span>
            <span className="ml-auto text-xs font-bold text-rose-600">{fmt(totals.payments)}</span>
          </div>
          <div className="divide-y divide-border/40">
            {payments.length === 0 ? <p className="text-center py-8 text-xs text-muted-foreground">No payments for this date.</p>
              : payments.map((p: any, i: number) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div><p className="text-xs font-semibold text-foreground">{p.party}</p><p className="text-[10px] text-muted-foreground font-mono">{fmtDate(p.date)}</p></div>
                  <span className="text-sm font-bold text-rose-600">{fmt(p.amount)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
