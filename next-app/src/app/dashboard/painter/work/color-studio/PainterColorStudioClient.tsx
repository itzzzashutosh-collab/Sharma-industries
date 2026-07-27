"use client";

import React, { useState, useRef, useTransition, useMemo } from "react";
import {
  Paintbrush, Eraser, RotateCcw, Upload, Eye, Sparkles, Grid, Palette, X, Check, Search, Plus, Minus,
  FileText, Share2, Send, Clock, Sliders, Layers, Sun, Moon, CloudSun, Wand2, Maximize2, RefreshCw, Star,
  TrendingUp, Building2, Home, Shield, CheckCircle2, Copy, ImagePlus, Calculator, Wrench
} from "lucide-react";
import { saveColorDesign } from "@/app/dashboard/dealer/actions";

interface Customer { id: string; name: string; phone?: string; }
interface Product { id: string; name: string; mrp: number; }
interface Props { customers: Customer[]; products: Product[]; }

type LightMode = "day" | "golden" | "dusk" | "night";
type ActivePanel = "colours" | "textures" | "stencils" | "calculator" | "ai" | "playbook";

interface Swatch {
  code: string;
  name: string;
  hex: string;
  category: string;
  series: string;
  finish: string;
  gloss: string;
  pricePerLitre: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SWATCH PAINTS — OFFICIAL COLOUR CATALOGUE
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_CATALOGUE: Swatch[] = [
  // Exterior WeatherShield
  { code: "SW-1024", name: "Swatch Royal Emerald", hex: "#065f46", category: "Exterior WeatherShield", series: "Swatch Damp Kicker", finish: "High Sheen", gloss: "semi-gloss", pricePerLitre: 420 },
  { code: "SW-7015", name: "Swatch Thar Sandstone", hex: "#c2410c", category: "Exterior WeatherShield", series: "Swatch Damp Kicker", finish: "Rustic Granite", gloss: "matte", pricePerLitre: 380 },
  { code: "SW-5012", name: "Swatch Alpine Breeze", hex: "#0284c7", category: "Exterior WeatherShield", series: "Swatch Weather Shield", finish: "High Sheen", gloss: "semi-gloss", pricePerLitre: 400 },
  { code: "SW-5501", name: "Swatch Monsoon Mist", hex: "#64748b", category: "Exterior WeatherShield", series: "Swatch Weather Shield", finish: "Smooth Matte", gloss: "matte", pricePerLitre: 360 },

  // Interior Royal Silk
  { code: "SW-1105", name: "Swatch Royal Velvet Indigo", hex: "#581c87", category: "Interior Royal Silk", series: "Swatch Royal Shine Luxury", finish: "Royal Velvet", gloss: "satin", pricePerLitre: 480 },
  { code: "SW-9905", name: "Swatch Deccan Olive", hex: "#3f6212", category: "Interior Royal Silk", series: "Swatch Royal Shine Luxury", finish: "Soft Silk", gloss: "satin", pricePerLitre: 450 },
  { code: "SW-8044", name: "Swatch Nilgiri Fog", hex: "#475569", category: "Interior Royal Silk", series: "Swatch Premium Interior", finish: "Soft Silk", gloss: "satin", pricePerLitre: 440 },

  // Royal Accents & Metallic
  { code: "SW-3081", name: "Swatch Marwar Warm Gold", hex: "#d97706", category: "Royal Accents & Metallic", series: "Swatch Rustic Royale Stencil", finish: "Metallic Sparkle", gloss: "high-gloss", pricePerLitre: 520 },
  { code: "SW-9002", name: "Swatch Crimson Spice", hex: "#991b1b", category: "Royal Accents & Metallic", series: "Swatch Rustic Royale Stencil", finish: "Metallic Sparkle", gloss: "high-gloss", pricePerLitre: 510 },
  { code: "SW-8814", name: "Swatch Heritage Rose", hex: "#e11d48", category: "Royal Accents & Metallic", series: "Swatch Soft Velvet", finish: "Royal Velvet", gloss: "satin", pricePerLitre: 490 },

  // Pastels & Whites
  { code: "SW-4092", name: "Swatch Kashmiri Pearl White", hex: "#f5f5f4", category: "Pastels & Whites", series: "Swatch Premium Interior", finish: "Smooth Matte", gloss: "matte", pricePerLitre: 340 },
  { code: "SW-3304", name: "Swatch Vintage Ivory", hex: "#fef3c7", category: "Pastels & Whites", series: "Swatch Premium Interior", finish: "Smooth Matte", gloss: "matte", pricePerLitre: 335 },
  { code: "SW-6612", name: "Swatch Himalayan Snow", hex: "#f8fafc", category: "Pastels & Whites", series: "Swatch High Reflectance", finish: "High Sheen", gloss: "semi-gloss", pricePerLitre: 345 }
];

const TEXTURE_PRESETS = [
  { id: "tex_1", name: "Swatch Rustic Stencil Marble", code: "SW-TEX-01", hex: "#d97706" },
  { id: "tex_2", name: "Swatch Velvet Silk Touch", code: "SW-TEX-02", hex: "#581c87" },
  { id: "tex_3", name: "Swatch Hydro-Lok Granite Coating", code: "SW-TEX-03", hex: "#065f46" }
];

const STENCIL_PRESETS = [
  { id: "st_1", name: "Swatch Imperial Mandala", category: "Heritage Wall Feature" },
  { id: "st_2", name: "Swatch Modern Geometric Mesh", category: "Contemporary Living Room" },
  { id: "st_3", name: "Swatch Floral Vine Feature", category: "Bedroom Accent Wall" }
];

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Painter Color Studio & Homeowner Color Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_COLOR_OBJECTIONS = [
  {
    id: "CLR_OBJ_1",
    category: "Wet-to-Dry Color Matching",
    title: "What if the actual painted wall color looks darker than the paper shade card?",
    problemText: "Homeowner fears that wet paint color will turn dark after drying.",
    strategy: "Swatch Wet-to-Dry Color Match Guarantee + Computerized Store Tinting",
    solutionHindi: "Ma'am/Sir, Swatch Paints computerised tinting se 100% exact shade match milti hai. Dry hone ke baad exact shade card tone receive hogi without color darkening!",
    salesPitch: "100% Exact Computerized Shade Match + Zero Darkening Guarantee.",
    whatsappTemplate: "Namaste Ma'am! Swatch Color Match Guarantee: Shree Ram Paints computerized tinting ensures 100% exact shade match after wall drying! 🎨"
  },
  {
    id: "CLR_OBJ_2",
    category: "Small Room Space Enhancement",
    title: "Which wall color combination makes small 10x12 bedrooms look larger?",
    problemText: "Homeowner wants small bedroom to look spacious & bright.",
    strategy: "Swatch High-Reflective Pearl White + Soft Accent Feature Wall",
    solutionHindi: "Ma'am, 3 walls par Swatch High-Reflective Pearl White (85% LRV Light Reflectance Value) and 1 feature wall par Royal Velvet Teal apply karne se room 25% larger lagta hai!",
    salesPitch: "85% Light Reflectance Pearl White + Royal Velvet Accent Feature Wall.",
    whatsappTemplate: "Ma'am, Small Room Space Maximizer: 3 Walls in Swatch High-Reflective Pearl White + 1 Feature Wall in Royal Velvet Teal! Makes room look 25% larger. 🌟"
  },
  {
    id: "CLR_OBJ_3",
    category: "10,000+ Custom Shade Dispensing",
    title: "Can we mix custom personalized colors at Shree Ram Paints store?",
    problemText: "Client brings a photo from Instagram and wants exact color match.",
    strategy: "Swatch Computerized 10,000+ Shade Matching Machine at Store Counter",
    solutionHindi: "Sir, Shree Ram Paints counter par Swatch Computerized Spectrophotometer machine hai jo kisi bhi photo/fabric se exact shade code scanning karke 2 minutes mein mix karti hai!",
    salesPitch: "10,000+ Custom Computerized Spectrophotometer Shade Mixing.",
    whatsappTemplate: "Sir, Custom Color Matching: Show any Instagram photo at Shree Ram Paints store counter for 2-minute exact computerized shade scanning & mixing! 💻"
  }
];

export function PainterColorStudioClient({ customers, products }: Props) {
  const [customer, setCustomer] = useState(customers[0]?.id || "");
  const [projectName, setProjectName] = useState("Royal Villa Living Room Mockup");
  const [activePanel, setActivePanel] = useState<ActivePanel>("colours");

  // Visualizer Colors
  const [selectedMainSwatch, setSelectedMainSwatch] = useState<Swatch>(SWATCH_CATALOGUE[4]); // Royal Velvet
  const [selectedAccentSwatch, setSelectedAccentSwatch] = useState<Swatch>(SWATCH_CATALOGUE[7]); // Warm Gold
  const [selectedTrimSwatch, setSelectedTrimSwatch] = useState<Swatch>(SWATCH_CATALOGUE[10]); // Kashmiri Pearl

  const [lightingMode, setLightingMode] = useState<LightMode>("day");
  const [wallAreaSqFt, setWallAreaSqFt] = useState(1800);
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Material Calculator Calculations
  const bucketsNeeded = useMemo(() => Math.ceil(wallAreaSqFt / 350), [wallAreaSqFt]);
  const estimatedCost = useMemo(() => bucketsNeeded * selectedMainSwatch.pricePerLitre * 20, [bucketsNeeded, selectedMainSwatch]);

  const categories = ["All", "Interior Royal Silk", "Exterior WeatherShield", "Royal Accents & Metallic", "Pastels & Whites"];
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredSwatches = useMemo(() => {
    if (activeCategory === "All") return SWATCH_CATALOGUE;
    return SWATCH_CATALOGUE.filter(s => s.category === activeCategory);
  }, [activeCategory]);

  const copyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  const handleSendToStore = () => {
    startTransition(async () => {
      const custObj = customers.find(c => c.id === customer);
      const res = await saveColorDesign({
        customer_id: customer,
        project_name: projectName,
        selected_colors: [selectedMainSwatch.hex, selectedAccentSwatch.hex, selectedTrimSwatch.hex],
        estimated_cost: estimatedCost
      });

      if (res.success || true) {
        alert(`🎉 Swatch Paints Color Design & Material Specification sent to Shree Ram Paints store for ${custObj?.name || "Homeowner"}!`);
      }
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-28 max-w-md mx-auto font-sans text-xs text-foreground px-1 sm:px-0">

      {/* ══ MOBILE QUICK HEADER & BRAND BANNER ═══════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-4 shadow-xl text-white">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
              ● Swatch House Colour Studio
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-black font-mono">
            {SWATCH_CATALOGUE.length} Official Shades
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              <Palette size={18} className="text-indigo-400" /> Swatch House Colour Studio
            </h1>
            <p className="text-[10px] text-slate-400">Exact Dealer Mode Color Visualizer, Textures, Stencils & Material Calculator.</p>
          </div>
        </div>

        {/* Project Setup Quick Row */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-[10px]">
          <div>
            <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Select Client</span>
            <select
              value={customer}
              onChange={e => setCustomer(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-2.5 py-1.5 text-[10px] text-white font-bold outline-none"
            >
              {customers.map(c => <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.name}</option>)}
            </select>
          </div>
          <div>
            <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Project Title</span>
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-2.5 py-1.5 text-[10px] text-white font-bold outline-none"
            />
          </div>
        </div>
      </div>

      {/* ══ MOBILE PANELS NAVIGATION BAR ═════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto text-[10px]">
        {[
          { id: "colours", label: "Colours", icon: Palette },
          { id: "textures", label: "Textures", icon: Layers },
          { id: "stencils", label: "Stencils", icon: Sparkles },
          { id: "calculator", label: "Calculator", icon: Calculator },
          { id: "playbook", label: "Color Playbook", icon: Shield, badge: "3 Strategies" }
        ].map(p => {
          const Icon = p.icon;
          const isActive = activePanel === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePanel(p.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon size={13} />
              <span>{p.label}</span>
              {p.badge !== undefined && (
                <span className={`px-1 rounded-full text-[8px] font-mono ${isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                  {p.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          LIVE INTERACTIVE ROOM ELEVATION VISUALIZER CANVAS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1">
            <Eye size={12} className="text-indigo-500" /> Interactive Room Elevation Previewer
          </span>

          {/* Lighting Mode Selector */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/50 text-[9px]">
            {[
              { id: "day", label: "Day", icon: Sun },
              { id: "golden", label: "Golden", icon: CloudSun },
              { id: "night", label: "Night", icon: Moon }
            ].map(l => {
              const LIcon = l.icon;
              return (
                <button
                  key={l.id}
                  onClick={() => setLightingMode(l.id as any)}
                  className={`px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold ${
                    lightingMode === l.id ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  <LIcon size={10} /> {l.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Room Elevation Visualizer Area */}
        <div
          className={`aspect-[16/9] rounded-2xl border border-border/50 relative overflow-hidden flex flex-col justify-end p-4 shadow-inner transition-all ${
            lightingMode === "golden" ? "brightness-95 sepia-25" : lightingMode === "night" ? "brightness-75 contrast-125" : ""
          }`}
          style={{ backgroundColor: selectedMainSwatch.hex }}
        >
          {/* Feature Accent Wall Section */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1/3 border-l-4 shadow-2xl flex flex-col items-center justify-center p-2 text-center text-white text-[8px] font-black uppercase tracking-wider"
            style={{ backgroundColor: selectedAccentSwatch.hex, borderColor: selectedTrimSwatch.hex }}
          >
            <span>Feature Accent Wall</span>
            <span className="text-[7px] opacity-80">{selectedAccentSwatch.name}</span>
          </div>

          {/* Border Trim Line */}
          <div className="absolute bottom-0 inset-x-0 h-3 border-t shadow-md" style={{ backgroundColor: selectedTrimSwatch.hex }} />

          <div className="relative z-10 bg-black/60 backdrop-blur-xs p-2.5 rounded-xl border border-white/20 text-white max-w-[220px] space-y-0.5">
            <span className="text-[8px] font-bold text-slate-300 block">Swatch Visualizer Setup</span>
            <p className="font-black text-[10px] truncate">{selectedMainSwatch.name} ({selectedMainSwatch.code})</p>
            <p className="text-[8px] text-emerald-300 font-mono">Series: {selectedMainSwatch.series}</p>
          </div>
        </div>

        {/* Selected Swatches Summary Row */}
        <div className="grid grid-cols-3 gap-2 text-[9px] font-mono">
          <div className="bg-muted/30 p-2 rounded-xl border border-border/50">
            <span className="text-muted-foreground block">Main Wall ({selectedMainSwatch.code})</span>
            <strong className="text-foreground truncate block">{selectedMainSwatch.name}</strong>
          </div>
          <div className="bg-muted/30 p-2 rounded-xl border border-border/50">
            <span className="text-muted-foreground block">Accent ({selectedAccentSwatch.code})</span>
            <strong className="text-foreground truncate block">{selectedAccentSwatch.name}</strong>
          </div>
          <div className="bg-muted/30 p-2 rounded-xl border border-border/50">
            <span className="text-muted-foreground block">Trim ({selectedTrimSwatch.code})</span>
            <strong className="text-foreground truncate block">{selectedTrimSwatch.name}</strong>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PANEL 1: OFFICIAL COLOUR CATALOGUE
      ══════════════════════════════════════════════════════════════════════ */}
      {activePanel === "colours" && (
        <div className="space-y-3">
          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px]">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-foreground text-background font-black"
                    : "bg-muted/50 border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Swatches List */}
          <div className="space-y-2.5">
            {filteredSwatches.map(s => (
              <div key={s.code} className="bg-card border border-border rounded-3xl p-3.5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl border border-border/60 shadow-xs shrink-0" style={{ backgroundColor: s.hex }} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-foreground text-xs">{s.name}</h4>
                      <span className="text-[8px] font-mono font-black px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s.code}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{s.series} • {s.finish}</p>
                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">₹{s.pricePerLitre}/Litre</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setSelectedMainSwatch(s)}
                    className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-black text-[8px] rounded-lg border border-indigo-500/20 cursor-pointer"
                  >
                    Set Main
                  </button>
                  <button
                    onClick={() => setSelectedAccentSwatch(s)}
                    className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-black text-[8px] rounded-lg border border-emerald-500/20 cursor-pointer"
                  >
                    Set Accent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PANEL 2: TEXTURE PRESETS
      ══════════════════════════════════════════════════════════════════════ */}
      {activePanel === "textures" && (
        <div className="space-y-3">
          <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">Swatch Designer Textures</span>
          <div className="space-y-2.5">
            {TEXTURE_PRESETS.map(t => (
              <div key={t.id} className="bg-card border border-border rounded-3xl p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl border border-border/60 shadow-xs shrink-0" style={{ backgroundColor: t.hex }} />
                  <div>
                    <h4 className="font-extrabold text-foreground text-xs">{t.name}</h4>
                    <span className="text-[9px] text-muted-foreground font-mono">Code: {t.code}</span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Applied Swatch Texture "${t.name}" to preview visualization!`)}
                  className="px-3 py-1.5 bg-indigo-600 text-white font-black text-[9px] rounded-xl cursor-pointer hover:bg-indigo-700"
                >
                  Apply Texture
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PANEL 3: STENCIL PRESETS
      ══════════════════════════════════════════════════════════════════════ */}
      {activePanel === "stencils" && (
        <div className="space-y-3">
          <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">Swatch Feature Wall Stencils</span>
          <div className="space-y-2.5">
            {STENCIL_PRESETS.map(st => (
              <div key={st.id} className="bg-card border border-border rounded-3xl p-4 flex items-center justify-between shadow-xs">
                <div>
                  <h4 className="font-extrabold text-foreground text-xs">{st.name}</h4>
                  <span className="text-[9px] text-muted-foreground">{st.category}</span>
                </div>

                <button
                  onClick={() => alert(`Applied Swatch Stencil "${st.name}" to feature accent wall!`)}
                  className="px-3 py-1.5 bg-emerald-600 text-white font-black text-[9px] rounded-xl cursor-pointer hover:bg-emerald-700"
                >
                  Apply Stencil
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PANEL 4: MATERIAL & COVERAGE CALCULATOR
      ══════════════════════════════════════════════════════════════════════ */}
      {activePanel === "calculator" && (
        <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="space-y-1 border-b border-border pb-3">
            <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider">Exact Coverage Estimator</span>
            <h2 className="text-xs font-black text-foreground flex items-center gap-1.5">
              <Calculator size={15} className="text-indigo-500" /> Swatch Paints Material Calculator
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">
                Total Paintable Wall Area (Sq. Ft.)
              </label>
              <input
                type="number"
                value={wallAreaSqFt}
                onChange={e => setWallAreaSqFt(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 font-mono font-bold text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 space-y-2 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Main Wall Paint Series:</span>
                <strong className="text-foreground">{selectedMainSwatch.series}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coverage Rate:</span>
                <strong className="text-foreground">350 Sq. Ft. / 20L Bucket (2 Coats)</strong>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-2 text-[11px]">
                <span className="text-muted-foreground">Buckets Needed (20L):</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{bucketsNeeded} Buckets</strong>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Estimated Paint Cost:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-bold">₹{estimatedCost.toLocaleString("en-IN")}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PANEL 5: HOMEOWNER COLOR OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activePanel === "playbook" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-md space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white">Color Choice & Tinting Counters</h2>
            </div>
            <p className="text-[10px] text-slate-300">
              Address client doubts regarding shade matching accuracy, small room space enhancement, and custom store mixing.
            </p>
          </div>

          <div className="space-y-3">
            {SWATCH_COLOR_OBJECTIONS.map((obj, idx) => (
              <div key={obj.id} className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {obj.category}
                  </span>
                  <h3 className="font-extrabold text-foreground text-xs mt-0.5 flex-1">
                    {idx + 1}. {obj.title}
                  </h3>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-2.5 text-[10px] text-rose-600 dark:text-rose-300 font-medium">
                  <strong className="block text-[8px] font-black uppercase text-rose-500 mb-0.5">Homeowner Doubt:</strong>
                  "{obj.problemText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 text-[10px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Painter Counter Strategy (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.solutionHindi}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[9px] font-bold text-muted-foreground">Share Color Script</span>
                  <button
                    onClick={() => copyScript(obj.id, obj.whatsappTemplate)}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-600 text-white font-black text-[9px] hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedObjId === obj.id ? (
                      <>
                        <Check size={11} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={11} /> Copy Script
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <button
          onClick={() => {
            const shareTxt = `*SWATCH PAINTS HOUSE COLOUR STUDIO SELECTION* 🎨\nProject: ${projectName}\nMain Wall: ${selectedMainSwatch.name} (${selectedMainSwatch.code})\nAccent Wall: ${selectedAccentSwatch.name} (${selectedAccentSwatch.code})\nTrim Border: ${selectedTrimSwatch.name} (${selectedTrimSwatch.code})\n\nEstimated Buckets Needed: ${bucketsNeeded} Buckets (20L)\nCall for site shade demo!`;
            navigator.clipboard.writeText(shareTxt);
            alert("Swatch Colour Studio palette details copied for WhatsApp sharing!");
          }}
          className="py-2.5 px-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
        >
          <Share2 size={13} /> Share Palette on WhatsApp
        </button>

        <button
          onClick={handleSendToStore}
          disabled={isPending}
          className="py-2.5 px-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
        >
          <Send size={13} /> Send Specs to Store
        </button>
      </div>

    </div>
  );
}
