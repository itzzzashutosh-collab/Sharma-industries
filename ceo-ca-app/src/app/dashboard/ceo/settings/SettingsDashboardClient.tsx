"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { Settings, ShieldAlert, Sparkles, Building, Landmark, PenTool, Check, Upload, X, Users, Shield, Languages, Moon, Sun, Download, Trash, RefreshCw } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { INDIAN_STATES } from "@/lib/constants";
import { 
  saveCompanySettings, 
  uploadCompanyStamp, 
  testAiConnection, 
  saveAiConfigs, 
  updateUserRoleAndStatus, 
  backupDatabaseData 
} from "./actions";

interface Props {
  initialSettings: any;
  initialUsers: any[];
  initialAiConfigs: any[];
  initialSpendLogs: any[];
  initialSpendAggregate: any[];
  initialSpendGrandTotal: number;
}

export function SettingsDashboardClient({
  initialSettings,
  initialUsers,
  initialAiConfigs,
  initialSpendLogs,
  initialSpendAggregate,
  initialSpendGrandTotal
}: Props) {
  const { t, language, setLanguage } = useLanguage();
  const [isPending, startTransition] = useTransition();

  // Active Tab: "company" | "gst" | "users" | "permissions" | "language" | "theme" | "backup" | "ai"
  const [activeTab, setActiveTab] = useState<"company" | "gst" | "users" | "permissions" | "language" | "theme" | "backup" | "ai">("company");

  // Local state representing database values
  const [formData, setFormData] = useState(initialSettings || {
    companyName: "Sharma Industries", ownerName: "", gstin: "", phone: "", address: "Bundi, Rajasthan, India", stateCode: "08", pincode: "", bankName: "", accountNumber: "", ifsc: "", upiId: "", termsAndConditions: "", notes: "", companyStampUrl: null, signatureUrl: null
  });
  const [users, setUsers] = useState<any[]>(initialUsers || []);
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [anthropicApiKey, setAnthropicApiKey] = useState("");
  const [selectedAiModel, setSelectedAiModel] = useState("gemini-3.5-flash");

  // Spend logs
  const [spendLogs] = useState<any[]>(initialSpendLogs || []);
  const [spendAggregate] = useState<any[]>(initialSpendAggregate || []);
  const [grandTotalSpend] = useState<number>(initialSpendGrandTotal || 0);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Setup initial API keys on mount
  useEffect(() => {
    if (initialAiConfigs) {
      initialAiConfigs.forEach((c: any) => {
        if (c.provider === "openai") setOpenaiApiKey(c.api_key || "");
        if (c.provider === "gemini") setGeminiApiKey(c.api_key || "");
        if (c.provider === "anthropic") setAnthropicApiKey(c.api_key || "");
        if (c.is_active) {
          setSelectedAiModel(c.selected_model || "gemini-3.5-flash");
        }
      });
    }
  }, [initialAiConfigs]);

  // Stamp uploads
  const [isUploadingStamp, setIsUploadingStamp] = useState(false);
  const stampFileInputRef = useRef<HTMLInputElement>(null);

  const handleStampUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingStamp(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const res = await uploadCompanyStamp(base64);
      if (res.success && res.url) {
        setFormData((prev: any) => ({ ...prev, companyStampUrl: res.url }));
        setMessage({ type: "success", text: t("Company stamp uploaded successfully!") });
      } else {
        setMessage({ type: "error", text: t("Failed to upload company stamp.") });
      }
      setIsUploadingStamp(false);
    };
    reader.readAsDataURL(file);
  };

  // Signatures
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeSigTab, setActiveSigTab] = useState<"draw" | "upload">("draw");
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setFormData((prev: any) => ({ ...prev, signatureUrl: null }));
  };

  const handleSaveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setFormData((prev: any) => ({ ...prev, signatureUrl: canvas.toDataURL("image/png") }));
  };

  const handleSigFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setFormData((prev: any) => ({ ...prev, signatureUrl: event.target?.result as string }));
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

  // Main Submit Company details
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      // Save AI keys
      const aiConfigs = [
        { provider: "openai", api_key: openaiApiKey, selected_model: selectedAiModel, is_active: selectedAiModel.startsWith("gpt") },
        { provider: "gemini", api_key: geminiApiKey, selected_model: selectedAiModel, is_active: selectedAiModel.startsWith("gemini") },
        { provider: "anthropic", api_key: anthropicApiKey, selected_model: selectedAiModel, is_active: selectedAiModel.startsWith("claude") }
      ];
      const aiRes = await saveAiConfigs(aiConfigs);
      const res = await saveCompanySettings(formData);
      if (res.success && aiRes.success) {
        setMessage({ type: "success", text: t("Settings saved successfully!") });
      } else {
        setMessage({ type: "error", text: t("Failed to save settings.") });
      }
    });
  };

  // User list edits
  const handleUserRoleUpdate = async (userId: string, currentRole: string, newRole: string, isApproved: boolean) => {
    startTransition(async () => {
      const res = await updateUserRoleAndStatus(userId, newRole, isApproved);
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole, is_approved: isApproved } : u));
        setMessage({ type: "success", text: t("User settings updated!") });
      } else {
        alert(res.error);
      }
    });
  };

  // Theme Toggler
  const toggleTheme = (theme: "light" | "dark") => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    setMessage({ type: "success", text: `${t("Theme toggled to")} ${theme.toUpperCase()}!` });
  };

  // Trigger Database Backup Export
  const handleBackupTrigger = async () => {
    startTransition(async () => {
      const res = await backupDatabaseData();
      if (res.success && res.backup) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.backup, null, 2));
        const dlAnchorElem = document.createElement("a");
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `sharma_erp_backup_${Date.now()}.json`);
        dlAnchorElem.click();
        setMessage({ type: "success", text: t("Database backup exported successfully!") });
      } else {
        setMessage({ type: "error", text: t("Failed to run database backup.") });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto p-6 font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
        <span>{t("Home")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Settings")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
            <Settings className="text-primary animate-spin-slow" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Settings")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t("Manage company parameters, user permissions, localization toggles, and database security.")}</p>
          </div>
        </div>

        {/* Tab Controls (Invoice templates removed) */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60 text-xs font-bold">
          {[
            { key: "company", label: "Company", icon: <Building size={13} /> },
            { key: "gst", label: "GST Setup", icon: <Landmark size={13} /> },
            { key: "users", label: "Users Registry", icon: <Users size={13} /> },
            { key: "permissions", label: "Permissions Matrix", icon: <Shield size={13} /> },
            { key: "language", label: "Language", icon: <Languages size={13} /> },
            { key: "theme", label: "Theme Style", icon: <Moon size={13} /> },
            { key: "backup", label: "System Backup", icon: <Download size={13} /> },
            { key: "ai", label: "AI Spend", icon: <Sparkles size={13} /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? "bg-muted text-foreground border-border/80"
                  : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
              }`}
            >
              {tab.icon}{t(tab.label)}
            </button>
          ))}
          <Link href="/dashboard/ceo/ai-spend" className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 px-4 py-2 rounded-xl text-xs font-black ml-auto flex items-center gap-1.5 transition-all">
            ✨ {t("Spend Ledger")}
          </Link>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border animate-in slide-in-from-top-4 duration-300 ${
          message.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-450"
        }`}>
          <ShieldAlert size={18} />
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      {/* ─── TAB: COMPANY ─── */}
      {activeTab === "company" && (
        <form onSubmit={handleSaveSettings} className="space-y-8 animate-in fade-in">
          {/* Company details */}
          <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Building size={20} className="text-primary" /> {t("Company Profile")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold text-muted-foreground">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase block mb-1">Company Name *</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-foreground" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase block mb-1">Owner Name *</label>
                <input type="text" name="ownerName" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-foreground" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase block mb-1">Contact Phone *</label>
                <input type="text" name="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-foreground font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">State Code *</label>
                  <select name="stateCode" value={formData.stateCode} onChange={e => setFormData({...formData, stateCode: e.target.value})} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground">
                    {INDIAN_STATES.map(s => <option key={s} value={s.split(" ")[0]}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Pincode *</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-foreground font-mono" />
                </div>
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase block mb-1">Full Address *</label>
                <textarea name="address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required rows={3} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-foreground" />
              </div>
            </div>
          </div>

          {/* Stamp upload */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Upload size={20} className="text-primary" /> {t("Official Company Stamp")}
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {formData.companyStampUrl ? (
                <div className="relative group">
                  <img src={formData.companyStampUrl} alt="Stamp" className="w-32 h-32 object-contain border border-border rounded-2xl p-2 bg-white" />
                  <button type="button" onClick={() => setFormData({...formData, companyStampUrl: null})} className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 shadow-md transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div onClick={() => stampFileInputRef.current?.click()} className="w-32 h-32 border-2 border-dashed border-border hover:border-primary/50 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer p-4 bg-muted/20">
                  <Upload size={20} className="text-muted-foreground mb-1" />
                  <span className="text-[10px] font-bold text-muted-foreground">{isUploadingStamp ? t("Uploading...") : t("Upload Stamp")}</span>
                  <input type="file" ref={stampFileInputRef} onChange={handleStampUpload} accept="image/*" className="hidden" />
                </div>
              )}
              <div className="text-xs font-semibold text-muted-foreground max-w-md">
                <p>{t("Upload a high-resolution PNG transparent background stamp of your business. This will be automatically embedded on GSTR billings, quotations, and official letters.")}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={isPending} className="bg-primary text-white font-black px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer">
              {isPending ? t("Saving...") : t("Save Company profile")}
            </button>
          </div>
        </form>
      )}

      {/* ─── TAB: GST ─── */}
      {activeTab === "gst" && (
        <form onSubmit={handleSaveSettings} className="space-y-8 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Landmark size={20} className="text-primary" /> {t("GST Tax Declarations")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold text-muted-foreground">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase block mb-1">GSTIN Registration Number *</label>
                <input type="text" name="gstin" value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-foreground font-mono uppercase" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase block mb-1">Declaration / Terms & Conditions *</label>
                <textarea name="termsAndConditions" value={formData.termsAndConditions} onChange={e => setFormData({...formData, termsAndConditions: e.target.value})} rows={4} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-foreground" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="bg-primary text-white font-black px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer">
              {t("Save GST Declarations")}
            </button>
          </div>
        </form>
      )}

      {/* ─── TAB: USERS ─── */}
      {activeTab === "users" && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users size={20} className="text-primary" /> {t("Users Registry")}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
                  <th className="pb-4 pr-4">User Details</th>
                  <th className="pb-4 px-4">Contact Phone</th>
                  <th className="pb-4 px-4">System Role</th>
                  <th className="pb-4 px-4 text-center">Status</th>
                  <th className="pb-4 pl-4 text-right">Roster Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-border/30 hover:bg-muted/10">
                    <td className="py-4 pr-4">
                      <span className="font-bold text-foreground block">{u.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{u.id}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-muted-foreground">{u.phone}</td>
                    <td className="py-4 px-4">
                      <select 
                        value={u.role} 
                        onChange={e => handleUserRoleUpdate(u.id, u.role, e.target.value, u.is_approved)}
                        className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground font-bold">
                        <option value="dealer">Dealer</option>
                        <option value="salesman">Salesman</option>
                        <option value="factory">Factory</option>
                        <option value="ca">Chartered Accountant</option>
                        <option value="cofounder">Co-Founder</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${
                        u.is_approved ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-450 border-amber-500/20"
                      }`}>
                        {u.is_approved ? "APPROVED" : "PENDING"}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <button 
                        onClick={() => handleUserRoleUpdate(u.id, u.role, u.role, !u.is_approved)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black border transition-colors cursor-pointer ${
                          u.is_approved ? 'bg-rose-500/15 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white' : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                        }`}
                      >
                        {u.is_approved ? "Revoke Access" : "Grant Access"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB: PERMISSIONS ─── */}
      {activeTab === "permissions" && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in text-xs">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield size={20} className="text-primary" /> {t("Access Permissions Matrix")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-semibold">
            {[
              { role: "CEO / Co-Founder", desc: "Superuser status with access to profit/loss ledgers, CEO actions, approvals center, employee onboardings, and system configs." },
              { role: "Chartered Accountant (CA)", desc: "Financial ledger auditing, cash flow analysis, GST return exports, invoices logs access. Blocked from starting factory batches." },
              { role: "Factory Manager", desc: "Start production runs, log raw material audits, check mixer labor rosters, verify yield metrics. Blocked from dealer profiles editing." },
              { role: "Sales Executive", desc: "Schedule distributor visits, register new painters, log token scans, record dealer orders. Blocked from payroll configuration." },
              { role: "Retail Dealer / Client", desc: "Submit order requests, check credit thresholds, view paid invoices, browse paint categories. Blocked from administrative tools." }
            ].map((p, i) => (
              <div key={i} className="border border-border rounded-2xl p-5 bg-background">
                <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <Check size={14} className="text-primary" /> {p.role}
                </h4>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB: LANGUAGE ─── */}
      {activeTab === "language" && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Languages size={20} className="text-primary" /> {t("Language Settings")}
          </h2>
          <div className="flex items-center gap-4 text-xs font-bold">
            <label className="text-muted-foreground">{t("Select System Language")}:</label>
            <select 
              value={language} 
              onChange={e => setLanguage(e.target.value as any)}
              className="bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-primary">
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>
      )}

      {/* ─── TAB: THEME ─── */}
      {activeTab === "theme" && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Moon size={20} className="text-primary" /> {t("Theme customizer")}
          </h2>
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={() => toggleTheme("light")} 
              className="flex-1 py-4 border border-border rounded-2xl bg-white text-slate-800 text-xs font-black shadow-sm flex items-center justify-center gap-2 hover:border-primary transition-all cursor-pointer"
            >
              <Sun size={16} /> Light Mode
            </button>
            <button 
              type="button" 
              onClick={() => toggleTheme("dark")} 
              className="flex-1 py-4 border border-slate-700 rounded-2xl bg-slate-950 text-slate-200 text-xs font-black shadow-sm flex items-center justify-center gap-2 hover:border-primary transition-all cursor-pointer"
            >
              <Moon size={16} /> Dark Mode
            </button>
          </div>
        </div>
      )}

      {/* ─── TAB: SYSTEM BACKUP ─── */}
      {activeTab === "backup" && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Download size={20} className="text-primary" /> {t("Database Backup")}
          </h2>
          <div className="text-xs font-semibold text-muted-foreground space-y-4">
            <p>{t("Download a complete JSON export of critical business tables (including products, employees, orders, raw materials, expenses, and PO bills) to save locally.")}</p>
            <button 
              type="button" 
              onClick={handleBackupTrigger} 
              disabled={isPending}
              className="bg-primary text-white text-xs font-black px-6 py-3 rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? <RefreshCw className="animate-spin" size={14} /> : <Download size={14} />} {t("Generate Database Backup")}
            </button>
          </div>
        </div>
      )}

      {/* ─── TAB: AI SPEND ─── */}
      {activeTab === "ai" && (
        <form onSubmit={handleSaveSettings} className="space-y-8 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles size={20} className="text-primary" /> {t("AI Provider Keys & Model Select")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold text-muted-foreground">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase block mb-1">OpenAI API Key</label>
                <input type="password" value={openaiApiKey} onChange={e => setOpenaiApiKey(e.target.value)} placeholder="sk-proj-..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-foreground font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase block mb-1">Gemini API Key</label>
                <input type="password" value={geminiApiKey} onChange={e => setGeminiApiKey(e.target.value)} placeholder="AIzaSy..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-foreground font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase block mb-1">Selected AI Model</label>
                <select value={selectedAiModel} onChange={e => setSelectedAiModel(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground">
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (Default)</option>
                  <option value="gpt-4o">GPT-4o (OpenAI)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (OpenAI)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Anthropic)</option>
                </select>
              </div>
            </div>

            {/* AI spend summary snippet */}
            <div className="pt-4 border-t border-border/40">
              <h4 className="text-sm font-bold text-foreground mb-3">AI Budget Spent Summary</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/20 border border-border rounded-2xl p-4">
                  <p className="text-muted-foreground font-semibold text-[10px] uppercase">Total Cost (INR)</p>
                  <p className="text-xl font-black text-foreground mt-1">₹{Number(grandTotalSpend).toLocaleString()}</p>
                </div>
                <div className="bg-muted/20 border border-border rounded-2xl p-4 col-span-2">
                  <p className="text-muted-foreground font-semibold text-[10px] uppercase">Aggregated Calls</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {spendAggregate.map((agg, idx) => (
                      <span key={idx} className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[10px] font-bold">
                        {agg.model}: {agg.total_calls} calls (₹{Number(agg.total_cost).toFixed(2)})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="bg-primary text-white font-black px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer">
              {t("Save AI Configurations")}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
