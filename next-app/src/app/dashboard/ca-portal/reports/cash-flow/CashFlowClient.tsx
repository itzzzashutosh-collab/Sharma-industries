"use client";
import React from "react";
import { LineChart, Download } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
const fmt = (n: number) => `Rs ${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
export function CashFlowClient({ revenue, purchases, expenses }: { revenue: number; purchases: number; expenses: number }) {
  const { t } = useLanguage();
  const operatingInflow = revenue;
  const operatingOutflow = purchases + expenses;
  const netOperating = operatingInflow - operatingOutflow;
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1"><span>CA Workspace</span><span className="opacity-40">/</span><span>Reports</span><span className="opacity-40">/</span><span className="text-foreground">Cash Flow</span></div>
      <div className="flex items-center gap-3"><div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><LineChart size={20} className="text-primary" /></div><div><h1 className="text-xl font-black text-foreground">{t("Cash Flow Statement")}</h1><p className="text-xs text-muted-foreground">Operating, investing and financing activities</p></div></div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border/40">
        <div className="px-5 py-2 bg-emerald-500/5 text-emerald-600 font-black text-[10px] uppercase">A. Operating Activities</div>
        <div className="px-5 py-3 flex justify-between text-xs"><span className="text-muted-foreground">Cash received from customers</span><span className="font-bold text-emerald-600">{fmt(operatingInflow)}</span></div>
        <div className="px-5 py-3 flex justify-between text-xs"><span className="text-muted-foreground">Cash paid for purchases</span><span className="font-bold text-rose-600">({fmt(purchases)})</span></div>
        <div className="px-5 py-3 flex justify-between text-xs"><span className="text-muted-foreground">Cash paid for expenses</span><span className="font-bold text-rose-600">({fmt(expenses)})</span></div>
        <div className="px-5 py-4 flex justify-between bg-muted/30"><span className="font-black text-foreground">Net Cash from Operating Activities</span><span className={`font-black text-lg ${netOperating >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{fmt(Math.abs(netOperating))}</span></div>
        <div className="px-5 py-2 bg-blue-500/5 text-blue-600 font-black text-[10px] uppercase">B. Investing Activities</div>
        <div className="px-5 py-3 flex justify-between text-xs"><span className="text-muted-foreground">Capital expenditure</span><span className="text-muted-foreground">— Not recorded</span></div>
        <div className="px-5 py-2 bg-violet-500/5 text-violet-600 font-black text-[10px] uppercase">C. Financing Activities</div>
        <div className="px-5 py-3 flex justify-between text-xs"><span className="text-muted-foreground">Loans / Capital infusion</span><span className="text-muted-foreground">— Not recorded</span></div>
        <div className="px-5 py-4 flex justify-between bg-muted/30"><span className="font-black text-foreground">Net Change in Cash</span><span className={`font-black text-lg ${netOperating >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{fmt(Math.abs(netOperating))}</span></div>
      </div>
    </div>
  );
}