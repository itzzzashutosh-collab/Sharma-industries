"use client";
import React from "react";
import { FileBarChart, Download } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
const reports = [
  { name: "GSTR-1 Summary", desc: "Outward supplies — B2B, B2C, exports" },
  { name: "GSTR-3B Summary", desc: "Monthly consolidated GST liability" },
  { name: "Input Tax Credit Report", desc: "ITC claimed vs available" },
  { name: "GST Payable Calculation", desc: "Output tax minus input credit" },
];
export function TaxReportsClient() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1"><span>CA Workspace</span><span className="opacity-40">/</span><span>GST & Tax</span><span className="opacity-40">/</span><span className="text-foreground">Tax Reports</span></div>
      <div className="flex items-center gap-3"><div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><FileBarChart size={20} className="text-primary" /></div><div><h1 className="text-xl font-black text-foreground">{t("Tax Reports")}</h1><p className="text-xs text-muted-foreground">GST return summaries and tax computation reports</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between hover:bg-muted/20 transition-colors">
            <div><p className="text-sm font-bold text-foreground">{r.name}</p><p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p></div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-bold cursor-pointer hover:opacity-90"><Download size={11} /> Download</button>
          </div>
        ))}
      </div>
    </div>
  );
}