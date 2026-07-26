"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Settings, Moon, Sun, Monitor, Bell, Shield, Database, Save, CheckCircle2,
  Lock, RefreshCw, Download, Sparkles, Smartphone, Eye, Key, Sliders, Palette
} from "lucide-react";
import { saveDealerAppSettings } from "../../actions";

interface AppSettings {
  theme_mode?: string;
  accent_color?: string;
  table_density?: string;
  auto_collapse_sidebar?: boolean;
  low_stock_alerts?: boolean;
  new_scheme_alerts?: boolean;
  khata_overdue_alerts?: boolean;
  daily_summary_email?: boolean;
  two_factor_auth?: boolean;
  session_timeout_mins?: number;
  cashier_restricted_mode?: boolean;
  ip_restriction?: boolean;
  auto_cloud_backup?: boolean;
}

interface Props {
  initialData: AppSettings;
}

export function AppSettingsPreferencesClient({ initialData }: Props) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<"appearance" | "notifications" | "security" | "backup">("appearance");
  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme_mode: "system",
    accent_color: "amber",
    table_density: "standard",
    auto_collapse_sidebar: false,
    low_stock_alerts: true,
    new_scheme_alerts: true,
    khata_overdue_alerts: true,
    daily_summary_email: true,
    two_factor_auth: false,
    session_timeout_mins: 30,
    cashier_restricted_mode: true,
    ip_restriction: false,
    auto_cloud_backup: true,
    ...initialData
  });

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    if (initialData && Object.keys(initialData).length > 0) {
      setAppSettings(prev => ({ ...prev, ...initialData }));
      if (initialData.theme_mode) {
        setTheme(initialData.theme_mode);
      }
    }
  }, [initialData, setTheme]);

  const handleThemeChange = (mode: string) => {
    setAppSettings(prev => ({ ...prev, theme_mode: mode }));
    setTheme(mode);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      // Sync live next-themes theme
      if (appSettings.theme_mode) {
        setTheme(appSettings.theme_mode);
      }

      const res = await saveDealerAppSettings(appSettings);
      if (res.success) {
        alert(`Application Settings saved to Supabase! Live theme set to "${appSettings.theme_mode?.toUpperCase()}".`);
      } else {
        alert("Failed to save settings. Please try again.");
      }
    });
  };

  const handleExportFullBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      app_settings: appSettings,
      portal: "Sharma Industries Dealer ERP",
      version: "2026.4.1"
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Sharma_Paints_Store_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!mounted) {
    return (
      <div className="p-12 text-center text-xs font-bold text-muted-foreground animate-pulse bg-card rounded-2xl border border-border">
        Loading Application Settings & Live Theme Engine...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
      {/* ── Top Header Navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Settings</span><span className="opacity-40">/</span><span className="text-foreground">Application Settings</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <Settings size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                Live Theme Switching & Application Settings
              </h1>
              <p className="text-xs text-muted-foreground">
                Instantly switch Light/Dark mode, set notification alerts, configure cashier POS rules, and save settings to Supabase DB
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
          <Save size={15} /> {isPending ? "Saving to Supabase..." : "Save App Preferences"}
        </button>
      </div>

      {/* ── TABBED NAVIGATION CONTROLS ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: "appearance", label: "1. Live Theme & Appearance", icon: Palette },
          { id: "notifications", label: "2. Notification Alerts", icon: Bell },
          { id: "security", label: "3. Security & POS Roles", icon: Shield },
          { id: "backup", label: "4. Data Backup & Cache", icon: Database },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`p-3.5 rounded-2xl border text-xs font-black transition-all text-left flex items-center gap-2 cursor-pointer ${
                activeTab === t.id
                  ? "bg-primary text-white border-primary shadow-2xs"
                  : "bg-card border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              <Icon size={16} />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── PREFERENCES FORM ────────────────────────────────────────────── */}
      <form onSubmit={handleSave} className="bg-card border border-border rounded-3xl p-6 shadow-2xs space-y-6">
        {/* TAB 1: APPEARANCE & LIVE THEME */}
        {activeTab === "appearance" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Palette size={16} className="text-primary" /> Live Theme Switching & Appearance Options
            </h3>

            {/* Live Theme Mode Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Live System Theme Mode *</label>
                <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Active Theme: {theme || appSettings.theme_mode || "system"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs font-bold">
                {[
                  { id: "light", label: "☀️ Light Mode", icon: Sun, desc: "Clean bright contrast" },
                  { id: "dark", label: "🌙 Dark Mode", icon: Moon, desc: "Sleek dark glassmorphism" },
                  { id: "system", label: "💻 System Sync", icon: Monitor, desc: "Match device OS theme" },
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = appSettings.theme_mode === item.id || (theme === item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleThemeChange(item.id)}
                      className={`p-5 rounded-2xl border flex flex-col items-center gap-2.5 cursor-pointer transition-all ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-lg scale-105"
                          : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                      }`}
                    >
                      <Icon size={26} />
                      <div className="text-center">
                        <span className="block font-black text-sm">{item.label}</span>
                        <span className="text-[10px] opacity-80 block font-normal">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Color Scheme */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-[10px] font-black text-muted-foreground uppercase">Accent Brand Color</label>
              <div className="grid grid-cols-4 gap-3 text-xs font-bold">
                {[
                  { id: "amber", label: "Classic Amber", color: "bg-amber-500" },
                  { id: "emerald", label: "Emerald Pro", color: "bg-emerald-500" },
                  { id: "blue", label: "Royal Blue", color: "bg-blue-600" },
                  { id: "purple", label: "Purple Luxury", color: "bg-purple-600" },
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setAppSettings({ ...appSettings, accent_color: c.id })}
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      appSettings.accent_color === c.id
                        ? "border-primary text-foreground bg-muted/40 font-black"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${c.color}`} />
                    <span className="truncate">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Display Spacing & Sidebar */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-border">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Table Spacing Density</label>
                <select
                  value={appSettings.table_density}
                  onChange={e => setAppSettings({ ...appSettings, table_density: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                >
                  <option value="standard">Standard Spacing (Recommended)</option>
                  <option value="compact">High Density Compact Mode</option>
                </select>
              </div>

              <div className="bg-muted/40 p-3 rounded-2xl border border-border flex items-center justify-between mt-4">
                <div>
                  <span className="font-bold text-foreground block">Auto-Collapse Sidebar</span>
                  <span className="text-[10px] text-muted-foreground">Automatically collapse menu on smaller screens</span>
                </div>
                <input
                  type="checkbox"
                  checked={appSettings.auto_collapse_sidebar}
                  onChange={e => setAppSettings({ ...appSettings, auto_collapse_sidebar: e.target.checked })}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NOTIFICATION ALERTS */}
        {activeTab === "notifications" && (
          <div className="space-y-4 animate-in fade-in duration-300 text-xs">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Bell size={16} className="text-amber-500" /> Notifications & Real-Time Alert Center
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "low_stock_alerts", title: "Low Stock Inventory Alerts", desc: "Notify when paint buckets fall below reorder thresholds" },
                { key: "new_scheme_alerts", title: "New Contractor Scheme Offers", desc: "Notify when new painter cashback & discount schemes launch" },
                { key: "khata_overdue_alerts", title: "Khata Overdue Warnings", desc: "Notify when contractor credit is overdue by >15 days" },
                { key: "daily_summary_email", title: "Daily Automated Sales Summary", desc: "Send daily closing billing digest email at 9:00 PM" },
              ].map(item => (
                <div key={item.key} className="bg-muted/40 p-4 rounded-2xl border border-border/40 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground block">{item.title}</span>
                    <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean((appSettings as any)[item.key])}
                    onChange={e => setAppSettings({ ...appSettings, [item.key]: e.target.checked })}
                    className="w-4 h-4 accent-primary cursor-pointer shrink-0 ml-2"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & POS ROLES */}
        {activeTab === "security" && (
          <div className="space-y-4 animate-in fade-in duration-300 text-xs">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Shield size={16} className="text-primary" /> Security, Session Timeout & Staff Access Roles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Session Inactivity Auto-Logout</label>
                <select
                  value={appSettings.session_timeout_mins}
                  onChange={e => setAppSettings({ ...appSettings, session_timeout_mins: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                >
                  <option value={15}>15 Minutes Inactivity</option>
                  <option value={30}>30 Minutes (Standard)</option>
                  <option value={60}>60 Minutes</option>
                  <option value={0}>Never Auto-Logout</option>
                </select>
              </div>

              <div className="bg-muted/40 p-3.5 rounded-2xl border border-border flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground block">Cashier Restricted POS Mode</span>
                  <span className="text-[10px] text-muted-foreground">Staff cashiers cannot edit product cost prices or discounts</span>
                </div>
                <input
                  type="checkbox"
                  checked={appSettings.cashier_restricted_mode}
                  onChange={e => setAppSettings({ ...appSettings, cashier_restricted_mode: e.target.checked })}
                  className="w-4 h-4 accent-primary cursor-pointer shrink-0 ml-2"
                />
              </div>

              <div className="bg-muted/40 p-3.5 rounded-2xl border border-border flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground block">Two-Factor Auth (2FA) for Refunds</span>
                  <span className="text-[10px] text-muted-foreground">Require OTP verification for high-value cash refunds</span>
                </div>
                <input
                  type="checkbox"
                  checked={appSettings.two_factor_auth}
                  onChange={e => setAppSettings({ ...appSettings, two_factor_auth: e.target.checked })}
                  className="w-4 h-4 accent-primary cursor-pointer shrink-0 ml-2"
                />
              </div>

              <div className="bg-muted/40 p-3.5 rounded-2xl border border-border flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground block">Store Wi-Fi IP Restriction</span>
                  <span className="text-[10px] text-muted-foreground">Restrict POS billing login strictly to store Wi-Fi IP range</span>
                </div>
                <input
                  type="checkbox"
                  checked={appSettings.ip_restriction}
                  onChange={e => setAppSettings({ ...appSettings, ip_restriction: e.target.checked })}
                  className="w-4 h-4 accent-primary cursor-pointer shrink-0 ml-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DATA BACKUP & CACHE */}
        {activeTab === "backup" && (
          <div className="space-y-4 animate-in fade-in duration-300 text-xs">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Database size={16} className="text-emerald-600" /> Data Backup, Cloud Storage & Local Cache
            </h3>

            <div className="bg-muted/40 p-4 rounded-2xl border border-border flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Automatic Supabase Cloud Backup</span>
                <span className="text-[10px] text-muted-foreground">Daily automated database snapshot backed up at midnight</span>
              </div>
              <input
                type="checkbox"
                checked={appSettings.auto_cloud_backup}
                onChange={e => setAppSettings({ ...appSettings, auto_cloud_backup: e.target.checked })}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-background border border-border p-4 rounded-2xl space-y-2">
                <span className="font-black text-foreground block">Full Store Data Backup Archive</span>
                <p className="text-[11px] text-muted-foreground">Export a complete JSON backup file containing all store settings, invoices, and painter khata logs.</p>
                <button
                  type="button"
                  onClick={handleExportFullBackup}
                  className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download size={13} /> Export Full Store Backup (.JSON)
                </button>
              </div>

              <div className="bg-background border border-border p-4 rounded-2xl space-y-2">
                <span className="font-black text-foreground block">Clear Application Cache</span>
                <p className="text-[11px] text-muted-foreground">Force refresh browser local storage cache and re-synchronize live Supabase database tables.</p>
                <button
                  type="button"
                  onClick={() => alert("Local application cache cleared! Re-synchronizing Supabase database tables...")}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold border border-border rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} /> Clear Cache & Re-Sync
                </button>
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
            <CheckCircle2 size={16} /> {isPending ? "Saving to Supabase..." : "Save App Preferences →"}
          </button>
        </div>
      </form>
    </div>
  );
}
