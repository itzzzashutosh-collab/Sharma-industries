"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FileText, Search, ExternalLink, Filter } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useLanguage } from "@/components/LanguageProvider";

export default function QuotationsHistoryPage() {
  const { t } = useLanguage();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");



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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <FileText className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">{t("Quotation History")}</h1>
            <p className="text-muted-foreground mt-1">{t("Manage and track all generated quotations and settlements.")}</p>
          </div>
        </div>
        <Link
          href="/dashboard/ceo/quotations/new"
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={20} /> {t("Add New Quotation")}
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("Search by Quotation No or Client")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground outline-none focus:border-primary transition-colors"
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
                  const isPaid = inv.balance_due <= 0;
                  return (
                    <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
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
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/dashboard/ceo/quotations/${inv.id}`}
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
    </div>
  );
}
