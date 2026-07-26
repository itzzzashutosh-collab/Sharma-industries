"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileSpreadsheet, Download, Search, TrendingUp, Calendar, ArrowUpRight,
  DollarSign, Package, Users, Receipt, FileText, CheckCircle2, AlertCircle,
  Filter, Sparkles, PieChart, Layers, Printer, ShieldCheck
} from "lucide-react";

interface SalesReportData {
  summary: {
    total_revenue: number;
    revenue_growth: string;
    total_liters: number;
    liters_growth: string;
    total_invoices: number;
    avg_order_value: number;
    total_gst_tax: number;
    khata_outstanding: number;
  };
  category_breakdown: Array<{
    name: string;
    revenue: number;
    liters: number;
    percentage: string;
  }>;
  customer_type_split: Array<{
    type: string;
    revenue: number;
    percentage: number;
  }>;
  recent_invoices: Array<{
    invoice_no: string;
    customer_name: string;
    customer_type: string;
    items_count: number;
    liters_sold: number;
    tax_amount: number;
    net_amount: number;
    payment_mode: string;
    status: string;
    date: string;
  }>;
}

interface Props {
  initialData: SalesReportData;
}

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export function SalesReportClient({ initialData }: Props) {
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<"today" | "weekly" | "monthly" | "quarterly" | "yearly">("monthly");
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const report = initialData?.summary ? initialData : {
    summary: {
      total_revenue: 1284500,
      revenue_growth: "+24.5%",
      total_liters: 2850,
      liters_growth: "+18.2%",
      total_invoices: 142,
      avg_order_value: 9045,
      total_gst_tax: 231210,
      khata_outstanding: 185000
    },
    category_breakdown: [
      { name: "Interior Emulsions", revenue: 542000, liters: 1200, percentage: "42%" },
      { name: "Exterior Waterproofing", revenue: 385000, liters: 850, percentage: "30%" },
      { name: "Royale Texture Art", revenue: 215000, liters: 450, percentage: "17%" },
      { name: "Primers & Undercoats", revenue: 142500, liters: 350, percentage: "11%" }
    ],
    customer_type_split: [
      { type: "Contractor / Painter Billing", revenue: 873460, percentage: 68 },
      { type: "Walk-in Retail Customers", revenue: 282590, percentage: 22 },
      { type: "Builder Bulk Projects", revenue: 128450, percentage: 10 }
    ],
    recent_invoices: [
      { invoice_no: "INV-2026-0891", customer_name: "Rajesh Kumar Painter", customer_type: "Contractor", items_count: 5, liters_sold: 110, tax_amount: 8802, net_amount: 57702, payment_mode: "UPI Scan", status: "Paid", date: "2026-07-26" },
      { invoice_no: "INV-2026-0890", customer_name: "Anita Sharma (Retail)", customer_type: "Walk-in Retail", items_count: 2, liters_sold: 20, tax_amount: 763, net_amount: 5003, payment_mode: "Cash", status: "Paid", date: "2026-07-25" },
      { invoice_no: "INV-2026-0889", customer_name: "Vikram Singh Saini", customer_type: "Contractor", items_count: 8, liters_sold: 180, tax_amount: 14500, net_amount: 95060, payment_mode: "Credit Khata", status: "Pending Khata", date: "2026-07-24" },
      { invoice_no: "INV-2026-0888", customer_name: "Civil Lines Villa Site", customer_type: "Builder Bulk", items_count: 12, liters_sold: 340, tax_amount: 27800, net_amount: 182200, payment_mode: "Bank RTGS", status: "Paid", date: "2026-07-22" },
      { invoice_no: "INV-2026-0887", customer_name: "Mukesh Contractor", customer_type: "Contractor", items_count: 4, liters_sold: 80, tax_amount: 6410, net_amount: 42010, payment_mode: "UPI Scan", status: "Paid", date: "2026-07-20" }
    ]
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredInvoices = useMemo(() => {
    return report.recent_invoices.filter(inv => {
      const s = search.toLowerCase();
      const matchSearch = !search || inv.invoice_no.toLowerCase().includes(s) || inv.customer_name.toLowerCase().includes(s) || inv.payment_mode.toLowerCase().includes(s);
      const matchPayment = paymentFilter === "all" || inv.status.toLowerCase() === paymentFilter.toLowerCase();
      return matchSearch && matchPayment;
    });
  }, [report.recent_invoices, search, paymentFilter]);

  const handleExportCSV = () => {
    const headers = ["Invoice No", "Date", "Customer Name", "Type", "Liters", "Tax Amount", "Net Total", "Payment Mode", "Status"];
    const rows = report.recent_invoices.map(inv => [
      inv.invoice_no, inv.date, inv.customer_name, inv.customer_type, inv.liters_sold, inv.tax_amount, inv.net_amount, inv.payment_mode, inv.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Dealer_Sales_Report_${timeframe}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) {
    return (
      <div className="p-12 text-center text-xs font-bold text-muted-foreground animate-pulse bg-card rounded-2xl border border-border">
        Loading Dealer Sales Analytics & Revenue Intelligence...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── Top Header Navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Reports</span><span className="opacity-40">/</span><span className="text-foreground">Sales Reports</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <FileSpreadsheet size={22} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                Dealer Sales & Revenue Performance Report
              </h1>
              <p className="text-xs text-muted-foreground">
                Real-time store billing summary, GST tax calculations, paint liters sold, and contractor sales split
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-bold hover:bg-muted transition-all cursor-pointer shadow-2xs"
          >
            <Download size={14} /> Export Sales CSV
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-black hover:bg-primary/90 transition-all cursor-pointer shadow-md"
          >
            <Printer size={14} /> Print Audit Report
          </button>
        </div>
      </div>

      {/* ── Time-Period Filter Bar ──────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 bg-card border border-border p-3.5 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <Calendar size={15} className="text-primary" /> Report Timeframe:
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border">
          {[
            { id: "today", label: "Today" },
            { id: "weekly", label: "This Week" },
            { id: "monthly", label: "This Month (July)" },
            { id: "quarterly", label: "Quarterly (Q3)" },
            { id: "yearly", label: "Financial Year (FY26)" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                timeframe === t.id
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI METRICS CARDS ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Gross Sales Revenue</span>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-[10px] font-bold flex items-center gap-0.5">
              <ArrowUpRight size={12} /> {report.summary.revenue_growth}
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 font-mono">{fmt(report.summary.total_revenue)}</p>
          <p className="text-[11px] text-muted-foreground">{report.summary.total_invoices} Invoices Generated</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Total Paint Volume Sold</span>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-[10px] font-bold flex items-center gap-0.5">
              <ArrowUpRight size={12} /> {report.summary.liters_growth}
            </span>
          </div>
          <p className="text-2xl font-black text-foreground font-mono">{report.summary.total_liters.toLocaleString("en-IN")} Liters</p>
          <p className="text-[11px] text-muted-foreground">Emulsion, Primer & Polishes</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">GST Tax Collected (18%)</span>
          <p className="text-2xl font-black text-primary font-mono">{fmt(report.summary.total_gst_tax)}</p>
          <p className="text-[11px] text-muted-foreground">CGST (9%) + SGST (9%) Output</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Pending Khata Credit</span>
          <p className="text-2xl font-black text-amber-500 font-mono">{fmt(report.summary.khata_outstanding)}</p>
          <p className="text-[11px] text-muted-foreground">Outstanding Contractor Credit</p>
        </div>
      </div>

      {/* ── SALES BREAKDOWN: CUSTOMER TYPES & CATEGORIES ───────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CUSTOMER TYPE SALES SPLIT */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-primary" /> Sales Channel & Customer Split
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground">100% Billing Volume</span>
          </div>

          <div className="space-y-4">
            {report.customer_type_split.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">{item.type}</span>
                  <span className="font-mono text-emerald-600">{fmt(item.revenue)} ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0 ? "bg-primary" : idx === 1 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP PRODUCT CATEGORY REVENUE */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} className="text-amber-500" /> Category Wise Revenue Breakdown
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground">4 Categories</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {report.category_breakdown.map((cat, idx) => (
              <div key={idx} className="bg-muted/40 p-3.5 rounded-2xl border border-border space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase block truncate">{cat.name}</span>
                <p className="font-mono font-black text-foreground text-sm">{fmt(cat.revenue)}</p>
                <p className="text-[10px] text-emerald-600 font-bold font-mono">{cat.liters} L • {cat.percentage}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RECENT INVOICED TRANSACTIONS TABLE ──────────────────────────── */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-primary" />
            <h2 className="text-base font-black text-foreground uppercase tracking-wider">
              Store Sales Invoices Log ({filteredInvoices.length} Bills)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search invoice #, customer..."
                className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>

            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none focus:border-primary"
            >
              <option value="all">All Payment Status</option>
              <option value="paid">Paid Bills</option>
              <option value="pending khata">Pending Khata</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-3">Invoice No</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer / Contractor</th>
                <th className="py-3 px-3">Channel Type</th>
                <th className="py-3 px-3 text-right">Liters Sold</th>
                <th className="py-3 px-3 text-right">GST Tax (₹)</th>
                <th className="py-3 px-3 text-right">Net Bill Amount</th>
                <th className="py-3 px-3 text-center">Payment Mode</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredInvoices.map(inv => (
                <tr key={inv.invoice_no} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-3 font-mono font-black text-primary">
                    {inv.invoice_no}
                  </td>
                  <td className="py-3 px-3 font-mono text-muted-foreground">
                    {inv.date}
                  </td>
                  <td className="py-3 px-3 font-bold text-foreground">
                    {inv.customer_name}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[10px] font-bold border border-border">
                      {inv.customer_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-foreground">
                    {inv.liters_sold} L
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                    {fmt(inv.tax_amount)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-emerald-600">
                    {fmt(inv.net_amount)}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-foreground">
                    {inv.payment_mode}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      inv.status === "Paid"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-xs text-muted-foreground">
                    No matching sales invoices found.
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
