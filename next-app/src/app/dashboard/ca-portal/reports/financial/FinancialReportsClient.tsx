"use client";
import React from "react";
import { FileBarChart } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";
const reports = [
  { title: "Profit & Loss", desc: "Monthly, quarterly or yearly P&L statement", href: "/dashboard/ca-portal/reports/pnl", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  { title: "Balance Sheet", desc: "Assets, liabilities and equity position", href: "/dashboard/ca-portal/reports/balance-sheet", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { title: "Trial Balance", desc: "All ledger balances — debit vs credit", href: "/dashboard/ca-portal/reports/trial-balance", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
  { title: "Cash Flow Statement", desc: "Operating, investing, financing activities", href: "/dashboard/ca-portal/reports/cash-flow", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
];
export function FinancialReportsClient() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1"><span>CA Workspace</span><span className="opacity-40">/</span><span className="text-foreground">Financial Reports</span></div>
      <div className="flex items-center gap-3"><div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><FileBarChart size={20} className="text-primary" /></div><div><h1 className="text-xl font-black text-foreground">{t("Financial Reports")}</h1><p className="text-xs text-muted-foreground">All financial statements in one place</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r, i) => (
          <Link key={i} href={r.href} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all group">
            <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${r.color} mb-3`}>{r.title}</div>
            <p className="text-xs text-muted-foreground">{r.desc}</p>
            <p className="text-xs text-primary mt-3 font-bold group-hover:underline">Open Report →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}