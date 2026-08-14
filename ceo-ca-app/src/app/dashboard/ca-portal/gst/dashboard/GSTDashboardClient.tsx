"use client";
import React, { useState, useTransition } from "react";
import { Calculator, Download, TrendingUp, TrendingDown, AlertCircle, CheckCircle, FileSpreadsheet } from "lucide-react";
import { getGSTDashboardData } from "../../actions";
import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";
const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
export function GSTDashboardClient({ initialData }: { initialData: any }) {
  const { t } = useLanguage();
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const refresh = () => startTransition(async () => {
    const res = await getGSTDashboardData();
    if (res.success && res.data) setData(res.data);
  });
  const gstPositive = (data?.gstPayable || 0) >= 0;
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1"><span>CA Workspace</span><span className="opacity-40">/</span><span>GST & Tax</span><span className="opacity-40">/</span><span className="text-foreground">GST Dashboard</span></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Calculator size={20} className="text-primary" /></div><div><h1 className="text-xl font-black text-foreground">{t("GST Dashboard")}</h1><p className="text-xs text-muted-foreground">GST compliance center • {data?.financialYear}</p></div></div>
          <button onClick={refresh} disabled={isPending} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold cursor-pointer hover:bg-primary/20 transition-all">{isPending ? "Loading..." : "↻ Refresh"}</button>
        </div>
      </div>
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Output GST (Sales)", value: fmt(data?.monthlyOutputGST || 0), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Input GST (Purchases)", value: fmt(data?.monthlyInputGST || 0), icon: TrendingDown, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
          { label: "GST Payable", value: fmt(data?.gstPayable || 0), icon: Calculator, color: gstPositive ? "text-rose-500" : "text-emerald-500", bg: gstPositive ? "bg-rose-500/10 border-rose-500/20" : "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Pending GSTR-1", value: String(data?.pendingGSTR1 || 0), icon: AlertCircle, color: "text-violet-500", bg: "bg-violet-500/10 border-violet-500/20" },
        ].map((k, i) => { const Icon = k.icon; return (
          <div key={i} className={`bg-card border ${k.bg} rounded-2xl p-4`}>
            <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-black text-muted-foreground uppercase">{t(k.label)}</span><Icon size={13} className={k.color} /></div>
            <p className="text-xl font-black text-foreground">{k.value}</p>
          </div>
        );})}
      </div>
      {/* Returns Status */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-foreground">GST Returns Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "GSTR-1", desc: "Outward supplies", status: "pending", due: "11th of next month" },
            { name: "GSTR-3B", desc: "Monthly summary return", status: "pending", due: "20th of next month" },
            { name: "GSTR-2A", desc: "Auto-drafted inward", status: "auto", due: "Auto populated" },
          ].map((r, i) => (
            <div key={i} className="border border-border rounded-xl p-4 flex items-center justify-between">
              <div><p className="text-sm font-bold text-foreground">{r.name}</p><p className="text-[10px] text-muted-foreground">{r.desc}</p><p className="text-[10px] text-muted-foreground font-mono mt-1">Due: {r.due}</p></div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${r.status === "filed" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : r.status === "auto" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Purchase Register", href: "/dashboard/ca-portal/gst/purchase-register", icon: FileSpreadsheet },
          { label: "Sales Register", href: "/dashboard/ca-portal/gst/sales-register", icon: TrendingUp },
          { label: "Reconciliation", href: "/dashboard/ca-portal/gst/reconciliation", icon: CheckCircle },
          { label: "Tax Reports", href: "/dashboard/ca-portal/gst/tax-reports", icon: Download },
        ].map((l, i) => { const Icon = l.icon; return (
          <Link key={i} href={l.href} className="flex items-center gap-2 p-3 rounded-xl border border-border hover:bg-muted/40 transition-all text-xs font-semibold text-foreground">
            <Icon size={13} className="text-primary" />{t(l.label)}
          </Link>
        );})}
      </div>
    </div>
  );
}
