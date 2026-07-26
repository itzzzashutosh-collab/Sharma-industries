"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Plus, FileText, Search, ExternalLink, X, Download,
  FileDown, Clock, History, ChevronDown, RefreshCw,
  CheckCircle2, AlertCircle, Printer, Trash2, IndianRupee,
  Copy, ArrowRight, LayoutTemplate,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface QuotationDraft {
  id: string;
  title: string;
  customer: string;
  amount: number;
  savedAt: string;
  data: any;
}

type ActiveTab = "history" | "drafts" | "templates";

// ─── Template Definitions ─────────────────────────────────────────────────────
const QUOTATION_TEMPLATES = [
  {
    id: "standard-quote",
    name: "Standard Quotation",
    desc: "GST-compliant sales quotation with itemized rates, MRP, and tax calculations",
    tag: "Most Used",
    tagColor: "bg-primary/10 text-primary border-primary/20",
    fields: ["Customer/Contractor", "Brand Selection", "Tax Breakdown", "MRP Display"],
    href: "/dashboard/dealer/sales/quotations/new",
  },
  {
    id: "contractor-quote",
    name: "Contractor & Painter Quote",
    desc: "Tailored bulk quotation for paint contractors and site painters with margin terms",
    tag: "Contractor",
    tagColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    fields: ["Painter Selection", "Bulk Quantities", "Dealer Margins", "Valid Until"],
    href: "/dashboard/dealer/sales/quotations/new",
  },
  {
    id: "retail-quote",
    name: "Retail Customer Quote",
    desc: "Quick estimate quote for walk-in retail customers with valid period and terms",
    tag: "Retail",
    tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    fields: ["Retail Customer", "Visual Catalog", "MRP & Selling Rate", "Terms"],
    href: "/dashboard/dealer/sales/quotations/new",
  },
  {
    id: "project-estimate",
    name: "Project Site Estimate",
    desc: "Comprehensive project site quotation for residential and commercial sites",
    tag: "Projects",
    tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    fields: ["Site Address", "Brand Products", "Labor Charges", "GST Summary"],
    href: "/dashboard/dealer/sales/quotations/new",
  },
];

// ─── CSV export ────────────────────────────────────────────────────────────────
function exportToCSV(quotations: any[]) {
  const headers = ["Quotation No", "Date", "Client", "Amount (₹)", "Status"];
  const rows = quotations.map((q) => {
    const name =
      typeof q.customer === "object" && q.customer !== null
        ? q.customer.name || ""
        : q.customer || q.client_details?.name || "";
    return [
      q.quotation_no || "",
      q.date ? new Date(q.date).toLocaleDateString("en-IN") : "",
      name,
      (q.grand_total || 0).toFixed(2),
      q.status || "Draft",
    ];
  });

  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dealer-quotations-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToPrint(quotations: any[]) {
  const custName = (q: any) =>
    typeof q.customer === "object" && q.customer !== null
      ? q.customer.name || ""
      : q.customer || q.client_details?.name || "";

  const rows = quotations
    .map(
      (q) => `<tr>
      <td>${q.quotation_no || ""}</td>
      <td>${q.date ? new Date(q.date).toLocaleDateString("en-IN") : ""}</td>
      <td>${custName(q)}</td>
      <td style="text-align:right">₹${(q.grand_total || 0).toLocaleString("en-IN")}</td>
      <td><span style="padding:2px 8px;border-radius:999px;font-size:11px;background:#fef3c7;color:#92400e">${q.status || "Draft"}</span></td>
    </tr>`
    )
    .join("");

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>Quotations – Sharma Industries (Dealer)</title>
  <style>
    body{font-family:Arial,sans-serif;padding:24px;color:#1a1a1a}
    h1{font-size:20px;margin-bottom:4px}
    p{color:#666;font-size:12px;margin-bottom:16px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{background:#f4f4f5;text-align:left;padding:8px 12px;border-bottom:2px solid #e4e4e7;font-size:11px;text-transform:uppercase;letter-spacing:.05em}
    td{padding:8px 12px;border-bottom:1px solid #f4f4f5}
    @media print{body{padding:0}}
  </style></head><body>
  <h1>Quotation History – Sharma Industries (Dealer Portal)</h1>
  <p>Generated: ${new Date().toLocaleString("en-IN")} · Total: ${quotations.length} quotations</p>
  <table><thead><tr><th>Quotation No</th><th>Date</th><th>Client</th><th>Amount</th><th>Status</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <script>window.onload=()=>{ window.print(); }<\/script>
  </body></html>`);
  win.document.close();
}

// ─── Main Component ────────────────────────────────────────────────────────────
interface Props {
  initialData: any[];
}

export function QuotationsClient({ initialData }: Props) {
  const { t } = useLanguage();
  const [quotations, setQuotations] = useState<any[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("history");
  const [drafts, setDrafts] = useState<QuotationDraft[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const fetchQuotations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/quotations");
      const data = await res.json();
      if (data.success) setQuotations(data.data);
    } catch (err) {
      console.error("Failed to fetch quotations", err);
    }
    setIsLoading(false);
  }, []);

  const loadDrafts = useCallback(() => {
    try {
      const raw = localStorage.getItem("dealer_quotation_drafts");
      if (raw) setDrafts(JSON.parse(raw));
    } catch {
      setDrafts([]);
    }
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getCustomerName = (q: any) =>
    typeof q.customer === "object" && q.customer !== null
      ? q.customer.name || ""
      : typeof q.customer === "string"
      ? q.customer
      : q.client_details?.name || "";

  const filteredQuotations = quotations.filter((q) => {
    const name = getCustomerName(q);
    const matchSearch =
      (q.quotation_no || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === "All" ||
      (q.status || "Draft").toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const deleteDraft = (id: string) => {
    const updated = drafts.filter((d) => d.id !== id);
    setDrafts(updated);
    localStorage.setItem("dealer_quotation_drafts", JSON.stringify(updated));
  };

  // Stats
  const totalValue = quotations.reduce((s, q) => s + (q.grand_total || 0), 0);
  const convertedCount = quotations.filter((q) => q.status === "Converted").length;
  const draftCount = quotations.filter((q) => !q.status || q.status === "Draft").length;

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
        <span>Dealer Workspace</span>
        <span className="text-muted-foreground/45">/</span>
        <span>Sales</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">Quotations</span>
      </div>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <FileText className="text-primary" size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Quotations Terminal</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {quotations.length} quotations · ₹{totalValue.toLocaleString("en-IN")} total value
              </p>
            </div>
          </div>

          {/* Export dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen((o) => !o)}
              className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-xl text-xs font-bold border border-border transition-colors"
            >
              <FileDown size={14} /> Export
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
                    onClick={() => { exportToCSV(filteredQuotations); setExportOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors border-b border-border/50"
                  >
                    <Download size={14} className="text-primary" /> Export as CSV
                  </button>
                  <button
                    onClick={() => { exportToPrint(filteredQuotations); setExportOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <Printer size={14} className="text-muted-foreground" /> Print / Save PDF
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
            <span className="text-xs font-bold text-foreground">{quotations.length} Total</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-2.5">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-xs font-bold text-foreground">{convertedCount} Converted to Invoice</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-2.5">
            <Clock size={14} className="text-amber-500" />
            <span className="text-xs font-bold text-foreground">{draftCount} Draft</span>
          </div>
          {drafts.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-500/8 border border-blue-500/20 rounded-xl px-4 py-2.5">
              <Clock size={14} className="text-blue-500" />
              <span className="text-xs font-bold text-foreground">{drafts.length} Local Drafts</span>
            </div>
          )}
        </div>

        {/* Tab + New button */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Link
            href="/dashboard/dealer/sales/quotations/new"
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus size={14} /> New Quotation
          </Link>
          <div className="flex bg-muted/40 rounded-xl border border-border p-0.5 gap-0.5">
            {(["history", "drafts", "templates"] as ActiveTab[]).map((tab) => (
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
                {tab === "history"
                  ? "Quotation History"
                  : tab === "drafts"
                  ? `Drafts${drafts.length > 0 ? ` (${drafts.length})` : ""}`
                  : "Templates"}
              </button>
            ))}
          </div>
          <button
            onClick={fetchQuotations}
            disabled={isLoading}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-muted/40 transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* ── HISTORY TAB ─────────────────────────────────────────────── */}
      {activeTab === "history" && (
        <>
          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 max-w-md w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by Quotation No or Client…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-1.5">
              {["All", "Draft", "Sent", "Converted"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    statusFilter === f
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-auto">{filteredQuotations.length} results</span>
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    {["Date", "Quotation No", "Client", "Amount (₹)", "Status", "Actions"].map((h) => (
                      <th
                        key={h}
                        className={`py-4 px-5 text-xs font-bold text-muted-foreground uppercase tracking-wider ${h === "Amount (₹)" || h === "Actions" ? "text-right" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <RefreshCw size={16} className="animate-spin" />
                          <span className="text-xs font-medium">Loading quotations…</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredQuotations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <FileText size={32} className="mx-auto text-muted-foreground/25 mb-3" />
                        <p className="text-sm text-muted-foreground font-medium">No quotations found.</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Click "New Quotation" to create your first one.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredQuotations.map((q) => {
                      const name = getCustomerName(q);
                      const isPaid = q.status === "Converted";
                      return (
                        <tr
                          key={q.id}
                          onClick={() => setSelectedQuotation(q)}
                          className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                        >
                          <td className="py-4 px-5 text-xs font-medium text-muted-foreground whitespace-nowrap">
                            {q.date ? new Date(q.date).toLocaleDateString("en-IN") : "—"}
                          </td>
                          <td className="py-4 px-5 font-mono font-bold text-foreground text-xs">{q.quotation_no || "—"}</td>
                          <td className="py-4 px-5 font-semibold text-foreground">{name || "Retail Customer"}</td>
                          <td className="py-4 px-5 text-right font-black text-foreground">
                            ₹{(q.grand_total || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                              isPaid
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            }`}>
                              {q.status || "Draft"}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/dashboard/dealer/sales/quotations/${q.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-bold transition-colors"
                              >
                                View <ExternalLink size={12} />
                              </Link>
                              <Link
                                href={`/dashboard/dealer/sales/invoices/new?convert_quotation_id=${q.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                              >
                                → Invoice
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── DRAFTS TAB ──────────────────────────────────────────────── */}
      {activeTab === "drafts" && (
        <div className="space-y-3">
          {drafts.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border rounded-2xl">
              <Clock size={32} className="mx-auto text-muted-foreground/25 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No saved drafts</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Drafts are saved locally in your browser.</p>
            </div>
          ) : (
            drafts.map((draft) => (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-xs font-mono font-bold text-muted-foreground">{draft.title}</p>
                  <p className="font-bold text-foreground mt-0.5">{draft.customer}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ₹{draft.amount.toLocaleString("en-IN")} · Saved {new Date(draft.savedAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/dashboard/dealer/sales/quotations/new?draft=${draft.id}`}
                    className="px-3 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors"
                  >
                    Continue
                  </Link>
                  <button
                    onClick={() => deleteDraft(draft.id)}
                    className="px-3 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-bold hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* ── TEMPLATES TAB ───────────────────────────────────────────── */}
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
            <h2 className="text-sm font-bold text-foreground">
              {t("Quotation Templates")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("Start a new quotation from a pre-configured sales template")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {QUOTATION_TEMPLATES.map((tpl, idx) => (
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
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${tpl.tagColor}`}
                  >
                    {tpl.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {t(tpl.name)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {t(tpl.desc)}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {tpl.fields.map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 bg-muted/50 border border-border rounded-lg text-[10px] font-semibold text-muted-foreground"
                    >
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

      {/* ── DETAIL DRAWER ────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedQuotation && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedQuotation(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col"
            >
              {/* Drawer header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                    {selectedQuotation.quotation_no}
                  </span>
                  <h3 className="text-lg font-black text-foreground mt-2">
                    {getCustomerName(selectedQuotation) || "Retail Customer"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedQuotation.date ? new Date(selectedQuotation.date).toLocaleDateString("en-IN") : ""}
                    {selectedQuotation.client_type ? ` · ${selectedQuotation.client_type}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedQuotation(null)}
                  className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Status */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Status</p>
                    <span className={`inline-flex items-center mt-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                      selectedQuotation.status === "Converted"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                      {selectedQuotation.status || "Draft"}
                    </span>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Grand Total</p>
                    <p className="font-black text-foreground text-xl mt-1">
                      ₹{(selectedQuotation.grand_total || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  {selectedQuotation.client_details?.phone && (
                    <div>
                      <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Phone</p>
                      <p className="font-semibold text-foreground mt-1">{selectedQuotation.client_details.phone}</p>
                    </div>
                  )}
                  {selectedQuotation.client_details?.gstin && (
                    <div>
                      <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">GSTIN</p>
                      <p className="font-semibold text-foreground mt-1 font-mono">{selectedQuotation.client_details.gstin}</p>
                    </div>
                  )}
                </div>

                {/* Line items */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-3">
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Quotation Items</h4>
                  <div className="space-y-2">
                    {selectedQuotation.items && Array.isArray(selectedQuotation.items) ? (
                      selectedQuotation.items.map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs py-2 border-b border-border/40 last:border-0">
                          <div>
                            <p className="font-bold text-foreground">{it.name}</p>
                            {it.brand && <p className="text-muted-foreground text-[10px]">{it.brand}</p>}
                            <p className="text-muted-foreground mt-0.5">
                              Qty: {it.qty || it.quantity} × ₹{it.rate}
                            </p>
                          </div>
                          <span className="font-mono font-bold text-foreground">
                            ₹{((it.qty || it.quantity || 1) * it.rate).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No items recorded.</p>
                    )}
                  </div>
                </div>

                {/* Pricing summary */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-2 text-xs">
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-3">Pricing Summary</h4>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{(selectedQuotation.subtotal || 0).toLocaleString("en-IN")}</span>
                  </div>
                  {(selectedQuotation.tax_breakdown?.cgst || 0) > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>CGST + SGST</span>
                      <span className="font-mono">
                        ₹{((selectedQuotation.tax_breakdown?.cgst || 0) + (selectedQuotation.tax_breakdown?.sgst || 0)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  {(selectedQuotation.tax_breakdown?.igst || selectedQuotation.total_gst || 0) > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Total GST</span>
                      <span className="font-mono">₹{(selectedQuotation.total_gst || 0).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-foreground font-bold border-t border-border/40 pt-2 text-sm mt-2">
                    <span>Grand Total</span>
                    <span className="font-mono text-primary">₹{(selectedQuotation.grand_total || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="p-6 border-t border-border bg-muted/20 flex gap-3">
                <Link
                  href={`/dashboard/dealer/sales/invoices/new?convert_quotation_id=${selectedQuotation.id}`}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowRight size={14} /> Convert to Invoice
                </Link>
                <Link
                  href={`/dashboard/dealer/sales/quotations/${selectedQuotation.id}`}
                  className="flex-1 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold border border-primary/20 rounded-xl text-center transition-all flex items-center justify-center gap-1.5"
                >
                  View Full <ExternalLink size={12} />
                </Link>
                <button
                  onClick={() => setSelectedQuotation(null)}
                  className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
