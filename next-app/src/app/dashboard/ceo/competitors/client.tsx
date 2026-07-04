"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  description: string; // stores JSON: { trade_price, dealer_margin_pct, installer_margin_pct, brand_color }
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
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPackSize, setSelectedPackSize] = useState("All");
  const [sortBy, setSortBy] = useState<"mrp" | "margin" | "brand">("brand");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedProduct, setSelectedProduct] = useState<ParsedProduct | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "brand">("table");
  const [refreshing, setRefreshing] = useState(false);

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

  // Summary stats
  const avgDealerMargin = products.length
    ? (products.reduce((s, p) => s + (p.dealer_margin_pct || 0), 0) / products.length).toFixed(1)
    : 0;
  const maxMRP = products.reduce((m, p) => Math.max(m, p.mrp || 0), 0);
  const minMRP = products.filter((p) => p.mrp > 0).reduce((m, p) => Math.min(m, p.mrp), Infinity);

  return (
    <div className="space-y-6 pb-10">
      {/* ─── HEADER ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart2 size={18} className="text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Competitor Intelligence</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-10">
            Live pricing, margins, and SKU analysis across {brands.length - 1} competitor brands
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === "table" ? "brand" : "table")}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted transition-all"
          >
            <Layers size={14} /> {viewMode === "table" ? "Brand View" : "Table View"}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-60"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ─── STAT CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Brands Tracked", value: brands.length - 1, icon: Shield, color: "text-primary", bg: "bg-primary/10" },
          { label: "Total SKUs", value: products.length, icon: Tag, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Avg Dealer Margin", value: `${avgDealerMargin}%`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "MRP Range", value: `₹${minMRP === Infinity ? 0 : minMRP}–₹${maxMRP}`, icon: IndianRupee, color: "text-blue-500", bg: "bg-blue-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-black mt-0.5 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ─── FILTERS ────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search brand, product, category…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: selectedBrand, setter: setSelectedBrand, options: brands, label: "Brand" },
              { value: selectedCategory, setter: setSelectedCategory, options: categories, label: "Category" },
              { value: selectedPackSize, setter: setSelectedPackSize, options: packSizes, label: "Pack Size" },
            ].map(({ value, setter, options, label }) => (
              <select
                key={label}
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary min-w-[120px]"
              >
                {options.map((o) => <option key={o} value={o}>{o === "All" ? `All ${label}s` : o}</option>)}
              </select>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 ml-1">
          Showing <span className="font-bold text-foreground">{filtered.length}</span> of {products.length} SKUs
        </p>
      </div>

      {/* ─── CONTENT ─────────────────────────────────────── */}
      {viewMode === "brand" ? (
        /* Brand Cards View */
        <div className="space-y-6">
          {Object.entries(brandGroups).map(([brand, items]) => {
            const color = items[0]?.brand_color || "#888";
            const avgMargin = (items.reduce((s, p) => s + p.dealer_margin_pct, 0) / items.length).toFixed(1);
            return (
              <div key={brand} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                {/* Brand Header */}
                <div className="px-6 py-4 flex items-center justify-between" style={{ background: `linear-gradient(90deg, ${color}18 0%, transparent 100%)`, borderLeft: `4px solid ${color}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm" style={{ backgroundColor: color }}>
                      {brand[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{brand}</h3>
                      <p className="text-xs text-muted-foreground">{items.length} SKUs tracked</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Dealer Margin</p>
                      <p className="font-black text-emerald-500">{avgMargin}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">MRP Range</p>
                      <p className="font-black text-foreground">₹{Math.min(...items.map(p=>p.mrp||0))}–₹{Math.max(...items.map(p=>p.mrp||0))}</p>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {items.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className="text-left p-4 bg-muted/30 rounded-xl border border-border hover:bg-muted/60 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-sm text-foreground leading-tight">{p.product_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{p.pack_size} · {p.subcategory}</p>
                        </div>
                        <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors mt-1 shrink-0" />
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                        <div>
                          <p className="text-xs text-muted-foreground">MRP</p>
                          <p className="font-black text-foreground">₹{p.mrp?.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Trade Price</p>
                          <p className="font-bold text-blue-500">₹{p.trade_price?.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Margin</p>
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
      ) : (
        /* Table View */
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="px-5 py-3.5 font-semibold text-muted-foreground">Brand & Product</th>
                  <th className="px-5 py-3.5 font-semibold text-muted-foreground">Category</th>
                  <th className="px-5 py-3.5 font-semibold text-muted-foreground">Size</th>
                  <th className="px-5 py-3.5 font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort("mrp")}>
                    <span className="flex items-center gap-1">MRP <SortIcon col="mrp" /></span>
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-muted-foreground">Trade Price</th>
                  <th className="px-5 py-3.5 font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort("margin")}>
                    <span className="flex items-center gap-1">Dealer Margin <SortIcon col="margin" /></span>
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-muted-foreground">Installer Margin</th>
                  <th className="px-5 py-3.5 font-semibold text-muted-foreground">Warranty</th>
                  <th className="px-5 py-3.5 font-semibold text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-muted-foreground">
                      <BarChart2 className="mx-auto mb-3 opacity-20" size={36} />
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
                            <p className="text-xs text-muted-foreground">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-foreground">{p.category}</p>
                        <p className="text-xs text-muted-foreground">{p.subcategory}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold bg-muted px-2 py-1 rounded-lg">{p.pack_size}</span>
                      </td>
                      <td className="px-5 py-3.5 font-black text-foreground">
                        ₹{p.mrp?.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-blue-500">
                        {p.trade_price ? `₹${p.trade_price.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-black text-sm ${p.dealer_margin_pct >= 11 ? "text-emerald-500" : p.dealer_margin_pct >= 9 ? "text-amber-500" : "text-muted-foreground"}`}>
                          {p.dealer_margin_pct ? `${p.dealer_margin_pct}%` : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {p.installer_margin_pct ? `${p.installer_margin_pct}%` : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.warranty && p.warranty !== "N/A" ? (
                          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-lg">{p.warranty}</span>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
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

      {/* ─── DETAIL DRAWER ─────────────────────────────── */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end" onClick={() => setSelectedProduct(null)}>
          <div
            className="w-full max-w-md h-full bg-card border-l border-border shadow-2xl overflow-y-auto flex flex-col"
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
                  <h2 className="font-black text-base text-foreground leading-tight">{selectedProduct.product_name}</h2>
                  <p className="text-xs text-muted-foreground">{selectedProduct.brand} · {selectedProduct.pack_size}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1">
              {/* Product Image */}
              {selectedProduct.image_url && (
                <div className="flex justify-center items-center py-4 bg-muted/20 border border-border/60 rounded-2xl overflow-hidden relative">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.product_name}
                    className="h-44 object-contain filter drop-shadow-md hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Price Intelligence */}
              <div className="bg-muted/30 rounded-2xl p-4 border border-border">
                <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-1.5">
                  <IndianRupee size={14} className="text-primary" /> Pricing Intelligence
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "MRP", value: `₹${selectedProduct.mrp?.toLocaleString()}`, color: "text-foreground" },
                    { label: "Trade Price", value: selectedProduct.trade_price ? `₹${selectedProduct.trade_price.toLocaleString()}` : "—", color: "text-blue-500" },
                    { label: "Dealer Discount", value: selectedProduct.mrp && selectedProduct.trade_price ? `₹${(selectedProduct.mrp - selectedProduct.trade_price).toLocaleString()}` : "—", color: "text-amber-500" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center bg-card rounded-xl p-3 border border-border">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                      <p className={`font-black text-base mt-1 ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Margin Analysis */}
              <div className="bg-muted/30 rounded-2xl p-4 border border-border">
                <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-emerald-500" /> Margin Analysis
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Dealer Margin", pct: selectedProduct.dealer_margin_pct, color: "#10b981" },
                    { label: "Installer Margin", pct: selectedProduct.installer_margin_pct, color: "#3b82f6" },
                  ].map(({ label, pct, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-muted-foreground">{label}</span>
                        <span className="font-black" style={{ color }}>{pct}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min((pct / 15) * 100, 100)}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Specs */}
              <div className="bg-muted/30 rounded-2xl p-4 border border-border">
                <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-1.5">
                  <Info size={14} className="text-primary" /> Product Specifications
                </h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
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
                    { label: "Source", value: selectedProduct.source?.replace("_", " ") },
                  ].filter(({ value }) => value && value !== "N/A" && value !== "null").map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                      <p className="font-semibold text-foreground mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              {selectedProduct.featuresArr.length > 0 && (
                <div className="bg-muted/30 rounded-2xl p-4 border border-border">
                  <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-1.5">
                    <Star size={14} className="text-amber-500" /> Key Features
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.featuresArr.map((f, i) => (
                      <span key={i} className="flex items-center gap-1.5 text-xs font-semibold bg-card border border-border px-2.5 py-1.5 rounded-xl">
                        <CheckCircle size={11} className="text-emerald-500" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
