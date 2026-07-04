"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  PlusCircle, 
  Loader2, 
  X, 
  AlertCircle, 
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface DBPainter {
  id: string;
  name: string;
  phone: string;
  role: string;
  is_active: boolean;
  is_approved: boolean;
  address: string | null;
  territory: string | null;
  created_at: string;
}

export default function SalesmanPaintersClient() {
  const [painters, setPainters] = useState<DBPainter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Registration modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    territory: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchPainters = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'painter')
        .order('created_at', { ascending: false });

      if (data && !error) {
        setPainters(data as DBPainter[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPainters();
  }, []);

  const filteredPainters = useMemo(() => {
    return painters.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      (p.territory && p.territory.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [painters, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setFormError("Name and Phone Number are required.");
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setFormError("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      // 1. Generate password hash of "admin123" for sandbox loggability
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync("admin123", salt);

      // 2. Insert into users table
      const { error: insertErr } = await supabase
        .from('users')
        .insert([{
          phone: formData.phone,
          password_hash: passwordHash,
          name: formData.name,
          role: "painter",
          is_active: true,
          is_approved: true,
          address: formData.address || null,
          territory: formData.territory || null,
          status: "APPROVED"
        }]);

      if (insertErr) {
        if (insertErr.code === '23505') {
          throw new Error("This phone number is already registered.");
        }
        throw insertErr;
      }

      // Close & Refresh
      setIsModalOpen(false);
      setFormData({ name: "", phone: "", address: "", territory: "" });
      fetchPainters();
    } catch (err: any) {
      setFormError(err.message || "Failed to onboard painter.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Users className="text-primary w-8 h-8" />
            Painters directory & Onboarding
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            Onboard painters to Sharma Industries Loyalty Program, manage profile credentials, and monitor routes.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
        >
          <PlusCircle size={16} /> Onboard Painter
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search painters by name, phone, or locality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-slate-700"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Painter Name</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Phone Number</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Locality / Route</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Registered Address</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={18} />
                      Loading painters directory...
                    </div>
                  </td>
                </tr>
              ) : filteredPainters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                    No painters onboarded yet.
                  </td>
                </tr>
              ) : (
                filteredPainters.map(p => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-xs font-black">
                        {p.name[0].toUpperCase()}
                      </div>
                      {p.name}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-650 font-semibold">{p.phone}</td>
                    <td className="py-4 px-6 font-semibold text-slate-600">{p.territory || "N/A"}</td>
                    <td className="py-4 px-6 text-slate-500 max-w-xs truncate">{p.address || "N/A"}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-250 flex items-center gap-1 w-max mx-auto">
                        <ShieldCheck size={10} /> Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboarding Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl overflow-y-auto max-h-[85vh] animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-800">Onboard Painter</h2>
                <p className="text-xs font-semibold text-slate-500 mt-1">Enroll painter into loyalty system</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs font-bold text-rose-700">
                <AlertCircle size={16} className="shrink-0" /> {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Painter Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800" placeholder="e.g. Ramesh Parmar" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number *</label>
                <input required type="tel" maxLength={10} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 font-mono" placeholder="10-digit number" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Locality / Territory Area</label>
                <input type="text" value={formData.territory} onChange={e => setFormData({...formData, territory: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800" placeholder="e.g. Borivali East" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Physical Address</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800" placeholder="Street name, landmark, pin code" />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-2 rounded-xl hover:bg-primary/90 transition-all text-xs">
                  {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : "Complete Onboarding"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
