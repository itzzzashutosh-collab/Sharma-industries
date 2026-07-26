"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  FileSpreadsheet, Download, Search, Package, AlertTriangle, AlertCircle,
  CheckCircle2, ShoppingCart, Layers, Printer, ShieldCheck, ArrowUpRight,
  RefreshCw, DollarSign, Filter, Sparkles
} from "lucide-react";

interface InventoryReportData {
  summary: {
    total_valuation: number;
    total_items_count: number;
    total_liters: number;
    low_stock_count: number;
    out_of_stock_count: number;
    turnover_rate: string;
  };
  category_valuation: Array<{
    name: string;
    valuation: number;
    liters: number;
    percentage: string;
  }>;
  items: Array<{
    sku: string;
    name: string;
    pack_size: string;
    category: string;
    in_stock: number;
    reorder_level: number;
    cost_price: number;
    selling_price: number;
    total_valuation: number;
    status: string;
  }>;
}

interface Props {
  initialData: InventoryReportData;
}

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export function InventoryReportClient({ initialData }: Props) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const report = initialData?.summary ? initialData : {
    summary: {
      total_valuation: 2480000,
      total_items_count: 1420,
      total_liters: 8950,
      low_stock_count: 6,
      out_of_stock_count: 2,
      turnover_rate: "4.2x / Year"
    },
    category_valuation: [
      { name: "Interior Emulsions", valuation: 1116000, liters: 4000, percentage: "45%" },
      { name: "Exterior Waterproofing", valuation: 744000, liters: 2700, percentage: "30%" },
      { name: "Royale Texture Art", valuation: 372000, liters: 1350, percentage: "15%" },
      { name: "Enamels & Accessories", valuation: 248000, liters: 900, percentage: "10%" }
    ],
    items: [
      { sku: "SKU-ROY-20L", name: "Royale Luxury Emulsion Shimmer", pack_size: "20 Liters", category: "Interior Emulsion", in_stock: 45, reorder_level: 15, cost_price: 4200, selling_price: 4800, total_valuation: 189000, status: "In Stock" },
      { sku: "SKU-APC-20L", name: "Apcolite Premium Gloss Enamel", pack_size: "20 Liters", category: "Enamels & Accessories", in_stock: 8, reorder_level: 12, cost_price: 2800, selling_price: 3200, total_valuation: 22400, status: "Low Stock" },
      { sku: "SKU-EXT-20L", name: "Apex Ultima Exterior Weatherproof", pack_size: "20 Liters", category: "Exterior Waterproofing", in_stock: 62, reorder_level: 20, cost_price: 3900, selling_price: 4500, total_valuation: 241800, status: "In Stock" },
      { sku: "SKU-STU-10L", name: "Royale Play Stucco Gold Texture", pack_size: "10 Liters", category: "Royale Texture Art", in_stock: 0, reorder_level: 10, cost_price: 3100, selling_price: 3600, total_valuation: 0, status: "Out of Stock" },
      { sku: "SKU-PRM-20L", name: "Acrylic Wall Primer Exterior", pack_size: "20 Liters", category: "Exterior Waterproofing", in_stock: 5, reorder_level: 15, cost_price: 2100, selling_price: 2400, total_valuation: 10500, status: "Low Stock" },
      { sku: "SKU-DMP-20L", name: "SmartCare Damp-Block Waterproofing", pack_size: "20 Liters", category: "Exterior Waterproofing", in_stock: 28, reorder_level: 10, cost_price: 3400, selling_price: 3950, total_valuation: 95200, status: "In Stock" }
    ]
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredItems = useMemo(() => {
    return report.items.filter(item => {
      const s = search.toLowerCase();
      const matchSearch = !search || item.name.toLowerCase().includes(s) || item.sku.toLowerCase().includes(s) || item.category.toLowerCase().includes(s);
      const matchCategory = categoryFilter === "all" || item.category.toLowerCase().includes(categoryFilter.toLowerCase());
      const matchStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchCategory && matchStatus;
    });
  }, [report.items, search, categoryFilter, statusFilter]);

  const alertItems = useMemo(() => {
    return report.items.filter(i => i.status === "Low Stock" || i.status === "Out of Stock");
  }, [report.items]);

  const handleExportCSV = () => {
    const headers = ["SKU", "Product Name", "Pack Size", "Category", "In Stock Units", "Reorder Level", "Cost Price", "Selling Price", "Valuation", "Status"];
    const rows = report.items.map(item => [
      item.sku, item.name, item.pack_size, item.category, item.in_stock, item.reorder_level, item.cost_price, item.selling_price, item.total_valuation, item.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Dealer_Inventory_Audit_Report_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) {
    return (
      <div className="p-12 text-center text-xs font-bold text-muted-foreground animate-pulse bg-card rounded-2xl border border-border">
        Loading Dealer Inventory & Stock Valuation Audit...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── Top Header Navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Reports</span><span className="opacity-40">/</span><span className="text-foreground">Inventory Audit</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <Package size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                Dealer Inventory Audit & Stock Valuation Report
              </h1>
              <p className="text-xs text-muted-foreground">
                Track warehouse stock valuation, low stock reorder alerts, product pack sizes, and factory restock orders
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-bold hover:bg-muted transition-all cursor-pointer shadow-2xs"
          >
            <Download size={14} /> Export Inventory CSV
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-black hover:bg-primary/90 transition-all cursor-pointer shadow-md"
          >
            <Printer size={14} /> Print Audit Report
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Store Stock Valuation</span>
          <p className="text-2xl font-black text-primary font-mono">{fmt(report.summary.total_valuation)}</p>
          <p className="text-[11px] text-emerald-600 font-bold">Cost Value in Showroom</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Paint Volume in Stock</span>
          <p className="text-2xl font-black text-foreground font-mono">{report.summary.total_liters.toLocaleString("en-IN")} Liters</p>
          <p className="text-[11px] text-muted-foreground">{report.summary.total_items_count} Units In Warehouse</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Low Stock Reorder Alerts</span>
          <p className="text-2xl font-black text-amber-500 font-mono flex items-center gap-1.5">
            <AlertTriangle size={20} /> {report.summary.low_stock_count} SKUs
          </p>
          <p className="text-[11px] text-muted-foreground">Below Minimum Reorder Point</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Out of Stock SKUs</span>
          <p className="text-2xl font-black text-red-500 font-mono flex items-center gap-1.5">
            <AlertCircle size={20} /> {report.summary.out_of_stock_count} SKUs
          </p>
          <p className="text-[11px] text-muted-foreground">Urgent Factory Order Needed</p>
        </div>
      </div>

      {/* ── LOW STOCK REORDER ALERTS SECTION ───────────────────────────── */}
      {alertItems.length > 0 && (
        <div className="bg-card border-2 border-amber-500/40 rounded-3xl p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h2 className="text-base font-black text-foreground uppercase tracking-wider">
                Low Stock & Reorder Alert Highlights ({alertItems.length} SKUs)
              </h2>
            </div>
            <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full text-[10px] font-black uppercase">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alertItems.map(item => (
              <div key={item.sku} className="bg-background border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-muted-foreground">{item.sku}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      item.status === "Out of Stock" ? "bg-red-500 text-white" : "bg-amber-500/20 text-amber-700"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h4 className="font-black text-foreground text-xs">{item.name}</h4>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Available: <span className="font-black text-foreground">{item.in_stock} Units</span> • Reorder Threshold: {item.reorder_level} Units
                  </p>
                </div>

                <button
                  onClick={() => alert(`Placing Restock Factory Order for ${item.name}...`)}
                  className="px-3 py-2 bg-primary text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 hover:bg-primary/90 transition-all cursor-pointer shadow-2xs"
                >
                  <ShoppingCart size={13} /> Order Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CATEGORY VALUATION BREAKDOWN ─────────────────────────────────── */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} className="text-primary" /> Stock Valuation by Category
          </h3>
          <span className="text-[10px] font-mono text-muted-foreground">Total Valuation: {fmt(report.summary.total_valuation)}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {report.category_valuation.map((cat, idx) => (
            <div key={idx} className="bg-muted/40 p-4 rounded-2xl border border-border space-y-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase block truncate">{cat.name}</span>
              <p className="font-mono font-black text-primary text-base">{fmt(cat.valuation)}</p>
              <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                <span>{cat.liters} L Stock</span>
                <span className="font-bold text-foreground">{cat.percentage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── INVENTORY AUDIT CATALOG TABLE ───────────────────────────────── */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-primary" />
            <h2 className="text-base font-black text-foreground uppercase tracking-wider">
              Store Stock Inventory Catalog ({filteredItems.length} SKUs)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search SKU or product name..."
                className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none focus:border-primary"
            >
              <option value="all">All Stock Status</option>
              <option value="in stock">In Stock</option>
              <option value="low stock">Low Stock ⚠️</option>
              <option value="out of stock">Out of Stock 🚨</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-3">SKU Code</th>
                <th className="py-3 px-3">Product Name & Pack Size</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-center">In Stock Units</th>
                <th className="py-3 px-3 text-center">Reorder Point</th>
                <th className="py-3 px-3 text-right">Cost Price (₹)</th>
                <th className="py-3 px-3 text-right">Selling Price (₹)</th>
                <th className="py-3 px-3 text-right">Total Valuation</th>
                <th className="py-3 px-3 text-center">Health Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredItems.map(item => (
                <tr key={item.sku} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-muted-foreground">
                    {item.sku}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-foreground block">{item.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{item.pack_size}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-muted rounded text-[10px] font-bold text-foreground border border-border">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-black text-foreground">
                    {item.in_stock} Units
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-muted-foreground">
                    {item.reorder_level} Units
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                    {fmt(item.cost_price)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                    {fmt(item.selling_price)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-emerald-600">
                    {fmt(item.total_valuation)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      item.status === "In Stock"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : item.status === "Low Stock"
                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        : "bg-red-500/10 text-red-600 border border-red-500/20"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => alert(`Placing Restock Order for ${item.name}...`)}
                      className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      🛒 Restock
                    </button>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-xs text-muted-foreground">
                    No inventory SKUs match the search filters.
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
