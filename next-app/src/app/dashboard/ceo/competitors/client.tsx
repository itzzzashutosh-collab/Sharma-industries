"use client";

import { useState, useMemo, useTransition } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Search,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  Filter,
  BarChart2,
  Tag,
  Star,
  Layers,
  RefreshCw,
  X,
  Info,
  CheckCircle,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  Brain,
  AlertCircle,
  Plus,
  Trash2,
  Building,
  Target
} from "lucide-react";
import { useRouter } from "next/navigation";
import { chatWithGlobalAI } from "@/actions/chatActions";
import { addCompetitorProduct, deleteCompetitorProduct } from "./actions";

interface CompetitorProduct {
  id: string;
  brand: string;
  category: string;
  subcategory: string;
  product_name: string;
  pack_size: string;
  mrp: number;
  finish: string;
  coverage: string;
  drying_time: string;
  recoat_time: string;
  technology: string;
  warranty: string;
  interior_exterior: string;
  washability: string;
  voc: string;
  features: any;
  source: string;
  description: string; // JSON: { trade_price, dealer_margin_pct, installer_margin_pct, brand_color }
  sheen: string; // stores brand_color hex
}

interface ParsedProduct extends CompetitorProduct {
  trade_price: number;
  dealer_margin_pct: number;
  installer_margin_pct: number;
  brand_color: string;
  featuresArr: string[];
  image_url?: string;
}

const BRAND_FALLBACK_COLORS: Record<string, string> = {
  "Asian Paints": "#e8132b",
  "Berger Paints": "#0054a6",
  "Nerolac Paints": "#007a33",
  "Birla Opus": "#ff6b00",
  "Dulux": "#cc0100",
  "Indigo Paints": "#4b0082",
  "Jotun": "#e30613",
  "Nippon Paint": "#f7931e",
  "Kansai Nerolac": "#28a745",
};

// Sharma's Flagship Catalog for comparison gap matrix
const SHARMA_PRODUCTS = [
  { name: "Rustic Royale - 20L", category: "Emulsion", mrp: 5000, trade_price: 4300, dealer_margin: 14, warranty: "5 Years" },
  { name: "WeatherGuard Exterior - 10L", category: "Exterior Paint", mrp: 3200, trade_price: 2850, dealer_margin: 11, warranty: "3 Years" },
  { name: "Wall Putty - 40kg", category: "Putty", mrp: 850, trade_price: 760, dealer_margin: 10, warranty: "N/A" }
];

function parseProduct(p: CompetitorProduct): ParsedProduct {
  let intelligence = { trade_price: 0, dealer_margin_pct: 0, installer_margin_pct: 0, brand_color: "", image_url: "" };
  try {
    if (p.description) intelligence = JSON.parse(p.description);
  } catch {}

  let featuresArr: string[] = [];
  try {
    if (typeof p.features === "string") featuresArr = JSON.parse(p.features);
    else if (Array.isArray(p.features)) featuresArr = p.features;
  } catch {}

  const brand_color =
    p.sheen && p.sheen.startsWith("#")
      ? p.sheen
      : BRAND_FALLBACK_COLORS[p.brand] || "#888888";

  return {
    ...p,
    trade_price: intelligence.trade_price || 0,
    dealer_margin_pct: intelligence.dealer_margin_pct || 0,
    installer_margin_pct: intelligence.installer_margin_pct || 0,
    brand_color,
    featuresArr,
    image_url: intelligence.image_url || "",
  };
}

export function CompetitorsClient({ initialData }: { initialData: CompetitorProduct[] }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPackSize, setSelectedPackSize] = useState("All");
  const [sortBy, setSortBy] = useState<"mrp" | "margin" | "brand">("brand");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedProduct, setSelectedProduct] = useState<ParsedProduct | null>(null);
  
  // Tabs: table, brand, comparison
  const [viewMode, setViewMode] = useState<"table" | "brand" | "comparison">("table");
  const [refreshing, setRefreshing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    brand: "Asian Paints",
    product_name: "",
    category: "Emulsion",
    subcategory: "Premium Interior",
    pack_size: "20L",
    mrp: "",
    trade_price: "",
    dealer_margin_pct: "10",
    installer_margin_pct: "5",
    finish: "Matt",
    coverage: "120-140 sq.ft/L",
    drying_time: "4 Hours",
    recoat_time: "4 Hours",
    technology: "Acrylic copolymer",
    warranty: "3 Years",
    interior_exterior: "Interior",
    washability: "High",
    voc: "Low VOC",
    brand_color: "#e8132b"
  });

  const products = useMemo(() => initialData.map(parseProduct), [initialData]);

  const brands = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.brand))).sort()], [products]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category))).sort()], [products]);
  const packSizes = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.pack_size))).filter(Boolean).sort()], [products]);

  const filtered = useMemo(() => {
    let arr = products.filter((p) => {
      const matchSearch = `${p.brand} ${p.product_name} ${p.category} ${p.subcategory}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchBrand = selectedBrand === "All" || p.brand === selectedBrand;
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchSize = selectedPackSize === "All" || p.pack_size === selectedPackSize;
      return matchSearch && matchBrand && matchCat && matchSize;
    });

    arr.sort((a, b) => {
      let val = 0;
      if (sortBy === "mrp") val = (a.mrp || 0) - (b.mrp || 0);
      else if (sortBy === "margin") val = (a.dealer_margin_pct || 0) - (b.dealer_margin_pct || 0);
      else val = a.brand.localeCompare(b.brand);
      return sortDir === "asc" ? val : -val;
    });
    return arr;
  }, [products, searchTerm, selectedBrand, selectedCategory, selectedPackSize, sortBy, sortDir]);

  // Brand-grouped view
  const brandGroups = useMemo(() => {
    const groups: Record<string, ParsedProduct[]> = {};
    filtered.forEach((p) => {
      if (!groups[p.brand]) groups[p.brand] = [];
      groups[p.brand].push(p);
    });
    return groups;
  }, [filtered]);

  // Price Gap mapping comparison
  const priceGapMatrix = useMemo(() => {
    return SHARMA_PRODUCTS.map(sharmaProd => {
      // Find the nearest competitor products matching categories
      const peers = products.filter(p => p.category.toLowerCase() === sharmaProd.category.toLowerCase() && p.pack_size.includes("20L") || p.pack_size.includes("10L") || p.pack_size.includes("40kg"));
      const bestPeer = peers.length > 0 ? peers[0] : null;

      let gapPercent = 0;
      if (bestPeer && bestPeer.mrp) {
        gapPercent = Math.round(((sharmaProd.mrp - bestPeer.mrp) / bestPeer.mrp) * 100);
      }

      return {
        sharma: sharmaProd,
        peer: bestPeer,
        gapPercent
      };
    });
  }, [products]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) =>
    sortBy === col ? (sortDir === "asc" ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />) : <ChevronDown size={12} className="opacity-30" />;

  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1200);
  };

  const runAiAnalysis = async () => {
    setAiLoading(true);
    setAiError("");
    setAiAnalysis("");
    const res = await chatWithGlobalAI(
      `Analyze the competitor intelligence data. We track ${products.length} SKUs across ${brands.length - 1} brands. ` +
      `Top categories: ${categories.slice(1, 4).join(", ")}. ` +
      `Average MRP range: ₹${minMRP === Infinity ? 0 : minMRP}–₹${maxMRP}. Average dealer margin: ${avgDealerMargin}%. ` +
      `Give 5 strategic competitive recommendations for Sharma Industries to differentiate and grow market share.`,
      []
    );
    if (res.success && res.reply) setAiAnalysis(res.reply);
    else setAiError(res.error || "Analysis failed");
    setAiLoading(false);
  };

  // Submit Handler
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name || !formData.mrp) return;

    startTransition(async () => {
      const payload = {
        ...formData,
        mrp: parseFloat(formData.mrp),
        trade_price: parseFloat(formData.trade_price) || 0,
        dealer_margin_pct: parseFloat(formData.dealer_margin_pct) || 0,
        installer_margin_pct: parseFloat(formData.installer_margin_pct) || 0,
        features: []
      };

      const res = await addCompetitorProduct(payload);
      if (res.success) {
        setIsAddModalOpen(false);
        setFormData({
          brand: "Asian Paints", product_name: "", category: "Emulsion", subcategory: "Premium Interior", pack_size: "20L",
          mrp: "", trade_price: "", dealer_margin_pct: "10", installer_margin_pct: "5", finish: "Matt",
          coverage: "120-140 sq.ft/L", drying_time: "4 Hours", recoat_time: "4 Hours", technology: "Acrylic copolymer",
          warranty: "3 Years", interior_exterior: "Interior", washability: "High", voc: "Low VOC", brand_color: "#e8132b"
        });
        router.refresh();
      } else {
        alert(`Error adding competitor SKU: ${res.error}`);
      }
    });
  };

  // Delete Handler
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this competitor SKU?")) return;
    startTransition(async () => {
      const res = await deleteCompetitorProduct(id);
      if (res.success) {
        setSelectedProduct(null);
        router.refresh();
      } else {
        alert(`Error: ${res.error}`);
      }
    });
  };

  // Summary stats
  const avgDealerMargin = products.length
    ? (products.reduce((s, p) => s + (p.dealer_margin_pct || 0), 0) / products.length).toFixed(1)
    : 0;
  const maxMRP = products.reduce((m, p) => Math.max(m, p.mrp || 0), 0);
  const minMRP = products.filter((p) => p.mrp > 0).reduce((m, p) => Math.min(m, p.mrp), Infinity);

  return (
    <div className="space-y-6 pb-20 font-sans max-w-7xl mx-auto p-6 animate-in fade-in duration-500">
      
      {/* ─── HEADER ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <BarChart2 size={18} className="text-primary" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Competitor Intelligence</h1>
          </div>
          <p className="text-xs text-muted-foreground ml-10">
            Live pricing, margins, and SKU analysis across {brands.length - 1} competitor brands
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover transition-all cursor-pointer shadow-sm"
          >
            <Plus size={14} /> Add Competitor SKU
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ─── STAT CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Brands Tracked", value: brands.length - 1, icon: Shield, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
          { label: "Total SKUs", value: products.length, icon: Tag, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
          { label: "Avg Competitor Margin", value: `${avgDealerMargin}%`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "MRP Range", value: `₹${minMRP === Infinity ? 0 : minMRP}–₹${maxMRP}`, icon: IndianRupee, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-xl ${bg} border flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t(label)}</p>
            <p className={`text-xl font-black mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ─── AI COMPETITOR ANALYSIS ──────────────────────── */}
      <div className="bg-gradient-to-br from-orange-500/5 via-card to-primary/5 border border-orange-500/20 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Brain size={16} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">AI Competitor Analysis</h2>
              <p className="text-[10px] text-muted-foreground">Powered by active AI configuration</p>
            </div>
          </div>
          <button
            onClick={runAiAnalysis}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
          >
            <Sparkles size={12} className={aiLoading ? "animate-spin" : ""} />
            {aiLoading ? "Analyzing..." : aiAnalysis ? "Re-Analyze" : "Run AI Analysis"}
          </button>
        </div>

        {!aiAnalysis && !aiLoading && !aiError && (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <Sparkles size={24} className="text-orange-500/40" />
            <p className="text-xs text-muted-foreground font-semibold">Click <strong>Run AI Analysis</strong> to get strategic competitive recommendations</p>
          </div>
        )}

        {aiLoading && (
          <div className="flex items-center justify-center gap-3 py-6 text-muted-foreground text-xs font-semibold">
            <RefreshCw size={14} className="animate-spin text-orange-500" />
            Querying database and generating competitive strategy...
          </div>
        )}

        {aiError && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <AlertCircle size={14} className="text-rose-500 shrink-0" />
            <p className="text-xs text-rose-500">{aiError}</p>
          </div>
        )}

        {aiAnalysis && !aiLoading && (
          <div className="space-y-1.5">
            {aiAnalysis.split("\n").map((line, idx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={idx} className="h-1" />;
              const html = trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="text-orange-500 mt-1 shrink-0">•</span>
                    <p className="text-xs text-foreground/85 leading-relaxed font-semibold" dangerouslySetInnerHTML={{ __html: html.replace(/^[-*]\s/, "") }} />
                  </div>
                );
              }
              return <p key={idx} className="text-xs text-foreground/85 leading-relaxed font-semibold" dangerouslySetInnerHTML={{ __html: html }} />;
            })}
          </div>
        )}
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
        {[
          { key: "table", label: "Table View", icon: <SlidersHorizontal size={13} /> },
          { key: "brand", label: "Brand Group Overview", icon: <Layers size={13} /> },
          { key: "comparison", label: "Price Gap Matrix", icon: <Target size={13} /> }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setViewMode(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === tab.key ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            {tab.icon}{t(tab.label)}
          </button>
        ))}
      </div>

      {/* SEARCH AND FILTERS ROW (Not shown in comparison gap matrix tab) */}
      {viewMode !== "comparison" && (
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search brand, product, category…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground outline-none focus:border-primary transition-all font-semibold"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap text-xs">
              {[
                { value: selectedBrand, setter: setSelectedBrand, options: brands, label: "Brand" },
                { value: selectedCategory, setter: setSelectedCategory, options: categories, label: "Category" },
                { value: selectedPackSize, setter: setSelectedPackSize, options: packSizes, label: "Pack Size" },
              ].map(({ value, setter, options, label }) => (
                <select
                  key={label}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-w-[120px]"
                >
                  {options.map((o) => <option key={o} value={o}>{o === "All" ? `All ${label}s` : o}</option>)}
                </select>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 ml-1 font-semibold">
            Showing <span className="font-bold text-foreground">{filtered.length}</span> of {products.length} SKUs
          </p>
        </div>
      )}

      {/* ─── TAB: TABLE VIEW ─── */}
      {viewMode === "table" && (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-muted/40 border-b border-border">
                <tr className="text-xs uppercase text-muted-foreground font-bold">
                  <th className="px-5 py-3.5">Brand & Product</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Size</th>
                  <th className="px-5 py-3.5 cursor-pointer hover:text-foreground" onClick={() => toggleSort("mrp")}>
                    <span className="flex items-center gap-1">MRP <SortIcon col="mrp" /></span>
                  </th>
                  <th className="px-5 py-3.5">Trade Price</th>
                  <th className="px-5 py-3.5 cursor-pointer hover:text-foreground" onClick={() => toggleSort("margin")}>
                    <span className="flex items-center gap-1">Dealer Margin <SortIcon col="margin" /></span>
                  </th>
                  <th className="px-5 py-3.5">Installer Margin</th>
                  <th className="px-5 py-3.5">Warranty</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs font-semibold">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-muted-foreground">
                      <BarChart2 className="mx-auto mb-3 opacity-20" size={32} />
                      <p>No results found. Try adjusting your filters.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm shrink-0"
                            style={{ backgroundColor: p.brand_color }}
                          >
                            {p.brand[0]}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{p.product_name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-foreground">{p.category}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">{p.subcategory}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-bold bg-muted px-2 py-1 rounded-lg">{p.pack_size}</span>
                      </td>
                      <td className="px-5 py-3.5 font-black text-foreground">
                        ₹{p.mrp?.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-blue-500">
                        {p.trade_price ? `₹${p.trade_price.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-black ${p.dealer_margin_pct >= 11 ? "text-emerald-500" : p.dealer_margin_pct >= 9 ? "text-amber-500" : "text-muted-foreground"}`}>
                          {p.dealer_margin_pct ? `${p.dealer_margin_pct}%` : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {p.installer_margin_pct ? `${p.installer_margin_pct}%` : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.warranty && p.warranty !== "N/A" ? (
                          <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg">{p.warranty}</span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB: BRAND VIEW ─── */}
      {viewMode === "brand" && (
        <div className="space-y-6">
          {Object.entries(brandGroups).map(([brand, items]) => {
            const color = items[0]?.brand_color || "#888";
            const avgMargin = (items.reduce((s, p) => s + p.dealer_margin_pct, 0) / items.length).toFixed(1);
            return (
              <div key={brand} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                {/* Brand Header */}
                <div className="px-6 py-4 flex items-center justify-between" style={{ background: `linear-gradient(90deg, ${color}10 0%, transparent 100%)`, borderLeft: `4px solid ${color}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm" style={{ backgroundColor: color }}>
                      {brand[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{brand}</h3>
                      <p className="text-[10px] text-muted-foreground">{items.length} SKUs tracked</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-right text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold">Avg Margin</p>
                      <p className="font-black text-emerald-500">{avgMargin}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold">MRP Range</p>
                      <p className="font-black text-foreground">₹{Math.min(...items.map(p=>p.mrp||0))}–₹{Math.max(...items.map(p=>p.mrp||0))}</p>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 text-xs font-bold">
                  {items.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className="text-left p-4 bg-muted/20 rounded-xl border border-border hover:bg-muted/40 hover:border-primary/20 transition-all group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-xs text-foreground leading-tight">{p.product_name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">{p.pack_size} · {p.subcategory}</p>
                        </div>
                        <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors mt-1 shrink-0" />
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-[10px]">
                        <div>
                          <p className="text-muted-foreground">MRP</p>
                          <p className="font-black text-foreground">₹{p.mrp?.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">Trade Price</p>
                          <p className="font-bold text-blue-500">₹{p.trade_price?.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">Margin</p>
                          <p className="font-black text-emerald-500">{p.dealer_margin_pct}%</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── TAB: PRICE GAP MATRIX ─── */}
      {viewMode === "comparison" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground">Pricing Gap Analysis Matrix</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Price variance tracking between Sharma flagship catalog and equivalent competitor SKUs.</p>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/50 border-b border-border">
                <tr className="text-xs uppercase text-muted-foreground font-bold">
                  <th className="p-4">Sharma Flagship Product</th>
                  <th className="p-4 text-right">Sharma MRP</th>
                  <th className="p-4">Nearest Competitor Alternative</th>
                  <th className="p-4 text-right">Competitor MRP</th>
                  <th className="p-4 text-center">Pricing Gap / Margin Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs font-semibold">
                {priceGapMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/10">
                    <td className="p-4 text-foreground font-bold">{item.sharma.name}</td>
                    <td className="p-4 text-right font-mono text-foreground">₹{item.sharma.mrp.toLocaleString()}</td>
                    <td className="p-4 text-muted-foreground">
                      {item.peer ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: item.peer.brand_color }} />
                          {item.peer.brand} - {item.peer.product_name}
                        </span>
                      ) : "No Peer Tracked"}
                    </td>
                    <td className="p-4 text-right font-mono text-muted-foreground">
                      {item.peer ? `₹${item.peer.mrp.toLocaleString()}` : "—"}
                    </td>
                    <td className="p-4 text-center">
                      {item.peer ? (
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black border uppercase ${
                          item.gapPercent <= 0 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                            : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        }`}>
                          {item.gapPercent <= 0 ? `${item.gapPercent}% (Sharma Cheaper)` : `+${item.gapPercent}% (Sharma Pricier)`}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── DETAIL DRAWER ─── */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end" onClick={() => setSelectedProduct(null)}>
          <div
            className="w-full max-w-md h-full bg-card border-l border-border shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="sticky top-0 z-10 px-6 py-4 border-b border-border bg-card/95 backdrop-blur flex items-center justify-between"
              style={{ borderTop: `4px solid ${selectedProduct.brand_color}` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow" style={{ backgroundColor: selectedProduct.brand_color }}>
                  {selectedProduct.brand[0]}
                </div>
                <div>
                  <h2 className="font-black text-sm text-foreground leading-tight">{selectedProduct.product_name}</h2>
                  <p className="text-[10px] text-muted-foreground font-semibold">{selectedProduct.brand} · {selectedProduct.pack_size}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1 text-xs font-bold text-muted-foreground">
              {/* Price Intelligence */}
              <div className="bg-muted/30 rounded-2xl p-4 border border-border space-y-3">
                <h3 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <IndianRupee size={14} className="text-primary" /> Pricing Intelligence
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "MRP", value: `₹${selectedProduct.mrp?.toLocaleString()}`, color: "text-foreground" },
                    { label: "Trade Price", value: selectedProduct.trade_price ? `₹${selectedProduct.trade_price.toLocaleString()}` : "—", color: "text-blue-500" },
                    { label: "Dealer Margin", value: selectedProduct.dealer_margin_pct ? `${selectedProduct.dealer_margin_pct}%` : "—", color: "text-emerald-500" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center bg-card rounded-xl p-2.5 border border-border">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
                      <p className={`font-black text-sm mt-1 ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Specs */}
              <div className="bg-muted/30 rounded-2xl p-4 border border-border space-y-3">
                <h3 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Info size={14} className="text-primary" /> Product Specifications
                </h3>
                <div className="grid grid-cols-2 gap-y-3">
                  {[
                    { label: "Category", value: selectedProduct.category },
                    { label: "Subcategory", value: selectedProduct.subcategory },
                    { label: "Finish", value: selectedProduct.finish },
                    { label: "Coverage", value: selectedProduct.coverage },
                    { label: "Drying Time", value: selectedProduct.drying_time },
                    { label: "Recoat Time", value: selectedProduct.recoat_time },
                    { label: "Technology", value: selectedProduct.technology },
                    { label: "VOC Level", value: selectedProduct.voc },
                    { label: "Washability", value: selectedProduct.washability },
                    { label: "Interior/Ext", value: selectedProduct.interior_exterior },
                    { label: "Warranty", value: selectedProduct.warranty },
                  ].filter(({ value }) => value && value !== "N/A" && value !== "null").map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
                      <p className="font-bold text-foreground mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delete Button (If manual SKU) */}
              {selectedProduct.id.startsWith("COMP-") && (
                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    onClick={() => handleDeleteProduct(selectedProduct.id)}
                    disabled={isPending}
                    className="bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-black"
                  >
                    <Trash2 size={13} /> Delete SKU Record
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: ADD COMPETITOR SKU
      ══════════════════════════════════════════ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border bg-muted/20">
              <h2 className="text-base font-black text-foreground flex items-center gap-2">
                <Building size={16} className="text-primary animate-pulse" /> Add Competitor SKU Product
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"><X size={16}/></button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs font-bold text-muted-foreground">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Brand Name *</label>
                  <select value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                    <option value="Asian Paints">Asian Paints</option>
                    <option value="Berger Paints">Berger Paints</option>
                    <option value="Nerolac Paints">Nerolac Paints</option>
                    <option value="Birla Opus">Birla Opus</option>
                    <option value="Dulux">Dulux</option>
                    <option value="Indigo Paints">Indigo Paints</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Product Name *</label>
                  <input type="text" required value={formData.product_name} onChange={e => setFormData({...formData, product_name: e.target.value})}
                    placeholder="e.g. Royale Glitz" className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                    <option value="Emulsion">Emulsion</option>
                    <option value="Exterior Paint">Exterior Paint</option>
                    <option value="Primer">Primer</option>
                    <option value="Putty">Putty</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Subcategory</label>
                  <input type="text" value={formData.subcategory} onChange={e => setFormData({...formData, subcategory: e.target.value})}
                    placeholder="e.g. Premium Interior" className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Pack Size</label>
                  <input type="text" value={formData.pack_size} onChange={e => setFormData({...formData, pack_size: e.target.value})}
                    placeholder="e.g. 20L" className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">MRP (₹) *</label>
                  <input type="number" required value={formData.mrp} onChange={e => setFormData({...formData, mrp: e.target.value})}
                    placeholder="5400" className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Trade Price (₹)</label>
                  <input type="number" value={formData.trade_price} onChange={e => setFormData({...formData, trade_price: e.target.value})}
                    placeholder="4700" className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Dealer Margin (%)</label>
                  <input type="number" value={formData.dealer_margin_pct} onChange={e => setFormData({...formData, dealer_margin_pct: e.target.value})}
                    placeholder="12" className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Finish</label>
                  <input type="text" value={formData.finish} onChange={e => setFormData({...formData, finish: e.target.value})}
                    placeholder="Matt / Gloss" className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Warranty</label>
                  <input type="text" value={formData.warranty} onChange={e => setFormData({...formData, warranty: e.target.value})}
                    placeholder="5 Years" className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Brand Hex Color</label>
                  <input type="text" value={formData.brand_color} onChange={e => setFormData({...formData, brand_color: e.target.value})}
                    placeholder="#e8132b" className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none font-mono" />
                </div>
              </div>

              <div className="pt-2 flex gap-3 border-t border-border">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-xs font-bold py-2.5 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-black py-2.5 rounded-xl transition-colors cursor-pointer">
                  {isPending ? "Adding SKU..." : "Save Competitor SKU"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
