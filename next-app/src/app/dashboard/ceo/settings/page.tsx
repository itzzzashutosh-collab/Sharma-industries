"use client";

import React, { useState, useEffect, useRef } from "react";
import { Settings, ShieldAlert, Sparkles, Building, Landmark, PenTool, Check, Upload, X } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { getCompanySettings, saveCompanySettings, uploadCompanyStamp } from "./actions";
import { INDIAN_STATES } from "@/lib/constants";

// Alias to strictly match the requested coding standards
const useTranslation = useLanguage;

interface CompanySettingsForm {
  companyName: string;
  ownerName: string;
  gstin: string;
  phone: string;
  address: string;
  stateCode: string;
  pincode?: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
  signatureUrl?: string | null;
  termsAndConditions?: string;
  notes?: string;
  companyStampUrl?: string | null;
}

const DEFAULT_SETTINGS: CompanySettingsForm = {
  companyName: "Sharma Industries",
  ownerName: "",
  gstin: "",
  phone: "",
  address: "Bundi, Rajasthan, India",
  stateCode: "08", // Default state code for Rajasthan
  pincode: "",
  bankName: "",
  accountNumber: "",
  ifsc: "",
  upiId: "",
  signatureUrl: null,
  termsAndConditions: "",
  notes: "",
  companyStampUrl: null
};

export default function CompanySettingsPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CompanySettingsForm>(DEFAULT_SETTINGS);
  
  const stampFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingStamp, setIsUploadingStamp] = useState(false);

  const handleStampUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingStamp(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const res = await uploadCompanyStamp(base64);
      if (res.success && res.url) {
        setFormData(prev => ({ ...prev, companyStampUrl: res.url }));
        setMessage({ type: "success", text: t("Company stamp uploaded successfully!") });
      } else {
        setMessage({ type: "error", text: t("Failed to upload company stamp.") });
      }
      setIsUploadingStamp(false);
    };
    reader.readAsDataURL(file);
  };

  const removeStamp = () => {
    setFormData(prev => ({ ...prev, companyStampUrl: null }));
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Signature States
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeSigTab, setActiveSigTab] = useState<"draw" | "upload">("draw");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      
      // 1. Try to load from LocalStorage first for instant render or offline support
      const localData = localStorage.getItem("company_settings");
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          setFormData(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Failed to parse local company settings", e);
        }
      }

      // 2. Fetch from Supabase
      const res = await getCompanySettings();
      if (res.success && res.data) {
        setFormData(res.data);
        // Sync back to LocalStorage
        localStorage.setItem("company_settings", JSON.stringify(res.data));
      } else if (!res.success) {
        console.warn("Failed to fetch settings from Supabase. Falling back to LocalStorage.");
      }
      setIsLoading(false);
    }
    
    loadSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Signature Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const drawSignature = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setFormData(prev => ({ ...prev, signatureUrl: null }));
  };

  const handleSaveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setFormData(prev => ({ ...prev, signatureUrl: canvas.toDataURL("image/png") }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setFormData(prev => ({ ...prev, signatureUrl: event.target?.result as string }));
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && activeSigTab === "draw" && !formData.signatureUrl) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [activeSigTab, formData.signatureUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    // Save to LocalStorage immediately (offline availability)
    localStorage.setItem("company_settings", JSON.stringify(formData));

    // Save to Supabase
    const res = await saveCompanySettings(formData);
    if (res.success) {
      setMessage({ type: "success", text: t("Settings saved successfully!") });
    } else {
      setMessage({ type: "error", text: t("Failed to save settings.") });
    }
    setIsSaving(false);
    
    // Auto-clear message after 4 seconds
    setTimeout(() => setMessage(null), 4000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground animate-pulse">{t("Loading...")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
            <Settings className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              {t("Company Settings")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("Manage company master details and bank/UPI profile for GST invoicing.")}
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border animate-in slide-in-from-top-4 duration-300 ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          <ShieldAlert size={20} />
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Company Info */}
        <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Building size={120} className="text-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            {t("Company Profile")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                {t("Company Name")}
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                {t("Owner Name")}
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                required
                placeholder="e.g. Ashutosh Sharma"
                className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                {t("GSTIN")}
              </label>
              <input
                type="text"
                name="gstin"
                value={formData.gstin}
                onChange={handleInputChange}
                required
                placeholder="08AABCU9603R1ZX"
                className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                  {t("Contact Number")}
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+91 98765 43210"
                  className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                  {t("State")}
                </label>
                <select
                  name="stateCode"
                  value={formData.stateCode}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                >
                  <option value="" disabled>{t("Select State")}</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                  {t("Pincode")}
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. 324005"
                  className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium text-center"
                />
              </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                {t("Full Address")}
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                {t("Terms and Conditions")}
              </label>
              <textarea
                name="termsAndConditions"
                value={formData.termsAndConditions || ""}
                onChange={handleInputChange}
                rows={4}
                placeholder="Enter company default terms and conditions..."
                className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                {t("Notes / Declarations")}
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter other general notes or declarations..."
                className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
              />
            </div>

          </div>
        </div>

        {/* Section 2: Bank & UPI Info */}
        <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Landmark size={120} className="text-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Landmark size={20} className="text-primary" />
            {t("Bank & UPI Details")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                {t("Bank Name")}
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                required
                placeholder="e.g. State Bank of India"
                className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                {t("Account Number")}
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                required
                placeholder="e.g. 12345678901"
                className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                {t("IFSC Code")}
              </label>
              <input
                type="text"
                name="ifsc"
                value={formData.ifsc}
                onChange={handleInputChange}
                required
                placeholder="e.g. SBIN0001234"
                className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                {t("UPI ID")}
              </label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleInputChange}
                required
                placeholder="e.g. sharma@upi"
                className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Authorized Signature */}
        <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <PenTool size={120} className="text-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 relative z-10">
            <PenTool size={20} className="text-primary" />
            {t("Authorized Signature")}
          </h2>

          <div className="relative z-10 max-w-lg">
            {formData.signatureUrl ? (
              <div className="flex flex-col items-center justify-center p-4 bg-white border border-border rounded-2xl relative">
                <button 
                  type="button"
                  onClick={clearSignature} 
                  className="absolute top-2 right-2 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
                <img src={formData.signatureUrl} alt="Signature" className="max-h-32 object-contain mix-blend-multiply" />
                <p className="text-sm text-emerald-600 font-bold mt-2 flex items-center gap-1">
                  <Check size={14} /> {t("Signature ready to save")}
                </p>
              </div>
            ) : (
              <div>
                <div className="flex gap-2 mb-4">
                  <button 
                    type="button"
                    onClick={() => setActiveSigTab("draw")}
                    className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${activeSigTab === 'draw' ? 'bg-primary text-background' : 'bg-transparent text-foreground border border-border hover:bg-muted'}`}
                  >
                    {t("Draw Signature")}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveSigTab("upload")}
                    className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${activeSigTab === 'upload' ? 'bg-primary text-background' : 'bg-transparent text-foreground border border-border hover:bg-muted'}`}
                  >
                    {t("Upload Image")}
                  </button>
                </div>

                {activeSigTab === "draw" && (
                  <div className="space-y-4">
                    <div className="border-2 border-border rounded-2xl bg-white overflow-hidden relative cursor-crosshair">
                      <canvas
                        ref={canvasRef}
                        width={500}
                        height={180}
                        onMouseDown={startDrawing}
                        onMouseMove={drawSignature}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={drawSignature}
                        onTouchEnd={stopDrawing}
                        className="w-full h-[180px] touch-none"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button 
                        type="button" 
                        onClick={clearSignature} 
                        className="px-4 py-2 text-sm font-bold bg-muted hover:bg-muted/80 text-foreground rounded-xl transition-colors"
                      >
                        {t("Clear")}
                      </button>
                      <button 
                        type="button"
                        onClick={handleSaveDrawing} 
                        className="px-5 py-2 text-sm font-bold bg-primary hover:bg-primary-hover text-white rounded-xl flex items-center gap-2 transition-all shadow-sm"
                      >
                        <Check size={16} /> {t("Confirm Drawing")}
                      </button>
                    </div>
                  </div>
                )}

                {activeSigTab === "upload" && (
                  <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-muted/20">
                    <Upload size={40} className="text-muted-foreground mb-4" />
                    <p className="text-base font-semibold text-foreground mb-1">{t("Upload Signature Image")}</p>
                    <p className="text-sm text-muted-foreground mb-6">{t("PNG or JPEG with transparent background recommended")}</p>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-8 py-2.5 bg-background border border-border hover:bg-card text-foreground font-bold rounded-xl transition-all shadow-sm"
                    >
                      {t("Select File")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        
        {/* Section 4: Company Stamp */}
        <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Building size={120} className="text-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 relative z-10">
            <Sparkles size={20} className="text-primary" />
            {t("Company Stamp / Seal")}
          </h2>

          <div className="relative z-10 max-w-lg">
            {formData.companyStampUrl ? (
              <div className="flex flex-col items-center justify-center p-4 bg-white border border-border rounded-2xl relative">
                <button 
                  type="button"
                  onClick={removeStamp} 
                  className="absolute top-2 right-2 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
                <img src={formData.companyStampUrl} alt="Company Stamp" className="max-h-32 object-contain mix-blend-multiply" />
                <p className="text-sm text-emerald-600 font-bold mt-2 flex items-center gap-1">
                  <Check size={14} /> {t("Stamp uploaded and linked successfully")}
                </p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-muted/20">
                <Upload size={40} className="text-muted-foreground mb-4" />
                <p className="text-base font-semibold text-foreground mb-1">
                  {isUploadingStamp ? t("Uploading...") : t("Upload Company Stamp Image")}
                </p>
                <p className="text-sm text-muted-foreground mb-6">{t("PNG or JPEG with transparent background recommended")}</p>
                <input
                  type="file"
                  accept="image/*"
                  ref={stampFileInputRef}
                  onChange={handleStampUpload}
                  className="hidden"
                  disabled={isUploadingStamp}
                />
                <button 
                  type="button"
                  onClick={() => stampFileInputRef.current?.click()}
                  disabled={isUploadingStamp}
                  className="px-8 py-2.5 bg-background border border-border hover:bg-card text-foreground font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
                >
                  {t("Select Stamp Image")}
                </button>
              </div>
            )}
          </div>
        </div>


{/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-background text-white font-extrabold px-8 py-3 rounded-xl transition-all shadow-md dark:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? t("Saving...") : t("Save Settings")}
          </button>
        </div>
      </form>
    </div>
  );
}
