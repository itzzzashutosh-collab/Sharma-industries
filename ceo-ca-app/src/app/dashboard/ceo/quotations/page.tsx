"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FileText, Search, ExternalLink, X } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";

export default function QuotationsHistoryPage() {
  const { t } = useLanguage();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/quotations');
      const data = await res.json();
      if (data.success) {
        setQuotations(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch quotations", err);
    }
    setIsLoading(false);
  };

  const filteredQuotations = quotations.filter((inv) => {
    const custName = typeof inv.customer === 'object' && inv.customer !== null 
      ? (inv.customer.name || '') 
      : (typeof inv.customer === 'string' ? inv.customer : '');

    return (inv.quotation_no || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      custName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
        <span>{t("Home")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Quotations")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <FileText className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Quotations")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t("Manage, draft, and issue quotations to prospects and partners.")}</p>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
          <Link
            href="/dashboard/ceo/quotations/new"
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus size={14} /> {t("New Quotation")}
          </Link>
          <button className="bg-muted text-foreground px-4 py-2 rounded-xl text-xs font-bold border border-border/80">
            {t("Quotation List")}
          </button>
          <button className="bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl text-xs font-bold border border-border/60 transition-colors">
            {t("Convert to Invoice")}
          </button>
          <button className="bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl text-xs font-bold border border-border/60 transition-colors">
            {t("Print")}
          </button>
          <button className="bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl text-xs font-bold border border-border/60 transition-colors ml-auto">
            {t("Export")}
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 border border-border rounded-2xl shadow-xs">
        <div className="relative flex-1 max-w-md w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("Search by Quotation No or Client")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs font-semibold text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("Date")}</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("Quotation No")}</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("Client")}</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">{t("Amount (₹)")}</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground font-medium">
                    {t("Loading quotations...")}
                  </td>
                </tr>
              ) : filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground font-medium">
                    {t("No quotations found.")}
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((inv) => {
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedQuotation(inv)}
                      className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-foreground">
                        {new Date(inv.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-foreground">
                        {inv.quotation_no}
                      </td>
                      <td className="py-4 px-6 font-semibold text-foreground">
                        {typeof inv.customer === 'object' && inv.customer !== null 
                          ? (inv.customer.name || '') 
                          : (typeof inv.customer === 'string' ? inv.customer : '')}
                      </td>
                      <td className="py-4 px-6 text-right font-black text-foreground">
                        ₹{(inv.grand_total || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={inv.pdf_url || `/dashboard/ceo/quotations/${inv.id}`}
                          target={inv.pdf_url ? "_blank" : undefined}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-sm font-bold transition-colors"
                        >
                          {t("View")} <ExternalLink size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Recent Activity */}
      <div className="pt-4 max-w-3xl">
        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">{t("Recent Activity")}</p>
          <div className="space-y-3.5">
            <div className="flex justify-between items-start text-xs border-b border-border/40 pb-2">
              <div>
                <p className="font-bold text-foreground">QTN-2025-948 Created</p>
                <p className="text-muted-foreground mt-0.5">Apex Paints — ₹1,80,000</p>
              </div>
              <span className="text-[10px] text-muted-foreground">Yesterday</span>
            </div>
            <div className="flex justify-between items-start text-xs border-b border-border/40 pb-2">
              <div>
                <p className="font-bold text-foreground">Quotation Converted to Invoice</p>
                <p className="text-muted-foreground mt-0.5">Ravi Traders — ₹4,50,000</p>
              </div>
              <span className="text-[10px] text-muted-foreground">Jul 8, 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Sliding Drawer */}
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
              className="relative w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                    {selectedQuotation.quotation_no}
                  </span>
                  <h3 className="text-lg font-black text-foreground mt-2">
                    {typeof selectedQuotation.customer === 'object' && selectedQuotation.customer !== null 
                      ? selectedQuotation.customer.name 
                      : selectedQuotation.customer}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedQuotation(null)}
                  className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* General Information */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-4">
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">{t("General Information")}</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-muted-foreground">{t("Quotation Date")}</p>
                      <p className="font-semibold text-foreground mt-0.5">{new Date(selectedQuotation.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("Status")}</p>
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase mt-1 border bg-amber-500/10 text-amber-600 border-amber-500/20">
                          {t("Draft")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items detail list */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-3">
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">{t("Quotation Items")}</h4>
                  <div className="space-y-2">
                    {selectedQuotation.items && Array.isArray(selectedQuotation.items) ? (
                      selectedQuotation.items.map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs py-2 border-b border-border/40 last:border-0">
                          <div>
                            <p className="font-bold text-foreground">{it.name}</p>
                            <p className="text-muted-foreground mt-0.5">Qty: {it.qty || it.quantity} × ₹{it.rate}</p>
                          </div>
                          <span className="font-mono font-bold text-foreground">₹{((it.qty || it.quantity) * it.rate).toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No items detailed.</p>
                    )}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">{t("Pricing Summary")}</h4>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{(selectedQuotation.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST (CGST + SGST)</span>
                    <span className="font-mono">₹{(selectedQuotation.total_gst || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-foreground font-bold border-t border-border/40 pt-2 text-sm">
                    <span>Total Amount</span>
                    <span className="font-mono text-primary">₹{(selectedQuotation.grand_total || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">{t("Timeline")}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quotation Issued</span>
                      <span className="font-semibold text-foreground">{new Date(selectedQuotation.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Controls Footer */}
              <div className="p-6 border-t border-border bg-muted/20 flex gap-3">
                <Link
                  href={`/dashboard/ceo/quotations/${selectedQuotation.id}`}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-xl text-center shadow-md transition-all"
                >
                  {t("Convert to Invoice")}
                </Link>
                <button
                  onClick={() => setSelectedQuotation(null)}
                  className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border rounded-xl transition-all"
                >
                  {t("Close Details")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
