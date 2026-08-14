"use client";
import React, { useState, useTransition } from "react";
import { User, Save, CheckCircle } from "lucide-react";
import { saveCAFirmDetails } from "../../actions";
import { useLanguage } from "@/components/LanguageProvider";

interface Props { initialData: any | null; }

export function ProfileClient({ initialData }: Props) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    ca_name: initialData?.ca_name || "",
    membership_number: initialData?.membership_number || "",
    frn_number: initialData?.frn_number || "",
    pan_number: initialData?.pan_number || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    firm_name: initialData?.firm_name || "",
  });
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const save = () => {
    startTransition(async () => {
      const res = await saveCAFirmDetails(form);
      if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    });
  };

  const Field = ({ label, field, placeholder, type = "text" }: { label: string; field: keyof typeof form; placeholder: string; type?: string }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{t(label)}</label>
      <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={placeholder}
        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary transition-colors" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1"><span>CA Workspace</span><span className="opacity-40">/</span><span>Settings</span><span className="opacity-40">/</span><span className="text-foreground">Profile</span></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><User size={20} className="text-primary" /></div>
          <div><h1 className="text-xl font-black text-foreground">{t("CA Profile")}</h1><p className="text-xs text-muted-foreground">Your professional details and credentials</p></div>
        </div>
        <button onClick={save} disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50">
          {saved ? <><CheckCircle size={13} /> Saved!</> : <><Save size={13} /> {isPending ? "Saving..." : "Save Changes"}</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Personal Details</h3>
          <Field label="Full Name" field="ca_name" placeholder="CA Full Name" />
          <Field label="Email Address" field="email" placeholder="ca@firm.com" type="email" />
          <Field label="Phone Number" field="phone" placeholder="+91 98765 43210" />
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Professional Credentials</h3>
          <Field label="Membership Number" field="membership_number" placeholder="ICAI Membership No. (e.g., 123456)" />
          <Field label="Firm Registration Number (FRN)" field="frn_number" placeholder="FRN (e.g., 123456W)" />
          <Field label="PAN Number" field="pan_number" placeholder="Personal PAN (e.g., ABCDE1234F)" />
          <Field label="Firm Name" field="firm_name" placeholder="CA Firm Name" />
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold text-emerald-600">
          <CheckCircle size={13} /> Profile saved successfully!
        </div>
      )}
    </div>
  );
}
