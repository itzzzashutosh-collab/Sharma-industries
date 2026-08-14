"use client";
import React, { useState } from "react";
import { CreditCard, Download, Search } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export function ExpenseRegisterClient({ initialData }: { initialData: any[] }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const filtered = initialData.filter((d: any) => !search || JSON.stringify(d).toLowerCase().includes(search.toLowerCase()));
  const totalAmount = filtered.reduce((s: number, d: any) => s + Number(d.amount || 0), 0);

  const exportCSV = () => {
    const csv = ["Category,Amount,Description,Status,Date",
      ...filtered.map((d: any) => [d.category, d.amount, d.description || "", d.status, fmtDate(d.created_at)].join(","))
    ].join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `expense_register_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
        <span>CA Workspace</span><span className="opacity-40">/</span><span>Audit</span><span className="opacity-40">/</span><span className="text-foreground">Expense Register</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20"><CreditCard size={20} className="text-rose-500" /></div>
          <div><h1 className="text-xl font-black text-foreground">{t("Expense Register")}</h1>
            <p className="text-xs text-muted-foreground">{filtered.length} entries • Total: {fmt(totalAmount)} — Read-only</p></div>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90"><Download size={13} /> Export CSV</button>
      </div>
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
        <Search size={13} className="text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses..." className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground" />
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Category</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No expense entries found.</td></tr>
                : filtered.map((d: any, i: number) => (
                  <tr key={i} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground">{d.category || "Other"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.description || "—"}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{fmtDate(d.created_at)}</td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600">{fmt(d.amount || 0)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border capitalize ${d.status === "approved" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}>{d.status || "pending"}</span>
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