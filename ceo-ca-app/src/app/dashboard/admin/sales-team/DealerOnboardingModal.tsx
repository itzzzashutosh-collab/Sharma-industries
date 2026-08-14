"use client";

import React, { useState } from "react";
import { X, Upload, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// We need a supabase client that has insert privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Props {
  salesmanId: string;
  salesmanName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DealerOnboardingModal({ salesmanId, salesmanName, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    localities: "",
    designation: "Dealer", // Default
    gst_number: "",
  });

  const [files, setFiles] = useState<{
    pan: File | null;
    aadhaarFront: File | null;
    aadhaarBack: File | null;
  }>({
    pan: null,
    aadhaarFront: null,
    aadhaarBack: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [type]: e.target.files[0] });
    }
  };

  const uploadFile = async (file: File, docName: string, dealerName: string): Promise<string | null> => {
    // Format: DealerName_SalesmanID_DocName.ext
    const sanitizedDealerName = dealerName.replace(/[^a-zA-Z0-9]/g, "_");
    const extension = file.name.split('.').pop();
    const newFileName = `${sanitizedDealerName}_${salesmanId}_${docName}.${extension}`;

    const { data, error } = await supabase.storage
      .from('dealers')
      .upload(newFileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error("Upload error:", error);
      throw new Error(`Failed to upload ${docName}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('dealers')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!formData.name) throw new Error("Business/Partner name is required");
      
      let panUrl = null;
      let aadhaarFrontUrl = null;
      let aadhaarBackUrl = null;

      // 1. Upload files with renaming logic
      if (files.pan) panUrl = await uploadFile(files.pan, "PAN", formData.name);
      if (files.aadhaarFront) aadhaarFrontUrl = await uploadFile(files.aadhaarFront, "Aadhaar_Front", formData.name);
      if (files.aadhaarBack) aadhaarBackUrl = await uploadFile(files.aadhaarBack, "Aadhaar_Back", formData.name);

      // 2. Save to database
      const { error: dbError } = await supabase
        .from('dealers')
        .insert([{
          name: formData.name,
          address: formData.address,
          localities: formData.localities,
          designation: formData.designation,
          gst_number: formData.gst_number,
          assigned_salesman_id: salesmanId,
          pan_card_url: panUrl,
          aadhaar_front_url: aadhaarFrontUrl,
          aadhaar_back_url: aadhaarBackUrl
        }]);

      if (dbError) throw dbError;

      onSuccess();
    } catch (err: any) {
      setError(err.message || "An error occurred during onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Onboard New Partner</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Assigning to Route: {salesmanName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="text-rose-500 w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business / Partner Name *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800" placeholder="e.g. Apex Buildmart Pvt Ltd" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Designation *</label>
              <select required value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800">
                <option value="Dealer">Dealer (Direct Customer Sales)</option>
                <option value="Distributor">Distributor (B2B Supply Chain)</option>
                <option value="Depot">Depot (Regional Storage & Sales)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">GST Number</label>
              <input type="text" value={formData.gst_number} onChange={e => setFormData({...formData, gst_number: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 uppercase" placeholder="27XXXXX1234X1ZX" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Address</label>
              <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800" placeholder="Full physical address" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Localities / Territory Areas</label>
              <input type="text" value={formData.localities} onChange={e => setFormData({...formData, localities: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800" placeholder="e.g. Andheri East, Powai, Sakinaka" />
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Document Uploads */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">KYC Document Uploads</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* PAN */}
              <div className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-colors relative overflow-hidden ${files.pan ? 'bg-primary/5 border-primary/30' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange(e, 'pan')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {files.pan ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                    <p className="text-xs font-bold text-slate-700 truncate w-full px-2">{files.pan.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">PAN CARD</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-600">Upload PAN Card</p>
                    <p className="text-[10px] text-slate-400 mt-1">Image or PDF</p>
                  </>
                )}
              </div>

              {/* Aadhaar Front */}
              <div className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-colors relative overflow-hidden ${files.aadhaarFront ? 'bg-primary/5 border-primary/30' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange(e, 'aadhaarFront')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {files.aadhaarFront ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                    <p className="text-xs font-bold text-slate-700 truncate w-full px-2">{files.aadhaarFront.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">AADHAAR (FRONT)</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-600">Upload Aadhaar (Front)</p>
                    <p className="text-[10px] text-slate-400 mt-1">Image or PDF</p>
                  </>
                )}
              </div>

              {/* Aadhaar Back */}
              <div className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-colors relative overflow-hidden ${files.aadhaarBack ? 'bg-primary/5 border-primary/30' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange(e, 'aadhaarBack')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {files.aadhaarBack ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                    <p className="text-xs font-bold text-slate-700 truncate w-full px-2">{files.aadhaarBack.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">AADHAAR (BACK)</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-600">Upload Aadhaar (Back)</p>
                    <p className="text-[10px] text-slate-400 mt-1">Image or PDF</p>
                  </>
                )}
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-primary text-white font-bold px-8 py-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-md disabled:opacity-70 disabled:hover:translate-y-0">
              {isSubmitting ? (
                <><Loader2 size={18} className="animate-spin" /> Processing & Uploading...</>
              ) : (
                "Onboard Partner & Upload KYC"
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
