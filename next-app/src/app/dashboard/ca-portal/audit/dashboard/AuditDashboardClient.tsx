"use client";

import React, { useState } from "react";
import { LayoutDashboard, FileText, CheckCircle, AlertCircle, Sparkles, Download, ArrowRight, ShieldCheck, Activity } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";

interface UploadItem {
  name: string;
  amount: number;
  date: string;
  type: string;
}

interface Props {
  initialData: {
    pendingBills: number;
    pendingExpenses: number;
    pendingReconciliation: number;
    missingDocs: number;
    latestUploads: UploadItem[];
  } | null;
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function AuditDashboardClient({ initialData }: Props) {
  const { t } = useLanguage();
  const [data] = useState(initialData);

  const stats = [
    { label: "Pending Purchase Bills", value: data?.pendingBills || 0, desc: "Awaiting auditor check", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Pending Expenses", value: data?.pendingExpenses || 0, desc: "Pending receipt checks", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
    { label: "Reconciliation Queries", value: data?.pendingReconciliation || 0, desc: "GSTR mismatches flagged", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Missing Documents", value: data?.missingDocs || 0, desc: "No supporting bills found", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>Audit</span><span className="opacity-40">/</span><span className="text-foreground">Dashboard</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><LayoutDashboard size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Audit Dashboard</h1>
              <p className="text-xs text-muted-foreground">Digital Audit Center • Compliance Overview</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
            <ShieldCheck size={13} /> Run Full Audit Scan
          </button>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Auditor Insight:</span> Identified {data?.missingDocs || 0} expenses that have no supporting uploaded invoice files. Reconciliation scan recommended.
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <span className={`h-2 w-2 rounded-full ${s.color.replace("text-", "bg-")}`} />
            </div>
            <p className="text-2xl font-black text-foreground">{s.value}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Latest Uploads & Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Documents */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Activity size={12} className="text-primary" /> Latest Uploaded Documents</h3>
          </div>
          <div className="divide-y divide-border/40">
            {data?.latestUploads.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No documents uploaded recently.</p>
            ) : data?.latestUploads.map((u, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between hover:bg-muted/20 transition-colors px-2 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-primary/10 rounded-lg"><FileText size={12} className="text-primary" /></div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{u.name}</p>
                    <p className="text-[9px] text-muted-foreground">{fmtDate(u.date)} • {u.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-foreground">{fmt(u.amount)}</p>
                  <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-600 px-1 py-0.5 rounded border border-emerald-500/20">OCR Parsed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Quick Action Registry</h3>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { label: "Verify Purchase Bills", href: "/dashboard/ca-portal/audit/purchase-bills" },
              { label: "Verify Sales Invoices", href: "/dashboard/ca-portal/audit/sales-invoices" },
              { label: "Verify Expense Register", href: "/dashboard/ca-portal/audit/expense-register" },
              { label: "Verify Stock Valuations", href: "/dashboard/ca-portal/audit/stock-register" },
              { label: "Upload Bank Statements", href: "/dashboard/ca-portal/audit/bank-statements" },
              { label: "Audit Trails", href: "/dashboard/ca-portal/audit/audit-trail" },
            ].map((l, i) => (
              <Link key={i} href={l.href} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/40 hover:border-primary/20 transition-all text-xs font-semibold text-foreground group">
                {l.label} <ArrowRight size={12} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
