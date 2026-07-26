"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Store, Building2, Phone, Mail, MapPin, CreditCard, Landmark, Clock,
  Upload, Save, Sparkles, CheckCircle2, ShieldCheck, FileText, QrCode,
  Globe, Cpu, Award, ExternalLink, Image as ImageIcon, FileSignature, Stamp
} from "lucide-react";
import { saveDealerShopProfile } from "../../actions";

interface DealerProfile {
  id?: string;
  name?: string;
  tagline?: string;
  owner_name?: string;
  phone?: string;
  secondary_phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  google_maps_link?: string;
  gstin?: string;
  license_no?: string;
  franchise_code?: string;
  franchise_tier?: string;
  logo_url?: string;
  banner_url?: string;
  bank_name?: string;
  bank_account_no?: string;
  bank_ifsc?: string;
  bank_branch?: string;
  upi_id?: string;
  qr_code_url?: string;
  signature_url?: string;
  stamp_url?: string;
  opening_time?: string;
  closing_time?: string;
  working_days?: string;
  tinting_machine_model?: string;
}

interface Props {
  initialData: DealerProfile;
}

export function ShopProfileSettingsClient({ initialData }: Props) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"credentials" | "location" | "banking" | "stamps" | "operations">("credentials");
  const [profile, setProfile] = useState<DealerProfile>({
    name: "Shree Ram Paints & Hardware",
    tagline: "Authorized Premium Dealer & Exclusive Franchise of Sharma Industries Paints",
    owner_name: "Shree Ram Sharma",
    phone: "+91 98290 12345",
    secondary_phone: "+91 98290 99887",
    email: "contact@shreerampaints.com",
    address: "Bundi Road, Near Old Bus Stand, Alwar",
    city: "Alwar",
    state: "Rajasthan",
    pincode: "301001",
    landmark: "Opposite Circuit House Gate",
    google_maps_link: "https://maps.google.com/?q=27.553,76.634",
    gstin: "08AAACS1234F1Z1",
    license_no: "ALW-2026-9812",
    franchise_code: "SHARMA-FRANCHISE-GOLD-9801",
    franchise_tier: "Gold Tier Distributor",
    logo_url: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&auto=format&fit=crop&q=80",
    bank_name: "State Bank of India",
    bank_account_no: "308192847102",
    bank_ifsc: "SBIN0001234",
    bank_branch: "Alwar Main Branch",
    upi_id: "shreerampaints@upi",
    qr_code_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    signature_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    stamp_url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&auto=format&fit=crop&q=80",
    opening_time: "09:00 AM",
    closing_time: "08:30 PM",
    working_days: "Monday to Saturday (Sunday Closed)",
    tinting_machine_model: "SpectraTint 9000 Turbo (Active)",
    ...initialData
  });

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    if (initialData && Object.keys(initialData).length > 0) {
      setProfile(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleImageFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setProfile(p => ({ ...p, [field]: uploadEvent.target?.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveDealerShopProfile(profile);
      if (res.success) {
        alert("Store Credentials, Authorized Signature, and Rubber Stamp uploaded & saved to Supabase!");
      } else {
        alert("Failed to save profile. Please check inputs.");
      }
    });
  };

  if (!mounted) {
    return (
      <div className="p-12 text-center text-xs font-bold text-muted-foreground animate-pulse bg-card rounded-2xl border border-border">
        Loading Dealer Shop Profile & Supabase Storage Assets...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
      {/* ── Top Header Navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Settings</span><span className="opacity-40">/</span><span className="text-foreground">{t("Shop Profile")}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <Store size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                Dealer Shop Profile & Supabase Asset Storage
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage showroom credentials, signature & rubber stamp uploads, GSTIN registration, and payment QR codes
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white text-xs font-black hover:bg-primary/90 transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          <Save size={15} /> {isPending ? "Uploading to Supabase..." : "Save Store Profile & Stamps"}
        </button>
      </div>

      {/* ── SHOWROOM HERO BRANDING BANNER ───────────────────────────────── */}
      <div className="relative overflow-hidden bg-card border border-border rounded-3xl shadow-md">
        {/* Banner Cover Image */}
        <div className="h-44 w-full relative bg-muted">
          <img
            src={profile.banner_url || "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&auto=format&fit=crop&q=80"}
            alt="Showroom Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        </div>

        {/* Store Logo & Details Header */}
        <div className="p-6 pt-0 relative z-10 flex flex-wrap items-end justify-between gap-4 -mt-12">
          <div className="flex items-end gap-4">
            <div className="relative">
              <img
                src={profile.logo_url || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=80"}
                alt="Store Logo"
                className="w-24 h-24 rounded-2xl object-cover border-4 border-card shadow-xl bg-card"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-card shadow-sm">
                <CheckCircle2 size={14} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase">
                  {profile.franchise_tier || "Gold Tier Distributor"}
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-[10px] font-bold">
                  🟢 Open Today ({profile.opening_time} – {profile.closing_time})
                </span>
              </div>
              <h2 className="text-2xl font-black text-foreground">{profile.name}</h2>
              <p className="text-xs text-muted-foreground">{profile.tagline}</p>
            </div>
          </div>

          <div className="bg-muted/40 p-3 rounded-2xl border border-border/40 text-xs font-mono">
            <span className="text-[10px] font-black text-muted-foreground uppercase block">Franchise Code</span>
            <span className="font-bold text-foreground">{profile.franchise_code}</span>
          </div>
        </div>
      </div>

      {/* ── TABBED NAVIGATION CONTROLS ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {[
          { id: "credentials", label: "Credentials", icon: Building2 },
          { id: "location", label: "Address & Maps", icon: MapPin },
          { id: "banking", label: "Banking & QR Code", icon: Landmark },
          { id: "stamps", label: "Signature & Stamp", icon: FileSignature },
          { id: "operations", label: "Hours & Machine", icon: Clock },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`p-3 rounded-2xl border text-xs font-black transition-all text-left flex items-center gap-2 cursor-pointer ${
                activeTab === t.id
                  ? "bg-primary text-white border-primary shadow-2xs"
                  : "bg-card border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              <Icon size={15} />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── PROFILE SETTINGS FORM ───────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-6 shadow-2xs space-y-6">
        {/* TAB 1: BUSINESS & LICENSE CREDENTIALS */}
        {activeTab === "credentials" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Building2 size={16} className="text-primary" /> Store Credentials & Tax Registrations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Outlet Business Name *</label>
                <input
                  required
                  type="text"
                  value={profile.name || ""}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Authorized Owner / Manager Name *</label>
                <input
                  required
                  type="text"
                  value={profile.owner_name || ""}
                  onChange={e => setProfile({ ...profile, owner_name: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Primary Phone Number *</label>
                <input
                  required
                  type="text"
                  value={profile.phone || ""}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Secondary Mobile Contact</label>
                <input
                  type="text"
                  value={profile.secondary_phone || ""}
                  onChange={e => setProfile({ ...profile, secondary_phone: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">GSTIN Registration Number *</label>
                <input
                  required
                  type="text"
                  value={profile.gstin || ""}
                  onChange={e => setProfile({ ...profile, gstin: e.target.value.toUpperCase() })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Trade License Number</label>
                <input
                  type="text"
                  value={profile.license_no || ""}
                  onChange={e => setProfile({ ...profile, license_no: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase font-bold outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-black text-muted-foreground uppercase">Outlet Tagline / Description</label>
              <textarea
                value={profile.tagline || ""}
                onChange={e => setProfile({ ...profile, tagline: e.target.value })}
                rows={2}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground resize-none"
              />
            </div>

            {/* Logo & Banner Photo Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border text-xs">
              <div className="bg-muted/40 border border-border rounded-2xl p-4 space-y-3">
                <span className="text-[10px] font-black text-muted-foreground uppercase block">Store Logo Photo Upload</span>
                <img src={profile.logo_url} alt="Logo Preview" className="w-20 h-20 rounded-2xl object-cover border border-border bg-card" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageFileChange("logo_url", e)}
                  className="text-[11px] text-muted-foreground file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-primary/10 file:text-primary"
                />
              </div>

              <div className="bg-muted/40 border border-border rounded-2xl p-4 space-y-3">
                <span className="text-[10px] font-black text-muted-foreground uppercase block">Showroom Cover Banner Upload</span>
                <img src={profile.banner_url} alt="Banner Preview" className="w-full h-20 rounded-2xl object-cover border border-border bg-card" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageFileChange("banner_url", e)}
                  className="text-[11px] text-muted-foreground file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-primary/10 file:text-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADDRESS & MAPS */}
        {activeTab === "location" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <MapPin size={16} className="text-emerald-500" /> Showroom Address & Google Maps Location
            </h3>

            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-black text-muted-foreground uppercase">Full Showroom Address *</label>
              <textarea
                required
                value={profile.address || ""}
                onChange={e => setProfile({ ...profile, address: e.target.value })}
                rows={2}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-primary text-foreground resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">City / Tehsil *</label>
                <input
                  required
                  type="text"
                  value={profile.city || ""}
                  onChange={e => setProfile({ ...profile, city: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">State *</label>
                <input
                  required
                  type="text"
                  value={profile.state || ""}
                  onChange={e => setProfile({ ...profile, state: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Pincode *</label>
                <input
                  required
                  type="text"
                  value={profile.pincode || ""}
                  onChange={e => setProfile({ ...profile, pincode: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Nearby Landmark</label>
                <input
                  type="text"
                  value={profile.landmark || ""}
                  onChange={e => setProfile({ ...profile, landmark: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Google Maps Link</label>
                <input
                  type="text"
                  value={profile.google_maps_link || ""}
                  onChange={e => setProfile({ ...profile, google_maps_link: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BANKING & POS QR CODE */}
        {activeTab === "banking" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Landmark size={16} className="text-primary" /> Store Bank Account & POS Payment QR Code
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Bank Name & Branch *</label>
                  <input
                    required
                    type="text"
                    value={profile.bank_name || ""}
                    onChange={e => setProfile({ ...profile, bank_name: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Bank Account Number *</label>
                  <input
                    required
                    type="text"
                    value={profile.bank_account_no || ""}
                    onChange={e => setProfile({ ...profile, bank_account_no: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">IFSC Code *</label>
                  <input
                    required
                    type="text"
                    value={profile.bank_ifsc || ""}
                    onChange={e => setProfile({ ...profile, bank_ifsc: e.target.value.toUpperCase() })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Store UPI VPA ID</label>
                  <input
                    type="text"
                    value={profile.upi_id || ""}
                    onChange={e => setProfile({ ...profile, upi_id: e.target.value })}
                    placeholder="shreerampaints@upi"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              {/* Payment QR Code Upload */}
              <div className="bg-muted/40 border border-border rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Store Payment QR Code (Uploaded to Supabase)</span>
                  <img src={profile.qr_code_url} alt="Payment QR Code" className="w-full h-44 rounded-xl object-cover border border-border bg-white p-2" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageFileChange("qr_code_url", e)}
                  className="text-[11px] text-muted-foreground file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-primary/10 file:text-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUTHORIZED SIGNATURE & RUBBER STAMP UPLOADS */}
        {activeTab === "stamps" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <FileSignature size={16} className="text-primary" /> Authorized Proprietor Signature & Official Rubber Stamp Uploads
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Authorized Digital Signature Upload */}
              <div className="bg-muted/40 border border-border rounded-2xl p-5 space-y-4">
                <div>
                  <span className="text-[11px] font-black text-foreground uppercase block flex items-center gap-1.5">
                    <FileSignature size={14} className="text-primary" /> Official Proprietor Signature Photo
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Automatically printed on all generated PDF Tax Invoices, Payment Receipt Vouchers, and Credit Bills.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-border text-center shadow-inner">
                  <img
                    src={profile.signature_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"}
                    alt="Proprietor Signature"
                    className="h-28 mx-auto object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase block">Upload Signature Image (PNG / JPG / WebP)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageFileChange("signature_url", e)}
                    className="text-[11px] text-muted-foreground file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-primary/10 file:text-primary"
                  />
                </div>
              </div>

              {/* Official Store Rubber Stamp Upload */}
              <div className="bg-muted/40 border border-border rounded-2xl p-5 space-y-4">
                <div>
                  <span className="text-[11px] font-black text-foreground uppercase block flex items-center gap-1.5">
                    <Stamp size={14} className="text-emerald-600" /> Store Round Rubber Stamp / Seal Photo
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Official round store seal image stamped on customer invoices for authenticity and tax audits.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-border text-center shadow-inner">
                  <img
                    src={profile.stamp_url || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&auto=format&fit=crop&q=80"}
                    alt="Store Rubber Stamp"
                    className="h-28 mx-auto object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase block">Upload Stamp / Seal Image (PNG / JPG / WebP)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageFileChange("stamp_url", e)}
                    className="text-[11px] text-muted-foreground file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-emerald-500/10 file:text-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: OPERATING HOURS & TINTING MACHINE */}
        {activeTab === "operations" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Clock size={16} className="text-amber-500" /> Showroom Hours & Tinting Machine Specs
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Opening Time</label>
                <input
                  type="text"
                  value={profile.opening_time || ""}
                  onChange={e => setProfile({ ...profile, opening_time: e.target.value })}
                  placeholder="09:00 AM"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Closing Time</label>
                <input
                  type="text"
                  value={profile.closing_time || ""}
                  onChange={e => setProfile({ ...profile, closing_time: e.target.value })}
                  placeholder="08:30 PM"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Working Days</label>
                <input
                  type="text"
                  value={profile.working_days || ""}
                  onChange={e => setProfile({ ...profile, working_days: e.target.value })}
                  placeholder="Monday to Saturday (Sunday Closed)"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Computerized Tinting Machine Specs</label>
                <input
                  type="text"
                  value={profile.tinting_machine_model || ""}
                  onChange={e => setProfile({ ...profile, tinting_machine_model: e.target.value })}
                  placeholder="SpectraTint 9000 Turbo (Active)"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-end border-t border-border">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-primary text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 size={16} /> {isPending ? "Uploading to Supabase..." : "Save Store Credentials, Signature & Stamp →"}
          </button>
        </div>
      </form>
    </div>
  );
}
