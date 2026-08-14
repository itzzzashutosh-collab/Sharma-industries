"use client";
import React from "react";
import { BarChart2, Download } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
interface Props { debits: any[]; credits: any[]; totalDebits: number; totalCredits: number; difference: number; }
export function TrialBalanceClient({ debits, credits, totalDebits, totalCredits, difference }: Props) {
  const { t } = useLanguage();
  const balanced = Math.abs(difference) < 1;
  const exportCSV = () => {
    const rows = [["Account", "Debit (₹)", "Credit (₹)"], ...debits.map(d => [d.account, d.amount, ""]), ...credits.map(c => [c.account, "", c.amount]), ["TOTAL", totalDebits, totalCredits]];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv); a.download = `trial_balance_${Date.now()}.csv`; a.click();
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1"><span>CA Workspace</span><span className="opacity-40">/</span><span>Reports</span><span className="opacity-40">/</span><span className="text-foreground">Trial Balance</span></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><BarChart2 size={20} className="text-primary" /></div><div><h1 className="text-xl font-black text-foreground">{t("Trial Balance")}</h1><p className="text-xs text-muted-foreground">All ledger account balances — as at today</p></div></div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90"><Download size={13} /> Export CSV</button>
      </div>
      {balanced ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-600 text-xs font-bold">✓ Trial Balance is balanced — Debits equal Credits.</div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-amber-600 text-xs font-bold">⚠ Difference of {fmt(Math.abs(difference))} detected. Review entries.</div>
      )}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-xs text-left">
          <thead className="border-b border-border bg-muted/30"><tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider"><th className="px-4 py-3">Account</th><th className="px-4 py-3 text-right">Debit ₹</th><th className="px-4 py-3 text-right">Credit ₹</th></tr></thead>
          <tbody>
            {debits.map((d, i) => <tr key={`d${i}`} className="border-b border-border/40 hover:bg-muted/20 transition-colors"><td className="px-4 py-3 font-semibold text-foreground">{d.account}</td><td className="px-4 py-3 text-right font-bold text-rose-600">{fmt(d.amount)}</td><td className="px-4 py-3 text-right text-muted-foreground">—</td></tr>)}
            {credits.map((c, i) => <tr key={`c${i}`} className="border-b border-border/40 hover:bg-muted/20 transition-colors"><td className="px-4 py-3 font-semibold text-foreground">{c.account}</td><td className="px-4 py-3 text-right text-muted-foreground">—</td><td className="px-4 py-3 text-right font-bold text-emerald-600">{fmt(c.amount)}</td></tr>)}
            <tr className="bg-muted/30 font-black text-sm"><td className="px-4 py-3 text-foreground">TOTAL</td><td className="px-4 py-3 text-right text-rose-600">{fmt(totalDebits)}</td><td className="px-4 py-3 text-right text-emerald-600">{fmt(totalCredits)}</td></tr>
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
