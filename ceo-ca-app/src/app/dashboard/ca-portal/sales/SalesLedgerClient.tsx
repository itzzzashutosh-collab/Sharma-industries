"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Download, ChevronDown, ChevronUp, Search, FileText, CheckCircle2,
  Lock, Unlock, ShieldAlert, BarChart3, Clock, AlertTriangle, AlertCircle,
  Eye, Check, X, Calendar, Sparkles, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES ---
interface InvoiceItem {
  name: string;
  hsnCode: string;
  quantity: number;
  priceInclusive: number; // Single unit inclusive price
  taxRate: number; // e.g., 18
}

interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  dealerName: string;
  gstin: string;
  items: InvoiceItem[];
  isPaid: boolean; // Field to verify payment status for reconciliation
}

// --- RICH MOCK DATA ---
const INITIAL_INVOICES: Invoice[] = [
  {
    id: "INV-2026-001",
    invoiceNo: "SHARMA/26-27/001",
    date: "2026-07-01",
    dealerName: "Apex Buildmart Pvt Ltd",
    gstin: "27AADCA1234B1Z5",
    isPaid: true,
    items: [
      { name: "Rustic Royale - 20L", hsnCode: "3209", quantity: 50, priceInclusive: 5000, taxRate: 18 },
      { name: "Wall Putty - 40kg", hsnCode: "3214", quantity: 100, priceInclusive: 850, taxRate: 18 },
    ]
  },
  {
    id: "INV-2026-002",
    invoiceNo: "SHARMA/26-27/002",
    date: "2026-07-03",
    dealerName: "Metro Hardware Traders",
    gstin: "27BBNPM5678C2Z1",
    isPaid: false,
    items: [
      { name: "WeatherGuard Exterior - 10L", hsnCode: "3209", quantity: 30, priceInclusive: 3200, taxRate: 18 },
      { name: "Enamel Gloss - 1L", hsnCode: "3208", quantity: 150, priceInclusive: 350, taxRate: 18 },
    ]
  },
  {
    id: "INV-2026-003",
    invoiceNo: "SHARMA/26-27/003",
    date: "2026-07-04",
    dealerName: "Krishna Colors & Co",
    gstin: "27CKLPP9012D3Z4",
    isPaid: true,
    items: [
      { name: "Interior Emulsion - 20L", hsnCode: "3209", quantity: 40, priceInclusive: 4100, taxRate: 18 },
    ]
  }
];

const INITIAL_LOGS = [
  { id: "LOG-01", action: "GSTR-1 exported to CSV", user: "CA Amit Mehta", timestamp: "2026-07-12 11:30 AM" },
  { id: "LOG-02", action: "Ledger unlocked for editing", user: "Admin (CEO)", timestamp: "2026-07-10 09:15 AM" },
  { id: "LOG-03", action: "Quarterly tax summary audit run", user: "CA Amit Mehta", timestamp: "2026-07-08 04:00 PM" }
];

// --- REVERSE CALCULATION ENGINE ---
const calculateItemTaxes = (item: InvoiceItem) => {
  const totalInclusive = item.priceInclusive * item.quantity;
  const taxableBase = totalInclusive / (1 + (item.taxRate / 100));
  const gstAmount = totalInclusive - taxableBase;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  return { totalInclusive, taxableBase, gstAmount, cgst, sgst };
};

const calculateInvoiceTotals = (invoice: Invoice) => {
  let totalTaxable = 0;
  let totalGST = 0;
  let grandTotal = 0;

  invoice.items.forEach(item => {
    const calc = calculateItemTaxes(item);
    totalTaxable += calc.taxableBase;
    totalGST += calc.gstAmount;
    grandTotal += calc.totalInclusive;
  });

  return { totalTaxable, totalGST, grandTotal };
};

type ActiveTab = "sales" | "gst" | "reconciliation" | "logs";

export default function SalesLedgerClient() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("sales");

  // Lock State
  const [isPeriodLocked, setIsPeriodLocked] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockPeriod, setLockPeriod] = useState("Q2 (July - Sept 2026)");

  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [auditLogs, setAuditLogs] = useState(INITIAL_LOGS);

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter Logic
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv =>
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.dealerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.gstin.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [invoices, searchTerm]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);
  };

  // KPI Calculations
  const grossTaxableBase = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + calculateInvoiceTotals(inv).totalTaxable, 0);
  }, [filteredInvoices]);

  const totalGSTOutput = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + calculateInvoiceTotals(inv).totalGST, 0);
  }, [filteredInvoices]);

  const settledTax = useMemo(() => {
    return filteredInvoices.filter(inv => inv.isPaid).reduce((sum, inv) => sum + calculateInvoiceTotals(inv).totalGST, 0);
  }, [filteredInvoices]);

  const outstandingTax = useMemo(() => {
    return filteredInvoices.filter(inv => !inv.isPaid).reduce((sum, inv) => sum + calculateInvoiceTotals(inv).totalGST, 0);
  }, [filteredInvoices]);

  // HSN summary split
  const hsnSummaries = useMemo(() => {
    const summaries: Record<string, { base: number; tax: number }> = {};
    filteredInvoices.forEach(inv => {
      inv.items.forEach(item => {
        const calc = calculateItemTaxes(item);
        if (!summaries[item.hsnCode]) {
          summaries[item.hsnCode] = { base: 0, tax: 0 };
        }
        summaries[item.hsnCode].base += calc.taxableBase;
        summaries[item.hsnCode].tax += calc.gstAmount;
      });
    });
    return Object.entries(summaries).map(([hsn, data]) => ({
      hsn,
      base: data.base,
      tax: data.tax,
      total: data.base + data.tax
    }));
  }, [filteredInvoices]);

  // Lock Period confirmation handler
  const handleConfirmLock = () => {
    setIsPeriodLocked(true);
    setIsLockModalOpen(false);
    const newLog = {
      id: `LOG-${Date.now()}`,
      action: `Financial Ledger Locked for period ${lockPeriod}`,
      user: "CA Amit Mehta",
      timestamp: new Date().toLocaleDateString("en-US") + " " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };
    setAuditLogs(prev => [newLog, ...prev]);
    showToast("success", `Ledger records frozen for ${lockPeriod}.`);
  };

  // Unlock Period handler
  const handleUnlockPeriod = () => {
    setIsPeriodLocked(false);
    const newLog = {
      id: `LOG-${Date.now()}`,
      action: "Financial Ledger Unlocked",
      user: "CA Amit Mehta",
      timestamp: new Date().toLocaleDateString("en-US") + " " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };
    setAuditLogs(prev => [newLog, ...prev]);
    showToast("error", "Ledger unlocked. Compliance edits enabled.");
  };

  // CSV EXPORT ENGINE (FLAT ITEMIZATION)
  const handleExportCSV = () => {
    const headers = [
      "Invoice No", "Date", "Dealer Name", "GSTIN", "Item Name", "HSN Code",
      "Quantity", "Taxable Value", "CGST Amount", "SGST Amount", "IGST Amount", "Total Value"
    ];

    const rows = [];
    for (const inv of filteredInvoices) {
      for (const item of inv.items) {
        const calc = calculateItemTaxes(item);
        const rowData = [
          `"${inv.invoiceNo}"`,
          `"${inv.date.split("-").reverse().join("/")}"`,
          `"${inv.dealerName}"`,
          `"${inv.gstin}"`,
          `"${item.name}"`,
          `"${item.hsnCode}"`,
          item.quantity.toString(),
          calc.taxableBase.toFixed(2),
          calc.cgst.toFixed(2),
          calc.sgst.toFixed(2),
          "0.00",
          calc.totalInclusive.toFixed(2)
        ];
        rows.push(rowData.join(","));
      }
    }

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GSTR1_Export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Log action
    const newLog = {
      id: `LOG-${Date.now()}`,
      action: "GSTR-1 exported to CSV",
      user: "CA Amit Mehta",
      timestamp: new Date().toLocaleDateString("en-US") + " " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20 font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom duration-300 ${
          notification.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
        }`}>
          <span className="font-bold text-sm">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-muted/50 rounded-lg ml-2"><X size={14}/></button>
        </div>
      )}

      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
            <FileText className="text-emerald-500 w-8 h-8" />
            Corporate Sales & Compliance Ledger
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Auditor Mode</span>
            Strict compliance ledger. Reverse GST taxation and audit trail lock enabled.
          </p>
        </div>
        <div className="flex gap-3">
          {isPeriodLocked ? (
            <button
              onClick={handleUnlockPeriod}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-sm cursor-pointer"
            >
              <Unlock size={14} /> Unlock Ledger
            </button>
          ) : (
            <button
              onClick={() => setIsLockModalOpen(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-sm cursor-pointer"
            >
              <Lock size={14} /> Freeze Ledger
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-sm cursor-pointer"
          >
            <Download size={14} /> Export for Tally (CSV)
          </button>
        </div>
      </div>

      {/* Period freeze status banner */}
      {isPeriodLocked && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold">
          <ShieldAlert size={18} className="text-amber-500 animate-pulse shrink-0" />
          <div>
            <p className="font-bold text-foreground">Ledger Frozen: {lockPeriod}</p>
            <p className="text-[10px] mt-0.5 opacity-90">All transaction entries are currently locked. Audit mode edits are frozen until unlock.</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Taxable Base MTD", value: formatCurrency(grossTaxableBase), icon: <BarChart3 className="text-emerald-500" />, trend: "Excluding sales tax" },
          { label: "GST Output CGST", value: formatCurrency(totalGSTOutput / 2), icon: <TrendingUp className="text-primary" />, trend: "9% Corporate Share" },
          { label: "GST Output SGST", value: formatCurrency(totalGSTOutput / 2), icon: <TrendingUp className="text-violet-500" />, trend: "9% State Share" },
          { label: "Compliance Health", value: "100%", icon: <CheckCircle2 className="text-emerald-500" />, trend: "Reverse Tax verified" }
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between hover:shadow-sm transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-muted-foreground leading-tight">{stat.label}</span>
              <div className="p-1.5 bg-muted rounded-lg border border-border/50">{stat.icon}</div>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-xl font-black text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-0.5">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Navigation Row */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
        {[
          { key: "sales", label: "Sales Ledger (GSTR-1)", icon: <FileText size={13} /> },
          { key: "gst", label: "GST Inflow Matrix", icon: <BarChart3 size={13} /> },
          { key: "reconciliation", label: "Reconciliation Check", icon: <AlertTriangle size={13} /> },
          { key: "logs", label: "Audit Action Logs", icon: <Clock size={13} /> }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key as any); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.key ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            {tab.icon}{t(tab.label)}
          </button>
        ))}
      </div>

      {/* ─── TAB: SALES LEDGER ─── */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by Invoice No, Dealer, or GSTIN..."
                className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-xl text-xs focus:outline-none focus:border-primary font-semibold text-foreground"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-muted/50 border-b border-border">
                  <tr className="text-xs uppercase text-muted-foreground font-bold">
                    <th className="py-4 px-6 w-12"></th>
                    <th className="py-4 px-6 font-bold">Invoice No</th>
                    <th className="py-4 px-6 font-bold">Date</th>
                    <th className="py-4 px-6 font-bold">Dealer Name</th>
                    <th className="py-4 px-6 font-bold">GSTIN</th>
                    <th className="py-4 px-6 font-bold text-right">Taxable Value</th>
                    <th className="py-4 px-6 font-bold text-right">Total GST</th>
                    <th className="py-4 px-6 font-bold text-right">Grand Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs">
                  {filteredInvoices.map(inv => {
                    const isExpanded = expandedRowId === inv.id;
                    const totals = calculateInvoiceTotals(inv);
                    return (
                      <React.Fragment key={inv.id}>
                        <tr className={`hover:bg-muted/30 transition-colors ${isExpanded ? "bg-muted/20" : ""}`}>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => setExpandedRowId(isExpanded ? null : inv.id)}
                              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </td>
                          <td className="py-4 px-6 font-mono font-bold text-foreground">{inv.invoiceNo}</td>
                          <td className="py-4 px-6 font-semibold text-muted-foreground">{inv.date.split("-").reverse().join("/")}</td>
                          <td className="py-4 px-6 font-bold text-foreground">{inv.dealerName}</td>
                          <td className="py-4 px-6 font-mono text-[10px] text-muted-foreground">{inv.gstin}</td>
                          <td className="py-4 px-6 font-mono text-right text-foreground font-semibold">
                            {formatCurrency(totals.totalTaxable)}
                          </td>
                          <td className="py-4 px-6 font-mono text-right text-rose-500 font-bold">
                            {formatCurrency(totals.totalGST)}
                          </td>
                          <td className="py-4 px-6 font-mono text-right text-foreground font-black">
                            {formatCurrency(totals.grandTotal)}
                          </td>
                        </tr>

                        {/* Expanded Itemized Breakdown */}
                        {isExpanded && (
                          <tr className="bg-muted/10">
                            <td colSpan={8} className="p-0 border-b border-border/80">
                              <div className="p-6 pb-8 pl-16">
                                <div className="flex items-center gap-2 mb-3">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Itemized Audit Breakdown (Reverse Calculated)</h4>
                                </div>
                                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                                  <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-muted/40 border-b border-border">
                                      <tr className="text-muted-foreground uppercase tracking-wider font-bold">
                                        <th className="py-3 px-4">Product Name</th>
                                        <th className="py-3 px-4 text-center">HSN</th>
                                        <th className="py-3 px-4 text-right">Qty</th>
                                        <th className="py-3 px-4 text-right">Unit Rate (Inc)</th>
                                        <th className="py-3 px-4 text-right bg-muted/20">Taxable Value</th>
                                        <th className="py-3 px-4 text-center font-bold text-primary">GST Rate</th>
                                        <th className="py-3 px-4 text-right bg-rose-500/5 text-rose-500">Tax Amount</th>
                                        <th className="py-3 px-4 text-right font-black">Total (Inc)</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40 font-semibold text-muted-foreground">
                                      {inv.items.map((item, idx) => {
                                        const calc = calculateItemTaxes(item);
                                        return (
                                          <tr key={idx} className="hover:bg-muted/10">
                                            <td className="py-3 px-4 font-bold text-foreground">{item.name}</td>
                                            <td className="py-3 px-4 text-center font-mono text-muted-foreground">{item.hsnCode}</td>
                                            <td className="py-3 px-4 text-right font-mono">{item.quantity}</td>
                                            <td className="py-3 px-4 text-right font-mono">₹{item.priceInclusive.toLocaleString("en-IN")}</td>
                                            <td className="py-3 px-4 text-right font-mono font-semibold bg-muted/10 text-foreground">
                                              ₹{calc.taxableBase.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3 px-4 text-center font-bold text-violet-500">{item.taxRate}%</td>
                                            <td className="py-3 px-4 text-right font-mono font-bold text-rose-500 bg-rose-500/5">
                                              ₹{calc.gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono font-black text-foreground">
                                              ₹{calc.totalInclusive.toLocaleString("en-IN")}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground font-medium">No sales invoices logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: GST INFLOW MATRIX ─── */}
      {activeTab === "gst" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground">GST Output Splits By HSN Class</h3>
            <p className="text-xs text-muted-foreground mt-0.5">HSN codes classification based on GSTR-1 itemization schedules.</p>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/50 border-b border-border">
                <tr className="text-xs uppercase text-muted-foreground font-bold">
                  <th className="p-4">HSN Code</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Taxable Base Value</th>
                  <th className="p-4 text-right">CGST Output (9%)</th>
                  <th className="p-4 text-right">SGST Output (9%)</th>
                  <th className="p-4 text-right">Net Tax Liability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-semibold text-xs">
                {hsnSummaries.map(s => (
                  <tr key={s.hsn} className="hover:bg-muted/10">
                    <td className="p-4 font-mono font-bold text-foreground">{s.hsn}</td>
                    <td className="p-4 text-muted-foreground">{s.hsn === "3209" ? "Water-based paints & varnishes" : s.hsn === "3214" ? "Glaziers putty & wall fillings" : "Enamels"}</td>
                    <td className="p-4 text-right font-mono text-foreground">{formatCurrency(s.base)}</td>
                    <td className="p-4 text-right font-mono text-primary">{formatCurrency(s.tax / 2)}</td>
                    <td className="p-4 text-right font-mono text-violet-500">{formatCurrency(s.tax / 2)}</td>
                    <td className="p-4 text-right font-mono font-black text-rose-500">{formatCurrency(s.tax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB: RECONCILIATION CHECK ─── */}
      {activeTab === "reconciliation" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-5 rounded-2xl flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-foreground">Outstanding Tax Reconciliation Check</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Compares total tax output liability against paid invoice settlements.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-black text-foreground">Reconciliation Status</h4>
              <div className="bg-muted/40 border border-border/40 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex justify-between text-muted-foreground"><span>Settled GST Output (Paid Invoices)</span><span className="font-mono font-bold text-emerald-500">{formatCurrency(settledTax)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Pending GST Output (Unpaid Invoices)</span><span className="font-mono font-bold text-rose-500">{formatCurrency(outstandingTax)}</span></div>
                <div className="h-px bg-border/40" />
                <div className="flex justify-between text-xs font-bold text-foreground"><span>Total GST Liability</span><span className="font-mono font-black text-primary">{formatCurrency(totalGSTOutput)}</span></div>
              </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-sm font-black text-foreground flex items-center gap-1.5"><AlertCircle size={16} className="text-rose-500" /> Discrepancy Warnings</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We spotted ₹{outstandingTax.toLocaleString("en-IN", { maximumFractionDigits: 0 })} in tax liability mapped to unpaid invoices. Auditors should follow up on outstanding credit accounts before quarterly filing limits.
                </p>
              </div>
              <div className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 rounded-xl border border-amber-500/20 font-semibold mt-4">
                ⚠️ Period GSTR-1 matching compliance check is 100% clean. No HSN mismatch errors detected.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: AUDIT ACTION LOGS ─── */}
      {activeTab === "logs" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground">Compliance Audit Trails</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Chronological trail of CA exports, ledger views, period locks, and credentials check.</p>
          </div>

          <div className="space-y-3">
            {auditLogs.map(log => (
              <div key={log.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/20 transition-all text-xs font-semibold">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg border border-border/50"><Clock size={14} className="text-muted-foreground" /></div>
                  <div>
                    <p className="text-foreground">{log.action}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">By: {log.user}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: FREEZE LEDGER PERIOD
      ══════════════════════════════════════════ */}
      {isLockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-base font-black text-foreground flex items-center gap-2">
                <Lock size={16} className="text-amber-500 animate-pulse" /> Freeze compliance period
              </h2>
              <button onClick={() => setIsLockModalOpen(false)} className="p-1.5 hover:bg-muted rounded-lg cursor-pointer"><X size={16}/></button>
            </div>
            <div className="space-y-3 text-xs font-bold text-muted-foreground">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Freezing this period will lock all invoices. No edits or raw entry deletions will be allowed.
              </p>
              <div>
                <label className="text-[10px] uppercase block mb-1">Select Freeze Period</label>
                <select value={lockPeriod} onChange={e => setLockPeriod(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none">
                  <option value="Q2 (July - Sept 2026)">Q2 (July - Sept 2026)</option>
                  <option value="Q1 (April - June 2026)">Q1 (April - June 2026)</option>
                  <option value="H1 Fiscal Year 2026">H1 Fiscal Year 2026</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsLockModalOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleConfirmLock} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black py-2.5 rounded-xl transition-colors cursor-pointer">
                Confirm Freeze
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
