"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  UserPlus, Upload, ShieldCheck, CheckCircle2, Landmark, CreditCard,
  Phone, MapPin, Calendar, Image as ImageIcon, ArrowRight, ArrowLeft,
  Sparkles, AlertCircle, FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createDealerPainter } from "../../actions";

export function PainterRegisterClient() {
  const { t } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [form, setForm] = useState({
    // Step 1: Personal
    name: "",
    phone: "",
    dob: "",
    address: "",
    pincode: "",
    profile_photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    
    // Step 2: Aadhaar Card
    aadhaar_no: "",
    aadhaar_front: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    aadhaar_back: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    
    // Step 3: PAN & Bank Passbook
    pan_no: "",
    pan_photo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    bank_name: "State Bank of India",
    bank_account_no: "",
    bank_ifsc: "",
    bank_branch: "Alwar Main Branch",
    bank_passbook_photo: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80",
    
    // Default tier & points
    tier: "Master Contractor",
    points_balance: "500"
  });

  const handleImageFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setForm(f => ({ ...f, [field]: uploadEvent.target?.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;

    startTransition(async () => {
      const res = await createDealerPainter({
        ...form,
        kyc_status: "Verified"
      });

      if (res.success) {
        alert(`Painter ${form.name} registered and onboarded successfully! Scanned bonus points credited: 500 Pts.`);
        router.push("/dashboard/dealer/painters/list");
      } else {
        alert("Failed to register painter. Please check inputs.");
      }
    });
  };

  if (!mounted) {
    return (
      <div className="p-12 text-center text-xs font-bold text-muted-foreground animate-pulse bg-card rounded-2xl border border-border">
        Loading Painter KYC Registration Form...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── Top Header Navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Painters</span><span className="opacity-40">/</span><span className="text-foreground">Painter KYC Onboarding</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <UserPlus size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                Onboard & Register New Painter (Full KYC)
              </h1>
              <p className="text-xs text-muted-foreground">
                Capture personal info, profile photo, Aadhaar (front & back), PAN card, and bank passbook details
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── STEPPER CONTROLS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { num: 1, title: "1. Personal Profile & Photo" },
          { num: 2, title: "2. Aadhaar Card KYC" },
          { num: 3, title: "3. PAN & Bank Passbook" },
        ].map(s => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num as any)}
            className={`p-3 rounded-2xl border text-xs font-black transition-all text-left flex items-center gap-2 ${
              step === s.num
                ? "bg-primary text-white border-primary shadow-2xs"
                : "bg-card border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step === s.num ? "bg-white text-primary" : "bg-muted text-muted-foreground"
            }`}>
              {s.num}
            </span>
            <span className="truncate">{s.title}</span>
          </button>
        ))}
      </div>

      {/* ── ONBOARDING FORM FORM ────────────────────────────────────────── */}
      <form onSubmit={handleSubmitRegistration} className="bg-card border border-border rounded-3xl p-6 shadow-2xs space-y-6">
        {/* STEP 1: PERSONAL DETAILS */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <UserPlus size={16} className="text-primary" /> Step 1: Personal Profile & Photo Upload
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Painter Full Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="E.g. Rajesh Kumar Painter"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Mobile Phone Number *</label>
                <input
                  required
                  type="text"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98290 88123"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Date of Birth (DOB)</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={e => setForm({ ...form, dob: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Residential Pincode</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={e => setForm({ ...form, pincode: e.target.value })}
                  placeholder="301001"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-black text-muted-foreground uppercase">Full Residential Address</label>
              <textarea
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="House no, village/locality, Tehsil, District, State"
                rows={2}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground resize-none"
              />
            </div>

            {/* Profile Photo Upload */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-[10px] font-black text-muted-foreground uppercase block">Painter Profile Photo / Selfie</label>
              <div className="flex items-center gap-4">
                <img
                  src={form.profile_photo}
                  alt="Profile Preview"
                  className="w-16 h-16 rounded-2xl object-cover border border-border shadow-2xs shrink-0"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageFileChange("profile_photo", e)}
                  className="text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                Proceed to Step 2 (Aadhaar KYC) <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: AADHAAR CARD KYC */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <ShieldCheck size={16} className="text-emerald-500" /> Step 2: Aadhaar Card Verification (Front & Back Photos)
            </h3>

            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-black text-muted-foreground uppercase">12-Digit Aadhaar Card Number *</label>
              <input
                required
                type="text"
                value={form.aadhaar_no}
                onChange={e => setForm({ ...form, aadhaar_no: e.target.value })}
                placeholder="4812-9910-2041"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              {/* Aadhaar Front Photo */}
              <div className="bg-muted/40 border border-border rounded-2xl p-4 space-y-3">
                <span className="text-[10px] font-black text-muted-foreground uppercase block">Aadhaar Card Front Photo Upload *</span>
                <img src={form.aadhaar_front} alt="Aadhaar Front" className="w-full h-36 rounded-xl object-cover border border-border" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageFileChange("aadhaar_front", e)}
                  className="text-[11px] text-muted-foreground file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-primary/10 file:text-primary"
                />
              </div>

              {/* Aadhaar Back Photo */}
              <div className="bg-muted/40 border border-border rounded-2xl p-4 space-y-3">
                <span className="text-[10px] font-black text-muted-foreground uppercase block">Aadhaar Card Back Photo Upload *</span>
                <img src={form.aadhaar_back} alt="Aadhaar Back" className="w-full h-36 rounded-xl object-cover border border-border" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageFileChange("aadhaar_back", e)}
                  className="text-[11px] text-muted-foreground file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-primary/10 file:text-primary"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-border text-foreground font-bold rounded-xl hover:bg-muted text-xs cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back to Step 1
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                Proceed to Step 3 (PAN & Bank Details) <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAN CARD & BANK PASSBOOK KYC */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Landmark size={16} className="text-emerald-500" /> Step 3: PAN Card & Bank Passbook Verification
            </h3>

            {/* PAN Card Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">10-Digit PAN Card Number</label>
                  <input
                    type="text"
                    value={form.pan_no}
                    onChange={e => setForm({ ...form, pan_no: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
                <div className="bg-muted/40 border border-border rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase block">PAN Card Photo Upload</span>
                  <img src={form.pan_photo} alt="PAN Photo" className="w-full h-32 rounded-xl object-cover border border-border" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageFileChange("pan_photo", e)}
                    className="text-[11px] text-muted-foreground file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-primary/10 file:text-primary"
                  />
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Bank Name & Branch *</label>
                  <input
                    required
                    type="text"
                    value={form.bank_name}
                    onChange={e => setForm({ ...form, bank_name: e.target.value })}
                    placeholder="State Bank of India (Alwar Branch)"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase">Account Number *</label>
                    <input
                      required
                      type="text"
                      value={form.bank_account_no}
                      onChange={e => setForm({ ...form, bank_account_no: e.target.value })}
                      placeholder="308192847102"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase">IFSC Code *</label>
                    <input
                      required
                      type="text"
                      value={form.bank_ifsc}
                      onChange={e => setForm({ ...form, bank_ifsc: e.target.value.toUpperCase() })}
                      placeholder="SBIN0001234"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase font-bold outline-none focus:border-primary text-foreground"
                    />
                  </div>
                </div>

                <div className="bg-muted/40 border border-border rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase block">Bank Passbook / Cheque Photo Upload *</span>
                  <img src={form.bank_passbook_photo} alt="Passbook Photo" className="w-full h-24 rounded-xl object-cover border border-border" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageFileChange("bank_passbook_photo", e)}
                    className="text-[11px] text-muted-foreground file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-primary/10 file:text-primary"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-border">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-border text-foreground font-bold rounded-xl hover:bg-muted text-xs cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back to Step 2
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 size={16} /> {isPending ? "Submitting KYC..." : "Complete KYC Registration & Onboard Painter →"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default PainterRegisterClient;
