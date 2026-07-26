"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileBarChart, Download, Search, TrendingUp, Calendar, ArrowUpRight,
  DollarSign, Landmark, Receipt, FileText, CheckCircle2, AlertCircle,
  Filter, Sparkles, PieChart, Layers, Printer, ShieldCheck, ArrowDownRight
} from "lucide-react";

interface FinanceReportData {
  summary: {
    total_income: number;
    cogs: number;
    gross_profit: number;
    gross_margin_pct: string;
    total_expenses: number;
    net_profit: number;
    net_margin_pct: string;
    output_gst: number;
    input_gst_credit: number;
    net_payable_gst: number;
  };
  expense_breakdown: Array<{
    category: string;
    amount: number;
    percentage: string;
  }>;
  transactions: Array<{
    date: string;
    ref_no: string;
    type: string;
    category: string;
    amount: number;
    payment_mode: string;
    status: string;
  }>;
}

interface Props {
  initialData: FinanceReportData;
}

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export function FinanceReportClient({ initialData }: Props) {
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const report = initialData?.summary ? initialData : {
    summary: {
      total_income: 1284500,
      cogs: 890000,
      gross_profit: 394500,
      gross_margin_pct: "30.7%",
      total_expenses: 142000,
      net_profit: 252500,
      net_margin_pct: "19.6%",
      output_gst: 231210,
      input_gst_credit: 160200,
      net_payable_gst: 71010
    },
    expense_breakdown: [
      { category: "Staff Wages & Salaries", amount: 63900, percentage: "45%" },
      { category: "Showroom Rent & Maintenance", amount: 42600, percentage: "30%" },
      { category: "Electricity & Utility Bills", amount: 21300, percentage: "15%" },
      { category: "Daily Store Refreshments & Misc", amount: 14200, percentage: "10%" }
    ],
    transactions: [
      { date: "2026-07-26", ref_no: "VOUCH-2026-041", type: "Sales Income", category: "Billing Revenue", amount: 57702, payment_mode: "UPI Scan", status: "Audited" },
      { date: "2026-07-25", ref_no: "VOUCH-2026-040", type: "Store Expense", category: "Showroom Electricity Bill", amount: 8400, payment_mode: "Bank Transfer", status: "Audited" },
      { date: "2026-07-24", ref_no: "VOUCH-2026-039", type: "Staff Salary", category: "Tinting Master July Wage", amount: 22000, payment_mode: "Cash", status: "Audited" },
      { date: "2026-07-22", ref_no: "VOUCH-2026-038", type: "Supplier Purchase", category: "Factory Paint Restock COGS", amount: 142000, payment_mode: "Bank RTGS", status: "Audited" },
      { date: "2026-07-20", ref_no: "VOUCH-2026-037", type: "Sales Income", category: "Billing Revenue", amount: 42010, payment_mode: "UPI Scan", status: "Audited" }
    ]
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredTransactions = useMemo(() => {
    return report.transactions.filter(t => {
      const s = search.toLowerCase();
      const matchSearch = !search || t.ref_no.toLowerCase().includes(s) || t.category.toLowerCase().includes(s) || t.type.toLowerCase().includes(s);
      const matchType = typeFilter === "all" || t.type.toLowerCase() === typeFilter.toLowerCase();
      return matchSearch && matchType;
    });
  }, [report.transactions, search, typeFilter]);

  const handleExportCSV = () => {
    const headers = ["Date", "Voucher Ref", "Type", "Category", "Amount", "Payment Mode", "Audit Status"];
    const rows = report.transactions.map(t => [
      t.date, t.ref_no, t.type, t.category, t.amount, t.payment_mode, t.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Dealer_Financial_P&L_Report_${timeframe}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) {
    return (
      <div className="p-12 text-center text-xs font-bold text-muted-foreground animate-pulse bg-card rounded-2xl border border-border">
        Loading Dealer Profitability & Financial Audit Report...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── Top Header Navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Reports</span><span className="opacity-40">/</span><span className="text-foreground">Finance Reports</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <FileBarChart size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                Dealer Profit & Loss (P&L) Financial Audit Report
              </h1>
              <p className="text-xs text-muted-foreground">
                Comprehensive store revenue, COGS, operating expenses, net profit margins, and GST tax liability audit
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-bold hover:bg-muted transition-all cursor-pointer shadow-2xs"
          >
            <Download size={14} /> Export Financial CSV
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-black hover:bg-primary/90 transition-all cursor-pointer shadow-md"
          >
            <Printer size={14} /> Print P&L Statement
          </button>
        </div>
      </div>

      {/* ── Time-Period Filter Controls ─────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 bg-card border border-border p-3.5 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <Calendar size={15} className="text-primary" /> Financial Audit Period:
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border">
          {[
            { id: "monthly", label: "This Month (July 2026)" },
            { id: "quarterly", label: "Quarterly (Q3)" },
            { id: "yearly", label: "Financial Year (FY26)" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                timeframe === t.id
                  ? "bg-primary text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── EXECUTIVE P&L SUMMARY CARDS ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Gross Sales Revenue</span>
          <p className="text-2xl font-black text-emerald-600 font-mono">{fmt(report.summary.total_income)}</p>
          <p className="text-[11px] text-muted-foreground">Total Customer Invoices</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Cost of Goods Sold (COGS)</span>
          <p className="text-2xl font-black text-foreground font-mono">{fmt(report.summary.cogs)}</p>
          <p className="text-[11px] text-muted-foreground">Factory Paint Purchase</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Gross Profit</span>
          <p className="text-2xl font-black text-primary font-mono">{fmt(report.summary.gross_profit)}</p>
          <p className="text-[11px] text-emerald-600 font-bold font-mono">{report.summary.gross_margin_pct} Gross Margin</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Store Operating Costs</span>
          <p className="text-2xl font-black text-amber-500 font-mono">{fmt(report.summary.total_expenses)}</p>
          <p className="text-[11px] text-muted-foreground">Rent, Wages & Utilities</p>
        </div>

        <div className="bg-card border-2 border-emerald-500/50 rounded-3xl p-5 space-y-2 shadow-md bg-emerald-500/5">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">Net Operating Profit</span>
          <p className="text-2xl font-black text-emerald-600 font-mono">{fmt(report.summary.net_profit)}</p>
          <p className="text-[11px] text-emerald-700 font-black font-mono">{report.summary.net_margin_pct} Net Profit Margin 🎉</p>
        </div>
      </div>

      {/* ── GST TAX AUDIT & EXPENSE BREAKDOWN ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GST TAX AUDIT CARD */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Landmark size={16} className="text-primary" /> GST Tax Liability & ITC Audit
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground">GSTIN: 08AAACS1234F1Z1</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center bg-muted/40 p-3 rounded-2xl border border-border">
              <span className="text-muted-foreground">Output GST Collected (18% Sales):</span>
              <span className="font-mono font-black text-foreground">{fmt(report.summary.output_gst)}</span>
            </div>

            <div className="flex justify-between items-center bg-muted/40 p-3 rounded-2xl border border-border">
              <span className="text-muted-foreground">Input Tax Credit / ITC (Factory Bills):</span>
              <span className="font-mono font-black text-emerald-600">-{fmt(report.summary.input_gst_credit)}</span>
            </div>

            <div className="flex justify-between items-center bg-primary/10 p-3.5 rounded-2xl border border-primary/20">
              <span className="font-bold text-foreground">Net Payable GST Liability:</span>
              <span className="font-mono font-black text-primary text-base">{fmt(report.summary.net_payable_gst)}</span>
            </div>
          </div>
        </div>

        {/* EXPENSE BREAKDOWN */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <PieChart size={16} className="text-amber-500" /> Store Expense Category Split
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground">Total: {fmt(report.summary.total_expenses)}</span>
          </div>

          <div className="space-y-3">
            {report.expense_breakdown.map((exp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">{exp.category}</span>
                  <span className="font-mono text-amber-600">{fmt(exp.amount)} ({exp.percentage})</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${exp.percentage}` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FINANCIAL LEDGER VOUCHERS TABLE ─────────────────────────────── */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-primary" />
            <h2 className="text-base font-black text-foreground uppercase tracking-wider">
              Financial Ledger & Audit Vouchers ({filteredTransactions.length} Entries)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search ref voucher, category..."
                className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none focus:border-primary"
            >
              <option value="all">All Voucher Types</option>
              <option value="sales income">Sales Income</option>
              <option value="store expense">Store Expenses</option>
              <option value="staff salary">Staff Salaries</option>
              <option value="supplier purchase">Supplier Restock</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Ref Voucher No</th>
                <th className="py-3 px-3">Voucher Type</th>
                <th className="py-3 px-3">Category / Description</th>
                <th className="py-3 px-3 text-right">Amount (₹)</th>
                <th className="py-3 px-3 text-center">Payment Mode</th>
                <th className="py-3 px-3 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredTransactions.map(t => (
                <tr key={t.ref_no} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-3 font-mono text-muted-foreground">
                    {t.date}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-primary">
                    {t.ref_no}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      t.type === "Sales Income"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-muted text-foreground border-border"
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-foreground">
                    {t.category}
                  </td>
                  <td className={`py-3 px-3 text-right font-mono font-black ${
                    t.type === "Sales Income" ? "text-emerald-600" : "text-foreground"
                  }`}>
                    {t.type === "Sales Income" ? `+${fmt(t.amount)}` : `-${fmt(t.amount)}`}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-foreground">
                    {t.payment_mode}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase flex items-center justify-center gap-1">
                      <ShieldCheck size={12} /> {t.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                    No ledger transactions match search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
