"use client";

import React, { useState, useTransition } from "react";
import { BarChart2, Download, Plus, FileText, Calendar, Filter, Search, RefreshCw } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { generateReportData } from "./actions";

interface ReportRow {
  name: string;
  category: string;
  ref: string;
  status: string;
  value: string;
}

interface Props {
  initialReport: {
    title: string;
    headers: string[];
    rows: ReportRow[];
  };
}

export default function ReportsCenterClient({ initialReport }: Props) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  // Active loaded report title and dataset
  const [reportTitle, setReportTitle] = useState(initialReport.title || "Daily Operations Log");
  const [headers, setHeaders] = useState<string[]>(initialReport.headers || ["Report Name", "Category", "Date / Reference", "Status", "Amount / Value"]);
  const [rows, setRows] = useState<ReportRow[]>(initialReport.rows || []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const loadReport = (type: "daily" | "weekly" | "monthly" | "yearly" | "inventory" | "sales" | "production" | "financial") => {
    startTransition(async () => {
      const res = await generateReportData(type);
      if (res.success && res.report) {
        setReportTitle(res.report.title);
        setHeaders(res.report.headers);
        setRows(res.report.rows);
      } else {
        alert(`Error loading report: ${res.error}`);
      }
    });
  };

  const handleExport = (format: "csv" | "excel") => {
    const csvHeaders = headers.join(",") + "\n";
    const csvRows = filteredRows
      .map(r => `"${r.name}","${r.category}","${r.ref}","${r.status}","${r.value.replace(/"/g, '""')}"`)
      .join("\n");
    
    const blob = new Blob([csvHeaders + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${reportTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}.${format === "excel" ? "xlsx" : "csv"}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRows = rows.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.value.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Unique categories list for filters
  const uniqueCategories = Array.from(new Set(rows.map(r => r.category))).filter(c => c && c !== "N/A");

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6 font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
        <span>{t("Home")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Reports")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <BarChart2 className="text-primary animate-pulse" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Reports Center")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t("Generate and download paint business audit reports, inventory tallies, and financials.")}</p>
          </div>
        </div>

        {/* Actionable Report Generation Buttons Row */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60 text-xs font-bold">
          <button 
            onClick={() => loadReport("daily")} 
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-white px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Plus size={13} /> {t("Daily Report")}
          </button>
          {[
            { type: "weekly", label: "Weekly Report" },
            { type: "monthly", label: "Monthly Report" },
            { type: "yearly", label: "Yearly Report" },
            { type: "inventory", label: "Inventory Report" },
            { type: "sales", label: "Sales Report" },
            { type: "production", label: "Production Report" },
            { type: "financial", label: "Financial Report" }
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => loadReport(item.type as any)}
              disabled={isPending}
              className="bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground px-3.5 py-2.5 rounded-xl border border-border/60 transition-all cursor-pointer disabled:opacity-50"
            >
              {t(item.label)}
            </button>
          ))}
          
          <button 
            onClick={() => handleExport("csv")}
            className="bg-muted hover:bg-muted/80 text-foreground px-3.5 py-2.5 rounded-xl border border-border/80 ml-auto flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download size={13} /> {t("Export CSV")}
          </button>
          <button 
            onClick={() => handleExport("excel")}
            className="bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground px-3.5 py-2.5 rounded-xl border border-border/60 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download size={13} /> {t("Export Excel")}
          </button>
        </div>
      </div>

      {/* Visible Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("Filter current report table...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold text-foreground outline-none focus:border-primary"
          />
        </div>

        {/* Category Selector */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary"
          >
            <option value="All">{t("All Categories")}</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{t(cat)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content: Reports Registry */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex justify-between items-center pb-2 border-b border-border/60">
          <h2 className="text-base font-black text-foreground flex items-center gap-2">
            <FileText size={16} className="text-primary" /> {t(reportTitle)}
          </h2>
          {isPending && <RefreshCw className="animate-spin text-muted-foreground" size={16} />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-bold">
                {headers.map((h, i) => (
                  <th key={i} className="pb-4 px-4 first:pl-0 last:pr-0">{t(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-xs font-semibold">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="py-8 text-center text-muted-foreground">
                    {t("No records found in this report view.")}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-border/30 hover:bg-muted/10">
                    <td className="py-4 pl-0 pr-4 font-bold text-foreground">{row.name}</td>
                    <td className="py-4 px-4 text-muted-foreground">
                      <span className="text-[10px] bg-muted border border-border px-2 py-0.5 rounded text-muted-foreground">{row.category}</span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground font-mono">{row.ref}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 text-[9px] rounded font-black border uppercase ${
                        row.status.includes("LOW") || row.status === "UNPAID" || row.status === "REJECTED"
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          : row.status === "OPTIMAL" || row.status === "PAID" || row.status === "COMPLETED" || row.status === "DELIVERED"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 pr-0 pl-4 text-right font-black text-foreground">{row.value}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
