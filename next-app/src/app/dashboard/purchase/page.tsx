"use client";

import React, { useEffect, useState, useMemo } from "react";
import { FileText, Plus, Search, Filter, DollarSign, X, Truck, CreditCard, Sparkles, AlertTriangle, ShieldCheck, PieChart, Users, ChevronRight } from "lucide-react";
import { getRecentPurchases, getRawMaterials, getSuppliers } from "@/actions/purchaseActions";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";

export default function PurchaseLedgerPage() {
  const { t } = useLanguage();
  const [bills, setBills] = useState<any[]>([]);
  const [materials, setMaterials] = useState<Record<string, string>>({});
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"history" | "suppliers" | "duplicates" | "expenses">("history");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [rmRes, billRes, supRes] = await Promise.all([
        getRawMaterials(),
        getRecentPurchases(filter),
        getSuppliers()
      ]);
      
      if (rmRes.success && rmRes.data) {
        const matMap: Record<string, string> = {};
        rmRes.data.forEach((rm: any) => {
          matMap[rm.id] = rm.material_name;
        });
        setMaterials(matMap);
      }
      
      if (billRes.success && billRes.data) {
        setBills(billRes.data);
      }

      if (supRes.success && supRes.data) {
        setSuppliers(supRes.data);
      }
      setLoading(false);
    }
    loadData();
  }, [filter]);

  const totalInvested = useMemo(() => {
    return bills.reduce((sum, b) => sum + Number(b.grand_total || b.total_amount || 0), 0);
  }, [bills]);

  // Client-Side Duplicate Detection logic
  const duplicateBills = useMemo(() => {
    const invoiceGroups: Record<string, any[]> = {};
    const amountGroups: Record<string, any[]> = {};

    bills.forEach(b => {
      if (b.invoice_no && b.supplier_name) {
        const key = `${b.invoice_no.toLowerCase().trim()}_${b.supplier_name.toLowerCase().trim()}`;
        if (!invoiceGroups[key]) invoiceGroups[key] = [];
        invoiceGroups[key].push(b);
      }
      const amt = Number(b.grand_total || b.total_amount || 0);
      if (amt > 0 && b.bill_date && b.supplier_name) {
        const key = `${amt}_${b.bill_date}_${b.supplier_name.toLowerCase().trim()}`;
        if (!amountGroups[key]) amountGroups[key] = [];
        amountGroups[key].push(b);
      }
    });

    const duplicates: { bill: any; type: string; siblingCount: number }[] = [];
    
    Object.values(invoiceGroups).forEach(group => {
      if (group.length > 1) {
        group.forEach(b => {
          duplicates.push({ bill: b, type: t("Invoice No Match"), siblingCount: group.length });
        });
      }
    });

    Object.values(amountGroups).forEach(group => {
      if (group.length > 1) {
        group.forEach(b => {
          if (!duplicates.some(d => d.bill.id === b.id)) {
            duplicates.push({ bill: b, type: t("Amount & Date Match"), siblingCount: group.length });
          }
        });
      }
    });

    return duplicates;
  }, [bills, t]);

  // Dynamic Expenses Mapping configuration
  const expenseSummary = useMemo(() => {
    let totalChemicals = 0;
    let totalBuckets = 0;
    let totalBottles = 0;
    let totalStickers = 0;
    let totalFinished = 0;
    let totalOthers = 0;
    let totalTransport = 0;
    let totalLabour = 0;

    bills.forEach(b => {
      totalTransport += Number(b.transport_cost || 0);
      totalLabour += Number(b.labour_cost || 0);

      const items = Array.isArray(b.items) ? b.items : [];
      items.forEach((item: any) => {
        const amt = Number(item.quantity || 0) * Number(item.rate || 0);
        if (item.product_id) {
          totalFinished += amt;
        } else {
          const nameLower = (item.material_name || "").toLowerCase();
          if (nameLower.includes("bucket")) {
            totalBuckets += amt;
          } else if (nameLower.includes("bottle")) {
            totalBottles += amt;
          } else if (nameLower.includes("sticker") || nameLower.includes("label") || nameLower.includes("print")) {
            totalStickers += amt;
          } else if (nameLower.includes("acid") || nameLower.includes("titanium") || nameLower.includes("chemical") || nameLower.includes("latex") || nameLower.includes("binder") || nameLower.includes("color")) {
            totalChemicals += amt;
          } else {
            totalOthers += amt;
          }
        }
      });
    });

    const grandSum = totalChemicals + totalBuckets + totalBottles + totalStickers + totalFinished + totalOthers + totalTransport + totalLabour;

    return {
      grandSum,
      categories: [
        { name: t("Chemicals & Raw Materials"), value: totalChemicals, color: "bg-emerald-500" },
        { name: t("Buckets & Packaging"), value: totalBuckets, color: "bg-blue-500" },
        { name: t("Bottles & Containers"), value: totalBottles, color: "bg-indigo-500" },
        { name: t("Stickers & Labels"), value: totalStickers, color: "bg-amber-500" },
        { name: t("Finished Paint Products"), value: totalFinished, color: "bg-purple-500" },
        { name: t("Transport & Shipping Costs"), value: totalTransport, color: "bg-sky-500" },
        { name: t("Labour & Handling Charges"), value: totalLabour, color: "bg-teal-500" },
        { name: t("Other Procurement"), value: totalOthers, color: "bg-slate-400" }
      ].filter(c => c.value > 0)
    };
  }, [bills, t]);

  // Unified Search filter
  const filteredBills = useMemo(() => {
    if (!searchQuery) return bills;
    return bills.filter(b => 
      b.invoice_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bills, searchQuery]);

  const filteredSuppliers = useMemo(() => {
    if (!searchQuery) return suppliers;
    return suppliers.filter(s => 
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.gstin?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suppliers, searchQuery]);

  const purchasedItemsHistory = useMemo(() => {
    const list: { name: string; qty: number; rate: number; date: string; supplier: string; unit: string }[] = [];
    bills.forEach(b => {
      const items = Array.isArray(b.items) ? b.items : [];
      items.forEach((item: any) => {
        list.push({
          name: item.material_name || materials[item.raw_material_id] || t("Unknown Item"),
          qty: Number(item.quantity || 0),
          rate: Number(item.rate || 0),
          date: b.bill_date || b.date,
          supplier: b.supplier_name,
          unit: item.unit || "KG"
        });
      });
    });
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [bills, materials, t]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 p-6">
      {/* Breadcrumb Navigation */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
        <span>{t("Home")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Purchase Bills")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <FileText className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Purchase Bills")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t("Manage incoming raw materials suppliers invoices, OCR matchings, and duplicate controls.")}</p>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
          <Link 
            href="/dashboard/purchase/new"
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus size={14} /> {t("Upload Purchase Bill")}
          </Link>

          <button 
            onClick={() => setActiveView("history")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeView === "history" ? "bg-muted text-foreground border-border/80" : "bg-background text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {t("Bill History")}
          </button>
          <button 
            onClick={() => setActiveView("suppliers")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeView === "suppliers" ? "bg-muted text-foreground border-border/80" : "bg-background text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {t("Suppliers")}
          </button>
          <button 
            onClick={() => setActiveView("duplicates")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeView === "duplicates" ? "bg-muted text-foreground border-border/80" : "bg-background text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {t("Duplicate Detection")}
          </button>
          <button 
            onClick={() => setActiveView("expenses")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeView === "expenses" ? "bg-muted text-foreground border-border/80" : "bg-background text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {t("Expense Mapping")}
          </button>
        </div>
      </div>

      {/* KPI & Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Card */}
        <div className="md:col-span-2 bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start">
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">{t("Total Money Invested")}</p>
            <div className="bg-primary/10 p-2 rounded-lg"><DollarSign size={20} className="text-primary" /></div>
          </div>
          <p className="text-4xl font-black text-foreground mt-2">
            ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm font-semibold text-primary mt-2">Based on selected filter</p>
        </div>

        {/* Filter Controls */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col justify-center gap-4">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Filter size={16} /> {t("Time Filter")}
          </label>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-bold outline-none"
          >
            <option value="all">Overall (All Time)</option>
            <option value="year">Last 1 Year</option>
            <option value="month">Last Month</option>
            <option value="week">Last Week</option>
          </select>
        </div>
      </div>

      {/* Search Filter Row */}
      {activeView !== "expenses" && (
        <div className="relative max-w-md bg-card border border-border rounded-2xl p-2 shadow-xs">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={activeView === "suppliers" ? t("Search suppliers by name or GSTIN...") : t("Search bills by invoice number or supplier...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border/80 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-primary transition-all"
          />
        </div>
      )}

      {/* Dynamic Content Views */}
      <AnimatePresence mode="wait">
        {activeView === "history" && (
          <motion.div 
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden"
          >
            <h2 className="text-lg font-bold text-foreground mb-6">{t("Purchase Bills Ledger")}</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-bold">
                    <th className="pb-4 pr-4">{t("Date")}</th>
                    <th className="pb-4 px-4">{t("Invoice No")}</th>
                    <th className="pb-4 px-4">{t("Supplier")}</th>
                    <th className="pb-4 px-4">{t("Status")}</th>
                    <th className="pb-4 px-4 text-center">{t("Attachment")}</th>
                    <th className="pb-4 pl-4 text-right">{t("Total (₹)")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground font-semibold">
                        {t("Loading bills...")}
                      </td>
                    </tr>
                  ) : filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground font-semibold">
                        {t("No bills found.")}
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map(b => {
                      const amt = Number(b.grand_total || b.total_amount || 0);
                      const isPaid = b.payment_status === "PAID";
                      return (
                        <tr 
                          key={b.id} 
                          onClick={() => setSelectedBill(b)}
                          className="border-b border-border/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                        >
                          <td className="py-4 pr-4 font-mono text-muted-foreground group-hover:text-foreground transition-colors text-xs">
                            {new Date(b.bill_date || b.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-4 px-4 font-bold text-foreground text-xs">{b.invoice_no}</td>
                          <td className="py-4 px-4 font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-xs">{b.supplier_name}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              isPaid ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            }`}>
                              {b.payment_status || "UNPAID"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            {b.bill_file_path ? (
                              <a 
                                href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/purchase_bills/${b.bill_file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded text-[10px] font-bold transition-all"
                              >
                                <FileText size={10} /> {t("View")}
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-[10px] font-semibold">—</span>
                            )}
                          </td>
                          <td className="py-4 pl-4 text-right font-black text-foreground group-hover:text-primary transition-colors text-xs">
                            ₹{amt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeView === "suppliers" && (
          <motion.div 
            key="suppliers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-foreground">{t("Suppliers Directory")}</h2>
              <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                {filteredSuppliers.length} {t("Suppliers")}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-bold">
                    <th className="pb-4 pr-4">{t("Supplier Name")}</th>
                    <th className="pb-4 px-4">{t("GSTIN")}</th>
                    <th className="pb-4 px-4">{t("Categories")}</th>
                    <th className="pb-4 px-4">{t("Bank Account Details")}</th>
                    <th className="pb-4 pl-4 text-right">{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground font-semibold">
                        {t("Loading suppliers...")}
                      </td>
                    </tr>
                  ) : filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground font-semibold">
                        {t("No suppliers registered yet.")}
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map(s => (
                      <tr key={s.id} className="border-b border-border/30 hover:bg-muted/50 transition-colors">
                        <td className="py-4 pr-4 text-xs font-bold text-foreground">
                          {s.name}
                          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.address || t("Address not provided")}</p>
                        </td>
                        <td className="py-4 px-4 text-xs font-mono text-foreground">{s.gstin || "—"}</td>
                        <td className="py-4 px-4 text-[10px] space-x-1">
                          {(s.categories || []).map((cat: string, idx: number) => (
                            <span key={idx} className="inline-block px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded font-bold">
                              {cat}
                            </span>
                          ))}
                        </td>
                        <td className="py-4 px-4 text-xs">
                          {s.bank_name ? (
                            <div>
                              <p className="font-semibold text-foreground">{s.bank_name}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">A/C: {s.bank_account_no} · IFSC: {s.bank_ifsc}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-4 pl-4 text-right text-xs">
                          <button 
                            onClick={() => {
                              setSearchQuery(s.name);
                              setActiveView("history");
                            }}
                            className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ml-auto"
                          >
                            {t("View Bills")} <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeView === "duplicates" && (
          <motion.div 
            key="duplicates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-foreground">{t("Duplicate Detection Scanner")}</h2>
              <span className="text-xs font-mono font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <AlertTriangle size={14} /> {duplicateBills.length} {t("Duplicates Found")}
              </span>
            </div>

            {duplicateBills.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3.5 border-2 border-dashed border-border rounded-2xl">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{t("Security Scan Passed")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("No duplicate invoice entries or suspicious matching amounts detected.")}</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-bold">
                      <th className="pb-4 pr-4">{t("Supplier & Invoice")}</th>
                      <th className="pb-4 px-4">{t("Bill Date")}</th>
                      <th className="pb-4 px-4">{t("Amount (₹)")}</th>
                      <th className="pb-4 px-4">{t("Reason")}</th>
                      <th className="pb-4 pl-4 text-right">{t("Action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duplicateBills.map((dup, idx) => (
                      <tr key={idx} className="border-b border-border/30 hover:bg-muted/50 transition-colors">
                        <td className="py-4 pr-4 text-xs">
                          <p className="font-bold text-foreground">{dup.bill.supplier_name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Inv: {dup.bill.invoice_no}</p>
                        </td>
                        <td className="py-4 px-4 text-xs text-muted-foreground font-mono">
                          {new Date(dup.bill.bill_date || dup.bill.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-foreground">
                          ₹{Number(dup.bill.grand_total || dup.bill.total_amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-4 text-[10px]">
                          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded font-bold">
                            {dup.type}
                          </span>
                        </td>
                        <td className="py-4 pl-4 text-right text-xs">
                          <button 
                            onClick={() => setSelectedBill(dup.bill)}
                            className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-xl font-bold transition-all text-xs"
                          >
                            {t("Audit Details")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeView === "expenses" && (
          <motion.div 
            key="expenses"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-foreground">{t("Expense Category Mapping")}</h2>
              <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                {t("Procurement Cost Distribution")}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Expense Breakdown List */}
              <div className="space-y-4">
                {expenseSummary.categories.map((c, i) => {
                  const pct = expenseSummary.grandSum > 0 ? ((c.value / expenseSummary.grandSum) * 100).toFixed(1) : "0";
                  return (
                    <div key={i} className="flex flex-col gap-1.5 p-3.5 bg-muted/20 border border-border/40 rounded-2xl text-xs">
                      <div className="flex justify-between font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${c.color}`} />
                          <span>{c.name}</span>
                        </div>
                        <span>₹{c.value.toLocaleString('en-IN')} <span className="text-muted-foreground font-semibold">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${c.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expense Mapping Summary Visualizer */}
              <div className="p-8 border border-border rounded-3xl bg-muted/10 flex flex-col justify-center items-center text-center space-y-4">
                <PieChart size={48} className="text-primary animate-pulse" />
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{t("Total Outward Expense")}</p>
                  <p className="text-3xl font-black text-foreground mt-1">₹{expenseSummary.grandSum.toLocaleString('en-IN')}</p>
                </div>
                <p className="text-xs text-muted-foreground max-w-xs">
                  {t("Every raw material and freight cost has been ledger-reconciled against active company credit terms.")}
                </p>
                <Link
                  href="/dashboard/ca-portal/sales"
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  {t("View Accounts Ledger")}
                </Link>
              </div>
            </div>

            {/* Stocks/Products Purchase History Ledger */}
            <div className="border-t border-border pt-6 mt-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground">{t("Purchased Items & Stock Inward Log")}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t("Detailed breakdown of materials, chemicals, and packaging quantities inwarded from bills.")}</p>
              </div>

              <div className="overflow-x-auto max-h-[300px] overflow-y-auto border border-border/60 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">{t("Date")}</th>
                      <th className="py-3 px-4">{t("Item Name")}</th>
                      <th className="py-3 px-4">{t("Supplier")}</th>
                      <th className="py-3 px-4 text-center">{t("Quantity")}</th>
                      <th className="py-3 px-4 text-right">{t("Rate (₹)")}</th>
                      <th className="py-3 px-4 text-right">{t("Total (₹)")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchasedItemsHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground font-medium">
                          {t("No purchased items found.")}
                        </td>
                      </tr>
                    ) : (
                      purchasedItemsHistory.map((item, idx) => (
                        <tr key={idx} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 font-mono text-muted-foreground">{new Date(item.date).toLocaleDateString('en-IN')}</td>
                          <td className="py-3 px-4 font-bold text-foreground">{item.name}</td>
                          <td className="py-3 px-4 font-semibold text-muted-foreground">{item.supplier}</td>
                          <td className="py-3 px-4 text-center font-bold text-foreground">
                            {item.qty} <span className="text-[10px] text-muted-foreground font-semibold">{item.unit}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">₹{item.rate.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-primary">
                            ₹{(item.qty * item.rate).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bill Details Drawer */}
      <AnimatePresence>
        {selectedBill && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedBill(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                    Invoice: {selectedBill.invoice_no}
                  </span>
                  <h3 className="text-lg font-black text-foreground mt-2">{selectedBill.supplier_name}</h3>
                </div>
                <button
                  onClick={() => setSelectedBill(null)}
                  className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Supplier info */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">{t("Supplier details")}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">GSTIN</p>
                      <p className="font-mono font-semibold text-foreground mt-0.5">{selectedBill.supplier_gstin || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bill Date</p>
                      <p className="font-semibold text-foreground mt-0.5">{new Date(selectedBill.bill_date || selectedBill.date).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment Status</p>
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase mt-1 border ${
                        selectedBill.payment_status === "PAID" ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      }`}>
                        {selectedBill.payment_status || "UNPAID"}
                      </span>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment Type</p>
                      <p className="font-semibold text-foreground mt-0.5">{selectedBill.payment_type || "CREDIT"}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-3">
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">{t("Items List")}</h4>
                  <div className="space-y-2">
                    {(Array.isArray(selectedBill.items) ? selectedBill.items : []).map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-border/40 last:border-0">
                        <div>
                          <p className="font-bold text-foreground">
                            {item.material_name || materials[item.raw_material_id] || "Unknown Material"}
                          </p>
                          <p className="text-muted-foreground mt-0.5">Qty: {item.quantity} × ₹{item.rate}</p>
                        </div>
                        <span className="font-mono font-bold text-foreground">₹{(item.quantity * item.rate).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculations */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-3 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sub-total</span>
                    <span className="font-mono">₹{Number(selectedBill.sub_total || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>IGST</span>
                    <span className="font-mono">₹{Number(selectedBill.igst_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>CGST + SGST</span>
                    <span className="font-mono">₹{(Number(selectedBill.cgst_amount || 0) + Number(selectedBill.sgst_amount || 0)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-border/40 pt-2 mt-2 flex justify-between items-center font-bold text-foreground text-sm">
                    <span>Grand Total</span>
                    <span className="text-lg font-black text-primary">₹{Number(selectedBill.grand_total || selectedBill.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Transport Info */}
                {selectedBill.transport_details && (
                  <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-3 text-xs">
                    <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">{t("Transport Details")}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground">Vehicle No</p>
                        <p className="font-semibold text-foreground uppercase mt-0.5">{selectedBill.transport_details.vehicle_no || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">LR No</p>
                        <p className="font-semibold text-foreground mt-0.5">{selectedBill.transport_details.lr_no || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="p-6 border-t border-border bg-muted/20 flex gap-3">
                {selectedBill.bill_file_path && (
                  <a 
                    href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/purchase_bills/${selectedBill.bill_file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-xl text-center shadow-md transition-all"
                  >
                    {t("Open Bill File")}
                  </a>
                )}
                <button
                  onClick={() => setSelectedBill(null)}
                  className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border rounded-xl transition-all"
                >
                  {t("Close")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
