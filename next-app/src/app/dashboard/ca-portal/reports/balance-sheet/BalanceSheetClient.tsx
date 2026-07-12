"use client";
import React from "react";
import { Scale, Download } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
const fmt = (n: number) => `Rs ${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
export function BalanceSheetClient({ stockValue, revenue, purchases }: { stockValue: number; revenue: number; purchases: number }) {
  const { t } = useLanguage();
  const assets = [
    { name: "Closing Stock (Finished Goods + RM)", amount: stockValue },
    { name: "Trade Receivables (Debtors)", amount: revenue * 0.3 },
    { name: "Cash & Bank Balances", amount: revenue * 0.1 },
  ];
  const liabilities = [
    { name: "Trade Payables (Creditors)", amount: purchases * 0.4 },
    { name: "GST Payable", amount: revenue * 0.05 },
    { name: "Owners Capital (Equity)", amount: assets.reduce((s,a)=>s+a.amount,0) - purchases*0.4 - revenue*0.05 },
  ];
  const totalA = assets.reduce((s,a)=>s+a.amount,0);
  const totalL = liabilities.reduce((s,l)=>s+l.amount,0);
  const exportCSV = () => {
    const rows = [["Account","Assets","Liabilities"],...assets.map(a=>[a.name,a.amount,""]),...liabilities.map(l=>[l.name,"",l.amount]),["TOTAL",totalA,totalL]];
    const csv = rows.map(r=>r.join(",")).join("\n");
    const a = document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="balance_sheet.csv"; a.click();
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1"><span>CA Workspace</span><span className="opacity-40">/</span><span>Reports</span><span className="opacity-40">/</span><span className="text-foreground">Balance Sheet</span></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Scale size={20} className="text-primary" /></div><div><h1 className="text-xl font-black text-foreground">{t("Balance Sheet")}</h1><p className="text-xs text-muted-foreground">Assets and liabilities as at today — illustrative</p></div></div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90"><Download size={13} /> Export CSV</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-blue-500/20 rounded-2xl overflow-hidden"><div className="px-4 py-3 bg-blue-500/5 border-b border-blue-500/20 font-black text-blue-600 text-xs uppercase">ASSETS</div><div className="divide-y divide-border/40">{assets.map((a,i)=><div key={i} className="px-4 py-3 flex justify-between text-xs hover:bg-muted/20 transition-colors"><span className="text-muted-foreground">{a.name}</span><span className="font-bold text-foreground">{fmt(a.amount)}</span></div>)}<div className="px-4 py-3 flex justify-between bg-muted/30 font-black text-sm"><span>TOTAL ASSETS</span><span className="text-blue-600">{fmt(totalA)}</span></div></div></div>
        <div className="bg-card border border-rose-500/20 rounded-2xl overflow-hidden"><div className="px-4 py-3 bg-rose-500/5 border-b border-rose-500/20 font-black text-rose-600 text-xs uppercase">LIABILITIES & EQUITY</div><div className="divide-y divide-border/40">{liabilities.map((l,i)=><div key={i} className="px-4 py-3 flex justify-between text-xs hover:bg-muted/20 transition-colors"><span className="text-muted-foreground">{l.name}</span><span className="font-bold text-foreground">{fmt(l.amount)}</span></div>)}<div className="px-4 py-3 flex justify-between bg-muted/30 font-black text-sm"><span>TOTAL L + E</span><span className="text-rose-600">{fmt(totalL)}</span></div></div></div>
      </div>
    </div>
  );
}