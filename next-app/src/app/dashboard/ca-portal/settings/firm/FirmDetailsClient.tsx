"use client";
import React, { useState, useTransition } from "react";
import { Building, Save, CheckCircle } from "lucide-react";
import { saveCAFirmDetails } from "../../actions";
import { useLanguage } from "@/components/LanguageProvider";

interface Props { initialData: any | null; }

export function FirmDetailsClient({ initialData }: Props) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    firm_name: initialData?.firm_name || "",
    firm_address: initialData?.firm_address || "",
    gst_number: initialData?.gst_number || "",
    pan_number: initialData?.pan_number || "",
    website: initialData?.website || "",
    bank_name: initialData?.bank_name || "",
    account_number: initialData?.account_number || "",
    ifsc_code: initialData?.ifsc_code || "",
  });
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const save = () => startTransition(async () => {
    const res = await saveCAFirmDetails(form);
    if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  });

  const Field = ({ label, field, placeholder, type = "text", span = false }: { label: string; field: keyof typeof form; placeholder: string; type?: string; span?: boolean }) => (
    <div className={`space-y-1.5 ${span ? "col-span-2" : ""}`}>
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{t(label)}</label>
      {type === "textarea" ? (
        <textarea value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={placeholder} rows={3}
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary transition-colors resize-none" />
      ) : (
        <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={placeholder}
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary transition-colors" />
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1"><span>CA Workspace</span><span className="opacity-40">/</span><span>Settings</span><span className="opacity-40">/</span><span className="text-foreground">Firm Details</span></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Building size={20} className="text-primary" /></div>
          <div><h1 className="text-xl font-black text-foreground">{t("Firm Details")}</h1><p className="text-xs text-muted-foreground">Firm information used on reports, letterheads and tax returns</p></div>
        </div>
        <button onClick={save} disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50">
          {saved ? <><CheckCircle size={13} /> Saved!</> : <><Save size={13} /> {isPending ? "Saving..." : "Save"}</>}
        </button>
      </div>

      <div className="space-y-4">
        {/* Firm Info */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Firm Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Firm Name" field="firm_name" placeholder="M/s ABC & Associates" />
            <Field label="Website" field="website" placeholder="https://www.firm.com" />
            <Field label="GST Number (GSTIN)" field="gst_number" placeholder="27AABCU9603R1ZX" />
            <Field label="PAN Number" field="pan_number" placeholder="AABCU9603R" />
            <div className="col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Firm Address</label>
              <textarea value={form.firm_address} onChange={e => setForm(f => ({ ...f, firm_address: e.target.value }))} placeholder="Complete firm address including city, state and pincode" rows={3}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary transition-colors resize-none" />
            </div>
          </div>
        </div>

        {/* Banking Details */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Banking Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Bank Name" field="bank_name" placeholder="State Bank of India" />
            <Field label="Account Number" field="account_number" placeholder="XXXXXXXXXXXX" />
            <Field label="IFSC Code" field="ifsc_code" placeholder="SBIN0001234" />
          </div>
        </div>
      </div>

      {saved && <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold text-emerald-600"><CheckCircle size={13} /> Firm details saved!</div>}
    </div>
  );
}
