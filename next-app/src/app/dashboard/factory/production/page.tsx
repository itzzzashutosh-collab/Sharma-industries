"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Layers, 
  Scale, 
  DollarSign, 
  AlertCircle, 
  History, 
  Activity, 
  Settings, 
  Save, 
  X,
  FileText,
  TrendingUp,
  Tag,
  Search,
  Package
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useRouter } from "next/navigation";
import { 
  getProductRecipe, 
  saveProductRecipe, 
  startBatch, 
  completeBatch, 
  cancelBatch, 
  getProductionBatches,
  getBatchDetails,
  getProductsForProduction
} from "@/actions/productionActions";
import { getRawMaterials } from "@/actions/purchaseActions";

const formatNum = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function ProductionBatchesPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"active" | "formulations" | "history">("active");
  const [isPending, startTransition] = useTransition();

  // Database lists
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Dialog states
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  // Selected details
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
  const [selectedBatchDetails, setSelectedBatchDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form State: New Formulation Recipe
  const [recipeItems, setRecipeItems] = useState<{ raw_material_id: string; quantity_per_unit: number }[]>([]);

  // Form State: New Production Batch
  const [batchProduct, setBatchProduct] = useState("");
  const [batchTargetYield, setBatchTargetYield] = useState<number>(0);
  const [batchOverheads, setBatchOverheads] = useState<number>(0);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualIngredients, setManualIngredients] = useState<{ raw_material_id: string; quantity_used: number }[]>([]);

  // Form State: Complete Batch
  const [completeBatchId, setCompleteBatchId] = useState("");
  const [completeActualYield, setCompleteActualYield] = useState<number>(0);
  const [completeProductYieldName, setCompleteProductYieldName] = useState("");

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Notifications
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Trigger Toast Notification Helper
  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Load baseline inventory data
  const loadData = async () => {
    setLoading(true);
    const [rmRes, batchRes, prodRes] = await Promise.all([
      getRawMaterials(),
      getProductionBatches(),
      getProductsForProduction()
    ]);

    if (rmRes.success && rmRes.data) setRawMaterials(rmRes.data);
    if (batchRes.success && batchRes.data) setBatches(batchRes.data);
    if (prodRes.success && prodRes.data) setProducts(prodRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ─── RECIPE FORMULARY LOAD ──────────────────────────────────────────────────
  const handleOpenRecipeModal = async (product: any) => {
    setSelectedProduct(product);
    setRecipeItems([]);
    setIsRecipeModalOpen(true);
    
    const res = await getProductRecipe(product.id);
    if (res.success && res.data && res.data.length > 0) {
      setRecipeItems(res.data.map((r: any) => ({
        raw_material_id: r.raw_material_id,
        quantity_per_unit: Number(r.quantity_per_unit)
      })));
    } else {
      // Default placeholder row
      setRecipeItems([{ raw_material_id: "", quantity_per_unit: 0 }]);
    }
  };

  const handleSaveRecipe = () => {
    if (!selectedProduct) return;
    const filtered = recipeItems.filter((item) => item.raw_material_id && item.quantity_per_unit > 0);
    
    startTransition(async () => {
      const res = await saveProductRecipe(selectedProduct.id, filtered);
      if (res.success) {
        showToast("success", "Formula formulation saved successfully!");
        setIsRecipeModalOpen(false);
        loadData();
      } else {
        showToast("error", "Failed to save formulation: " + res.error);
      }
    });
  };

  // ─── START BATCH CALCULATIONS ────────────────────────────────────────────────
  // Resolve formula details if starting a recipe batch
  const activeProductRecipe = useMemo(() => {
    if (!batchProduct || isManualMode) return [];
    // Currently, we need to load or infer the recipe for batchProduct
    // We will do a client-side lookup if we pre-fetched all recipes or query dynamically.
    // However, since we pre-loaded the raw product data, let's load recipes.
    // Let's resolve the recipe on product selection change.
    return [];
  }, [batchProduct, isManualMode]);

  // Handle active recipe loading when starting formulation batch
  const [loadedFormulation, setLoadedFormulation] = useState<any[]>([]);
  const [loadingFormulation, setLoadingFormulation] = useState(false);

  useEffect(() => {
    if (!batchProduct || isManualMode) {
      setLoadedFormulation([]);
      return;
    }
    const fetchFormulation = async () => {
      setLoadingFormulation(true);
      const res = await getProductRecipe(batchProduct);
      if (res.success && res.data) {
        setLoadedFormulation(res.data);
      } else {
        setLoadedFormulation([]);
      }
      setLoadingFormulation(false);
    };
    fetchFormulation();
  }, [batchProduct, isManualMode]);

  // Compute live preview costing for new batch
  const liveCostPreview = useMemo(() => {
    let materialsList: { raw_material_id: string; name: string; quantity: number; unit_cost: number; total_cost: number; current_stock: number; hasStock: boolean }[] = [];
    let isStockSufficient = true;

    if (isManualMode) {
      manualIngredients.forEach((item) => {
        const rm = rawMaterials.find((r) => r.id === item.raw_material_id);
        const name = rm?.material_name || "Unknown Material";
        const stock = Number(rm?.current_stock || 0);
        const rate = Number(rm?.avg_purchase_price || 0);
        const total = item.quantity_used * rate;
        const hasStock = stock >= item.quantity_used;
        if (!hasStock) isStockSufficient = false;

        materialsList.push({
          raw_material_id: item.raw_material_id,
          name,
          quantity: item.quantity_used,
          unit_cost: rate,
          total_cost: total,
          current_stock: stock,
          hasStock
        });
      });
    } else {
      loadedFormulation.forEach((item: any) => {
        const requiredQty = Number(item.quantity_per_unit) * batchTargetYield;
        const rm = rawMaterials.find((r) => r.id === item.raw_material_id);
        const name = rm?.material_name || "Unknown Material";
        const stock = Number(rm?.current_stock || 0);
        const rate = Number(rm?.avg_purchase_price || 0);
        const total = requiredQty * rate;
        const hasStock = stock >= requiredQty;
        if (!hasStock) isStockSufficient = false;

        materialsList.push({
          raw_material_id: item.raw_material_id,
          name,
          quantity: requiredQty,
          unit_cost: rate,
          total_cost: total,
          current_stock: stock,
          hasStock
        });
      });
    }

    const totalMaterialCost = materialsList.reduce((sum, m) => sum + m.total_cost, 0);
    const grandTotal = totalMaterialCost + batchOverheads;
    const perUnitCost = batchTargetYield > 0 ? grandTotal / batchTargetYield : 0;

    return {
      materialsList,
      totalMaterialCost,
      grandTotal,
      perUnitCost,
      isStockSufficient
    };
  }, [isManualMode, manualIngredients, loadedFormulation, batchTargetYield, batchOverheads, rawMaterials]);

  // Start active production run handler
  const handleStartBatch = () => {
    if (!batchProduct) {
      showToast("error", "Please select a product for the production batch.");
      return;
    }
    if (batchTargetYield <= 0) {
      showToast("error", "Please specify a valid Target Yield.");
      return;
    }
    if (!liveCostPreview.isStockSufficient) {
      showToast("error", "Deductions fail: Insufficient stock for one or more ingredients.");
      return;
    }

    const payloadMaterials = liveCostPreview.materialsList.map((m) => ({
      raw_material_id: m.raw_material_id,
      quantity_used: m.quantity,
      unit_cost: m.unit_cost
    }));

    startTransition(async () => {
      const res = await startBatch(batchProduct, batchTargetYield, batchOverheads, payloadMaterials);
      if (res.success) {
        showToast("success", `Batch ${res.batchId} launched successfully in progress.`);
        setIsBatchModalOpen(false);
        // Reset inputs
        setBatchProduct("");
        setBatchTargetYield(0);
        setBatchOverheads(0);
        setManualIngredients([]);
        loadData();
      } else {
        showToast("error", "Error starting batch: " + res.error);
      }
    });
  };

  // ─── COMPLETE RUN HANDLER ────────────────────────────────────────────────────
  const handleOpenCompleteModal = (batch: any) => {
    setCompleteBatchId(batch.id);
    setCompleteActualYield(batch.target_yield || 0);
    setCompleteProductYieldName(batch.products?.product_name || "Finished Goods");
    setIsCompleteModalOpen(true);
  };

  const handleCompleteBatchSubmit = () => {
    if (completeActualYield <= 0) {
      showToast("error", "Actual yield must be greater than zero.");
      return;
    }
    startTransition(async () => {
      const res = await completeBatch(completeBatchId, completeActualYield);
      if (res.success) {
        showToast("success", "Production batch completed successfully! Stock updated.");
        setIsCompleteModalOpen(false);
        loadData();
      } else {
        showToast("error", "Error completing batch: " + res.error);
      }
    });
  };

  // ─── CANCEL BATCH RUN HANDLER ────────────────────────────────────────────────
  const handleCancelBatch = (batchId: string) => {
    if (!confirm("Are you sure you want to cancel this batch? Deducted raw material stocks will be restored back to inventory.")) return;
    startTransition(async () => {
      const res = await cancelBatch(batchId);
      if (res.success) {
        showToast("success", "Batch cancelled. Consumed raw material stocks restored.");
        loadData();
      } else {
        showToast("error", "Error cancelling batch: " + res.error);
      }
    });
  };

  // ─── DRAWER DETAILED LOG VIEW ────────────────────────────────────────────────
  const handleViewBatchDetails = async (batch: any) => {
    setSelectedBatch(batch);
    setLoadingDetails(true);
    setSelectedBatchDetails(null);
    setIsDetailsDrawerOpen(true);

    const res = await getBatchDetails(batch.id);
    if (res.success && res.data) {
      setSelectedBatchDetails(res.data);
    }
    setLoadingDetails(false);
  };

  // Filter lists based on search
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku_number && p.sku_number.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [products, searchQuery]);

  const activeBatchesList = useMemo(() => {
    return batches.filter((b) => b.status === "IN_PROGRESS");
  }, [batches]);

  const historyBatchesList = useMemo(() => {
    return batches.filter((b) => b.status === "COMPLETED" || b.status === "CANCELLED");
  }, [batches]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 relative overflow-x-hidden">
      
      {/* Toast notification banner */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom duration-300 ${
          notification.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
        }`}>
          <span className="font-bold text-sm">{notification.message}</span>
          <button 
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-muted/50 rounded-lg transition-colors ml-2"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Scale className="text-primary" size={32} />
            {t("Batch Production Manager")}
          </h1>
          <p className="text-muted-foreground mt-2">{t("Formulate batches, track production overheads, and automate per-unit costing logs.")}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setIsManualMode(false);
              setBatchProduct("");
              setBatchTargetYield(0);
              setBatchOverheads(0);
              setManualIngredients([]);
              setIsBatchModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-black hover:bg-primary-hover transition-all shadow-md shadow-primary/20"
          >
            <Play size={16} /> {t("Start Batch Run")}
          </button>
        </div>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 text-sm font-bold border-b-2 px-4 flex items-center gap-2 transition-all ${
            activeTab === "active"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity size={16} />
          {t("Active Runs")}
          {activeBatchesList.length > 0 && (
            <span className="ml-1.5 px-2 py-0.5 text-[10px] font-black rounded-full bg-primary text-white">
              {activeBatchesList.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("formulations")}
          className={`pb-3 text-sm font-bold border-b-2 px-4 flex items-center gap-2 transition-all ${
            activeTab === "formulations"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers size={16} />
          {t("Formulations Registry")}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 text-sm font-bold border-b-2 px-4 flex items-center gap-2 transition-all ${
            activeTab === "history"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <History size={16} />
          {t("Batch Ledger History")}
        </button>
      </div>

      {/* ── TAB 1: ACTIVE PRODUCTION BATCHES ── */}
      {activeTab === "active" && (
        <div className="space-y-6">
          {activeBatchesList.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-12 text-center text-muted-foreground space-y-3">
              <Activity size={40} className="mx-auto text-muted-foreground/50 animate-pulse" />
              <p className="font-bold text-lg text-foreground">{t("No Production Batches In Progress")}</p>
              <p className="text-sm">{t("Start a new run to track material consumption and process costing ledger records.")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeBatchesList.map((batch) => (
                <div key={batch.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-primary/20 transition-all flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b border-border pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-md">{batch.id}</span>
                        <h2 className="text-lg font-black text-foreground mt-1.5">{batch.products?.product_name || "Finished Goods"}</h2>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse">
                        {t("In Progress")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block">{t("Target Yield")}</span>
                        <span className="text-foreground font-mono text-base font-black">{formatNum(batch.target_yield)} KG/LTR</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block">{t("Date Started")}</span>
                        <span className="text-foreground font-mono text-base">{batch.batch_date}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block">{t("Material Cost Locked")}</span>
                        <span className="text-emerald-500 font-mono text-base font-black">₹{formatNum(batch.total_material_cost)}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block">{t("Direct Overheads")}</span>
                        <span className="text-primary font-mono text-base font-black">₹{formatNum(batch.overhead_cost)}</span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3 flex justify-between items-center text-sm font-extrabold">
                      <span className="text-muted-foreground">{t("Running Total Cost")}:</span>
                      <span className="text-xl font-black text-foreground font-mono">₹{formatNum(batch.total_cost)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-4 border-t border-border/50">
                    <button
                      onClick={() => handleOpenCompleteModal(batch)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-sm"
                    >
                      <CheckCircle2 size={16} /> {t("Complete Run")}
                    </button>
                    <button
                      onClick={() => handleCancelBatch(batch.id)}
                      className="flex items-center justify-center p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all border border-rose-500/10"
                      title={t("Cancel Run")}
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: FORMULATIONS REGISTRY ── */}
      {activeTab === "formulations" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-foreground">{t("Formula Master Profiles")}</h2>
            <div className="relative w-full md:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("Search products name...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((prod) => (
              <div key={prod.id} className="bg-card border border-border rounded-3xl p-5 hover:border-primary/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{prod.sku_number || "NO SKU"}</span>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase tracking-wider">{prod.category}</span>
                  </div>
                  <h3 className="text-base font-black text-foreground">{prod.product_name}</h3>
                  <p className="text-xs text-muted-foreground">Standard Yield Unit: {prod.package_size} {prod.package_size_unit}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-semibold">Saved MFG Selling MRP</p>
                    <p className="text-sm font-black text-foreground font-mono">₹{formatNum(prod.mrp)}</p>
                  </div>
                  <div className="text-right border-l border-border pl-4">
                    <p className="text-xs text-muted-foreground font-semibold">Active Cost/Unit</p>
                    <p className="text-sm font-black text-emerald-500 font-mono">₹{formatNum(prod.mfg_cost || 0)}</p>
                  </div>
                  <button
                    onClick={() => handleOpenRecipeModal(prod)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-bold transition-all ml-2"
                  >
                    <Settings size={14} className="text-primary" />
                    {t("Manage Formulation")}
                  </button>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && products.length === 0 && (
              <div className="bg-card border-2 border-dashed border-border rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Package size={32} className="text-primary" />
                </div>
                <div>
                  <p className="font-black text-lg text-foreground">No Company Products Registered Yet</p>
                  <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
                    You need to first add your paint products (e.g. Interior Emulsion, Primer, Enamel) in the Company Products page before setting up formulations here.
                  </p>
                </div>
                <a
                  href="/dashboard/ceo/products"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover transition-all shadow-md shadow-primary/20"
                >
                  <Plus size={16} /> Go to Company Products & Add Products
                </a>
              </div>
            )}
            {filteredProducts.length === 0 && products.length > 0 && (
              <p className="text-center py-12 text-muted-foreground text-sm">No products matched search query.</p>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: BATCH LEDGER HISTORY ── */}
      {activeTab === "history" && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden space-y-6">
          <h2 className="text-lg font-bold text-foreground">{t("Completed / Cancelled Batch Ledger")}</h2>

          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60 border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4 text-left">Batch ID</th>
                  <th className="py-3 px-4 text-left">Product Name</th>
                  <th className="py-3 px-4 text-left">Yield Date</th>
                  <th className="py-3 px-4 text-right">Yield Qty</th>
                  <th className="py-3 px-4 text-right">Total Cost</th>
                  <th className="py-3 px-4 text-right">Per-Unit Cost</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {historyBatchesList.map((row) => {
                  const isSuccess = row.status === "COMPLETED";
                  return (
                    <tr key={row.id} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 text-muted-foreground font-mono text-xs font-bold">{row.id}</td>
                      <td className="py-3.5 px-4 text-foreground font-bold">{row.products?.product_name || "Finished Goods"}</td>
                      <td className="py-3.5 px-4 text-muted-foreground font-mono text-xs">{row.completed_at ? new Date(row.completed_at).toLocaleDateString('en-IN') : row.batch_date}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                        {isSuccess ? `${formatNum(row.actual_yield)} KG/LTR` : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                        ₹{formatNum(row.total_cost)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-500">
                        {isSuccess ? `₹${formatNum(row.unit_cost)}` : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          isSuccess ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleViewBatchDetails(row)}
                          className="px-3 py-1 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg text-xs font-bold transition-all"
                        >
                          View Logs
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {historyBatchesList.length === 0 && (
              <p className="py-12 text-center text-muted-foreground text-sm">No batch history logs registered.</p>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL: START PRODUCTION BATCH ─── */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                <Play size={20} className="text-primary" /> {t("Launch Production Batch Run")}
              </h2>
              <button 
                onClick={() => setIsBatchModalOpen(false)} 
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Form Column */}
              <div className="md:col-span-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">{t("Finished Product")}</label>
                  <select
                    value={batchProduct}
                    onChange={(e) => setBatchProduct(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-bold"
                  >
                    <option value="">-- Select Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.product_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">{t("Target Yield (KG/LTR)")}</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={batchTargetYield || ""}
                    onChange={(e) => setBatchTargetYield(Number(e.target.value))}
                    placeholder="e.g. 500"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">{t("Other Production Overheads (₹)")}</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={batchOverheads || ""}
                    onChange={(e) => setBatchOverheads(Number(e.target.value))}
                    placeholder="Labor, Packaging, Power..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-mono"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={isManualMode}
                      onChange={(e) => {
                        setIsManualMode(e.target.checked);
                        setManualIngredients([{ raw_material_id: "", quantity_used: 0 }]);
                      }}
                      className="rounded border-border bg-background text-primary focus:ring-primary h-4.5 w-4.5"
                    />
                    <span className="text-sm text-foreground font-bold">{t("Toggle Manual Ingredient Override")}</span>
                  </label>
                </div>
              </div>

              {/* Middle Ingredients Column */}
              <div className="md:col-span-2 space-y-4 border-t md:border-t-0 md:border-l border-border/60 md:pl-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("Batch Ingredients & Cost lock")}</h3>
                  {isManualMode && (
                    <button
                      type="button"
                      onClick={() => setManualIngredients([...manualIngredients, { raw_material_id: "", quantity_used: 0 }])}
                      className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      <Plus size={12} /> Add Row
                    </button>
                  )}
                </div>

                {loadingFormulation ? (
                  <p className="text-sm text-muted-foreground animate-pulse italic py-6 text-center">Loading formulary formulation details...</p>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[40vh] pr-1">
                    {!isManualMode && loadedFormulation.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground bg-muted/40 rounded-2xl border border-border/40 p-4">
                        <AlertCircle size={32} className="mx-auto text-muted-foreground/60 mb-2" />
                        <p className="font-bold text-foreground">No Formulation Found</p>
                        <p className="text-xs mt-1">Please manage formulations to register ingredients or check Manual Mode override.</p>
                      </div>
                    )}

                    {/* Manual Override List */}
                    {isManualMode && manualIngredients.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <select
                          value={item.raw_material_id}
                          onChange={(e) => {
                            const copy = [...manualIngredients];
                            copy[idx].raw_material_id = e.target.value;
                            setManualIngredients(copy);
                          }}
                          className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        >
                          <option value="">-- Choose Material --</option>
                          {rawMaterials.map((rm) => (
                            <option key={rm.id} value={rm.id}>{rm.material_name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.quantity_used || ""}
                          onChange={(e) => {
                            const copy = [...manualIngredients];
                            copy[idx].quantity_used = Number(e.target.value);
                            setManualIngredients(copy);
                          }}
                          placeholder="Qty (KG)"
                          className="w-28 bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-right font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (manualIngredients.length > 1) {
                              setManualIngredients(manualIngredients.filter((_, i) => i !== idx));
                            }
                          }}
                          className="p-2 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}

                    {/* Formula Ingredients List */}
                    {!isManualMode && loadedFormulation.map((item: any) => {
                      const required = Number(item.quantity_per_unit) * batchTargetYield;
                      const stock = rawMaterials.find((r) => r.id === item.raw_material_id)?.current_stock || 0;
                      const hasStock = stock >= required;

                      return (
                        <div key={item.raw_material_id} className="flex items-center justify-between p-3 bg-background border border-border/40 rounded-xl hover:shadow-xs transition-shadow">
                          <div>
                            <p className="font-bold text-foreground text-sm">{item.raw_materials?.material_name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
                              Formulation: {formatNum(item.quantity_per_unit)} / unit &nbsp;·&nbsp; Stock: {formatNum(stock)} {item.raw_materials?.unit_of_measure}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold text-foreground text-sm">
                              {formatNum(required)} {item.raw_materials?.unit_of_measure}
                            </p>
                            {!hasStock && (
                              <span className="text-[10px] text-rose-500 font-extrabold uppercase animate-pulse">Low Stock</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Total cost Summary */}
                <div className="bg-background border border-border/50 rounded-2xl p-4 space-y-2 mt-4 font-semibold text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Material Formulation Cost:</span>
                    <span className="font-mono text-foreground">₹{formatNum(liveCostPreview.totalMaterialCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Direct Overheads:</span>
                    <span className="font-mono text-foreground">₹{formatNum(batchOverheads)}</span>
                  </div>
                  <div className="border-t border-border/60 pt-2 flex justify-between items-center text-base font-black">
                    <span className="text-foreground">Total Process cost:</span>
                    <span className="font-mono text-primary text-lg">₹{formatNum(liveCostPreview.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>MFG cost per Unit:</span>
                    <span>₹{formatNum(liveCostPreview.perUnitCost)} / unit</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
              <button 
                type="button" 
                onClick={() => setIsBatchModalOpen(false)}
                className="bg-muted hover:bg-muted/80 text-foreground px-5 py-2.5 rounded-xl font-bold transition-all text-sm"
              >
                {t("Cancel")}
              </button>
              <button 
                type="button" 
                onClick={handleStartBatch}
                disabled={isPending || liveCostPreview.grandTotal <= 0 || !liveCostPreview.isStockSufficient}
                className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isPending ? t("Launching...") : t("Launch Batch Run")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: MANAGE RECIPE FORMULATION ─── */}
      {isRecipeModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                  <Layers size={20} className="text-primary" /> {t("Formulation Recipe Formulator")}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">{selectedProduct.product_name}</p>
              </div>
              <button 
                onClick={() => setIsRecipeModalOpen(false)} 
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveRecipe(); }} className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Formulation Ingredients</span>
                <button
                  type="button"
                  onClick={() => setRecipeItems([...recipeItems, { raw_material_id: "", quantity_per_unit: 0 }])}
                  className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                  <Plus size={12} /> Add Ingredient
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[45vh] pr-1">
                {recipeItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <select
                      value={item.raw_material_id}
                      onChange={(e) => {
                        const copy = [...recipeItems];
                        copy[idx].raw_material_id = e.target.value;
                        setRecipeItems(copy);
                      }}
                      className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      required
                    >
                      <option value="">-- Select Ingredient --</option>
                      {rawMaterials.map((rm) => (
                        <option key={rm.id} value={rm.id}>{rm.material_name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.quantity_per_unit || ""}
                      onChange={(e) => {
                        const copy = [...recipeItems];
                        copy[idx].quantity_per_unit = Number(e.target.value);
                        setRecipeItems(copy);
                      }}
                      placeholder="Qty / yield unit"
                      className="w-40 bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-right font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (recipeItems.length > 1) {
                          setRecipeItems(recipeItems.filter((_, i) => i !== idx));
                        }
                      }}
                      className="p-2 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
                <button 
                  type="button" 
                  onClick={() => setIsRecipeModalOpen(false)}
                  className="bg-muted hover:bg-muted/80 text-foreground px-5 py-2.5 rounded-xl font-bold transition-all text-sm"
                >
                  {t("Cancel")}
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2"
                >
                  <Save size={16} /> {isPending ? t("Saving...") : t("Save Formula")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: COMPLETE BATCH RUN ─── */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-6">
            
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-500" /> {t("Yield Reconciliation")}
              </h2>
              <button 
                onClick={() => setIsCompleteModalOpen(false)} 
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Completing Yield Batch Run For</p>
                <h3 className="text-base font-black text-foreground mt-0.5">{completeProductYieldName}</h3>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">{t("Actual Yield Yield Qty (KG/LTR)")}</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={completeActualYield || ""}
                  onChange={(e) => setCompleteActualYield(Number(e.target.value))}
                  placeholder="Enter final actual yields qty"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-mono"
                />
                <p className="text-xs text-muted-foreground">Adjust actual yields based on physical factory output readings.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
              <button 
                type="button" 
                onClick={() => setIsCompleteModalOpen(false)}
                className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2.5 rounded-xl font-bold transition-all text-xs"
              >
                {t("Cancel")}
              </button>
              <button 
                type="button" 
                onClick={handleCompleteBatchSubmit}
                disabled={isPending || completeActualYield <= 0}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5"
              >
                {isPending ? t("Saving...") : t("Reconcile & Complete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DETAILS DRAWER POPUP ─── */}
      {isDetailsDrawerOpen && selectedBatch && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-card border-l border-border h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-border flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-md">ID: {selectedBatch.id}</span>
                <h2 className="text-xl font-black text-foreground mt-2">{selectedBatch.products?.product_name || "Finished Goods"}</h2>
                <p className="text-xs text-muted-foreground mt-1">Batch Yield Date: {selectedBatch.batch_date}</p>
              </div>
              <button 
                onClick={() => setIsDetailsDrawerOpen(false)} 
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetails ? (
                <p className="text-sm text-center py-12 text-muted-foreground animate-pulse">Loading batch consumption logs...</p>
              ) : selectedBatchDetails ? (
                <div className="space-y-6">
                  
                  {/* Status Banner */}
                  <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                    selectedBatchDetails.batch.status === "COMPLETED" 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                      : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                  }`}>
                    {selectedBatchDetails.batch.status === "COMPLETED" ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    <div>
                      <p className="text-sm font-bold">This production run was marked as {selectedBatchDetails.batch.status}.</p>
                      {selectedBatchDetails.batch.completed_at && (
                        <p className="text-xs text-muted-foreground/80 mt-0.5">Completed: {new Date(selectedBatchDetails.batch.completed_at).toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Yield metrics */}
                  <div className="grid grid-cols-2 gap-4 bg-muted/40 border border-border/40 p-4 rounded-2xl text-sm font-semibold">
                    <div>
                      <span className="text-xs text-muted-foreground block">Target Yield Qty</span>
                      <span className="text-foreground font-mono text-base font-black">{formatNum(selectedBatchDetails.batch.target_yield)} KG/LTR</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Actual Yield Yield</span>
                      <span className="text-foreground font-mono text-base font-black">
                        {selectedBatchDetails.batch.status === "COMPLETED" ? `${formatNum(selectedBatchDetails.batch.actual_yield)} KG/LTR` : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Raw Material Cost</span>
                      <span className="text-foreground font-mono text-base font-black">₹{formatNum(selectedBatchDetails.batch.total_material_cost)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Direct Overheads</span>
                      <span className="text-foreground font-mono text-base font-black">₹{formatNum(selectedBatchDetails.batch.overhead_cost)}</span>
                    </div>
                    <div className="col-span-2 border-t border-border/60 pt-3 mt-1 flex justify-between text-base font-black">
                      <span className="text-foreground">Total Batch Cost:</span>
                      <span className="text-primary font-mono">₹{formatNum(selectedBatchDetails.batch.total_cost)}</span>
                    </div>
                    {selectedBatchDetails.batch.status === "COMPLETED" && (
                      <div className="col-span-2 flex justify-between text-sm font-black border-t border-border/40 pt-2 text-emerald-500">
                        <span>Unit Manufacturing Cost:</span>
                        <span>₹{formatNum(selectedBatchDetails.batch.unit_cost)} / KG/LTR</span>
                      </div>
                    )}
                  </div>

                  {/* Ingredients Consumed list */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Tag size={16} /> Consumed Formulation Ingredients
                    </h3>
                    <div className="bg-background border border-border/45 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border bg-muted/40 text-muted-foreground font-black uppercase tracking-wider">
                            <th className="p-3 pl-4">Ingredient Name</th>
                            <th className="p-3 text-right">Qty Used</th>
                            <th className="p-3 text-right">Unit Rate</th>
                            <th className="p-3 text-right pr-4">Total Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedBatchDetails.consumption.map((item: any, i: number) => (
                            <tr key={i} className="border-b border-border/25 hover:bg-muted/10">
                              <td className="p-3 pl-4 font-bold text-foreground">{item.raw_materials?.material_name || "Unknown"}</td>
                              <td className="p-3 text-right font-mono font-bold text-muted-foreground">{formatNum(item.quantity_used)} {item.raw_materials?.unit_of_measure}</td>
                              <td className="p-3 text-right font-mono text-muted-foreground">₹{formatNum(item.unit_cost)}</td>
                              <td className="p-3 text-right pr-4 font-mono font-bold text-foreground">₹{formatNum(item.total_cost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              ) : (
                <p className="text-center py-12 text-muted-foreground text-sm">Failed to retrieve batch consumption logs.</p>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-border bg-muted/20">
              <button
                onClick={() => setIsDetailsDrawerOpen(false)}
                className="w-full py-3 bg-muted hover:bg-muted/80 border border-border rounded-xl font-bold text-sm text-foreground transition-all"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
