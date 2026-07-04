"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  Store, 
  Building2, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  PlusCircle, 
  Loader2 
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { DealerOnboardingModal } from "../../admin/sales-team/DealerOnboardingModal";

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

export default function SalesmanCustomersClient() {
  const salesmanId = "SM-101";
  const salesmanName = "Rajesh Kumar";

  const [dealers, setDealers] = useState<DBDealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const fetchDealers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('assigned_salesman_id', salesmanId)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setDealers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const filteredDealers = useMemo(() => {
    return dealers.filter(d => 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.gst_number && d.gst_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [dealers, searchTerm]);

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Store className="text-primary w-8 h-8" />
            My Partner Ledger
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            Manage your territory routes. Review mapped Dealers, Distributors, Depots, and upload KYC credentials.
          </p>
        </div>
        <button 
          onClick={() => setIsOnboardingOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
        >
          <PlusCircle size={16} /> Onboard New Partner
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search business name or GST..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-slate-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Business Partner</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Designation</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Territory Localities</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">GST Number</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">KYC Documents</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={18} />
                      Loading mapped customers...
                    </div>
                  </td>
                </tr>
              ) : filteredDealers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                    No customers found on this route.
                  </td>
                </tr>
              ) : (
                filteredDealers.map(dealer => (
                  <tr key={dealer.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black border border-slate-200">
                          {dealer.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{dealer.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[200px]">{dealer.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded border text-[10px] font-black uppercase tracking-wider ${
                        dealer.designation === 'Distributor' ? 'bg-violet-50 text-violet-600 border-violet-200' :
                        dealer.designation === 'Depot' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-blue-50 text-blue-600 border-blue-200'
                      }`}>
                        {dealer.designation}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">
                      {dealer.localities || "N/A"}
                    </td>
                    <td className="py-4 px-6 font-mono text-sm font-bold text-slate-700">
                      {dealer.gst_number || "UNREGISTERED"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {dealer.pan_card_url && (
                          <a href={dealer.pan_card_url} target="_blank" rel="noreferrer" className="text-[9px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded flex items-center gap-1 uppercase transition-colors">
                            PAN <ExternalLink size={10} />
                          </a>
                        )}
                        {dealer.aadhaar_front_url && (
                          <a href={dealer.aadhaar_front_url} target="_blank" rel="noreferrer" className="text-[9px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded flex items-center gap-1 uppercase transition-colors">
                            AADHAAR <ExternalLink size={10} />
                          </a>
                        )}
                        {(!dealer.pan_card_url && !dealer.aadhaar_front_url) && (
                          <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-50 border border-slate-200 px-2 py-1 rounded">No KYC Docs</span>
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

      {/* Onboarding Modal */}
      {isOnboardingOpen && (
        <DealerOnboardingModal 
          salesmanId={salesmanId}
          salesmanName={salesmanName}
          onClose={() => setIsOnboardingOpen(false)}
          onSuccess={() => {
            setIsOnboardingOpen(false);
            fetchDealers(); // Refresh ledger
          }}
        />
      )}

    </div>
  );
}
