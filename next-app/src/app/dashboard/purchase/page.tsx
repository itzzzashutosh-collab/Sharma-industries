"use client";

import React, { useEffect, useState, useMemo } from "react";
import { FileText, Plus, Search, Filter, DollarSign, X, Truck, CreditCard } from "lucide-react";
import { getRecentPurchases, getRawMaterials } from "@/actions/purchaseActions";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function PurchaseLedgerPage() {
  const { t } = useLanguage();
  const [bills, setBills] = useState<any[]>([]);
  const [materials, setMaterials] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("all");
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [rmRes, billRes] = await Promise.all([
        getRawMaterials(),
        getRecentPurchases(filter)
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
      setLoading(false);
    }
    loadData();
  }, [filter]);

  const totalInvested = useMemo(() => {
    return bills.reduce((sum, b) => sum + Number(b.grand_total || b.total_amount || 0), 0);
  }, [bills]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <FileText className="text-primary" size={32} /> {t("Purchase History")}
          </h1>
          <p className="text-muted-foreground mt-2">{t("Review past purchases, filter by time, and track investments.")}</p>
        </div>
        <Link 
          href="/dashboard/purchase/new"
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} /> {t("Add New Bill")}
        </Link>
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
            className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-bold"
          >
            <option value="all">Overall (All Time)</option>
            <option value="year">Last 1 Year</option>
            <option value="month">Last Month</option>
            <option value="week">Last Week</option>
          </select>
        </div>
      </div>

      {/* History Ledger Table */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden">
        <h2 className="text-lg font-bold text-foreground mb-6">{t("Purchase Bills Ledger")}</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider font-bold">
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
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground font-semibold">
                    {t("No bills found for this time period.")}
                  </td>
                </tr>
              ) : (
                bills.map(b => {
                  const amt = Number(b.grand_total || b.total_amount || 0);
                  const isPaid = b.payment_status === "PAID";
                  return (
                    <tr 
                      key={b.id} 
                      onClick={() => setSelectedBill(b)}
                      className="border-b border-border/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 pr-4 font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                        {new Date(b.bill_date || b.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-4 px-4 font-bold text-foreground">{b.invoice_no}</td>
                      <td className="py-4 px-4 font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{b.supplier_name}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-sm font-bold uppercase tracking-wider border ${
                          isPaid ? 'bg-primary/10 text-primary border-primary/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {b.payment_status || "UNPAID"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        {b.bill_file_path ? (
                          <a 
                            href={`https://mwqjdhwlfuwhyslqtpwd.supabase.co/storage/v1/object/public/purchase_bills/${b.bill_file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                          >
                            <FileText size={12} /> {t("View")}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs font-semibold">—</span>
                        )}
                      </td>
                      <td className="py-4 pl-4 text-right font-black text-foreground group-hover:text-primary transition-colors">
                        ₹{amt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Details Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80  animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden slide-in-from-bottom-4 animate-in">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <div>
                <h2 className="text-2xl font-black text-foreground">Invoice: {selectedBill.invoice_no}</h2>
                <p className="text-muted-foreground font-semibold">Date: {new Date(selectedBill.bill_date || selectedBill.date).toLocaleDateString('en-IN')}</p>
              </div>
              <button 
                onClick={() => setSelectedBill(null)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              
              {/* Top Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-background border border-border p-4 rounded-2xl">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">{t("Supplier Details")}</h3>
                  <p className="text-lg font-bold text-foreground">{selectedBill.supplier_name}</p>
                  <p className="text-muted-foreground font-mono text-sm mt-1">GSTIN: {selectedBill.supplier_gstin || "N/A"}</p>
                </div>

                <div className="bg-background border border-border p-4 rounded-2xl flex flex-col justify-center">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                    <CreditCard size={14} /> {t("Payment Info")}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider border ${
                      selectedBill.payment_status === "PAID" ? 'bg-primary/10 text-primary border-primary/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      Status: {selectedBill.payment_status || "UNPAID"}
                    </span>
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider">
                      Type: {selectedBill.payment_type || "CREDIT"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4">{t("Purchased Items")}</h3>
                <div className="border border-border rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/30">
                      <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider font-bold">
                        <th className="py-3 px-4">{t("Material")}</th>
                        <th className="py-3 px-4 text-right">{t("Quantity")}</th>
                        <th className="py-3 px-4 text-right">{t("Rate")}</th>
                        <th className="py-3 px-4 text-right">{t("Amount")}</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {(Array.isArray(selectedBill.items) ? selectedBill.items : []).map((item: any, i: number) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-3 px-4 font-semibold text-foreground">
                            {item.material_name || materials[item.raw_material_id] || "Unknown Material"}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-muted-foreground">{item.quantity}</td>
                          <td className="py-3 px-4 text-right font-mono text-muted-foreground">₹{item.rate}</td>
                          <td className="py-3 px-4 text-right font-black text-foreground">₹{(item.quantity * item.rate).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer Calculations & Transport */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-background border border-border p-5 rounded-2xl space-y-3">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Truck size={14} /> {t("Transport")}
                  </h3>
                  {selectedBill.transport_details ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vehicle No:</span>
                        <span className="font-bold text-foreground font-mono uppercase">{selectedBill.transport_details.vehicle_no || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">LR No:</span>
                        <span className="font-bold text-foreground font-mono">{selectedBill.transport_details.lr_no || "N/A"}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground italic">No transport details</p>
                  )}
                  
                  {selectedBill.bill_file_path && (
                    <div className="pt-2 border-t border-border mt-4">
                      <a 
                        href={`https://mwqjdhwlfuwhyslqtpwd.supabase.co/storage/v1/object/public/purchase_bills/${selectedBill.bill_file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 py-2.5 rounded-xl text-sm font-bold transition-all"
                      >
                        <FileText size={16} /> {t("View Original Bill File")}
                      </a>
                    </div>
                  )}
                </div>

                <div className="bg-muted/10 border-2 border-border p-5 rounded-2xl space-y-2 flex flex-col justify-center">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Sub-total</span>
                    <span className="font-semibold text-foreground">₹{Number(selectedBill.sub_total || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>IGST</span>
                    <span>₹{Number(selectedBill.igst_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>CGST + SGST</span>
                    <span>₹{(Number(selectedBill.cgst_amount || 0) + Number(selectedBill.sgst_amount || 0)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2 flex justify-between items-center">
                    <span className="font-bold text-foreground uppercase tracking-wider">Grand Total</span>
                    <span className="text-2xl font-black text-primary">₹{Number(selectedBill.grand_total || selectedBill.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
