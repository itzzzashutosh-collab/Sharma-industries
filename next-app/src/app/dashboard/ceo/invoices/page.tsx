"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Plus, FileText, Search, ExternalLink, X, Download, FileDown,
  Clock, LayoutTemplate, History, ChevronDown, RefreshCw,
  IndianRupee, CheckCircle2, AlertCircle, Printer, Copy, Trash2
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";

// ─── Draft Types ──────────────────────────────────────────────────────────────
interface InvoiceDraft {
  id: string;
  title: string;
  customer: string;
  amount: number;
  savedAt: string;
  data: any;
}

// ─── Template Definitions ─────────────────────────────────────────────────────
const INVOICE_TEMPLATES = [
  {
    id: "standard",
    name: "Standard Invoice",
    desc: "GST-compliant invoice with full tax breakdown (CGST/SGST/IGST)",
    tag: "Most Used",
    tagColor: "bg-primary/10 text-primary border-primary/20",
    fields: ["Client Details", "Line Items", "CGST/SGST/IGST", "Transport", "QR Range"],
    href: "/dashboard/ceo/invoices/new?template=standard",
  },
  {
    id: "quotation-convert",
    name: "Quotation → Invoice",
    desc: "Convert an accepted quotation directly into a tax invoice",
    tag: "Quick",
    tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    fields: ["Linked Quotation", "Client Details", "Adjusted Items", "Tax"],
    href: "/dashboard/ceo/invoices/new?template=from-quotation",
  },
  {
    id: "advance",
    name: "Advance Invoice",
    desc: "Invoice with advance payment deduction and balance due tracking",
    tag: "Finance",
    tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    fields: ["Client Details", "Advance Paid", "Balance Due", "Payment Terms"],
    href: "/dashboard/ceo/invoices/new?template=advance",
  },
  {
    id: "credit-note",
    name: "Credit Note",
    desc: "Issue a credit note for returns, corrections or adjustments",
    tag: "Returns",
    tagColor: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    fields: ["Original Invoice Ref", "Reason", "Items Returned", "Credit Amount"],
    href: "/dashboard/ceo/invoices/new?template=credit-note",
  },
];

// ─── Tab type ─────────────────────────────────────────────────────────────────
type ActiveTab = "history" | "drafts" | "templates";

// ─── CSV Export ───────────────────────────────────────────────────────────────
function exportToCSV(invoices: any[]) {
  const headers = ["Invoice No", "Date", "Client", "Amount (₹)", "Balance Due (₹)", "Status"];
  const rows = invoices.map(inv => {
    const custName = typeof inv.customer === "object" && inv.customer !== null
      ? inv.customer.name || "" : (inv.customer || "");
    const isPaid = inv.balance_due <= 0;
    return [
      inv.invoice_no || "",
      inv.date ? new Date(inv.date).toLocaleDateString("en-IN") : "",
      custName,
      (inv.grand_total || 0).toFixed(2),
      (inv.balance_due || 0).toFixed(2),
      isPaid ? "Paid" : "Unpaid",
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sharma-invoices-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Print Export ─────────────────────────────────────────────────────────────
function exportToPrint(invoices: any[]) {
  const custName = (inv: any) =>
    typeof inv.customer === "object" && inv.customer !== null
      ? inv.customer.name || "" : (inv.customer || "");

  const rows = invoices.map(inv => {
    const isPaid = inv.balance_due <= 0;
    return `
      <tr>
        <td>${inv.invoice_no || ""}</td>
        <td>${inv.date ? new Date(inv.date).toLocaleDateString("en-IN") : ""}</td>
        <td>${custName(inv)}</td>
        <td style="text-align:right">₹${(inv.grand_total || 0).toLocaleString("en-IN")}</td>
        <td style="text-align:right; color:${isPaid ? "#16a34a" : "#d97706"}">
          ${isPaid ? "—" : "₹" + (inv.balance_due || 0).toLocaleString("en-IN")}
        </td>
        <td><span style="padding:2px 8px;border-radius:999px;font-size:11px;background:${isPaid ? "#dcfce7" : "#fef3c7"};color:${isPaid ? "#15803d" : "#92400e"}">${isPaid ? "Paid" : "Unpaid"}</span></td>
      </tr>`;
  }).join("");

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>Invoice Report – Sharma Industries</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #1a1a1a; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    p { color: #666; font-size: 12px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #f4f4f5; text-align: left; padding: 8px 12px; border-bottom: 2px solid #e4e4e7; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
    td { padding: 8px 12px; border-bottom: 1px solid #f4f4f5; }
    @media print { body { padding: 0 } }
  </style></head><body>
  <h1>Invoice History – Sharma Industries</h1>
  <p>Generated: ${new Date().toLocaleString("en-IN")} · Total: ${invoices.length} invoices</p>
  <table><thead><tr><th>Invoice No</th><th>Date</th><th>Client</th><th>Amount</th><th>Balance</th><th>Status</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <script>window.onload=()=>{ window.print(); }<\/script>
  </body></html>`);
  win.document.close();
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InvoicesHistoryPage() {
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("history");
  const [drafts, setDrafts] = useState<InvoiceDraft[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Load invoices from API
  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      if (data.success) setInvoices(data.data);
    } catch (err) {
      console.error("Failed to fetch invoices", err);
    }
    setIsLoading(false);
  }, []);

  // Load drafts from localStorage
  const loadDrafts = useCallback(() => {
    try {
      const raw = localStorage.getItem("invoice_drafts");
      if (raw) setDrafts(JSON.parse(raw));
    } catch { setDrafts([]); }
  }, []);

  useEffect(() => {
    fetchInvoices();
    loadDrafts();
  }, [fetchInvoices, loadDrafts]);

  // Close export dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const custName = typeof inv.customer === "object" && inv.customer !== null
      ? (inv.customer.name || "")
      : (typeof inv.customer === "string" ? inv.customer : "");

    const matchesSearch =
      (inv.invoice_no || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      custName.toLowerCase().includes(searchTerm.toLowerCase());

    const isPaid = inv.balance_due <= 0;
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Paid" && isPaid) ||
      (statusFilter === "Unpaid" && !isPaid);

    return matchesSearch && matchesStatus;
  });

  const deleteDraft = (id: string) => {
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    localStorage.setItem("invoice_drafts", JSON.stringify(updated));
  };

  const getCustomerName = (inv: any) =>
    typeof inv.customer === "object" && inv.customer !== null
      ? (inv.customer.name || "")
      : (typeof inv.customer === "string" ? inv.customer : "");

  // Stats
  const totalRevenue = invoices.reduce((s, i) => s + (i.grand_total || 0), 0);
  const totalDue = invoices.reduce((s, i) => s + (i.balance_due > 0 ? i.balance_due : 0), 0);
  const paidCount = invoices.filter(i => i.balance_due <= 0).length;

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
        <span>{t("Home")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Invoices")}</span>
      </div>

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <FileText className="text-primary" size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Invoices")}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {invoices.length} {t("invoices")} · ₹{totalRevenue.toLocaleString("en-IN")} {t("total revenue")}
              </p>
            </div>
          </div>

          {/* Export dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen(o => !o)}
              className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-xl text-xs font-bold border border-border transition-colors"
            >
              <FileDown size={14} />
              {t("Export")}
              <ChevronDown size={12} className={`transition-transform ${exportOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {exportOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-xl z-30 overflow-hidden"
                >
                  <button
                    onClick={() => { exportToCSV(filteredInvoices); setExportOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors border-b border-border/50"
                  >
                    <Download size={14} className="text-primary" />
                    {t("Export as CSV")}
                  </button>
                  <button
                    onClick={() => { exportToPrint(filteredInvoices); setExportOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <Printer size={14} className="text-muted-foreground" />
                    {t("Print / Save PDF")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5">
            <FileText size={14} className="text-primary" />
            <span className="text-xs font-bold text-foreground">{invoices.length} {t("Total")}</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-2.5">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-xs font-bold text-foreground">{paidCount} {t("Paid")}</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-2.5">
            <AlertCircle size={14} className="text-amber-500" />
            <span className="text-xs font-bold text-foreground">
              {invoices.length - paidCount} {t("Unpaid")} · ₹{totalDue.toLocaleString("en-IN")} {t("due")}
            </span>
          </div>
          {drafts.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-500/8 border border-blue-500/20 rounded-xl px-4 py-2.5">
              <Clock size={14} className="text-blue-500" />
              <span className="text-xs font-bold text-foreground">{drafts.length} {t("Drafts saved")}</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Link
            href="/dashboard/ceo/invoices/new"
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus size={14} /> {t("New Invoice")}
          </Link>
          <div className="flex bg-muted/40 rounded-xl border border-border p-0.5 gap-0.5">
            {(["history", "drafts", "templates"] as ActiveTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "history" && <History size={12} />}
                {tab === "drafts" && <Clock size={12} />}
                {tab === "templates" && <LayoutTemplate size={12} />}
                {t(tab === "history" ? "Invoice History" : tab === "drafts" ? "Drafts" : "Templates")}
                {tab === "drafts" && drafts.length > 0 && (
                  <span className="ml-0.5 bg-primary/15 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-black">{drafts.length}</span>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={fetchInvoices}
            className="ml-auto flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl border border-border/60 hover:bg-muted/40 transition-colors"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            {t("Refresh")}
          </button>
        </div>
      </div>

      {/* ── TAB: Invoice History ──────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 border border-border rounded-2xl shadow-xs">
              <div className="relative flex-1 max-w-md w-full">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("Search by Invoice No or Client…")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs font-semibold text-foreground outline-none focus:border-primary transition-colors"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X size={13} />
                  </button>
                )}
              </div>
              <div className="flex gap-1.5 w-full sm:w-auto">
                {["All", "Paid", "Unpaid"].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      statusFilter === s
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-muted-foreground border-border/60 hover:bg-muted/20"
                    }`}
                  >
                    {t(s)}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                {filteredInvoices.length} {t("results")}
              </span>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="py-4 px-5 text-[10px] font-black text-muted-foreground uppercase tracking-wider">{t("Date")}</th>
                      <th className="py-4 px-5 text-[10px] font-black text-muted-foreground uppercase tracking-wider">{t("Invoice No")}</th>
                      <th className="py-4 px-5 text-[10px] font-black text-muted-foreground uppercase tracking-wider">{t("Client")}</th>
                      <th className="py-4 px-5 text-[10px] font-black text-muted-foreground uppercase tracking-wider text-right">{t("Amount")}</th>
                      <th className="py-4 px-5 text-[10px] font-black text-muted-foreground uppercase tracking-wider text-right">{t("Balance Due")}</th>
                      <th className="py-4 px-5 text-[10px] font-black text-muted-foreground uppercase tracking-wider">{t("Status")}</th>
                      <th className="py-4 px-5 text-[10px] font-black text-muted-foreground uppercase tracking-wider text-right">{t("Actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b border-border/40">
                          {[...Array(7)].map((_, j) => (
                            <td key={j} className="py-4 px-5">
                              <div className="h-4 bg-muted/60 rounded-md animate-pulse" style={{ width: `${40 + Math.random() * 40}%` }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <FileText size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                          <p className="text-muted-foreground font-medium text-sm">{t("No invoices found.")}</p>
                          <p className="text-muted-foreground/60 text-xs mt-1">{t("Try adjusting your search or filters")}</p>
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((inv) => {
                        const isPaid = inv.balance_due <= 0;
                        return (
                          <tr
                            key={inv.id}
                            onClick={() => setSelectedInvoice(inv)}
                            className="border-b border-border/40 hover:bg-muted/30 cursor-pointer transition-colors"
                          >
                            <td className="py-4 px-5 text-xs text-muted-foreground font-medium">
                              {inv.date ? new Date(inv.date).toLocaleDateString("en-IN") : "—"}
                            </td>
                            <td className="py-4 px-5 font-mono text-xs font-bold text-foreground">
                              {inv.invoice_no}
                            </td>
                            <td className="py-4 px-5 font-semibold text-sm text-foreground">
                              {getCustomerName(inv)}
                            </td>
                            <td className="py-4 px-5 text-right font-black text-sm text-foreground">
                              ₹{(inv.grand_total || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="py-4 px-5 text-right font-bold text-sm">
                              {inv.balance_due > 0
                                ? <span className="text-rose-500">₹{inv.balance_due.toLocaleString("en-IN")}</span>
                                : <span className="text-muted-foreground/50">—</span>}
                            </td>
                            <td className="py-4 px-5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                isPaid
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              }`}>
                                {isPaid ? t("Paid") : t("Unpaid")}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right" onClick={e => e.stopPropagation()}>
                              <Link
                                href={inv.pdf_url || `/dashboard/ceo/invoices/${inv.id}`}
                                target={inv.pdf_url ? "_blank" : undefined}
                                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-bold transition-colors"
                              >
                                {t("View")} <ExternalLink size={12} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              {filteredInvoices.length > 0 && !isLoading && (
                <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>{filteredInvoices.length} {t("invoices shown")}</span>
                  <span>{t("Total")}: <strong className="text-foreground">₹{filteredInvoices.reduce((s, i) => s + (i.grand_total || 0), 0).toLocaleString("en-IN")}</strong></span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── TAB: Drafts ──────────────────────────────────────── */}
        {activeTab === "drafts" && (
          <motion.div
            key="drafts"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground">{t("Saved Drafts")}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{t("Invoices you started but haven't submitted yet")}</p>
              </div>
              <Link
                href="/dashboard/ceo/invoices/new"
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
              >
                <Plus size={13} /> {t("New Invoice")}
              </Link>
            </div>

            {drafts.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-2xl p-16 text-center">
                <Clock size={36} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-sm font-bold text-foreground">{t("No drafts saved")}</p>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto">
                  {t("When you create a new invoice and click \"Save Draft\", it will appear here.")}
                </p>
                <Link
                  href="/dashboard/ceo/invoices/new"
                  className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                >
                  <Plus size={13} /> {t("Start an Invoice")}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {drafts.map(draft => (
                  <motion.div
                    key={draft.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <FileText size={16} className="text-blue-500" />
                      </div>
                      <button
                        onClick={() => deleteDraft(draft.id)}
                        className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete draft"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-foreground truncate">{draft.title || "Untitled Draft"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{draft.customer || t("No customer selected")}</p>
                    {draft.amount > 0 && (
                      <p className="text-xs font-black text-primary mt-1.5">₹{draft.amount.toLocaleString("en-IN")}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-3">
                      {t("Saved")} {draft.savedAt ? new Date(draft.savedAt).toLocaleString("en-IN") : "—"}
                    </p>
                    <Link
                      href={`/dashboard/ceo/invoices/new?draft=${draft.id}`}
                      className="mt-4 flex items-center justify-center gap-1.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold transition-colors"
                    >
                      {t("Continue Editing")}
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── TAB: Templates ───────────────────────────────────── */}
        {activeTab === "templates" && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-sm font-bold text-foreground">{t("Invoice Templates")}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{t("Start a new invoice from a pre-configured template")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {INVOICE_TEMPLATES.map((tpl, idx) => (
                <motion.div
                  key={tpl.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <LayoutTemplate size={18} className="text-primary" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${tpl.tagColor}`}>
                      {tpl.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">{t(tpl.name)}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{t(tpl.desc)}</p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {tpl.fields.map(f => (
                      <span key={f} className="px-2 py-0.5 bg-muted/50 border border-border rounded-lg text-[10px] font-semibold text-muted-foreground">
                        {f}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={tpl.href}
                    className="mt-5 flex items-center justify-center gap-1.5 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 hover:border-transparent rounded-xl text-xs font-bold transition-all"
                  >
                    <Plus size={13} /> {t("Use this Template")}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sliding Detail Drawer ──────────────────────────────── */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedInvoice(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
                <div>
                  <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                    {selectedInvoice.invoice_no}
                  </span>
                  <h3 className="text-lg font-black text-foreground mt-2">
                    {getCustomerName(selectedInvoice)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedInvoice.date ? new Date(selectedInvoice.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : ""}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Status + Meta */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t("Status"), value: selectedInvoice.balance_due <= 0 ? "Paid" : "Unpaid", isPaid: selectedInvoice.balance_due <= 0 },
                    { label: t("Payment Mode"), value: selectedInvoice.payment_mode || (selectedInvoice.payment_terms?.mode) || "—" },
                    { label: t("Due Date"), value: selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString("en-IN") : "Immediate" },
                    { label: t("Client Type"), value: selectedInvoice.client_type || "Customer" },
                  ].map((item, i) => (
                    <div key={i} className="bg-muted/30 border border-border/50 rounded-xl p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                      {"isPaid" in item ? (
                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          item.isPaid ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }`}>{t(item.value)}</span>
                      ) : (
                        <p className="text-sm font-bold text-foreground mt-0.5">{item.value}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Items */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5">
                  <h4 className="font-black text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{t("Billing Items")}</h4>
                  <div className="space-y-2">
                    {selectedInvoice.items && Array.isArray(selectedInvoice.items) && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs py-2.5 border-b border-border/40 last:border-0">
                          <div>
                            <p className="font-bold text-foreground">{it.name}</p>
                            <p className="text-muted-foreground mt-0.5">Qty: {it.qty || it.quantity || 1} × ₹{(it.rate || 0).toLocaleString("en-IN")}</p>
                          </div>
                          <span className="font-mono font-black text-foreground">
                            ₹{(((it.qty || it.quantity || 1) * (it.rate || 0))).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic text-center py-4">{t("No items available")}</p>
                    )}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-2.5 text-xs">
                  <h4 className="font-black text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t("Pricing Summary")}</h4>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("Subtotal")}</span>
                    <span className="font-mono">₹{(selectedInvoice.subtotal || 0).toLocaleString("en-IN")}</span>
                  </div>
                  {selectedInvoice.cgst > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>CGST</span>
                      <span className="font-mono">₹{(selectedInvoice.cgst || 0).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {selectedInvoice.sgst > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>SGST</span>
                      <span className="font-mono">₹{(selectedInvoice.sgst || 0).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {selectedInvoice.igst > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>IGST</span>
                      <span className="font-mono">₹{(selectedInvoice.igst || 0).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {selectedInvoice.round_off !== 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>{t("Round Off")}</span>
                      <span className="font-mono">₹{(selectedInvoice.round_off || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-foreground font-black border-t border-border pt-2.5 text-sm">
                    <span>{t("Grand Total")}</span>
                    <span className="font-mono text-primary">₹{(selectedInvoice.grand_total || 0).toLocaleString("en-IN")}</span>
                  </div>
                  {selectedInvoice.balance_due > 0 && (
                    <div className="flex justify-between text-rose-500 font-bold">
                      <span>{t("Balance Due")}</span>
                      <span className="font-mono">₹{(selectedInvoice.balance_due || 0).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-border bg-muted/20 flex gap-3 shrink-0">
                <Link
                  href={`/dashboard/ceo/invoices/${selectedInvoice.id}`}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-extrabold rounded-xl text-center shadow-md transition-all"
                >
                  {t("View / Print Invoice")}
                </Link>
                <button
                  onClick={() => { exportToCSV([selectedInvoice]); }}
                  className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-bold border border-border rounded-xl transition-all"
                  title={t("Export this invoice")}
                >
                  <Download size={15} />
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-bold border border-border rounded-xl transition-all"
                >
                  <X size={15} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
