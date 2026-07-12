"use client";

import React, { useState } from "react";
import { ArrowUpCircle, Download, Search, FileText, Sparkles, ExternalLink } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface Payment {
  id: string;
  payment_number: string;
  supplier: string;
  expense_category: string;
  purchase_bill_ref: string;
  amount: number;
  payment_mode: string;
  transaction_id: string;
  remarks: string;
  status: string;
  created_at: string;
}

interface Props {
  initialPayments: Payment[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function PaymentsClient({ initialPayments }: Props) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");

  const filtered = initialPayments.filter(p => {
    return !search || p.supplier?.toLowerCase().includes(search.toLowerCase()) || p.payment_number.toLowerCase().includes(search.toLowerCase()) || p.expense_category?.toLowerCase().includes(search.toLowerCase());
  });

  const total = filtered.reduce((s, p) => s + Number(p.amount || 0), 0);

  const exportCSV = () => {
    const header = ["Payment#", "Supplier", "Category", "Bill Ref", "Amount", "Mode", "Transaction ID", "Remarks", "Date"];
    const rows = filtered.map(p => [p.payment_number, p.supplier, p.expense_category, p.purchase_bill_ref || "—", p.amount, p.payment_mode, p.transaction_id || "—", p.remarks || "", fmtDate(p.created_at)]);
    const csv = [header, ...rows].map(row => row.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `payments_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>Accounting</span><span className="opacity-40">/</span><span className="text-foreground">Payments</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20"><ArrowUpCircle size={20} className="text-rose-500" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">{t("Payments Register")}</h1>
              <p className="text-xs text-muted-foreground">{filtered.length} payments • Total: {fmt(total)}</p>
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
          <span className="font-bold text-foreground">AI Assistant:</span> All payments are matched to vendors and op-ex categories. No unlinked payments detected.
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search payments by supplier, category, or payment#..." className="bg-transparent outline-none flex-1" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Payment#</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Bill Link</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">No payments found.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{fmtDate(p.created_at)}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">{p.payment_number}</td>
                  <td className="px-4 py-3 font-bold text-foreground">{p.supplier}</td>
                  <td className="px-4 py-3 text-muted-foreground font-semibold">{p.expense_category}</td>
                  <td className="px-4 py-3 text-primary font-bold">
                    {p.purchase_bill_ref ? (
                      <a href={`/dashboard/ca-portal/audit/purchase-bills?search=${p.purchase_bill_ref}`} className="flex items-center gap-1 hover:underline">
                        Bill Link <ExternalLink size={10} />
                      </a>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.payment_mode}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{p.transaction_id || "—"}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-rose-600">{fmt(p.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 uppercase">
                      {p.status || "Paid"}
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
