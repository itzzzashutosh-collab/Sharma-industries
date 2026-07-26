"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  SlidersHorizontal, FileText, CheckCircle2, Save, Sparkles, ShieldCheck,
  Receipt, Building2, QrCode, FileSignature, Stamp, CreditCard, MessageSquare,
  Lock, AlertTriangle, Eye, RefreshCw, Hash, Percent, Calendar
} from "lucide-react";
import { saveDealerBusinessSettings } from "../../actions";

interface BusinessSettings {
  invoice_prefix?: string;
  next_invoice_no?: number;
  default_gst_rate?: string;
  default_payment_terms?: string;
  contractor_discount_pct?: number;
  max_khata_limit?: number;
  overdue_block_days?: number;
  show_logo_on_invoice?: boolean;
  show_qr_code_on_invoice?: boolean;
  show_signature_on_invoice?: boolean;
  show_stamp_on_invoice?: boolean;
  auto_whatsapp_reminders?: boolean;
  declaration_text?: string;
  footer_thanks_msg?: string;
}

interface Props {
  initialData: BusinessSettings;
}

export function InvoiceCustomizerClient({ initialData }: Props) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<BusinessSettings>({
    invoice_prefix: "INV-2026-",
    next_invoice_no: 892,
    default_gst_rate: "18%",
    default_payment_terms: "Due on Receipt",
    contractor_discount_pct: 5,
    max_khata_limit: 50000,
    overdue_block_days: 30,
    show_logo_on_invoice: true,
    show_qr_code_on_invoice: true,
    show_signature_on_invoice: true,
    show_stamp_on_invoice: true,
    auto_whatsapp_reminders: true,
    declaration_text: "Goods once sold will not be taken back. Interest @ 18% p.a. charged on overdue bills after 30 days.",
    footer_thanks_msg: "Thank you for choosing Sharma Industries Paints! For technical shade advice call +91 98290 12345.",
    ...initialData
  });

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    if (initialData && Object.keys(initialData).length > 0) {
      setSettings(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveDealerBusinessSettings(settings);
      if (res.success) {
        alert("Business & Invoice Customization Settings saved successfully!");
      } else {
        alert("Failed to save settings. Please try again.");
      }
    });
  };

  if (!mounted) {
    return (
      <div className="p-12 text-center text-xs font-bold text-muted-foreground animate-pulse bg-card rounded-2xl border border-border">
        Loading Dealer Business Settings & Real-Time Invoice Customizer...
      </div>
    );
  }

  const sampleInvoiceNo = `${settings.invoice_prefix || "INV-2026-"}${String(settings.next_invoice_no || 892).padStart(4, "0")}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── Top Header Navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Settings</span><span className="opacity-40">/</span><span className="text-foreground">{t("Business Settings")}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <SlidersHorizontal size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                Dealer Business Rules & PDF Invoice Customizer
              </h1>
              <p className="text-xs text-muted-foreground">
                Configure billing prefixes, GST defaults, Khata credit limits, PDF branding toggles, and live bill preview
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white text-xs font-black hover:bg-primary/90 transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          <Save size={15} /> {isPending ? "Saving Settings..." : "Save Business Settings"}
        </button>
      </div>

      {/* ── MAIN 2-COLUMN LAYOUT: CONFIGURATION FORM & LIVE PREVIEW ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: CONFIGURATION CONTROLS (7 COLS) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          {/* SECTION 1: INVOICE NUMBERING & BILLING DEFAULTS */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Hash size={16} className="text-primary" /> Invoice Numbering & Billing Defaults
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Invoice Number Prefix *</label>
                <input
                  required
                  type="text"
                  value={settings.invoice_prefix || ""}
                  onChange={e => setSettings({ ...settings, invoice_prefix: e.target.value })}
                  placeholder="INV-2026-"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Next Invoice Counter *</label>
                <input
                  required
                  type="number"
                  value={settings.next_invoice_no || 892}
                  onChange={e => setSettings({ ...settings, next_invoice_no: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Default GST Rate</label>
                <select
                  value={settings.default_gst_rate}
                  onChange={e => setSettings({ ...settings, default_gst_rate: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                >
                  <option value="18%">18% (Standard Paints)</option>
                  <option value="28%">28% (Specialty Polish)</option>
                  <option value="12%">12% (Primer Tools)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Contractor Discount</label>
                <input
                  type="number"
                  value={settings.contractor_discount_pct}
                  onChange={e => setSettings({ ...settings, contractor_discount_pct: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">{t("Payment Terms")}</label>
                <select
                  value={settings.default_payment_terms}
                  onChange={e => setSettings({ ...settings, default_payment_terms: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                >
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15 Days">Net 15 Days</option>
                  <option value="Net 30 Days">Net 30 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: PDF BRANDING VISUAL TOGGLES */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Eye size={16} className="text-emerald-500" /> PDF Invoice Branding Toggles
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { key: "show_logo_on_invoice", label: "Store Logo Header", desc: "Print store logo on top left of PDF" },
                { key: "show_qr_code_on_invoice", label: "Payment QR Code", desc: "Print UPI QR Code in bill footer" },
                { key: "show_signature_on_invoice", label: "Proprietor Signature", desc: "Auto-stamp digital signature" },
                { key: "show_stamp_on_invoice", label: "Store Rubber Stamp", desc: "Print official round store seal" },
              ].map(item => (
                <div key={item.key} className="bg-muted/40 p-3 rounded-2xl border border-border/40 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground block">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean((settings as any)[item.key])}
                    onChange={e => setSettings({ ...settings, [item.key]: e.target.checked })}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: LEGAL DECLARATIONS & FOOTER NOTES */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-2xs space-y-4 text-xs">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <MessageSquare size={16} className="text-amber-500" /> Terms, Declaration & Thanks Footer
            </h3>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-muted-foreground uppercase">Terms & Legal Declaration Text</label>
              <textarea
                value={settings.declaration_text || ""}
                onChange={e => setSettings({ ...settings, declaration_text: e.target.value })}
                rows={2}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs outline-none focus:border-primary text-foreground resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-muted-foreground uppercase">Footer Thank You Message</label>
              <textarea
                value={settings.footer_thanks_msg || ""}
                onChange={e => setSettings({ ...settings, footer_thanks_msg: e.target.value })}
                rows={2}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs outline-none focus:border-primary text-foreground resize-none"
              />
            </div>
          </div>

          {/* SECTION 4: CREDIT & KHATA RISK SAFEGUARDS */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-2xs space-y-4 text-xs">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <ShieldCheck size={16} className="text-red-500" /> Credit & Khata Risk Control
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Max Contractor Credit Limit (₹)</label>
                <input
                  type="number"
                  value={settings.max_khata_limit}
                  onChange={e => setSettings({ ...settings, max_khata_limit: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Auto-Block Overdue (Days)</label>
                <input
                  type="number"
                  value={settings.overdue_block_days}
                  onChange={e => setSettings({ ...settings, overdue_block_days: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="bg-muted/40 p-3 rounded-2xl border border-border flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Auto WhatsApp Reminders</span>
                <span className="text-[10px] text-muted-foreground">Send payment reminder link when Khata bill is generated</span>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_whatsapp_reminders}
                onChange={e => setSettings({ ...settings, auto_whatsapp_reminders: e.target.checked })}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>
          </div>
        </form>

        {/* RIGHT COLUMN: REAL-TIME LIVE INVOICE PREVIEW PANEL (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6 bg-card border-2 border-primary/40 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Eye size={16} /> Live Real-Time Invoice PDF Preview
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-[10px] font-bold">
                Dynamic Preview
              </span>
            </div>

            {/* MOCK INVOICE RENDER */}
            <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-md border border-slate-200 space-y-4 text-xs font-sans">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  {settings.show_logo_on_invoice && (
                    <div className="w-10 h-10 bg-amber-500 text-white rounded-lg flex items-center justify-center font-black text-sm mb-1">
                      SRP
                    </div>
                  )}
                  <h4 className="font-black text-slate-900 text-sm">Shree Ram Paints & Hardware</h4>
                  <p className="text-[10px] text-slate-500">Bundi Road, Alwar • GSTIN: 08AAACS1234F1Z1</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-amber-600 text-xs block">{sampleInvoiceNo}</span>
                  <span className="text-[10px] text-slate-500">Date: 26-Jul-2026</span>
                </div>
              </div>

              {/* Items Table Mock */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between font-bold border-b border-slate-200 pb-1 text-slate-500 text-[10px] uppercase">
                  <span>Item Description</span>
                  <span>Qty</span>
                  <span>Total</span>
                </div>
                <div className="flex justify-between">
                  <span>Royale Luxury Emulsion 20L</span>
                  <span>2 Pcs</span>
                  <span className="font-mono font-bold">₹9,600</span>
                </div>
                <div className="flex justify-between">
                  <span>Acrylic Wall Primer 20L</span>
                  <span>1 Pc</span>
                  <span className="font-mono font-bold">₹2,400</span>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="border-t border-slate-200 pt-2 space-y-1 text-right text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹12,000</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Contractor Discount ({settings.contractor_discount_pct}%):</span>
                  <span className="font-mono text-emerald-600">-₹600</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST ({settings.default_gst_rate}):</span>
                  <span className="font-mono">₹2,052</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 text-xs border-t border-slate-300 pt-1">
                  <span>Grand Total Payable:</span>
                  <span className="font-mono text-amber-600">₹13,452</span>
                </div>
              </div>

              {/* Declarations & Stamps Section */}
              <div className="border-t border-slate-200 pt-3 flex justify-between items-end gap-2">
                <div className="max-w-[180px] space-y-1">
                  <p className="text-[9px] text-slate-500 italic line-clamp-2">"{settings.declaration_text}"</p>
                  {settings.show_qr_code_on_invoice && (
                    <div className="p-1 bg-slate-100 rounded border border-slate-200 w-12 h-12 flex items-center justify-center">
                      <QrCode size={36} className="text-slate-800" />
                    </div>
                  )}
                </div>

                <div className="text-right space-y-1">
                  {settings.show_stamp_on_invoice && (
                    <div className="w-10 h-10 rounded-full border-2 border-emerald-600 text-emerald-600 text-[8px] font-black flex items-center justify-center mx-auto opacity-80 rotate-12">
                      SEAL & STAMP
                    </div>
                  )}
                  {settings.show_signature_on_invoice && (
                    <div className="text-[9px] font-mono italic text-slate-700 border-t border-slate-300 pt-0.5">
                      Authorized Signature
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[9px] text-center text-slate-400 italic pt-1 border-t border-slate-100">
                "{settings.footer_thanks_msg}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
