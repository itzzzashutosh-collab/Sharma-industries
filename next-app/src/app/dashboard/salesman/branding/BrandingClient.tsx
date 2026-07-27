"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  Store, ShieldAlert, Sparkles, Plus, Image as ImageIcon, Camera, CheckCircle2,
  ChevronRight, X, Calendar, Shield, Copy, Check, Share2, Upload, FileText,
  Building2, Eye, Award, Palette, Layers, ArrowRight, Download, Printer, Tag, Info, Search
} from "lucide-react";
import { requestShopBrandingAsset } from "../actions";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Dealer {
  id: string;
  name: string;
  locality?: string;
  phone?: string;
  tier?: string;
  annual_revenue?: number;
}

interface BrandingItem {
  id: string;
  dealer_id: string;
  dealer_name: string;
  item_type: string;
  category: "Outdoor Signage" | "In-Store Display" | "Color Collateral" | "Vinyl & Banners";
  status: "Installed & Verified" | "In Production" | "Pending Approval" | "Inspection Overdue";
  dimensions: string;
  installed_date: string;
  last_inspected: string;
  locality?: string;
  visibility_score: number; // 0-100 score
  photo_url?: string;
}

interface Props {
  initialData: {
    dealers: Dealer[];
    branding: any[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Paints B2B Shop Branding Objection & Negotiation Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_BRANDING_OBJECTIONS = [
  {
    id: "BRD_OBJ_1",
    category: "Facade Space",
    title: "Asian Paints / Berger board is already on main shop front",
    problemText: "Main frontage pe Asian Paints ka ACP Glow Sign board pehle se laga hai, Swatch Paints ke board ki jagah nahi hai.",
    strategy: "Offer Side Pillar LED Board + Free Heavy Duty In-Store Display Rack",
    solutionHindi: "Sir, shop ke Side Entry Pillar ya Side Wall facade pe 8x3 ft Premium Swatch Paints LED Glow Board install karwa denge. Sath mein shop inside Swatch Paints 4-Tier Metal Display Rack free de rahe hain jo customer eye-level par high-margin buckets promote karega.",
    salesPitch: "Side LED Glow Board + In-Store Display Rack = 2x Customer Touchpoints without replacing existing signboard.",
    whatsappTemplate: "Namaste Sir! Swatch Paints Side Wall LED Glow Board + Free 4-Tier Product Display Rack package request approve ho gaya hai. Asian Paints board ke bina touch kiye Swatch Paints ka high-impact look banega. Installation slot book karein? 🎨"
  },
  {
    id: "BRD_OBJ_2",
    category: "Counter Dedication",
    title: "Why dedicate prime store counter space to Swatch Paints Display Rack?",
    problemText: "Mere counter ke paas space Kam hai, main Swatch Paints Display Rack kyun lagaun?",
    strategy: "Show Painter Cash Pull & High Retail Margin per Square Foot",
    solutionHindi: "Sir, Swatch Paints Shine Emulsion & Wall Putty ki retail margin competitor se 4% higher hai. Jab painter store mein enter karega, Swatch Paints Display Rack dekh ke direct Painter Cash App rewards ka inquire karega. Per sqft revenue 2.5x badhega!",
    salesPitch: "Display Rack = Instant Painter App Token Inquiry + ₹15,000 extra monthly retail margin.",
    whatsappTemplate: "Sirji, Swatch Paints Premium Metal Display Rack aapke billing counter par lagne se daily Painter App Wallet Rewards inquiry 3x ho jayegi. Product turnover automatically boost hoga! Rack dispatch schedule karein? 📦"
  },
  {
    id: "BRD_OBJ_3",
    category: "Maintenance & Renewal",
    title: "Old Swatch Glow Sign board tube lights got damaged",
    problemText: "Purana Glow Sign Board 2 saal purana ho gaya hai, light nahi jalti, company naya board free change kare.",
    strategy: "Grant 48-Hour LED Retrofit on ₹50,000 Re-Order Milestone",
    solutionHindi: "Sir, bilkul! ₹50,000 re-order booking ke sath Swatch Paints Branding Team within 48 hours aapke board mein Energy-Efficient LED Lighting Module & Fresh Flex Replacement complete kar degi.",
    salesPitch: "Order Milestone Trigger = Free LED Retrofit & Brand Refurbishment.",
    whatsappTemplate: "Great news Sir! ₹50,000 re-order confirmation par Swatch Paints 48-Hour Free LED Board Maintenance & Flex Refurbishment service trigger ho jati hai. Today re-order finalize karein? 💡"
  },
  {
    id: "BRD_OBJ_4",
    category: "Financial Cash Incentive",
    title: "Competitor offered ₹25,000 cash for shop frontage rights",
    problemText: "Dusri brand ne frontage board ke liye ₹25,000 cash discount diya hai, Swatch Paints kya cash dega?",
    strategy: "Leverage Gold Partner Tier Discount (Extra 3% Margin on All Orders)",
    solutionHindi: "Sir, competitor ek baar ₹25,000 cash deke discount khatam kar deta hai. Swatch Paints aapko Gold Partner Tier mein convert karke har order par extra 3% margin discount dega, jo saal mein ₹90,000+ extra cash profit dega!",
    salesPitch: "One-Time ₹25k Competitor Cash vs Swatch Paints Gold Partner Year-Round ₹90,000+ Extra Profit.",
    whatsappTemplate: "Sir, Swatch Paints Gold Partner Upgrade Offer: Har order par extra 3% margin discount (Yearly ₹90,000+ savings!) + FREE LED Glow Board. One-time ₹25k se 4x better value! Let's lock this tier today. 🏆"
  },
  {
    id: "BRD_OBJ_5",
    category: "Shade Card Distribution",
    title: "Demanding 10 Free Master Shade Cards for Contractors",
    problemText: "Mujhe 10 Swatch Shade Fanners & Books free do contractors ko baantne ke liye, tabhi order dunga.",
    strategy: "Bundle Shade Card Pack with Painter Loyalty App Onboarding",
    solutionHindi: "Sir, Swatch Paints Fanalyser Master Shade Card Books aapko 5 Kits free milengi jaise hi aapke 5 Key Contractors Swatch Painter App par register karke KYC complete karenge.",
    salesPitch: "Shade Cards = Verified Contractor Onboarding = Permanent Brand Retention.",
    whatsappTemplate: "Sir, Swatch Paints Master Fanalyser Shade Card Kits pack ready hai! Jaise hi contractor Painter App registration drive complete hoti hai, instant 5 Shade Books store deliver hongi. Drive start karein? 🎨"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function BrandingClient({ initialData }: Props) {
  // Normalize Dealers
  const dealersList: Dealer[] = initialData.dealers?.length
    ? initialData.dealers.map((d: any, idx: number) => ({
        id: d.id || `D-${idx}`,
        name: d.name || `Dealer ${idx + 1}`,
        locality: d.locality || "Jaipur",
        phone: d.phone || "9829012345",
        tier: idx === 0 ? "Gold Partner" : "Silver Partner",
        annual_revenue: d.annual_revenue || 450000
      }))
    : [
        { id: "D1", name: "Shree Ram Paints", locality: "Malviya Nagar", phone: "9829012345", tier: "Gold Partner", annual_revenue: 650000 },
        { id: "D2", name: "Ravi Paint & Hardware", locality: "Tonk Road", phone: "9829054321", tier: "Silver Partner", annual_revenue: 350000 },
        { id: "D3", name: "Sharma Colour House", locality: "Sanganer", phone: "9829099887", tier: "Gold Partner", annual_revenue: 820000 },
        { id: "D4", name: "Rajasthan Paint Depot", locality: "Vaishali Nagar", phone: "9829011223", tier: "Standard", annual_revenue: 210000 }
      ];

  // Mock Branding Items with Swatch Paints Branding
  const mockBrandingItems: BrandingItem[] = (initialData.branding?.length > 0)
    ? initialData.branding.map((b: any, idx: number) => ({
        id: b.id || `BRAND-94${80 + idx}`,
        dealer_id: b.dealer_id || dealersList[idx % dealersList.length].id,
        dealer_name: b.dealer_name || dealersList[idx % dealersList.length].name,
        item_type: b.item_type || "Swatch Paints LED Glow Sign Board",
        category: (b.category || (idx % 2 === 0 ? "Outdoor Signage" : "In-Store Display")) as any,
        status: (b.status || (idx === 0 ? "Installed & Verified" : "In Production")) as any,
        dimensions: b.dimensions || "10x4 ft",
        installed_date: b.installed_date || "2026-05-10",
        last_inspected: b.last_inspected || "2026-07-01",
        locality: b.locality || "Jaipur",
        visibility_score: b.visibility_score || (idx === 0 ? 95 : 78)
      }))
    : [
        { id: "BRAND-9482", dealer_id: "D1", dealer_name: "Shree Ram Paints", item_type: "Swatch Paints LED Glow Sign Board", category: "Outdoor Signage", status: "Installed & Verified", dimensions: "12x4 ft", installed_date: "2026-04-15", last_inspected: "2026-07-01", locality: "Malviya Nagar", visibility_score: 95 },
        { id: "BRAND-9511", dealer_id: "D3", dealer_name: "Sharma Colour House", item_type: "Swatch Paints Heavy Metal Display Rack", category: "In-Store Display", status: "In Production", dimensions: "4 Tier Heavy Duty", installed_date: "2026-06-20", last_inspected: "2026-07-10", locality: "Sanganer", visibility_score: 88 },
        { id: "BRAND-9540", dealer_id: "D2", dealer_name: "Ravi Paint & Hardware", item_type: "Swatch Paints Fanalyser Master Shade Pack", category: "Color Collateral", status: "Installed & Verified", dimensions: "5 Book Set", installed_date: "2026-05-02", last_inspected: "2026-06-28", locality: "Tonk Road", visibility_score: 90 },
        { id: "BRAND-9602", dealer_id: "D4", dealer_name: "Rajasthan Paint Depot", item_type: "Swatch Paints Exterior Wall Vinyl Wrap", category: "Vinyl & Banners", status: "Inspection Overdue", dimensions: "15x6 ft Side Facade", installed_date: "2026-03-12", last_inspected: "2026-05-15", locality: "Vaishali Nagar", visibility_score: 62 }
      ];

  // States
  const [brandingItems, setBrandingItems] = useState<BrandingItem[]>(mockBrandingItems);
  const [activeTab, setActiveTab] = useState<"assets" | "request" | "playbook" | "collateral" | "analytics">("assets");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<BrandingItem | null>(null);
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);
  const [showPhotoAuditModal, setShowPhotoAuditModal] = useState<BrandingItem | null>(null);
  const [isPending, startTransition] = useTransition();

  // Request Form State
  const [selectedDealerId, setSelectedDealerId] = useState<string>("");
  const [itemType, setItemType] = useState<string>("Swatch Paints LED Glow Sign Board");
  const [category, setCategory] = useState<"Outdoor Signage" | "In-Store Display" | "Color Collateral" | "Vinyl & Banners">("Outdoor Signage");
  const [dimensions, setDimensions] = useState<string>("10x4 ft");
  const [remarks, setRemarks] = useState<string>("");

  // Selected Dealer Object
  const selectedDealerObj = useMemo(() => dealersList.find(d => d.id === selectedDealerId), [selectedDealerId, dealersList]);

  // Overall Merchandising Metrics
  const metrics = useMemo(() => {
    const totalCount = brandingItems.length;
    const verifiedCount = brandingItems.filter(b => b.status === "Installed & Verified").length;
    const pendingCount = brandingItems.filter(b => b.status === "Pending Approval" || b.status === "In Production").length;
    const avgScore = totalCount > 0 ? Math.round(brandingItems.reduce((s, b) => s + b.visibility_score, 0) / totalCount) : 0;
    return { totalCount, verifiedCount, pendingCount, avgScore };
  }, [brandingItems]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return brandingItems.filter(b => {
      const matchesSearch = b.dealer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            b.item_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (b.locality && b.locality.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === "ALL" || b.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [brandingItems, searchTerm, categoryFilter]);

  // Handlers
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealerId) {
      alert("Please select a target dealer for Swatch Paints branding.");
      return;
    }

    const dealerObj = dealersList.find(d => d.id === selectedDealerId);
    const newAssetId = `BRAND-${Math.floor(9500 + Math.random() * 500)}`;

    const newAsset: BrandingItem = {
      id: newAssetId,
      dealer_id: selectedDealerId,
      dealer_name: dealerObj?.name || "Dealer",
      item_type: itemType,
      category: category,
      status: "Pending Approval",
      dimensions: dimensions || "Standard Store Fit",
      installed_date: "Scheduled",
      last_inspected: new Date().toISOString().slice(0, 10),
      locality: dealerObj?.locality || "Jaipur",
      visibility_score: 85
    };

    startTransition(async () => {
      await requestShopBrandingAsset({
        dealerName: newAsset.dealer_name,
        itemType: itemType,
        dimensions: dimensions,
        notes: remarks
      });

      setBrandingItems(prev => [newAsset, ...prev]);
      setActiveTab("assets");
      setSelectedDealerId("");
      setRemarks("");
      alert(`Marketing branding request for ${itemType} at ${newAsset.dealer_name} submitted successfully! Awaiting Admin approval.`);
    });
  };

  const copyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2500);
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
                Swatch Paints Merchandising
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black">
                ● OFFICIAL STORE BRANDING
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Store size={22} className="text-indigo-400" /> Swatch Paints Shop Branding Hub
            </h1>
            <p className="text-slate-400 text-[11px] max-w-xl">
              Request Swatch Paints LED Glow Signboards, Product Racks & Shade Cards. Resolve dealer frontage objections with instant WhatsApp proposals.
            </p>
          </div>

          <button
            onClick={() => setActiveTab("request")}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black text-xs hover:opacity-95 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer border border-indigo-400/30"
          >
            <Plus size={16} /> Request Swatch Branding Asset
          </button>
        </div>

        {/* Dynamic Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Branded Outlets</span>
            <p className="text-lg font-black text-white font-mono">{metrics.totalCount} Stores</p>
            <span className="text-[9px] text-slate-400">{metrics.verifiedCount} verified & active</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-emerald-400 block mb-0.5">Visibility Score</span>
            <p className="text-lg font-black text-emerald-300 font-mono">{metrics.avgScore}% Coverage</p>
            <span className="text-[9px] text-slate-400">High brand recall in territory</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-amber-300 block mb-0.5">In Production / Pending</span>
            <p className="text-lg font-black text-amber-200 font-mono">{metrics.pendingCount} Assets</p>
            <span className="text-[9px] text-slate-400">Awaiting fabrication/approval</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-indigo-300 block mb-0.5">Brand Identity</span>
            <p className="text-lg font-black text-indigo-200 font-mono">Swatch Paints</p>
            <span className="text-[9px] text-slate-400">Dealers, Salesman & Painter brand</span>
          </div>
        </div>
      </div>

      {/* ══ TAB NAVIGATION ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1.5 bg-muted/60 p-1.5 rounded-2xl border border-border overflow-x-auto">
        {[
          { id: "assets", label: "Branded Outlets & Signage", icon: Store, badge: metrics.totalCount },
          { id: "request", label: "Request Branding", icon: Plus, highlight: true },
          { id: "playbook", label: "Branding Objection Master", icon: Shield, badge: "5 Strategies" },
          { id: "collateral", label: "Swatch Shade Catalogs", icon: Palette, badge: "2026 Edition" },
          { id: "analytics", label: "Visibility Audit", icon: Eye }
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
                  : tab.highlight
                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: BRANDED OUTLETS & SIGNAGE ASSETS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "assets" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Dealer Name, Locality, or Asset Type..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs outline-none focus:border-primary transition-colors text-foreground shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "Outdoor Signage", "In-Store Display", "Color Collateral", "Vinyl & Banners"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Branding Items List */}
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-3xl p-6">
              <Store size={32} className="mx-auto text-muted-foreground/50 mb-2" />
              <p className="font-bold text-foreground">No Swatch Paints branding assets found</p>
              <p className="text-muted-foreground text-[11px] mt-1">Submit a new branding request for your territory dealers.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAssets.map(b => {
                const isInstalled = b.status === "Installed & Verified";
                const isOverdue = b.status === "Inspection Overdue";

                return (
                  <div
                    key={b.id}
                    className="bg-card border border-border rounded-3xl p-4 sm:p-5 space-y-4 hover:border-primary/40 transition-all shadow-xs cursor-pointer group"
                    onClick={() => setSelectedAsset(b)}
                  >
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-foreground font-mono group-hover:text-primary transition-colors">
                            {b.id}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{b.locality}</span>
                        </div>
                        <h3 className="font-extrabold text-foreground text-xs mt-0.5 flex items-center gap-1.5">
                          <Building2 size={13} className="text-indigo-500" /> {b.dealer_name}
                        </h3>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider flex-shrink-0 ${
                          isInstalled
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : isOverdue
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    {/* Asset Details */}
                    <div className="bg-muted/30 border border-border/50 rounded-2xl p-3 space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Asset Item:</span>
                        <span className="font-bold text-foreground">{b.item_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions / Spec:</span>
                        <span className="font-mono text-foreground font-bold">{b.dimensions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Visibility Score:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {b.visibility_score}% Coverage
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar size={11} /> Inspected: {b.last_inspected}
                      </span>

                      <button
                        onClick={(e) => { e.stopPropagation(); setShowPhotoAuditModal(b); }}
                        className="px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/10 text-primary font-black text-[10px] hover:bg-primary/20 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Camera size={12} /> Audit & Upload Photo
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: REQUEST SWATCH BRANDING ASSET FORM
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "request" && (
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                <Plus size={18} className="text-primary" /> Request Swatch Paints Shop Branding Asset
              </h2>
              <p className="text-muted-foreground text-[11px]">
                Submit branding requests for LED Glow Signboards, Display Racks, & Master Shade Fanners for territory outlets.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("assets")}
              className="px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:bg-muted font-bold text-[10px]"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleRequestSubmit} className="space-y-6">
            {/* Target Dealer */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                1. Select Target Dealer Store *
              </label>
              <select
                value={selectedDealerId}
                onChange={e => setSelectedDealerId(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-bold text-foreground outline-none focus:border-primary transition-colors"
              >
                <option value="">-- Choose Dealer Store --</option>
                {dealersList.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.locality}) — {d.tier}
                  </option>
                ))}
              </select>

              {selectedDealerObj && (
                <div className="bg-muted/40 border border-border rounded-2xl p-4 space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dealer Partnership Tier:</span>
                    <span className="font-bold text-indigo-500 font-mono">{selectedDealerObj.tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Swatch Order Volume:</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{(selectedDealerObj.annual_revenue || 450000).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Asset Material Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                  Branding Asset Material *
                </label>
                <select
                  value={itemType}
                  onChange={e => setItemType(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
                >
                  <option value="Swatch Paints LED Glow Sign Board">Swatch Paints LED Glow Sign Board (Outdoor)</option>
                  <option value="Swatch Paints ACP Store Facade Board">Swatch Paints ACP Store Facade Board (Outdoor)</option>
                  <option value="Swatch Paints Heavy Metal Display Rack">Swatch Paints Heavy Metal Display Rack (In-Store)</option>
                  <option value="Swatch Paints Fanalyser Master Shade Pack">Swatch Paints Fanalyser Master Shade Pack (Color)</option>
                  <option value="Swatch Paints Exterior Vinyl & Wall Wrap">Swatch Paints Exterior Vinyl & Wall Wrap (Banner)</option>
                  <option value="Swatch Paints Counter Mat & Billing Desk Kit">Swatch Paints Counter Mat & Billing Desk Kit (Store)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                  Material Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
                >
                  <option value="Outdoor Signage">Outdoor Signage</option>
                  <option value="In-Store Display">In-Store Display</option>
                  <option value="Color Collateral">Color Collateral</option>
                  <option value="Vinyl & Banners">Vinyl & Banners</option>
                </select>
              </div>
            </div>

            {/* Dimensions & Specific Remarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                  Installation Dimensions / Specs
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10x4 ft or 4-Tier Heavy Duty"
                  value={dimensions}
                  onChange={e => setDimensions(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1.5">
                  Facade & Installation Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Front facade replacement, highly visible main road"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Store Facade Upload Photo Simulator */}
            <div className="border border-dashed border-border rounded-2xl p-4 flex flex-col items-center justify-center bg-muted/10 space-y-1 cursor-pointer">
              <Upload size={20} className="text-primary" />
              <span className="text-xs font-bold text-foreground">Attach Store Frontage Photo for Approval</span>
              <span className="text-[10px] text-muted-foreground">PNG, JPG up to 5MB</span>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 bg-primary text-primary-foreground font-black text-xs rounded-2xl hover:opacity-95 shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} /> Submit Swatch Paints Branding Request
            </button>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: SWATCH PAINTS BRANDING OBJECTION MASTER PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-5 border border-indigo-500/30 shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-indigo-400" />
              <h2 className="text-base font-black text-white">Swatch Paints Branding Objection Master</h2>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Negotiate store frontage rights, defend counter space for Swatch Paints display racks, and send instant WhatsApp proposals.
            </p>
          </div>

          <div className="space-y-4">
            {SWATCH_BRANDING_OBJECTIONS.map((obj, idx) => (
              <div key={obj.id} className="bg-card border border-border rounded-3xl p-5 space-y-3.5 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {obj.category}
                  </span>
                  <h3 className="font-extrabold text-foreground text-xs sm:text-sm mt-1.5">
                    {idx + 1}. {obj.title}
                  </h3>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 text-[11px] text-rose-600 dark:text-rose-300 font-medium">
                  <strong className="block text-[9px] font-black uppercase text-rose-500 mb-0.5">Dealer Branding Objection:</strong>
                  "{obj.problemText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-[11px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Swatch Counter Strategy (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.solutionHindi}</p>
                </div>

                <div className="bg-muted/40 border border-border rounded-2xl p-3 text-[10px] text-muted-foreground space-y-0.5">
                  <strong className="block text-[9px] font-black uppercase text-foreground">
                    🎯 Pitch Value Proposition:
                  </strong>
                  <p>{obj.salesPitch}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-[10px] font-bold text-muted-foreground">WhatsApp Proposal Text</span>
                  <button
                    onClick={() => copyScript(obj.id, obj.whatsappTemplate)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-[10px] hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedObjId === obj.id ? (
                      <>
                        <Check size={12} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy WhatsApp Pitch
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4: SWATCH SHADE CATALOGS & MARKETING COLLATERAL
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "collateral" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Palette size={16} className="text-primary" /> Swatch Paints 2026 Digital Shade Catalogs
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Share official Swatch Paints digital shade fanners and product specification brochures directly with dealers and painters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Swatch Shine Emulsion Master Fanalyser", shades: "1,450 Shades", category: "Interior Range", badge: "2026 EDITION" },
              { title: "Swatch Rustic Royale Luxury Finishes", shades: "120 Designer Textures", category: "Luxury Range", badge: "HIGH MARGIN" },
              { title: "Swatch Weatherguard Exterior Protection", shades: "850 Exterior Tints", category: "Exterior Range", badge: "7-YR WARRANTY" },
              { title: "Swatch Damp Shield Waterproofing Guide", shades: "Complete System Guide", category: "Waterproofing", badge: "CONTRACTOR FAV" }
            ].map((cat, idx) => (
              <div key={idx} className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-xs hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-black text-[9px]">
                    {cat.badge}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground font-mono">{cat.shades}</span>
                </div>

                <h3 className="font-extrabold text-xs text-foreground">{cat.title}</h3>
                <p className="text-[10px] text-muted-foreground">{cat.category}</p>

                <div className="pt-2 border-t border-border/50 flex gap-2">
                  <button
                    onClick={() => {
                      const txt = `*SWATCH PAINTS DIGITAL SHADE CATALOG - ${cat.title}* 🎨\nExplore 2026 color trends & specifications here: https://swatchpaints.com/catalogs/${cat.category.toLowerCase().replace(/ /g, "-")}`;
                      navigator.clipboard.writeText(txt);
                      alert(`WhatsApp Share Link for ${cat.title} copied!`);
                    }}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-black text-[10px] hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Share2 size={12} /> Share Shade Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 5: BRAND AUDIT & VISIBILITY ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Eye size={16} className="text-indigo-500" /> Swatch Paints Merchandising Performance
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Territory Visibility Score</span>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">92% Coverage</p>
                <span className="text-[9px] text-emerald-500 font-bold">Top rank in Jaipur Zone</span>
              </div>
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Audit Compliance Rate</span>
                <p className="text-base font-black text-foreground font-mono">100% Inspected</p>
                <span className="text-[9px] text-muted-foreground">All 18 outlets audited</span>
              </div>
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Glow Board Uptime</span>
                <p className="text-base font-black text-indigo-500 font-mono">98.5% LED Uptime</p>
                <span className="text-[9px] text-indigo-400 font-bold">Active night illumination</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PHOTO AUDIT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showPhotoAuditModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPhotoAuditModal(null)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border bg-muted/20 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Store Audit Verification</span>
                <h3 className="text-xs font-black text-foreground">{showPhotoAuditModal.dealer_name}</h3>
              </div>
              <button onClick={() => setShowPhotoAuditModal(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={14} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-muted/40 border border-border rounded-2xl p-3.5 space-y-1">
                <p className="font-bold text-foreground">{showPhotoAuditModal.item_type}</p>
                <p className="text-[10px] text-muted-foreground">Dimensions: {showPhotoAuditModal.dimensions}</p>
              </div>

              <div className="border border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center bg-muted/10 space-y-1 cursor-pointer">
                <Camera size={24} className="text-primary mb-1" />
                <span className="text-xs font-bold text-foreground">Upload Store Frontage Photo</span>
                <span className="text-[10px] text-muted-foreground">Take live photo with GPS timestamp</span>
              </div>

              <button
                onClick={() => {
                  alert(`Store audit photo uploaded for ${showPhotoAuditModal.dealer_name}! Inspection status updated.`);
                  setShowPhotoAuditModal(null);
                }}
                className="w-full py-2.5 bg-primary text-primary-foreground font-black text-[11px] rounded-xl hover:opacity-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={13} /> Complete Audit & Verify Asset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
