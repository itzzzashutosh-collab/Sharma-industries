"use client";

import React, { useState, useTransition } from "react";
import {
  Settings, User, MapPin, Smartphone, Bell, Shield, Database, CheckCircle2,
  Save, RefreshCw, Key, Lock, Globe, MessageSquare, Share2, Sparkles, Navigation,
  Radio, HardDrive, AlertTriangle, ArrowRight, ShieldCheck, Mail, Phone, Building2
} from "lucide-react";

export function SettingsClient() {
  const [activeTab, setActiveTab] = useState<"profile" | "territory" | "whatsapp" | "notifications" | "system">("profile");
  const [isPending, startTransition] = useTransition();

  // Profile Settings State
  const [profile, setProfile] = useState({
    salesmanId: "SM-101",
    name: "Rajesh Kumar",
    phone: "9829010101",
    email: "rajesh.sales@swatchpaints.com",
    manager: "Vikram Sharma (Zonal Head)",
    language: "English",
    tier: "Gold Partner Tier (3.5% Commission)"
  });

  // Territory Preferences State
  const [territory, setTerritory] = useState({
    baseZone: "Rajasthan East Zone",
    baseHub: "Jaipur Central & Urban",
    dailyTargetVisits: 8,
    gpsAutoCheckin: true,
    routeEstimator: true,
    offlineRouteCache: true
  });

  // WhatsApp & Pitch Defaults State
  const [whatsapp, setWhatsapp] = useState({
    messageFooter: "Sent via Swatch Paints Sales Portal | Executive Rajesh Kumar (SM-101)",
    attachDigitalCatalog: true,
    catalogUrl: "https://swatchpaints.com/catalogs/2026-master-edition",
    defaultPaymentTermPitch: "30-Day PDC Cheque + 2.5% Instant Cash Rebate",
    autoAttachGlowBoardOffer: true
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    dealerOrderPush: true,
    collectionOverdueAlert: true,
    quotaMilestoneProgress: true,
    painterKycAlert: true,
    managerBroadcastAlert: true
  });

  // System State
  const [system, setSystem] = useState({
    offlineQueueCount: 0,
    lastSynced: new Date().toISOString().slice(0, 16).replace("T", " "),
    appVersion: "v2.6.4 (Swatch Paints Sales Suite)"
  });

  // Handlers
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      // Simulate saving preferences
      setSystem(prev => ({ ...prev, lastSynced: new Date().toISOString().slice(0, 16).replace("T", " ") }));
      alert("Sales Executive Settings & Swatch Paints Pitch Defaults saved successfully!");
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 text-xs font-sans text-foreground">

      {/* ══ HERO BANNER ═══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-slate-950 via-indigo-950/70 to-slate-950 p-5 sm:p-6 shadow-2xl text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.2),_transparent_70%)]" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[9px] font-black uppercase tracking-widest text-indigo-300">
                Swatch Sales Executive Preferences
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black">
                ● ACTIVE SESSION ({profile.salesmanId})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Settings size={22} className="text-indigo-400" /> Sales Executive Settings & Preferences
            </h1>
            <p className="text-slate-400 text-[11px] max-w-xl">
              Configure profile credentials, default WhatsApp pitch footers, GPS route check-ins, notification alerts, and Swatch Paints brand defaults.
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black text-xs hover:opacity-95 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer border border-indigo-400/30"
          >
            <Save size={16} /> Save All Settings
          </button>
        </div>

        {/* Dynamic Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Sales Executive</span>
            <p className="text-lg font-black text-white font-mono">{profile.name}</p>
            <span className="text-[9px] text-slate-400">ID: {profile.salesmanId}</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-indigo-300 block mb-0.5">Assigned Zone</span>
            <p className="text-lg font-black text-indigo-200 font-mono">{territory.baseZone}</p>
            <span className="text-[9px] text-slate-400">{territory.baseHub}</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-emerald-400 block mb-0.5">Commission Slab</span>
            <p className="text-lg font-black text-emerald-300 font-mono">Gold (3.5%)</p>
            <span className="text-[9px] text-slate-400">Max commission tier</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-amber-300 block mb-0.5">Brand Identity</span>
            <p className="text-lg font-black text-amber-200 font-mono">Swatch Paints</p>
            <span className="text-[9px] text-slate-400">Official dealer & painter brand</span>
          </div>
        </div>
      </div>

      {/* ══ TAB NAVIGATION ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1.5 bg-muted/60 p-1.5 rounded-2xl border border-border overflow-x-auto">
        {[
          { id: "profile", label: "Profile & Credentials", icon: User },
          { id: "territory", label: "Route & GPS Preferences", icon: MapPin },
          { id: "whatsapp", label: "WhatsApp & Pitch Defaults", icon: MessageSquare },
          { id: "notifications", label: "Alerts & Notifications", icon: Bell },
          { id: "system", label: "Sync & System Status", icon: HardDrive }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap text-[11px] ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: PROFILE & CREDENTIAL SETTINGS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveSettings} className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="text-[9px] font-black uppercase text-indigo-500 tracking-widest block mb-0.5">Executive Account</span>
              <h2 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                <User size={18} className="text-indigo-500" /> Sales Executive Profile & Credentials
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-black text-[9px] border border-emerald-500/20">
              VERIFIED EXECUTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                Sales Executive Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                Salesman ID / Employee Code
              </label>
              <input
                type="text"
                disabled
                value={profile.salesmanId}
                className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-muted-foreground outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                Mobile Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                Official Swatch Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                Preferred Portal Language
              </label>
              <select
                value={profile.language}
                onChange={e => setProfile(prev => ({ ...prev, language: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
              >
                <option value="English">English (Official B2B Interface)</option>
                <option value="Hindi">Hindi / हिन्दी (Territory Field Mode)</option>
                <option value="Hinglish">Hinglish (B2B Pitch Hybrid)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                Reporting Zonal Manager
              </label>
              <input
                type="text"
                disabled
                value={profile.manager}
                className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-muted-foreground outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-primary text-primary-foreground font-black text-xs rounded-2xl hover:opacity-95 shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save size={16} /> Save Profile Settings
          </button>
        </form>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: TERRITORY ROUTE & GPS PREFERENCES
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "territory" && (
        <form onSubmit={handleSaveSettings} className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="text-[9px] font-black uppercase text-indigo-500 tracking-widest block mb-0.5">Route Automation</span>
              <h2 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                <MapPin size={18} className="text-indigo-500" /> Sales Route & GPS Check-In Preferences
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                Assigned Territory Zone
              </label>
              <input
                type="text"
                disabled
                value={territory.baseZone}
                className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-muted-foreground outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                Base Locality Distribution Hub
              </label>
              <select
                value={territory.baseHub}
                onChange={e => setTerritory(prev => ({ ...prev, baseHub: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
              >
                <option value="Jaipur Central & Urban">Jaipur Central & Urban</option>
                <option value="Kota Industrial & Educational">Kota Industrial & Educational</option>
                <option value="Bundi & Satellite Hub">Bundi & Satellite Hub</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border">
            {[
              { id: "gpsAutoCheckin", label: "Automatic GPS Location Tagging on Visit Check-In", desc: "Auto-captures precise GPS coordinates during dealer store visits.", val: territory.gpsAutoCheckin },
              { id: "routeEstimator", label: "Travel Time & Route Optimization Engine", desc: "Calculates optimal route order and travel times between dealer outlets.", val: territory.routeEstimator },
              { id: "offlineRouteCache", label: "Offline Route Caching for Low-Network Areas", desc: "Caches dealer locations offline so visits can be completed without active internet.", val: territory.offlineRouteCache }
            ].map(opt => (
              <label key={opt.id} className="flex items-start gap-3 p-3.5 bg-muted/20 border border-border/50 rounded-2xl cursor-pointer hover:bg-muted/40 transition-colors">
                <input
                  type="checkbox"
                  checked={opt.val}
                  onChange={e => setTerritory(prev => ({ ...prev, [opt.id]: e.target.checked }))}
                  className="mt-0.5 rounded accent-primary cursor-pointer w-4 h-4"
                />
                <div>
                  <span className="font-bold text-foreground block text-xs">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                </div>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-primary text-primary-foreground font-black text-xs rounded-2xl hover:opacity-95 shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save size={16} /> Save Territory Preferences
          </button>
        </form>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: WHATSAPP & PITCH DEFAULTS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "whatsapp" && (
        <form onSubmit={handleSaveSettings} className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest block mb-0.5">Dealer Communication</span>
              <h2 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                <MessageSquare size={18} className="text-emerald-500" /> WhatsApp Pitching & Catalog Defaults
              </h2>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
              Default WhatsApp Message Signature Footer
            </label>
            <input
              type="text"
              value={whatsapp.messageFooter}
              onChange={e => setWhatsapp(prev => ({ ...prev, messageFooter: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
              Default Swatch Paints 2026 Digital Catalog Link
            </label>
            <input
              type="text"
              value={whatsapp.catalogUrl}
              onChange={e => setWhatsapp(prev => ({ ...prev, catalogUrl: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-foreground outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
              Default B2B Order Payment Terms Pitch
            </label>
            <select
              value={whatsapp.defaultPaymentTermPitch}
              onChange={e => setWhatsapp(prev => ({ ...prev, defaultPaymentTermPitch: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
            >
              <option value="30-Day PDC Cheque + 2.5% Instant Cash Rebate">30-Day PDC Cheque + 2.5% Instant Cash Rebate</option>
              <option value="Advance Payment + 4% Special Rebate">Advance Payment + 4% Special Rebate</option>
              <option value="15-Day Direct Credit Note">15-Day Direct Credit Note</option>
            </select>
          </div>

          <div className="space-y-3 pt-3 border-t border-border">
            <label className="flex items-start gap-3 p-3.5 bg-muted/20 border border-border/50 rounded-2xl cursor-pointer hover:bg-muted/40 transition-colors">
              <input
                type="checkbox"
                checked={whatsapp.attachDigitalCatalog}
                onChange={e => setWhatsapp(prev => ({ ...prev, attachDigitalCatalog: e.target.checked }))}
                className="mt-0.5 rounded accent-primary cursor-pointer w-4 h-4"
              />
              <div>
                <span className="font-bold text-foreground block text-xs">Auto-Attach Digital Shade Catalog Link to Order Quotes</span>
                <span className="text-[10px] text-muted-foreground">Includes link to Swatch 2026 digital shade fanners in all WhatsApp quotes.</span>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-emerald-600 text-white font-black text-xs rounded-2xl hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save size={16} /> Save WhatsApp Pitch Defaults
          </button>
        </form>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4: ALERTS & NOTIFICATIONS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "notifications" && (
        <form onSubmit={handleSaveSettings} className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="text-[9px] font-black uppercase text-indigo-500 tracking-widest block mb-0.5">Real-Time Alerts</span>
              <h2 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                <Bell size={18} className="text-indigo-500" /> Executive Notification & Target Alerts
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { id: "dealerOrderPush", label: "Instant Push Notification when Dealer Places B2B Order", desc: "Receive immediate mobile alert when an assigned dealer books an order." },
              { id: "collectionOverdueAlert", label: "Critical Collection Overdue Alerts (>30 Days)", desc: "Warns when dealer accounts exceed credit limits or aging thresholds." },
              { id: "quotaMilestoneProgress", label: "Monthly Target & Incentive Slab Progress Notifications", desc: "Alerts when approaching Bronze/Silver/Gold commission tier upgrades." },
              { id: "painterKycAlert", label: "Painter Network Registration & KYC Verification Alerts", desc: "Notifies when territory painters scan tokens or complete KYC." }
            ].map(opt => (
              <label key={opt.id} className="flex items-start gap-3 p-3.5 bg-muted/20 border border-border/50 rounded-2xl cursor-pointer hover:bg-muted/40 transition-colors">
                <input
                  type="checkbox"
                  checked={(notifications as any)[opt.id]}
                  onChange={e => setNotifications(prev => ({ ...prev, [opt.id]: e.target.checked }))}
                  className="mt-0.5 rounded accent-primary cursor-pointer w-4 h-4"
                />
                <div>
                  <span className="font-bold text-foreground block text-xs">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                </div>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-primary text-primary-foreground font-black text-xs rounded-2xl hover:opacity-95 shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save size={16} /> Save Notification Preferences
          </button>
        </form>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 5: SYNC & SYSTEM STATUS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "system" && (
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="text-[9px] font-black uppercase text-indigo-500 tracking-widest block mb-0.5">Database & Storage</span>
              <h2 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                <HardDrive size={18} className="text-indigo-500" /> System Sync & Cache Status
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-black text-[9px] border border-emerald-500/20">
              SUPABASE ONLINE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 space-y-1">
              <span className="text-[9px] font-black uppercase text-muted-foreground">Offline Sync Queue</span>
              <p className="text-base font-black text-foreground font-mono">0 Items Pending</p>
              <span className="text-[9px] text-emerald-500 font-bold">All field visits & orders synced</span>
            </div>

            <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 space-y-1">
              <span className="text-[9px] font-black uppercase text-muted-foreground">Last Database Sync</span>
              <p className="text-base font-black text-foreground font-mono">{system.lastSynced}</p>
              <span className="text-[9px] text-muted-foreground">{system.appVersion}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setSystem(prev => ({ ...prev, lastSynced: new Date().toISOString().slice(0, 16).replace("T", " ") }));
                alert("Supabase Database & Offline Cache synced successfully!");
              }}
              className="flex-1 py-3 bg-primary text-primary-foreground font-black text-xs rounded-2xl hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw size={15} /> Force Database Sync Now
            </button>

            <button
              onClick={() => {
                if (confirm("Reset local cache and clear offline draft logs?")) {
                  alert("Local browser cache reset cleanly.");
                }
              }}
              className="py-3 px-5 border border-border bg-background hover:bg-muted text-foreground font-black text-xs rounded-2xl transition-colors cursor-pointer"
            >
              Clear Local Cache
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
