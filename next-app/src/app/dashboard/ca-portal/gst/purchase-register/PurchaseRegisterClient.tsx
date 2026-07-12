"use client";
import React, { useState } from "react";
import { ShoppingCart, Download, Search } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const fmtNum = (n: any) => typeof n === "number" ? n.toLocaleString("en-IN") : String(n || "").slice(0, 40);

export function PurchaseRegisterClient({ initialData }: { initialData: any[] }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const filtered = initialData.filter((d: any) => !search || JSON.stringify(d).toLowerCase().includes(search.toLowerCase()));

  const exportCSV = () => {
    if (!filtered.length) return;
    const keys = Object.keys(filtered[0]).slice(0, 6);
    const csv = [keys.join(","), ...filtered.map((d: any) => keys.map(k => String(d[k] || "")).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "export_" + Date.now() + ".csv";
    a.click();
  };

  const cols = filtered.length > 0 ? Object.keys(filtered[0]).slice(0, 5) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
        <span>CA Workspace</span><span className="opacity-40">/</span><span>GST and Tax</span><span className="opacity-40">/</span><span className="text-foreground">Purchase Register</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl"><ShoppingCart size={20} className="text-primary" /></div>
          <div><h1 className="text-xl font-black text-foreground">{t("Purchase Register")}</h1><p className="text-xs text-muted-foreground">{filtered.length} entries — Read-only audit view</p></div>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90"><Download size={13} /> Export CSV</button>
      </div>
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
        <Search size={13} className="text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground" />
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                {cols.map((k, i) => <th key={i} className="px-4 py-3">{k.replace(/_/g," ")}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No data found.</td></tr>
                : filtered.map((d: any, i: number) => (
                  <tr key={i} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    {cols.map((k, j) => <td key={j} className="px-4 py-3 font-semibold text-foreground">{fmtNum(d[k])}</td>)}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}