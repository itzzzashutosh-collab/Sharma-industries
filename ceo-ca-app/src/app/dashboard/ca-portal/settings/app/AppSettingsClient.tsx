"use client";
import React, { useState, useTransition } from "react";
import { SlidersHorizontal, Save, CheckCircle, Moon, Sun, Globe, Bell, FileDown } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export function AppSettingsClient() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    language: "en",
    theme: "system",
    exportFormat: "csv",
    dateFormat: "DD/MM/YYYY",
    notifications: true,
    emailAlerts: false,
    reportHeader: true,
    reportFooter: true,
    watermark: false,
    fiscalYearStart: "April",
  });
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const save = () => startTransition(async () => {
    // Settings saved locally (expand to DB as needed)
    await new Promise(r => setTimeout(r, 500));
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  });

  const Toggle = ({ label, desc, field }: { label: string; desc: string; field: keyof typeof settings }) => (
    <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
      <div><p className="text-xs font-semibold text-foreground">{label}</p><p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p></div>
      <button onClick={() => setSettings(s => ({ ...s, [field]: !s[field] }))}
        className={`relative w-9 h-5 rounded-full transition-colors ${settings[field] ? "bg-primary" : "bg-muted border border-border"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${settings[field] ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </div>
  );

  const Select = ({ label, field, options }: { label: string; field: keyof typeof settings; options: string[] }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{label}</label>
      <select value={settings[field] as string} onChange={e => setSettings(s => ({ ...s, [field]: e.target.value }))}
        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary transition-colors">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1"><span>CA Workspace</span><span className="opacity-40">/</span><span>Settings</span><span className="opacity-40">/</span><span className="text-foreground">App Settings</span></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><SlidersHorizontal size={20} className="text-primary" /></div>
          <div><h1 className="text-xl font-black text-foreground">{t("App Settings")}</h1><p className="text-xs text-muted-foreground">Configure the CA workspace to your preferences</p></div>
        </div>
        <button onClick={save} disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50">
          {saved ? <><CheckCircle size={13} /> Saved!</> : <><Save size={13} /> {isPending ? "Saving..." : "Save Settings"}</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Display & Locale */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border"><Globe size={13} className="text-primary" /><h3 className="text-sm font-bold text-foreground">Display & Locale</h3></div>
          <Select label="Language" field="language" options={["en", "hi"]} />
          <Select label="Date Format" field="dateFormat" options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]} />
          <Select label="Fiscal Year Start" field="fiscalYearStart" options={["April", "January"]} />
        </div>

        {/* Export */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border"><FileDown size={13} className="text-primary" /><h3 className="text-sm font-bold text-foreground">Export Preferences</h3></div>
          <Select label="Default Export Format" field="exportFormat" options={["csv", "xlsx", "pdf"]} />
          <Toggle label="Report Header" desc="Include firm name and logo on all reports" field="reportHeader" />
          <Toggle label="Report Footer" desc="Include CA name, membership# and signature line" field="reportFooter" />
          <Toggle label="Watermark" desc="Add DRAFT watermark on unfinalized reports" field="watermark" />
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 md:col-span-2">
          <div className="flex items-center gap-2 pb-2 border-b border-border"><Bell size={13} className="text-primary" /><h3 className="text-sm font-bold text-foreground">Notifications</h3></div>
          <Toggle label="In-App Notifications" desc="Receive alerts for GST due dates and pending items" field="notifications" />
          <Toggle label="Email Alerts" desc="Send GST due date reminders to your registered email" field="emailAlerts" />
        </div>
      </div>

      {saved && <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold text-emerald-600"><CheckCircle size={13} /> Settings saved successfully!</div>}
    </div>
  );
}
