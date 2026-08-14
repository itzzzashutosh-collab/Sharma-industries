"use client";

import React, { useRef, useState, useTransition } from "react";
import { TrendingUp, TrendingDown, Download, RefreshCw, FileText } from "lucide-react";
import { getPnLReport } from "../../actions";
import { useLanguage } from "@/components/LanguageProvider";

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

interface PnLData {
  period: string; startDate: string; endDate: string;
  revenue: number; cogs: number; grossProfit: number; grossMargin: string;
  opex: number; netProfit: number; netMargin: string;
  expenseByCategory: Record<string, number>;
}

interface Props {
  initialReport: PnLData | null;
  firmDetails: any;
}

export function PnLClient({ initialReport, firmDetails }: Props) {
  const { t } = useLanguage();
  const [report, setReport] = useState<PnLData | null>(initialReport);
  const [period, setPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [isPending, startTransition] = useTransition();
  const reportRef = useRef<HTMLDivElement>(null);

  const load = (p: "monthly" | "quarterly" | "yearly") => {
    setPeriod(p);
    startTransition(async () => {
      const res = await getPnLReport(p);
      if (res.success && res.report) setReport(res.report as PnLData);
    });
  };

  const exportCSV = () => {
    if (!report) return;
    const rows = [
      ["Particulars", "Amount (₹)"],
      ["INCOME", ""],
      ["Sales Revenue", report.revenue],
      ["", ""],
      ["COST OF GOODS SOLD", ""],
      ["Purchases", report.cogs],
      ["", ""],
      ["GROSS PROFIT", report.grossProfit],
      ["Gross Margin", `${report.grossMargin}%`],
      ["", ""],
      ["OPERATING EXPENSES", ""],
      ...Object.entries(report.expenseByCategory).map(([k, v]) => [k, v]),
      ["Total OpEx", report.opex],
      ["", ""],
      ["NET PROFIT / (LOSS)", report.netProfit],
      ["Net Margin", `${report.netMargin}%`],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `pnl_${period}_${Date.now()}.csv`; a.click();
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const opt = {
        margin: 10,
        filename: `pnl_${period}_${Date.now()}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const }
      };
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().set(opt).from(reportRef.current).save();
    } catch (err) {
      console.error(err);
      alert("Failed to export PDF");
    }
  };

  const profitPositive = (report?.netProfit || 0) >= 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Top Header bar */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>CA Workspace</span><span className="opacity-40">/</span><span>Reports</span><span className="opacity-40">/</span><span className="text-foreground">Profit & Loss</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><TrendingUp size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">{t("Profit & Loss Statement")}</h1>
              <p className="text-xs text-muted-foreground">Traceable financial summary computed directly from ERP datasets</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-border overflow-hidden text-xs">
              {(["monthly", "quarterly", "yearly"] as const).map(p => (
                <button key={p} onClick={() => load(p)} className={`px-3 py-1.5 font-bold capitalize cursor-pointer transition-colors ${period === p ? "bg-primary text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>{p}</button>
              ))}
            </div>
            <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-all shadow-sm">
              <FileText size={13} /> Export PDF
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold cursor-pointer hover:bg-primary/20 transition-all">
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {isPending && <div className="text-center text-xs text-muted-foreground py-4 flex items-center justify-center gap-2"><RefreshCw size={12} className="animate-spin" /> Generating report...</div>}

      {report && (
        <div ref={reportRef} className="space-y-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
          {/* Header block with CA Firm Details */}
          <div className="flex justify-between items-start border-b border-border pb-4">
            <div>
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">{firmDetails?.firm_name || "M/S SHARMA INDUSTRIES"}</h2>
              <p className="text-[10px] text-muted-foreground">{firmDetails?.firm_address || "Factory Road, Alwar, Rajasthan"}</p>
              <p className="text-[9px] text-muted-foreground font-mono">GSTIN: {firmDetails?.gst_number || "08AABCS1234D1Z5"} • PAN: {firmDetails?.pan_number || "AABCS1234D"}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-primary tracking-wider">CA Audit Office</span>
              <p className="text-[9px] text-muted-foreground font-mono">Generated: {new Date().toLocaleDateString("en-IN")}</p>
              <p className="text-[9px] text-muted-foreground">Financial Year: 2025-26</p>
            </div>
          </div>

          {/* Statement Name & Period */}
          <div className="py-2">
            <h3 className="text-base font-black text-foreground">Statement of Profit & Loss</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              From: {new Date(report.startDate).toLocaleDateString("en-IN")} – To: {new Date(report.endDate).toLocaleDateString("en-IN")}
            </p>
          </div>

          {/* P&L Statement Grid */}
          <div className="border border-border rounded-xl overflow-hidden divide-y divide-border/40 text-xs">
            {/* Income */}
            <div className="px-4 py-2 bg-emerald-500/5 font-black text-emerald-600 uppercase tracking-wider text-[10px]">Income</div>
            <div className="px-4 py-3 flex justify-between"><span className="text-muted-foreground">Sales Revenue</span><span className="font-bold text-emerald-600">{fmt(report.revenue)}</span></div>

            {/* COGS */}
            <div className="px-4 py-2 bg-amber-500/5 font-black text-amber-600 uppercase tracking-wider text-[10px]">Cost of Goods Sold</div>
            <div className="px-4 py-3 flex justify-between"><span className="text-muted-foreground">Purchases</span><span className="font-bold text-rose-600">({fmt(report.cogs)})</span></div>

            {/* Gross Profit */}
            <div className="px-4 py-3 flex justify-between bg-muted/30 font-bold text-foreground">
              <span>Gross Profit</span>
              <div className="text-right">
                <span className={`font-black ${report.grossProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{fmt(Math.abs(report.grossProfit))}</span>
                <span className="text-[10px] text-muted-foreground ml-2">({report.grossMargin}% margin)</span>
              </div>
            </div>

            {/* OpEx */}
            <div className="px-4 py-2 bg-rose-500/5 font-black text-rose-600 uppercase tracking-wider text-[10px]">Operating Expenses</div>
            {Object.entries(report.expenseByCategory).map(([cat, amt], i) => (
              <div key={i} className="px-4 py-2.5 flex justify-between"><span className="text-muted-foreground pl-3">{cat}</span><span className="font-semibold text-rose-600">({fmt(amt)})</span></div>
            ))}
            <div className="px-4 py-3 flex justify-between font-bold border-t border-border/60"><span className="text-foreground">Total Operating Expenses</span><span className="text-rose-600">({fmt(report.opex)})</span></div>

            {/* Net Profit */}
            <div className={`px-4 py-4 flex justify-between font-black ${profitPositive ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
              <span className="text-sm">Net {profitPositive ? "Profit" : "Loss"}</span>
              <div className="text-right">
                <span className={`text-sm ${profitPositive ? "text-emerald-600" : "text-rose-600"}`}>{fmt(Math.abs(report.netProfit))}</span>
                <span className="text-[10px] text-muted-foreground ml-2">({report.netMargin}% net margin)</span>
              </div>
            </div>
          </div>

          {/* Digital Signature & Stamp Block */}
          <div className="flex justify-between items-end pt-8 text-[10px]">
            <div>
              <p className="text-muted-foreground">Certified True Copy</p>
              <div className="border border-dashed border-border/60 rounded p-2 text-center text-muted-foreground font-mono mt-1 select-none text-[8px] bg-muted/20">
                [CA STAMP PLACEHOLDER]
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-foreground">For ABC & Associates</p>
              <p className="text-muted-foreground">Chartered Accountants</p>
              <div className="h-6 mt-1 flex items-center justify-end select-none text-[8px] font-mono text-primary bg-primary/5 px-2 border border-primary/20 rounded">
                [DIGITALLY SIGNED]
              </div>
              <p className="text-muted-foreground mt-1">Membership No: {firmDetails?.membership_number || "123456"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
