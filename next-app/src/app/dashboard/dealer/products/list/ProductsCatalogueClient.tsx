"use client";

import React, { useState, useTransition } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Package, Plus, Search, Sparkles, AlertTriangle, Layers, LayoutGrid,
  List, Tag, IndianRupee, SlidersHorizontal, Edit3, X, Check, Eye,
  Building2, ShieldAlert, ArrowUpRight, FolderPlus, Star
} from "lucide-react";
import { saveDealerProduct, updateDealerProductThreshold } from "../../actions";

interface Product {
  id: string;
  name: string;
  category: string;
  sku_number?: string;
  purchase_rate: number;
  selling_price: number;
  mrp: number;
  actual_stock: number;
  min_stock_threshold: number;
  unit?: string;
}

interface Props {
  initialData: Product[];
}

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const INITIAL_CATEGORIES = [
  "Interior Emulsions",
  "Exterior Paints",
  "Wall Primers",
  "Waterproofing",
  "Enamels & Thinners",
  "Wood & Metal Finishes",
];

const INITIAL_DEALER_PRODUCTS: Product[] = [
  {
    id: "PROD_001",
    name: "Swatch Paints Premium Interior Emulsion 20L",
    category: "Interior Emulsions",
    sku_number: "32091010",
    purchase_rate: 2650,
    selling_price: 3450,
    mrp: 3890,
    actual_stock: 18,
    min_stock_threshold: 5,
    unit: "Pails (20L)"
  },
  {
    id: "PROD_002",
    name: "Swatch Paints Exterior Weather Proof 20L",
    category: "Exterior Paints",
    sku_number: "32091020",
    purchase_rate: 3200,
    selling_price: 4120,
    mrp: 4600,
    actual_stock: 4,
    min_stock_threshold: 6,
    unit: "Pails (20L)"
  },
  {
    id: "PROD_003",
    name: "Swatch Waterproof Acrylic Wall Primer 10L",
    category: "Wall Primers",
    sku_number: "32099010",
    purchase_rate: 940,
    selling_price: 1280,
    mrp: 1450,
    actual_stock: 22,
    min_stock_threshold: 8,
    unit: "Liters (10L)"
  },
  {
    id: "PROD_004",
    name: "Swatch Damp-Proof Waterproofing Coat 20L",
    category: "Waterproofing",
    sku_number: "32099020",
    purchase_rate: 3850,
    selling_price: 4890,
    mrp: 5400,
    actual_stock: 3,
    min_stock_threshold: 5,
    unit: "Pails (20L)"
  },
  {
    id: "PROD_005",
    name: "Asian Paints Royale Luxury Emulsion 20L",
    category: "Interior Emulsions",
    sku_number: "32091090",
    purchase_rate: 4600,
    selling_price: 5800,
    mrp: 6300,
    actual_stock: 12,
    min_stock_threshold: 4,
    unit: "Pails (20L)"
  },
  {
    id: "PROD_006",
    name: "Universal Synthetic Paint Thinner 5L",
    category: "Enamels & Thinners",
    sku_number: "38140010",
    purchase_rate: 350,
    selling_price: 480,
    mrp: 550,
    actual_stock: 2,
    min_stock_threshold: 5,
    unit: "Liters (5L)"
  }
];

export function ProductsCatalogueClient({ initialData }: Props) {
  const { t } = useLanguage();
  // Combine initialData with default dealer store products if initial is empty
  const [list, setList] = useState<Product[]>(() => {
    if (initialData && initialData.length > 0) return initialData;
    return INITIAL_DEALER_PRODUCTS;
  });

  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingThresholdProduct, setEditingThresholdProduct] = useState<Product | null>(null);
  const [newThresholdValue, setNewThresholdValue] = useState("");

  // New Category Form State
  const [newCategoryName, setNewCategoryName] = useState("");

  // New Product Form State
  const [productForm, setProductForm] = useState({
    name: "",
    category: INITIAL_CATEGORIES[0],
    sku_number: "3209",
    purchase_rate: "",
    selling_price: "",
    mrp: "",
    actual_stock: "",
    min_stock_threshold: "5",
    unit: "Pails (20L)"
  });

  // Filtered List
  const filtered = list.filter(p => {
    const s = search.toLowerCase();
    const matchesSearch = !search || p.name.toLowerCase().includes(s) || (p.category || "").toLowerCase().includes(s) || (p.sku_number || "").toLowerCase().includes(s);
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Low Stock Count
  const lowStockCount = list.filter(p => p.actual_stock <= p.min_stock_threshold).length;
  const totalStockValuation = list.reduce((sum, p) => sum + (p.actual_stock * p.purchase_rate), 0);

  // Handle Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const cat = newCategoryName.trim();
    if (!categories.includes(cat)) {
      setCategories(prev => [...prev, cat]);
      setSelectedCategory(cat);
    }
    setNewCategoryName("");
    setShowAddCategoryModal(false);
  };

  // Handle Add Product
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.selling_price) return;

    startTransition(async () => {
      const payload: Product = {
        id: `PROD_${Date.now()}`,
        name: productForm.name,
        category: productForm.category,
        sku_number: productForm.sku_number || "3209",
        purchase_rate: Number(productForm.purchase_rate || Number(productForm.selling_price) * 0.75),
        selling_price: Number(productForm.selling_price),
        mrp: Number(productForm.mrp || productForm.selling_price),
        actual_stock: Number(productForm.actual_stock || 0),
        min_stock_threshold: Number(productForm.min_stock_threshold || 5),
        unit: productForm.unit
      };

      await saveDealerProduct(payload);

      setList(prev => [payload, ...prev]);
      setShowAddProductModal(false);
      setProductForm({
        name: "",
        category: categories[0] || "Interior Emulsions",
        sku_number: "3209",
        purchase_rate: "",
        selling_price: "",
        mrp: "",
        actual_stock: "",
        min_stock_threshold: "5",
        unit: "Pails (20L)"
      });
    });
  };

  // Handle Update Threshold
  const handleUpdateThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingThresholdProduct || !newThresholdValue) return;

    const val = Number(newThresholdValue);
    startTransition(async () => {
      await updateDealerProductThreshold(editingThresholdProduct.id, val);
      setList(prev => prev.map(p => p.id === editingThresholdProduct.id ? { ...p, min_stock_threshold: val } : p));
      setEditingThresholdProduct(null);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── Header Bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Products</span><span className="opacity-40">/</span><span className="text-foreground">Store Inventory</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <Package size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                Dealer Products & Stock Inventory
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage your store stock products, purchase cost rates, selling rates, MRPs, stock quantities, and low-stock threshold alerts
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border transition-all cursor-pointer"
          >
            <FolderPlus size={14} className="text-primary" /> + Add Category
          </button>

          <button
            onClick={() => setShowAddProductModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-2xs cursor-pointer"
          >
            <Plus size={15} /> + Add Product to Store
          </button>
        </div>
      </div>

      {/* ── Key Metrics & AI Stock Advisor ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Dealer Products</span>
            <span className="text-2xl font-black text-foreground font-mono mt-1 block">{list.length} Items</span>
            <span className="text-[11px] text-muted-foreground">In Store Catalog</span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl border border-blue-500/20"><Package size={22} /></div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Low Stock Alerts</span>
            <span className="text-2xl font-black text-amber-500 font-mono mt-1 block">{lowStockCount} Products</span>
            <span className="text-[11px] text-amber-600 font-bold">At/Below Low Stock Threshold</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/20"><ShieldAlert size={22} /></div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Stock Valuation</span>
            <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">{fmt(totalStockValuation)}</span>
            <span className="text-[11px] text-muted-foreground">Purchase Cost Basis</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20"><IndianRupee size={22} /></div>
        </div>
      </div>

      {/* ── Category Filter Pills & Control Bar ────────────────────────── */}
      <div className="space-y-3 bg-card border border-border p-4 rounded-2xl shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-primary" />
            <span className="text-xs font-black text-foreground uppercase tracking-wider">Product Categories:</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-48 sm:w-64 bg-background border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs transition-all ${viewMode === "table" ? "bg-primary text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"}`}
                title="Table View"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs transition-all ${viewMode === "grid" ? "bg-primary text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"}`}
                title="Grid Cards View"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills List */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/50">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
              selectedCategory === "All"
                ? "bg-primary text-white shadow-2xs"
                : "bg-muted/60 text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            All Products ({list.length})
          </button>
          {categories.map((cat, idx) => {
            const count = list.filter(p => p.category === cat).length;
            return (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-2xs"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TABLE VIEW ──────────────────────────────────────────────────── */}
      {viewMode === "table" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-border bg-muted/40 uppercase font-black text-[10px] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5">{t("Product Name")}</th>
                  <th className="px-4 py-3.5">{t("Category")}</th>
                  <th className="px-4 py-3.5 text-right">Purchase Rate (₹)</th>
                  <th className="px-4 py-3.5 text-right">Selling Rate (₹)</th>
                  <th className="px-4 py-3.5 text-right">MRP (₹)</th>
                  <th className="px-4 py-3.5 text-center">Current Stock</th>
                  <th className="px-4 py-3.5 text-center">Threshold Alert</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-medium">
                {filtered.map((p) => {
                  const isLow = p.actual_stock <= p.min_stock_threshold && p.actual_stock > 0;
                  const isOut = p.actual_stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-foreground block text-xs">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">HSN: {p.sku_number || "3209"}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 bg-muted rounded-lg text-[10px] font-bold text-foreground border border-border">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        {fmt(p.purchase_rate)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-black text-primary text-sm">
                        {fmt(p.selling_price)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-muted-foreground text-xs line-through decoration-slate-400">
                        {fmt(p.mrp)}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-black text-foreground text-xs">
                        {p.actual_stock} <span className="text-[10px] font-normal text-muted-foreground">{p.unit || "Units"}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => {
                            setEditingThresholdProduct(p);
                            setNewThresholdValue(String(p.min_stock_threshold));
                          }}
                          className="px-2.5 py-1 bg-muted/80 hover:bg-muted border border-border rounded-lg text-[11px] font-mono font-bold text-foreground transition-all flex items-center gap-1 mx-auto"
                          title="Click to edit threshold"
                        >
                          <SlidersHorizontal size={11} className="text-primary" /> {p.min_stock_threshold} Units
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase font-mono tracking-wider ${
                          isOut
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            : isLow
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        }`}>
                          {isOut ? "Out of Stock" : isLow ? "⚠️ Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setEditingThresholdProduct(p);
                            setNewThresholdValue(String(p.min_stock_threshold));
                          }}
                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit Stock Threshold"
                        >
                          <Edit3 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground font-medium">
                      No products found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── GRID CARDS VIEW ─────────────────────────────────────────────── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const isLow = p.actual_stock <= p.min_stock_threshold && p.actual_stock > 0;
            const isOut = p.actual_stock === 0;

            return (
              <div key={p.id} className="bg-card border border-border rounded-2xl p-5 space-y-3 relative shadow-2xs hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black border border-primary/20 bg-primary/10 text-primary uppercase">
                    {p.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase font-mono ${
                    isOut
                      ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      : isLow
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  }`}>
                    {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-black text-foreground mt-1">{p.name}</h3>
                  <p className="text-[10px] text-muted-foreground">HSN/SKU: {p.sku_number}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-muted/30 p-2.5 rounded-xl border border-border text-[11px]">
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold block">Purchase</span>
                    <span className="font-mono font-bold text-foreground">{fmt(p.purchase_rate)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold block">Selling Rate</span>
                    <span className="font-mono font-black text-primary">{fmt(p.selling_price)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold block">MRP</span>
                    <span className="font-mono text-muted-foreground line-through">{fmt(p.mrp)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-xs">
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <Package size={13} className="text-primary" /> Stock: <strong className="font-mono text-sm">{p.actual_stock}</strong> {p.unit}
                  </div>
                  <button
                    onClick={() => {
                      setEditingThresholdProduct(p);
                      setNewThresholdValue(String(p.min_stock_threshold));
                    }}
                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    Threshold: {p.min_stock_threshold} <Edit3 size={10} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL 1: Add New Product to Dealer Store ─────────────────────── */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <Package size={16} className="text-primary" /> Add Product to Store Inventory
              </h3>
              <button onClick={() => setShowAddProductModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Product Name *</label>
                <input
                  required
                  type="text"
                  value={productForm.name}
                  onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="E.g. Swatch Luxury Emulsion Gloss 20L"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                  >
                    {categories.map((c, idx) => (
                      <option key={idx} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Packing Unit</label>
                  <select
                    value={productForm.unit}
                    onChange={e => setProductForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                  >
                    <option value="Pails (20L)">Pails (20L)</option>
                    <option value="Liters (10L)">Liters (10L)</option>
                    <option value="Liters (4L)">Liters (4L)</option>
                    <option value="Liters (1L)">Liters (1L)</option>
                    <option value="Kgs">Kgs</option>
                    <option value="Bags">Bags</option>
                    <option value="Pcs">Pcs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-muted/30 p-3.5 rounded-2xl border border-border">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Purchase Rate (₹)</label>
                  <input
                    type="number"
                    value={productForm.purchase_rate}
                    onChange={e => setProductForm(f => ({ ...f, purchase_rate: e.target.value }))}
                    placeholder="E.g. 2650"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Selling Rate (₹) *</label>
                  <input
                    required
                    type="number"
                    value={productForm.selling_price}
                    onChange={e => setProductForm(f => ({ ...f, selling_price: e.target.value }))}
                    placeholder="E.g. 3450"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Printed MRP (₹)</label>
                  <input
                    type="number"
                    value={productForm.mrp}
                    onChange={e => setProductForm(f => ({ ...f, mrp: e.target.value }))}
                    placeholder="E.g. 3890"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Initial Stock Qty</label>
                  <input
                    type="number"
                    value={productForm.actual_stock}
                    onChange={e => setProductForm(f => ({ ...f, actual_stock: e.target.value }))}
                    placeholder="E.g. 15"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Low Stock Threshold Limit</label>
                  <input
                    type="number"
                    value={productForm.min_stock_threshold}
                    onChange={e => setProductForm(f => ({ ...f, min_stock_threshold: e.target.value }))}
                    placeholder="E.g. 5"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-primary text-white font-black rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
                >
                  {isPending ? "Adding..." : "+ Save Product to Store"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Create New Product Category ─────────────────────────── */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <FolderPlus size={16} className="text-primary" /> Create New Product Category
              </h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Category Name *</label>
                <input
                  required
                  type="text"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="E.g. Wall Putty & Textures"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-2xs"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Update Low Stock Threshold ──────────────────────────── */}
      {editingThresholdProduct && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal size={14} className="text-primary" /> Low Stock Threshold Settings
              </h3>
              <button onClick={() => setEditingThresholdProduct(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateThreshold} className="p-6 space-y-4 text-xs">
              <div>
                <span className="font-bold text-foreground block text-xs">{editingThresholdProduct.name}</span>
                <span className="text-[10px] text-muted-foreground">Current Stock: <strong>{editingThresholdProduct.actual_stock} {editingThresholdProduct.unit}</strong></span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Alert Threshold Level (Units)</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={newThresholdValue}
                  onChange={e => setNewThresholdValue(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                />
                <p className="text-[10px] text-muted-foreground pt-0.5">An alert will trigger when stock count drops to or below this limit.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingThresholdProduct(null)}
                  className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
                >
                  {isPending ? "Updating..." : "Save Threshold"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
