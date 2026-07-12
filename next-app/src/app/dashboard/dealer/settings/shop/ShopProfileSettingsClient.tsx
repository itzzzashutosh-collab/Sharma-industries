"use client";

import React, { useState, useTransition } from "react";
import { ClipboardList, Sparkles, X, PlusCircle, Check, Save } from "lucide-react";
import { saveDealerShopProfile } from "../../actions";

interface DealerProfile {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  address: string;
  gstin: string;
  pincode: string;
}

interface Props {
  initialData: DealerProfile;
}

export function ShopProfileSettingsClient({ initialData }: Props) {
  const [profile, setProfile] = useState<DealerProfile>(initialData);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveDealerShopProfile({
        name: profile.name,
        owner_name: profile.owner_name,
        phone: profile.phone,
        address: profile.address,
        gstin: profile.gstin,
        pincode: profile.pincode
      });
      if (res.success) {
        alert("Shop profile settings saved successfully!");
      } else {
        alert(res.error || "Failed to update profile settings");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Settings</span><span className="opacity-40">/</span><span className="text-foreground">Shop Profile</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><ClipboardList size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Shop Profile Settings</h1>
              <p className="text-xs text-muted-foreground">Manage your paint outlet credentials, invoicing parameters, and GST profiles</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Settings Advisor:</span> Ensure GSTIN and pincode parameters are valid to support clean tax computations.
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-card border border-border rounded-2xl p-6 space-y-4 max-w-2xl text-xs shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase">Outlet Business Name</label>
            <input required value={profile.name || ""} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase">Owner Name</label>
            <input required value={profile.owner_name || ""} onChange={e => setProfile(p => ({ ...p, owner_name: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase">Phone Number</label>
            <input required value={profile.phone || ""} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground font-mono" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase">GSTIN Registration</label>
            <input required value={profile.gstin || ""} onChange={e => setProfile(p => ({ ...p, gstin: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground font-mono uppercase" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase">Outlet Address</label>
            <input required value={profile.address || ""} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase">Pincode</label>
            <input required value={profile.pincode || ""} onChange={e => setProfile(p => ({ ...p, pincode: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground font-mono" />
          </div>
        </div>
        <div className="pt-2 flex items-center justify-end">
          <button type="submit" disabled={isPending} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-sm">
            <Save size={13} /> {isPending ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </form>
    </div>
  );
}
