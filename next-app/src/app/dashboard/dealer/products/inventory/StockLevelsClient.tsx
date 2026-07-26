"use client";

import React, { useState, useTransition } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  ClipboardList, Plus, Minus, Search, Sparkles, X, PlusCircle,
  AlertTriangle, Warehouse, History, ArrowUpRight, ArrowDownRight,
  Filter, CheckCircle2, ShieldAlert, Package, RefreshCw, FileText,
  SlidersHorizontal
} from "lucide-react";
import { adjustDealerStock } from "../../actions";

interface Product {
  id: string;
  name: string;
  category?: string;
  actual_stock: number;
  min_stock_threshold: number;
  unit?: string;
}

interface StockMovement {
  id: string | number;
  product_id?: string;
  product_name: string;
  qty_change: number;
  movement_type: string;
  reference_no?: string | null;
  remarks?: string | null;
  created_at: string;
}

interface Props {
  initialProducts: Product[];
  initialMovements: StockMovement[];
}

const fmtDate = (s: string) => {
  try {
    return new Date(s).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return s;
  }
};

const INITIAL_MOCK_MOVEMENTS: StockMovement[] = [
  {
    id: "MV_101",
    product_name: "Swatch Paints Premium Interior Emulsion 20L",
    qty_change: 25,
    movement_type: "ADD (+)",
    reference_no: "PO_98214",
    remarks: "Factory Stock Refill Order Received",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: "MV_102",
    product_name: "Swatch Waterproof Acrylic Wall Primer 10L",
    qty_change: -5,
    movement_type: "DEDUCT (-)",
    reference_no: "INV_00492",
    remarks: "Counter POS Sale Invoice #00492",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "MV_103",
    product_name: "Swatch Paints Exterior Weather Proof 20L",
    qty_change: -2,
    movement_type: "DEDUCT (-)",
    reference_no: "AUDIT_CORR",
    remarks: "Transit Container Leakage Damage",
    created_at: new Date(Date.now() - 3600000 * 28).toISOString()
  }
];

export function StockLevelsClient({ initialProducts = [], initialMovements = [] }: Props) {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>(() => {
    if (Array.isArray(initialProducts) && initialProducts.length > 0) return initialProducts;
    return [
      { id: "PROD_001", name: "Swatch Paints Premium Interior Emulsion 20L", category: "Interior Emulsions", actual_stock: 18, min_stock_threshold: 5, unit: "Pails (20L)" },
      { id: "PROD_002", name: "Swatch Paints Exterior Weather Proof 20L", category: "Exterior Paints", actual_stock: 4, min_stock_threshold: 6, unit: "Pails (20L)" },
      { id: "PROD_003", name: "Swatch Waterproof Acrylic Wall Primer 10L", category: "Wall Primers", actual_stock: 22, min_stock_threshold: 8, unit: "Liters (10L)" },
      { id: "PROD_004", name: "Swatch Damp-Proof Waterproofing Coat 20L", category: "Waterproofing", actual_stock: 3, min_stock_threshold: 5, unit: "Pails (20L)" },
    ];
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    if (Array.isArray(initialMovements) && initialMovements.length > 0) return initialMovements;
    return INITIAL_MOCK_MOVEMENTS;
  });

  const [activeTab, setActiveTab] = useState<"inventory" | "register">("inventory");
  const [search, setSearch] = useState("");
  const [movementFilter, setMovementFilter] = useState("all");

  // Stock Action Modal State (ADD / DEDUCT)
  const [showStockModal, setShowStockModal] = useState(false);
  const [actionType, setActionType] = useState<"ADD" | "DEDUCT">("ADD");
  const [isPending, startTransition] = useTransition();

  const [stockForm, setStockForm] = useState({
    product_id: "",
    qty: "",
    reference_no: "",
    remarks: ""
  });

  // Low Stock Count
  const lowStockCount = products.filter(p => p.actual_stock <= p.min_stock_threshold).length;
  const totalStockItems = products.reduce((sum, p) => sum + p.actual_stock, 0);

  // Filtered Products
  const filteredProducts = products.filter(p => {
    return !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.category || "").toLowerCase().includes(search.toLowerCase());
  });

  // Filtered Movement Register
  const filteredMovements = movements.filter(m => {
    const s = search.toLowerCase();
    const matchesSearch = !search || m.product_name.toLowerCase().includes(s) || (m.remarks || "").toLowerCase().includes(s) || (m.reference_no || "").toLowerCase().includes(s);
    const isAdd = m.qty_change > 0;
    const matchesType = movementFilter === "all" || (movementFilter === "add" && isAdd) || (movementFilter === "deduct" && !isAdd);
    return matchesSearch && matchesType;
  });

  // Open Modal for Add or Deduct
  const openModalWithAction = (type: "ADD" | "DEDUCT", productId?: string) => {
    setActionType(type);
    setStockForm({
      product_id: productId || products[0]?.id || "",
      qty: "",
      reference_no: type === "ADD" ? `PO_${Date.now().toString().slice(-5)}` : `ISSUE_${Date.now().toString().slice(-5)}`,
      remarks: type === "ADD" ? "Stock Refill Arrival" : "Manual Stock Adjustment / Sales Issue"
    });
    setShowStockModal(true);
  };

  // Submit Stock Transaction
  const handleStockTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockForm.product_id || !stockForm.qty || Number(stockForm.qty) <= 0) return;

    const rawQty = Math.abs(Number(stockForm.qty));
    const delta = actionType === "ADD" ? rawQty : -rawQty;
    const selectedProd = products.find(p => p.id === stockForm.product_id);
    const prodName = selectedProd?.name || "Paint Product";

    startTransition(async () => {
      await adjustDealerStock({
        product_id: stockForm.product_id,
        product_name: prodName,
        qty_change: delta,
        remarks: stockForm.remarks
      });

      // 1. Update Product Live Inventory Count
      setProducts(prev => prev.map(p => {
        if (p.id === stockForm.product_id) {
          const updatedStock = Math.max(0, p.actual_stock + delta);
          return { ...p, actual_stock: updatedStock };
        }
        return p;
      }));

      // 2. Log Entry in Stock Register Audit Trail
      const newLog: StockMovement = {
        id: `MV_${Date.now()}`,
        product_id: stockForm.product_id,
        product_name: prodName,
        qty_change: delta,
        movement_type: actionType === "ADD" ? "ADD (+)" : "DEDUCT (-)",
        reference_no: stockForm.reference_no || "MANUAL_ADJ",
        remarks: stockForm.remarks || (actionType === "ADD" ? "Stock Arrival Refill" : "Stock Issue Deduction"),
        created_at: new Date().toISOString()
      };

      setMovements(prev => [newLog, ...prev]);
      setShowStockModal(false);
      alert(`Stock ${actionType === "ADD" ? "Added (+)" : "Deducted (-)"} successfully for ${prodName}!`);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── Top Header Navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Products</span><span className="opacity-40">/</span><span className="text-foreground">Stock Register & Inventory</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <Warehouse size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                Stock Register & Inventory Management
              </h1>
              <p className="text-xs text-muted-foreground">
                Unified live inventory counts, low stock thresholds, and double-entry stock movement register
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openModalWithAction("ADD")}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Plus size={15} /> + Add Stock (Refill)
          </button>

          <button
            onClick={() => openModalWithAction("DEDUCT")}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Minus size={15} /> - Deduct Stock (Issue)
          </button>
        </div>
      </div>

      {/* ── Key Inventory Metrics & AI Audit Assistant ──────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Stock Inventory</span>
            <span className="text-2xl font-black text-foreground font-mono mt-1 block">{totalStockItems.toLocaleString()} Units</span>
            <span className="text-[11px] text-muted-foreground">{products.length} Product SKUs</span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl border border-blue-500/20"><Package size={22} /></div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Low Stock Alert Items</span>
            <span className="text-2xl font-black text-amber-500 font-mono mt-1 block">{lowStockCount} Products</span>
            <span className="text-[11px] text-amber-600 font-bold">At or Below Threshold</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/20"><ShieldAlert size={22} /></div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Stock Register Logged</span>
            <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">{movements.length} Movements</span>
            <span className="text-[11px] text-muted-foreground">Audit Reconciled</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20"><History size={22} /></div>
        </div>
      </div>

      {/* ── Navigation Tabs & Search Controls ────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "inventory"
                ? "bg-primary text-white shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Warehouse size={14} /> Live Stock Levels ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "register"
                ? "bg-primary text-white shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History size={14} /> Stock Register Log ({movements.length})
          </button>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-md justify-end">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={activeTab === "inventory" ? "Search inventory products..." : "Search stock register movements..."}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>

          {activeTab === "register" && (
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border text-xs shrink-0">
              <button
                onClick={() => setMovementFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${movementFilter === "all" ? "bg-primary text-white" : "text-muted-foreground"}`}
              >
                All
              </button>
              <button
                onClick={() => setMovementFilter("add")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${movementFilter === "add" ? "bg-emerald-500 text-white" : "text-muted-foreground"}`}
              >
                + Add
              </button>
              <button
                onClick={() => setMovementFilter("deduct")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${movementFilter === "deduct" ? "bg-rose-500 text-white" : "text-muted-foreground"}`}
              >
                - Deduct
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── TAB 1: LIVE INVENTORY LEVELS TABLE ───────────────────────────── */}
      {activeTab === "inventory" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-border bg-muted/40 uppercase font-black text-[10px] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5">{t("Product Name")}</th>
                  <th className="px-4 py-3.5">{t("Category")}</th>
                  <th className="px-4 py-3.5 text-right">Actual Stock Count</th>
                  <th className="px-4 py-3.5 text-right">Threshold Alert Limit</th>
                  <th className="px-4 py-3.5 text-center">{t("Status")}</th>
                  <th className="px-4 py-3.5 text-right">Stock Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-medium">
                {filteredProducts.map((p) => {
                  const isLow = p.actual_stock <= p.min_stock_threshold && p.actual_stock > 0;
                  const isOut = p.actual_stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-foreground block">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {p.id}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 bg-muted rounded-lg text-[10px] font-bold text-foreground border border-border">
                          {p.category || "General Paints"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-black text-foreground text-sm">
                        {p.actual_stock} <span className="text-[10px] font-normal text-muted-foreground">{p.unit || "Units"}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-muted-foreground">
                        {p.min_stock_threshold} Units
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase font-mono tracking-wider ${
                          isOut
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            : isLow
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        }`}>
                          {isOut ? "Out of Stock" : isLow ? "⚠️ Low Stock Alert" : "In Stock"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openModalWithAction("ADD", p.id)}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                            title="Add Stock / Refill"
                          >
                            <Plus size={12} /> Add
                          </button>

                          <button
                            onClick={() => openModalWithAction("DEDUCT", p.id)}
                            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                            title="Deduct Stock / Issue"
                          >
                            <Minus size={12} /> Deduct
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground font-medium">
                      No inventory products found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: STOCK REGISTER AUDIT TRAIL LOG ────────────────────────── */}
      {activeTab === "register" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-border bg-muted/40 uppercase font-black text-[10px] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5">Timestamp Date</th>
                  <th className="px-4 py-3.5">Product Description</th>
                  <th className="px-4 py-3.5 text-center">Movement Type</th>
                  <th className="px-4 py-3.5 text-right">Qty Delta</th>
                  <th className="px-4 py-3.5">Reference No</th>
                  <th className="px-4 py-3.5">Reason & Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-medium">
                {filteredMovements.map((log) => {
                  const isAdd = log.qty_change > 0;
                  return (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5 text-muted-foreground font-mono">
                        {fmtDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-foreground">
                        {log.product_name}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase font-mono tracking-wider flex items-center justify-center gap-1 w-24 mx-auto ${
                          isAdd
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        }`}>
                          {isAdd ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {isAdd ? "ADD (+)" : "DEDUCT (-)"}
                        </span>
                      </td>
                      <td className={`px-4 py-3.5 text-right font-mono font-black text-sm ${isAdd ? "text-emerald-600" : "text-rose-600"}`}>
                        {isAdd ? `+${log.qty_change}` : log.qty_change}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-muted-foreground">
                        {log.reference_no || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {log.remarks || "—"}
                      </td>
                    </tr>
                  );
                })}
                {filteredMovements.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground font-medium">
                      No stock movement register entries recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── STOCK ACTION MODAL (ADD (+) or DEDUCT (-)) ──────────────────── */}
      {showStockModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                {actionType === "ADD" ? (
                  <span className="text-emerald-600 flex items-center gap-1.5"><PlusCircle size={16} /> Add Stock Refill (+)</span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1.5"><AlertTriangle size={16} /> Deduct Stock Issue (-)</span>
                )}
              </h3>
              <button onClick={() => setShowStockModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStockTransaction} className="p-6 space-y-4 text-xs">
              {/* Action Toggle */}
              <div className="flex items-center gap-2 bg-muted p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setActionType("ADD")}
                  className={`flex-1 py-2 rounded-lg font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                    actionType === "ADD"
                      ? "bg-emerald-500 text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Plus size={14} /> Add Stock (+)
                </button>
                <button
                  type="button"
                  onClick={() => setActionType("DEDUCT")}
                  className={`flex-1 py-2 rounded-lg font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                    actionType === "DEDUCT"
                      ? "bg-rose-500 text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Minus size={14} /> Deduct Stock (-)
                </button>
              </div>

              {/* Product Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Select Product *</label>
                <select
                  required
                  value={stockForm.product_id}
                  onChange={e => setStockForm(f => ({ ...f, product_id: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current Stock: {p.actual_stock} {p.unit || "Units"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Delta */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                  Quantity Count to {actionType === "ADD" ? "Add (+)" : "Deduct (-)"} *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={stockForm.qty}
                  onChange={e => setStockForm(f => ({ ...f, qty: e.target.value }))}
                  placeholder="E.g. 10"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              {/* Transaction Reference Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Reference / Invoice #</label>
                <input
                  type="text"
                  value={stockForm.reference_no}
                  onChange={e => setStockForm(f => ({ ...f, reference_no: e.target.value }))}
                  placeholder="E.g. PO_98214 or INV_1002"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              {/* Reason / Remarks */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Adjustment Reason & Remarks</label>
                <textarea
                  value={stockForm.remarks}
                  onChange={e => setStockForm(f => ({ ...f, remarks: e.target.value }))}
                  placeholder={actionType === "ADD" ? "E.g. Factory shipment arrival refill" : "E.g. Physical inventory audit correction or damaged item disposal"}
                  rows={2}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary text-foreground resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className={`px-5 py-2 text-white font-black rounded-xl hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-2xs ${
                    actionType === "ADD" ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                >
                  {isPending ? "Updating..." : actionType === "ADD" ? "+ Confirm Add Stock" : "- Confirm Deduct Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
