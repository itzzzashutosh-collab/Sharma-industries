"use client";

import React, { useEffect, useState } from "react";
import { Users, Search, Store, Building2, CheckCircle2, FileText, ExternalLink, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface DBDealer {
  id: string;
  name: string;
  address: string;
  localities: string;
  designation: string;
  gst_number: string;
  assigned_salesman_id: string;
  pan_card_url: string;
  aadhaar_front_url: string;
  aadhaar_back_url: string;
  created_at: string;
}

export default function CEODealersPage() {
  const { t } = useLanguage();
  const [dealers, setDealers] = useState<DBDealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (data && !error) {
        setDealers(data);
      }
    } catch (error) {
      console.error("Error fetching dealers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDealers = dealers.filter((d) =>
    (d.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (d.assigned_salesman_id?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <Store className="text-primary w-8 h-8" />
            {t("Dealer KYC & Onboarding Engine")}
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm max-w-2xl">
            {t("Master directory of all onboarded Partners, Depots, and Distributors. Review their KYC documents, exact designations, and the salesmen assigned to their territories.")}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={t("Search by business name or salesman...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("Total Partners")}</p>
            <p className="text-2xl font-black text-slate-800">{dealers.length}</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
            <Store size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("Dealers")}</p>
            <p className="text-2xl font-black text-slate-800">
              {dealers.filter(d => d.designation === "Dealer").length}
            </p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-violet-500/10 rounded-xl text-violet-500">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("Distributors")}</p>
            <p className="text-2xl font-black text-slate-800">
              {dealers.filter(d => d.designation === "Distributor").length}
            </p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("Depots")}</p>
            <p className="text-2xl font-black text-slate-800">
              {dealers.filter(d => d.designation === "Depot").length}
            </p>
          </div>
        </div>
      </div>

      {/* Dealers List */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">{t("Business Partner")}</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">{t("Designation")}</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">{t("Territory / Localities")}</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">{t("GST Number")}</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">{t("Assigned Salesman")}</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">{t("KYC Documents")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      Loading partners from KYC Database...
                    </div>
                  </td>
                </tr>
              ) : filteredDealers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-sm font-bold text-slate-600">No KYC partners found.</p>
                      <p className="text-xs font-medium text-slate-400 mt-1 max-w-xs">Dealers onboarded via the Salesman CRM will automatically appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDealers.map((dealer) => (
                  <tr key={dealer.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black border border-slate-200">
                          {(dealer.name || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{dealer.name}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5 truncate max-w-[200px]">{dealer.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded border text-[10px] font-black uppercase tracking-wider ${
                        dealer.designation === 'Distributor' ? 'bg-violet-50 text-violet-600 border-violet-200' :
                        dealer.designation === 'Depot' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-blue-50 text-blue-600 border-blue-200'
                      }`}>
                        {dealer.designation}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">{dealer.localities}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm font-bold text-slate-700">
                        {dealer.gst_number || <span className="text-slate-400 font-medium italic text-xs">UNREGISTERED</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">
                          {(dealer.assigned_salesman_id || "S")[0]}
                        </div>
                        <p className="text-sm font-bold text-slate-700">{dealer.assigned_salesman_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {dealer.pan_card_url && (
                          <a href={dealer.pan_card_url} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors uppercase tracking-wider shadow-sm">
                            PAN <ExternalLink size={12} />
                          </a>
                        )}
                        {dealer.aadhaar_front_url && (
                          <a href={dealer.aadhaar_front_url} target="_blank" rel="noreferrer" className="text-[10px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors uppercase tracking-wider shadow-sm">
                            AADHAAR <ExternalLink size={12} />
                          </a>
                        )}
                        {(!dealer.pan_card_url && !dealer.aadhaar_front_url) && (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg">No Documents</span>
                        )}
                      </div>
                    </td>
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
