"use client";
import React, { useState } from "react";
import { ShoppingCart, Download, Search } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
export function PurchaseBillsClient({ initialData }: { initialData: any[] }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const filtered = initialData.filter(d => !search || d.vendor_name?.toLowerCase().includes(search.toLowerCase()) || d.bill_number?.toLowerCase().includes(search.toLowerCase()));
  const totalAmount = filtered.reduce((s, d) => s + Number(d.total_amount || 0), 0);
  const exportCSV = () => {
    const csv = ["Bill#,Vendor,Amount,GST,Status,Date", ...filtered.map(d => [d.bill_number || d.id?.slice(0,8), d.vendor_name, d.total_amount, d.gst_amount, d.status, fmtDate(d.created_at)].join(","))].join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv); a.download = `purchase_bills_${Date.now()}.csv`; a.click();
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1"><span>CA Workspace</span><span className="opacity-40">/</span><span>Audit</span><span className="opacity-40">/</span><span className="text-foreground">Purchase Bills</span></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20"><ShoppingCart size={20} className="text-amber-500" /></div><div><h1 className="text-xl font-black text-foreground">{t("Purchase Bills")}</h1><p className="text-xs text-muted-foreground">{filtered.length} bills • Total: {fmt(totalAmount)} — Read-only</p></div></div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90"><Download size={13} /> Export CSV</button>
      </div>
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
        <Search size={13} className="text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by vendor or bill number..." className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground" />
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-xs text-left"><thead className="border-b border-border bg-muted/30"><tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider"><th className="px-4 py-3">Bill #</th><th className="px-4 py-3">Vendor</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-right">GST</th><th className="px-4 py-3 text-center">Status</th></tr></thead>
        <tbody>{filtered.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No purchase bills found.</td></tr>
          : filtered.map((d, i) => (
          <tr key={i} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
            <td className="px-4 py-3 font-mono text-muted-foreground text-[10px]">{d.bill_number || d.id?.slice(0,8) || "—"}</td>
            <td className="px-4 py-3 font-semibold text-foreground">{d.vendor_name || "Unknown"}</td>
            <td className="px-4 py-3 font-mono text-muted-foreground">{fmtDate(d.created_at)}</td>
            <td className="px-4 py-3 text-right font-bold text-foreground">{fmt(d.total_amount || 0)}</td>
            <td className="px-4 py-3 text-right text-amber-600">{fmt(d.gst_amount || 0)}</td>
            <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded text-[10px] font-black border capitalize ${d.status === "approved" || d.status === "paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}>{d.status || "pending"}</span></td>
          </tr>
        ))}</tbody></table></div></div>
    </div>
  );
}
