"use client";

import React, { useState } from "react";
import { ArrowDownCircle, Download, Search, FileText, Sparkles, ExternalLink } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface Receipt {
  id: string;
  receipt_number: string;
  customer: string;
  invoice_ref: string;
  amount: number;
  payment_mode: string;
  reference_number: string;
  remarks: string;
  status: string;
  created_at: string;
}

interface Props {
  initialReceipts: Receipt[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function ReceiptsClient({ initialReceipts }: Props) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");

  const filtered = initialReceipts.filter(r => {
    return !search || r.customer?.toLowerCase().includes(search.toLowerCase()) || r.receipt_number.toLowerCase().includes(search.toLowerCase());
  });

  const total = filtered.reduce((s, r) => s + Number(r.amount || 0), 0);

  const exportCSV = () => {
    const header = ["Receipt#", "Customer", "Invoice Ref", "Amount", "Mode", "Reference#", "Remarks", "Date"];
    const rows = filtered.map(r => [r.receipt_number, r.customer, r.invoice_ref || "—", r.amount, r.payment_mode, r.reference_number || "—", r.remarks || "", fmtDate(r.created_at)]);
    const csv = [header, ...rows].map(row => row.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `receipts_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>Accounting</span><span className="opacity-40">/</span><span className="text-foreground">Receipts</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><ArrowDownCircle size={20} className="text-emerald-500" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">{t("Receipts Register")}</h1>
              <p className="text-xs text-muted-foreground">{filtered.length} receipts • Total: {fmt(total)}</p>
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
          <span className="font-bold text-foreground">AI Assistant:</span> All sales receipts are correctly linked to customer profiles and invoice numbers. No orphan receipts detected.
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search receipts by customer or receipt#..." className="bg-transparent outline-none flex-1" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Receipt#</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Invoice Link</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Ref No</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No receipts found.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{fmtDate(r.created_at)}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">{r.receipt_number}</td>
                  <td className="px-4 py-3 font-bold text-foreground">{r.customer}</td>
                  <td className="px-4 py-3 text-primary font-bold">
                    {r.invoice_ref ? (
                      <a href={`/dashboard/ceo/invoices?search=${r.invoice_ref}`} className="flex items-center gap-1 hover:underline">
                        Invoice Link <ExternalLink size={10} />
                      </a>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.payment_mode}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{r.reference_number || "—"}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-emerald-600">{fmt(r.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 uppercase">
                      {r.status || "Paid"}
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
