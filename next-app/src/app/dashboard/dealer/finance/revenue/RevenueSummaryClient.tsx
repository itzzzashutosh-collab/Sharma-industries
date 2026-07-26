"use client";

import React, { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  TrendingUp, Download, Search, Sparkles, CreditCard, Landmark,
  IndianRupee, ArrowUpRight, ArrowDownRight, Filter, FileText, CheckCircle2,
  Clock, ShieldAlert, PieChart, Users
} from "lucide-react";

interface Invoice {
  id: string;
  invoice_no: string;
  date: string;
  customer?: any;
  subtotal?: number;
  total_gst?: number;
  grand_total: number;
  advance_paid?: number;
  balance_due?: number;
  payment_mode?: string;
  status?: string;
}

interface Props {
  initialInvoices: Invoice[];
  initialExpenses?: any[];
}

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const INITIAL_MOCK_INVOICES: Invoice[] = [
  {
    id: "INV_001",
    invoice_no: "POS-2026-0041",
    date: "2026-07-26",
    customer: { name: "Rajesh Hardware & Paints", phone: "+91 98290 11223" },
    grand_total: 48900,
    subtotal: 41440,
    total_gst: 7460,
    advance_paid: 48900,
    balance_due: 0,
    payment_mode: "UPI",
    status: "Paid"
  },
  {
    id: "INV_002",
    invoice_no: "POS-2026-0042",
    date: "2026-07-25",
    customer: { name: "Vikram Construction Studio", phone: "+91 98290 33445" },
    grand_total: 125000,
    subtotal: 105932,
    total_gst: 19068,
    advance_paid: 50000,
    balance_due: 75000,
    payment_mode: "Credit",
    status: "Partial"
  },
  {
    id: "INV_003",
    invoice_no: "POS-2026-0043",
    date: "2026-07-24",
    customer: { name: "Sharma Paint Decorators", phone: "+91 98290 55667" },
    grand_total: 34500,
    subtotal: 29237,
    total_gst: 5263,
    advance_paid: 34500,
    balance_due: 0,
    payment_mode: "Cash",
    status: "Paid"
  }
];

export function RevenueSummaryClient({ initialInvoices }: Props) {
  const { t } = useLanguage();
  const [invoices] = useState<Invoice[]>(initialInvoices || []);

  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");

  // Calculations
  const totalRev = invoices.reduce((s, i) => s + Number(i.grand_total || 0), 0);
  const upiRev = invoices.filter(i => (i.payment_mode || "").toLowerCase() === "upi").reduce((s, i) => s + Number(i.grand_total || 0), 0);
  const cashRev = invoices.filter(i => (i.payment_mode || "").toLowerCase() === "cash").reduce((s, i) => s + Number(i.grand_total || 0), 0);
  const creditRev = invoices.filter(i => (i.payment_mode || "").toLowerCase() === "credit" || Number(i.balance_due || 0) > 0).reduce((s, i) => s + Number(i.balance_due || i.grand_total || 0), 0);

  // Filtered List
  const filtered = invoices.filter(inv => {
    const s = search.toLowerCase();
    const invNo = inv.invoice_no || "";
    const custName = typeof inv.customer === "object" ? (inv.customer?.name || "") : (inv.customer || "");
    const matchesSearch = !search || invNo.toLowerCase().includes(s) || custName.toLowerCase().includes(s);
    const matchesMode = modeFilter === "all" || (inv.payment_mode || "").toLowerCase() === modeFilter.toLowerCase();
    return matchesSearch && matchesMode;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── Top Header Navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>{t("Dealer Workspace")}</span><span className="opacity-40">/</span><span>{t("Finance")}</span><span className="opacity-40">/</span><span className="text-foreground">{t("Revenue Summary")}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <TrendingUp size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                {t("Dealer Sales Revenue Summary")}`n              </h1>
              <p className="text-xs text-muted-foreground">
                {t("Track gross sales revenue, UPI digital settlements, cash collections, and credit receivables stream")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">{t("Total Billed Sales Revenue")}</span>
          <p className="text-2xl font-black text-foreground font-mono">{fmt(totalRev)}</p>
          <p className="text-[11px] text-muted-foreground">{invoices.length} {t("Sales Invoices Generated")}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">{t("UPI & Digital Receipts")}</span>
          <p className="text-2xl font-black text-emerald-600 font-mono">{fmt(upiRev)}</p>
          <p className="text-[11px] text-emerald-700 font-bold">{t("Direct Bank Instant Settlement")}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">{t("Cash Collections")}</span>
          <p className="text-2xl font-black text-blue-600 font-mono">{fmt(cashRev)}</p>
          <p className="text-[11px] text-muted-foreground">{t("Store Cash Drawer Balances")}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">{t("Credit Sales Receivables")}</span>
          <p className="text-2xl font-black text-amber-500 font-mono">{fmt(creditRev)}</p>
          <p className="text-[11px] text-amber-600 font-bold">{t("Khata Outstanding Credit")}</p>
        </div>
      </div>

      {/* ── Filter Controls Bar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter invoice code or customer name..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold bg-muted/60 p-1 rounded-xl border border-border">
          {[
            { id: "all", label: "All Sales" },
            { id: "upi", label: "💳 UPI" },
            { id: "cash", label: "💵 Cash" },
            { id: "credit", label: "📄 Credit / Khata" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setModeFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                modeFilter === t.id
                  ? "bg-primary text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Invoiced Revenue Audit Table ────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/40 uppercase font-black text-[10px] text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">{t("Invoice #")}</th>
                <th className="px-4 py-3.5">{t("Date")}</th>
                <th className="px-4 py-3.5">{t("Customer / Client")}</th>
                <th className="px-4 py-3.5">{t("Payment Mode")}</th>
                <th className="px-4 py-3.5 text-right">{t("Taxable Subtotal")}</th>
                <th className="px-4 py-3.5 text-right">{t("GST Tax")}</th>
                <th className="px-4 py-3.5 text-right">{t("Grand Total Revenue")}</th>
                <th className="px-4 py-3.5 text-center">{t("Status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {filtered.map((inv) => {
                const custName = typeof inv.customer === "object" ? (inv.customer?.name || "Retail Customer") : (inv.customer || "Retail Customer");
                const sub = Number(inv.subtotal || inv.grand_total / 1.18);
                const tax = Number(inv.total_gst || (inv.grand_total - sub));
                const isPaid = (inv.balance_due ?? 0) <= 0 || inv.status === "Paid";
                const isCredit = (inv.payment_mode || "").toLowerCase() === "credit" || Number(inv.balance_due || 0) > 0;

                return (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-primary flex items-center gap-1.5">
                      <FileText size={14} className="text-primary/70" /> {inv.invoice_no}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground font-mono">{inv.date}</td>
                    <td className="px-4 py-3.5 font-bold text-foreground">{custName}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <span className="px-2 py-0.5 bg-muted rounded text-[11px] font-bold text-foreground border border-border uppercase">
                        {inv.payment_mode || "Cash"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-600 dark:text-slate-300">{fmt(sub)}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-muted-foreground">{fmt(tax)}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-black text-foreground text-sm">{fmt(inv.grand_total)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase font-mono tracking-wider ${
                        isPaid
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : isCredit
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      }`}>
                        {isPaid ? t("Fully Paid") : t("Credit Due")}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground font-medium">
                    {t("No revenue invoices found.")}
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
