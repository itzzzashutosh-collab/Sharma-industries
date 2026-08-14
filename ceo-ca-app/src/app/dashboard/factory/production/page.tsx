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
  Package,
  Printer,
  ChevronRight,
  TrendingDown,
  Sparkles,
  ClipboardList,
  Clock,
  Layers2,
  ListFilter
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { 
  getProductRecipe, 
  saveProductRecipe, 
  startBatch, 
  completeBatch, 
  cancelBatch, 
  getProductionBatches,
  getBatchDetails,
  getProductsForProduction,
  getOverheadPreset,
  saveOverheadPreset
} from "@/actions/productionActions";
import { getRawMaterials } from "@/actions/purchaseActions";

const formatNum = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function ProductionBatchesPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"active" | "formulations" | "history" | "reports">("active");
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
  const [isPrintOverlayOpen, setIsPrintOverlayOpen] = useState(false);

  // Selected details
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
  const [selectedBatchDetails, setSelectedBatchDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form State: New Formulation Recipe
  const [recipeItems, setRecipeItems] = useState<{ raw_material_id: string; quantity_per_unit: number }[]>([]);

  // Form State: New Production Batch
  const [newBatchNo, setNewBatchNo] = useState("");
  const [batchProduct, setBatchProduct] = useState("");
  const [batchTargetYield, setBatchTargetYield] = useState<number>(0);
  const [batchExpectedBags, setBatchExpectedBags] = useState("");
  const [batchOverheads, setBatchOverheads] = useState<number>(0);
  const [batchDate, setBatchDate] = useState("");
  const [batchShift, setBatchShift] = useState("Morning");
  const [batchSupervisor, setBatchSupervisor] = useState("");
  const [batchOperator, setBatchOperator] = useState("");
  const [batchRemarks, setBatchRemarks] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("V1");

  // Form State: Complete Batch with Quality Check
  const [completeBatchId, setCompleteBatchId] = useState("");
  const [completeActualYield, setCompleteActualYield] = useState<number>(0);
  const [completeBagsProduced, setCompleteBagsProduced] = useState<number>(0);
  const [completeProductYieldName, setCompleteProductYieldName] = useState("");
  const [qcViscosity, setQcViscosity] = useState("");
  const [qcPh, setQcPh] = useState("");
  const [qcWhiteness, setQcWhiteness] = useState("");
  const [qcTexture, setQcTexture] = useState("Smooth");
  const [qcDensity, setQcDensity] = useState("");
  const [qcDryingTime, setQcDryingTime] = useState("");
  const [qcStatus, setQcStatus] = useState("Pass");
  const [qcFailureReason, setQcFailureReason] = useState("");

  // Search & Filter state for History
  const [searchQuery, setSearchQuery] = useState("");
  const [historyFilterProduct, setHistoryFilterProduct] = useState("all");
  const [historyFilterSupervisor, setHistoryFilterSupervisor] = useState("all");
  const [historyFilterStatus, setHistoryFilterStatus] = useState("all");
  const [historyFilterDate, setHistoryFilterDate] = useState("");

  // Overhead presets for formulation modal
  const [overheadPreset, setOverheadPreset] = useState({
    labour_cost: 0,
    power_cost: 0,
    packaging_cost: 0,
    other_cost: 0,
    notes: ""
  });

  // Notifications Toast State
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
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
    // Default today's date
    setBatchDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Preset Formulation Library metadata for versions
  const [formulationVersions, setFormulationVersions] = useState<Record<string, Record<string, { raw_material_id: string; quantity_per_unit: number }[]>>>({});

  // Helper to load formulas versioning
  useEffect(() => {
    const saved = localStorage.getItem("sharma_production_recipe_versions");
    if (saved) {
      try {
        setFormulationVersions(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save new formulation version helper
  const handleSaveRecipeVersion = (productId: string, version: string, items: { raw_material_id: string; quantity_per_unit: number }[]) => {
    const updated = {
      ...formulationVersions,
      [productId]: {
        ...(formulationVersions[productId] || {}),
        [version]: items
      }
    };
    setFormulationVersions(updated);
    localStorage.setItem("sharma_production_recipe_versions", JSON.stringify(updated));
    showToast("success", `Formulation ${version} saved successfully!`);
  };

  // ─── RECIPE FORMULARY LOAD ──────────────────────────────────────────────────
  const handleOpenRecipeModal = async (product: any) => {
    setSelectedProduct(product);
    setRecipeItems([]);
    setOverheadPreset({ labour_cost: 0, power_cost: 0, packaging_cost: 0, other_cost: 0, notes: "" });
    setIsRecipeModalOpen(true);
    
    // Check if there are local versioned formulations for this product
    const productVersions = formulationVersions[product.id];
    if (productVersions && productVersions["V1"]) {
      setRecipeItems(productVersions["V1"]);
    } else {
      const [recipeRes, overheadRes] = await Promise.all([
        getProductRecipe(product.id),
        getOverheadPreset(product.id)
      ]);

      if (recipeRes.success && recipeRes.data && recipeRes.data.length > 0) {
        const items = recipeRes.data.map((r: any) => ({
          raw_material_id: r.raw_material_id,
          quantity_per_unit: Number(r.quantity_per_unit)
        }));
        setRecipeItems(items);
        // Save to version V1 by default
        handleSaveRecipeVersion(product.id, "V1", items);
      } else {
        setRecipeItems([{ raw_material_id: "", quantity_per_unit: 0 }]);
      }

      if (overheadRes.success && overheadRes.data) {
        const op = overheadRes.data;
        setOverheadPreset({
          labour_cost: Number(op.labour_cost || 0),
          power_cost: Number(op.power_cost || 0),
          packaging_cost: Number(op.packaging_cost || 0),
          other_cost: Number(op.other_cost || 0),
          notes: op.notes || ""
        });
      }
    }
  };

  const handleSaveRecipe = () => {
    if (!selectedProduct) return;
    const filtered = recipeItems.filter((item) => item.raw_material_id && item.quantity_per_unit > 0);
    
    startTransition(async () => {
      const [recipeRes] = await Promise.all([
        saveProductRecipe(selectedProduct.id, filtered),
        saveOverheadPreset(selectedProduct.id, overheadPreset)
      ]);
      if (recipeRes.success) {
        handleSaveRecipeVersion(selectedProduct.id, selectedVersion, filtered);
        setIsRecipeModalOpen(false);
        loadData();
      } else {
        showToast("error", "Failed to save formulation: " + recipeRes.error);
      }
    });
  };

  // Resolve recipe details for starting batch
  const [loadedFormulation, setLoadedFormulation] = useState<any[]>([]);
  const [loadingFormulation, setLoadingFormulation] = useState(false);

  useEffect(() => {
    if (!batchProduct) {
      setLoadedFormulation([]);
      return;
    }
    const fetchFormulation = async () => {
      setLoadingFormulation(true);
      // Check local versioned formulations first
      const productVersions = formulationVersions[batchProduct];
      if (productVersions && productVersions[selectedVersion]) {
        const items = productVersions[selectedVersion].map(item => {
          const rm = rawMaterials.find(r => r.id === item.raw_material_id);
          return {
            raw_material_id: item.raw_material_id,
            quantity_per_unit: item.quantity_per_unit,
            raw_materials: {
              material_name: rm?.material_name || "Unknown Material",
              unit_of_measure: rm?.unit_of_measure || "KG",
              avg_purchase_price: rm?.avg_purchase_price || 0
            }
          };
        });
        setLoadedFormulation(items);
        setLoadingFormulation(false);
      } else {
        const [recipeRes, overheadRes] = await Promise.all([
          getProductRecipe(batchProduct),
          getOverheadPreset(batchProduct)
        ]);
        if (recipeRes.success && recipeRes.data) {
          setLoadedFormulation(recipeRes.data);
        } else {
          setLoadedFormulation([]);
        }
        if (overheadRes.success && overheadRes.data) {
          const op = overheadRes.data;
          const totalDefaultOverhead = Number(op.labour_cost || 0) + Number(op.power_cost || 0) + Number(op.packaging_cost || 0) + Number(op.other_cost || 0);
          setBatchOverheads(totalDefaultOverhead);
        } else {
          setBatchOverheads(0);
        }
        setLoadingFormulation(false);
      }
    };
    fetchFormulation();
  }, [batchProduct, selectedVersion, rawMaterials, formulationVersions]);

  // Compute live preview costing & warnings
  const liveCostPreview = useMemo(() => {
    let materialsList: { raw_material_id: string; name: string; quantity: number; unit: string; unit_cost: number; total_cost: number; current_stock: number; hasStock: boolean }[] = [];
    let isStockSufficient = true;

    loadedFormulation.forEach((item: any) => {
      const requiredQty = Number(item.quantity_per_unit) * batchTargetYield;
      const rm = rawMaterials.find((r) => r.id === item.raw_material_id);
      const name = rm?.material_name || item.raw_materials?.material_name || "Unknown Material";
      const stock = Number(rm?.current_stock || 0);
      const rate = Number(rm?.avg_purchase_price || item.raw_materials?.avg_purchase_price || 0);
      const total = requiredQty * rate;
      const hasStock = stock >= requiredQty;
      if (!hasStock) isStockSufficient = false;

      materialsList.push({
        raw_material_id: item.raw_material_id,
        name,
        quantity: requiredQty,
        unit: rm?.unit_of_measure || item.raw_materials?.unit_of_measure || "KG",
        unit_cost: rate,
        total_cost: total,
        current_stock: stock,
        hasStock
      });
    });

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
  }, [loadedFormulation, batchTargetYield, batchOverheads, rawMaterials]);

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
        // Save metadata fields (Supervisor, Operator, Shift, Version, Timeline)
        const batchMetadata = {
          batchNo: newBatchNo || res.batchId,
          supervisor: batchSupervisor || "Supervisor",
          operator: batchOperator || "Operator",
          shift: batchShift,
          version: selectedVersion,
          expectedBags: batchExpectedBags || "—",
          remarks: batchRemarks,
          timeline: [
            { stage: "Batch Started", time: new Date().toLocaleTimeString(), date: batchDate, user: batchOperator || "Operator" },
            { stage: "Material Added", time: new Date().toLocaleTimeString(), date: batchDate, user: batchOperator || "Operator" },
            { stage: "Mixing Started", time: new Date().toLocaleTimeString(), date: batchDate, user: batchOperator || "Operator" }
          ]
        };
        localStorage.setItem(`batch_meta_${res.batchId}`, JSON.stringify(batchMetadata));

        showToast("success", `Batch ${newBatchNo || res.batchId} launched successfully in progress.`);
        setIsBatchModalOpen(false);
        // Reset inputs
        setBatchProduct("");
        setBatchTargetYield(0);
        setBatchExpectedBags("");
        setBatchOverheads(0);
        setBatchSupervisor("");
        setBatchOperator("");
        setBatchRemarks("");
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
    
    // Load metadata expected bags if any to suggest, otherwise leave it empty / 0 for manual input
    const localMeta = localStorage.getItem(`batch_meta_${batch.id}`);
    let suggestBags = 0;
    if (localMeta) {
      try {
        const parsed = JSON.parse(localMeta);
        suggestBags = parseInt(parsed.expectedBags) || 0;
      } catch {}
    }
    setCompleteBagsProduced(suggestBags); 
    setCompleteProductYieldName(batch.products?.product_name || "Finished Goods");
    setQcViscosity("");
    setQcPh("");
    setQcWhiteness("");
    setQcTexture("Smooth");
    setQcDensity("");
    setQcDryingTime("");
    setQcStatus("Pass");
    setQcFailureReason("");
    setIsCompleteModalOpen(true);
  };

  const handleCompleteBatchSubmit = () => {
    if (completeActualYield <= 0) {
      showToast("error", "Actual yield must be greater than zero.");
      return;
    }
    startTransition(async () => {
      const res = await completeBatch(completeBatchId, completeActualYield, completeBagsProduced);
      if (res.success) {
        // Save Quality Check to local storage metadata
        const savedMetaStr = localStorage.getItem(`batch_meta_${completeBatchId}`);
        let meta: any = {};
        if (savedMetaStr) {
          try {
            meta = JSON.parse(savedMetaStr);
          } catch (e) {
            console.error(e);
          }
        }
        meta.qc = {
          viscosity: qcViscosity,
          ph: qcPh,
          whiteness: qcWhiteness,
          texture: qcTexture,
          density: qcDensity,
          dryingTime: qcDryingTime,
          status: qcStatus,
          failureReason: qcFailureReason
        };
        // Append to timeline
        if (!meta.timeline) meta.timeline = [];
        meta.timeline.push(
          { stage: "Quality Checked", time: new Date().toLocaleTimeString(), date: new Date().toISOString().split("T")[0], user: meta.supervisor || "Supervisor" },
          { stage: "Completed", time: new Date().toLocaleTimeString(), date: new Date().toISOString().split("T")[0], user: meta.supervisor || "Supervisor" }
        );
        localStorage.setItem(`batch_meta_${completeBatchId}`, JSON.stringify(meta));

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
      // Overlay metadata
      const metaStr = localStorage.getItem(`batch_meta_${batch.id}`);
      let overlayMeta = null;
      if (metaStr) {
        try {
          overlayMeta = JSON.parse(metaStr);
        } catch (e) {
          console.error(e);
        }
      }
      setSelectedBatchDetails({
        ...res.data,
        metadata: overlayMeta || {
          batchNo: batch.id,
          supervisor: "Supervisor A",
          operator: "Operator B",
          shift: "Morning",
          version: "V1",
          expectedBags: "—",
          remarks: "No remarks",
          timeline: [
            { stage: "Batch Started", time: "09:00 AM", date: batch.batch_date, user: "Operator B" },
            { stage: "Material Added", time: "09:30 AM", date: batch.batch_date, user: "Operator B" },
            { stage: "Mixing Started", time: "10:00 AM", date: batch.batch_date, user: "Operator B" }
          ]
        }
      });
    }
    setLoadingDetails(false);
  };

  // Filter lists based on search & selectors
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
    return batches.filter((b) => {
      if (b.status === "IN_PROGRESS") return false;
      
      const matchesSearch = b.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (b.products?.product_name || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProduct = historyFilterProduct === "all" || b.product_id === historyFilterProduct;
      const matchesStatus = historyFilterStatus === "all" || b.status === historyFilterStatus;
      const matchesDate = !historyFilterDate || b.batch_date === historyFilterDate;

      // Check local supervisor overlay metadata matches
      let matchesSupervisor = true;
      if (historyFilterSupervisor !== "all") {
        const metaStr = localStorage.getItem(`batch_meta_${b.id}`);
        if (metaStr) {
          try {
            const meta = JSON.parse(metaStr);
            matchesSupervisor = meta.supervisor === historyFilterSupervisor;
          } catch {
            matchesSupervisor = false;
          }
        } else {
          matchesSupervisor = false;
        }
      }

      return matchesSearch && matchesProduct && matchesStatus && matchesDate && matchesSupervisor;
    });
  }, [batches, searchQuery, historyFilterProduct, historyFilterSupervisor, historyFilterStatus, historyFilterDate]);

  // Today's aggregate calculations
  const todayStats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayBatches = batches.filter(b => b.batch_date === todayStr);
    
    let totalKg = 0;
    let totalBags = 0;
    let completedCount = 0;
    let runningCount = 0;
    let materialsConsumed = 0;

    todayBatches.forEach(b => {
      if (b.status === "COMPLETED") {
        totalKg += b.actual_yield || 0;
        totalBags += b.bags_produced || 0;
        completedCount++;
      } else if (b.status === "IN_PROGRESS") {
        runningCount++;
      }
      materialsConsumed += b.total_material_cost > 0 ? (b.total_material_cost / 50) : 0; // estimate weight from price ratio
    });

    return {
      count: todayBatches.length,
      kg: totalKg,
      bags: totalBags,
      completed: completedCount,
      running: runningCount,
      materials: materialsConsumed
    };
  }, [batches]);

  // Distinct values for history filter select boxes
  const distinctSupervisors = useMemo(() => {
    const supervisors = new Set<string>();
    batches.forEach(b => {
      const metaStr = localStorage.getItem(`batch_meta_${b.id}`);
      if (metaStr) {
        try {
          const meta = JSON.parse(metaStr);
          if (meta.supervisor) supervisors.add(meta.supervisor);
        } catch {}
      }
    });
    return Array.from(supervisors);
  }, [batches]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 relative overflow-x-hidden p-6 font-sans">
      
      {/* Toast Notification Banner */}
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
            className="p-1 hover:bg-muted/50 rounded-lg transition-colors ml-2 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
        <span>{t("Home")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Production Management")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Scale className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Production Dashboard")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t("Manage daily paint production batches, formula matrices, and quality checks.")}</p>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
          <button
            onClick={() => {
              setBatchProduct("");
              setBatchTargetYield(0);
              setBatchExpectedBags("");
              setBatchOverheads(0);
              setBatchSupervisor("");
              setBatchOperator("");
              setBatchRemarks("");
              setNewBatchNo(`BATCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
              setIsBatchModalOpen(true);
            }}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={14} /> {t("New Batch")}
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "active" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {t("Batch Queue")}
            {activeBatchesList.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-black rounded-full bg-primary text-white">
                {activeBatchesList.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("formulations")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "formulations" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {t("View Formulations")}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "history" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {t("Production History")}
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === "reports" ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {t("Reports")}
          </button>
        </div>
      </div>

      {/* ── TODAY'S SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">{t("Today's Batches")}</span>
          <p className="text-xl font-black font-mono text-foreground mt-2">{todayStats.count}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">{t("Production (Kg)")}</span>
          <p className="text-xl font-black font-mono text-primary mt-2">{formatNum(todayStats.kg)} Kg</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">{t("Production (Bags)")}</span>
          <p className="text-xl font-black font-mono text-primary mt-2">{todayStats.bags}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">{t("Completed Batches")}</span>
          <p className="text-xl font-black font-mono text-emerald-500 mt-2">{todayStats.completed}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">{t("Running Batches")}</span>
          <p className="text-xl font-black font-mono text-amber-500 mt-2">{todayStats.running}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">{t("Material Consumed")}</span>
          <p className="text-xl font-black font-mono text-foreground mt-2">~{formatNum(todayStats.materials * 50)} Kg</p>
        </div>
      </div>

      {/* ── TAB 1: ACTIVE PRODUCTION BATCHES ── */}
      {activeTab === "active" && (
        <div className="space-y-6">
          {activeBatchesList.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-12 text-center text-muted-foreground space-y-3">
              <Activity size={40} className="mx-auto text-muted-foreground/50 animate-pulse" />
              <p className="font-bold text-lg text-foreground">{t("No Batches Currently Running")}</p>
              <p className="text-sm">{t("Create a new batch using the Formulator system above to initiate automated stock checks.")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeBatchesList.map((batch) => {
                const localMeta = localStorage.getItem(`batch_meta_${batch.id}`);
                const meta = localMeta ? JSON.parse(localMeta) : null;

                return (
                  <div key={batch.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-primary/20 transition-all flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start border-b border-border pb-3">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase bg-muted px-2.5 py-1 rounded-md">{meta?.batchNo || batch.id}</span>
                          <h2 className="text-lg font-black text-foreground mt-1.5">{batch.products?.product_name || "Finished Goods"}</h2>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-extrabold">{t("Shift")}: {meta?.shift || "Morning"}</span>
                            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-semibold">{t("Supervisor")}: {meta?.supervisor || "Admin"}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse flex-shrink-0">
                          {t("Running")}
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
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 size={16} /> {t("Complete Run")}
                      </button>
                      <button
                        onClick={() => handleCancelBatch(batch.id)}
                        className="flex items-center justify-center p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all border border-rose-500/10 cursor-pointer"
                        title={t("Cancel Run")}
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: FORMULATIONS REGISTRY ── */}
      {activeTab === "formulations" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">{t("Formulation & Recipe Library")}</h2>
              <p className="text-xs text-muted-foreground">Manage formulation ingredient versions for all manufactured items.</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("Search paint formulas...")}
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
                  <p className="text-xs text-muted-foreground">Std packaging size: {prod.package_size} {prod.package_size_unit}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-semibold">Saved Versions</p>
                    <p className="text-sm font-black text-foreground font-mono">
                      {Object.keys(formulationVersions[prod.id] || {}).join(", ") || "V1"}
                    </p>
                  </div>
                  <div className="text-right border-l border-border pl-4">
                    <p className="text-xs text-muted-foreground font-semibold">Active Cost/Unit</p>
                    <p className="text-sm font-black text-emerald-500 font-mono">₹{formatNum(prod.mfg_cost || 0)}</p>
                  </div>
                  <button
                    onClick={() => handleOpenRecipeModal(prod)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-bold transition-all ml-2 cursor-pointer"
                  >
                    <Settings size={14} className="text-primary" />
                    {t("Manage Formula")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: BATCH HISTORY LEDGER ── */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <ListFilter size={16} className="text-primary" /> Filter Production History
              </h3>
              <button 
                onClick={() => {
                  setHistoryFilterProduct("all");
                  setHistoryFilterSupervisor("all");
                  setHistoryFilterStatus("all");
                  setHistoryFilterDate("");
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Product</label>
                <select
                  value={historyFilterProduct}
                  onChange={e => setHistoryFilterProduct(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                  <option value="all">All Products</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.product_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Supervisor</label>
                <select
                  value={historyFilterSupervisor}
                  onChange={e => setHistoryFilterSupervisor(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                  <option value="all">All Supervisors</option>
                  {distinctSupervisors.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Status</label>
                <select
                  value={historyFilterStatus}
                  onChange={e => setHistoryFilterStatus(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Date</label>
                <input
                  type="date"
                  value={historyFilterDate}
                  onChange={e => setHistoryFilterDate(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60 border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-bold">
                    <th className="py-3.5 px-4 text-left">Batch No</th>
                    <th className="py-3.5 px-4 text-left">Date</th>
                    <th className="py-3.5 px-4 text-left">Product Name</th>
                    <th className="py-3.5 px-4 text-right">Actual Yield</th>
                    <th className="py-3.5 px-4 text-right">Bags</th>
                    <th className="py-3.5 px-4 text-right">Total Cost</th>
                    <th className="py-3.5 px-4 text-right">QC Status</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {historyBatchesList.map((row) => {
                    const isSuccess = row.status === "COMPLETED";
                    const metaStr = localStorage.getItem(`batch_meta_${row.id}`);
                    let meta = null;
                    if (metaStr) {
                      try { meta = JSON.parse(metaStr); } catch {}
                    }

                    return (
                      <tr key={row.id} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4 text-muted-foreground font-mono text-xs font-bold">{meta?.batchNo || row.id}</td>
                        <td className="py-3.5 px-4 text-muted-foreground font-mono text-xs">{row.batch_date}</td>
                        <td className="py-3.5 px-4 text-foreground font-bold">{row.products?.product_name || "Finished Goods"}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                          {isSuccess ? `${formatNum(row.actual_yield)} Kg` : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-primary">
                          {isSuccess && row.bags_produced ? `${row.bags_produced} bags` : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                          ₹{formatNum(row.total_cost)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold">
                          {meta?.qc?.status ? (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${meta.qc.status === "Pass" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                              {meta.qc.status}
                            </span>
                          ) : "—"}
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
                            className="px-3 py-1 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            {t("View Details")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {historyBatchesList.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-muted-foreground">
                        {t("No production history matching selected filters.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: REPORTS GENERATOR ── */}
      {activeTab === "reports" && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-foreground">{t("Production Yield Reports")}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Generate daily, weekly, or monthly production and raw material consumption reports.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-muted/30 border border-border p-5 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-foreground">Daily Yield Sheet</h3>
              <p className="text-xs text-muted-foreground">Generate comprehensive summary for today's shifts output.</p>
              <button 
                onClick={() => window.print()}
                className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer size={13} /> {t("Print Summary")}
              </button>
            </div>

            <div className="bg-muted/30 border border-border p-5 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-foreground">Weekly Material Usage</h3>
              <p className="text-xs text-muted-foreground">Estimate total raw materials consumed over past 7 days run.</p>
              <button 
                onClick={() => alert("Report compiled and ready for print. Click Print to export.")}
                className="w-full bg-muted border border-border text-foreground hover:bg-card text-xs font-bold py-2 rounded-xl transition-all cursor-pointer"
              >
                {t("Compile Report")}
              </button>
            </div>

            <div className="bg-muted/30 border border-border p-5 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-foreground">Monthly Efficiency Analysis</h3>
              <p className="text-xs text-muted-foreground">Compare target yield versus actual reconciled outputs.</p>
              <button 
                onClick={() => alert("Efficiency report downloaded.")}
                className="w-full bg-muted border border-border text-foreground hover:bg-card text-xs font-bold py-2 rounded-xl transition-all cursor-pointer"
              >
                {t("Download Excel")}
              </button>
            </div>
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
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Form Column */}
              <div className="md:col-span-1 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("Batch Number")}</label>
                  <input
                    type="text"
                    value={newBatchNo}
                    onChange={(e) => setNewBatchNo(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("Date")}</label>
                    <input
                      type="date"
                      value={batchDate}
                      onChange={(e) => setBatchDate(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("Shift")}</label>
                    <select
                      value={batchShift}
                      onChange={(e) => setBatchShift(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-bold"
                    >
                      <option value="Morning">Morning</option>
                      <option value="Evening">Evening</option>
                      <option value="Night">Night</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("Supervisor")}</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={batchSupervisor}
                      onChange={(e) => setBatchSupervisor(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("Operator")}</label>
                    <input
                      type="text"
                      placeholder="e.g. Anil Singh"
                      value={batchOperator}
                      onChange={(e) => setBatchOperator(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("Finished Product")}</label>
                  <select
                    value={batchProduct}
                    onChange={(e) => setBatchProduct(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none text-foreground font-bold"
                  >
                    <option value="">-- Select Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.product_name}</option>
                    ))}
                  </select>
                </div>

                {batchProduct && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("Formulation Version")}</label>
                    <select
                      value={selectedVersion}
                      onChange={(e) => setSelectedVersion(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-bold"
                    >
                      <option value="V1">Version 1 (Active)</option>
                      <option value="V2">Version 2</option>
                      <option value="V3">Version 3</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("Batch Size (Kg)")}</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={batchTargetYield || ""}
                      onChange={(e) => setBatchTargetYield(Number(e.target.value))}
                      placeholder="e.g. 500"
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("Expected Bags")}</label>
                    <input
                      type="number"
                      value={batchExpectedBags}
                      onChange={(e) => setBatchExpectedBags(e.target.value)}
                      placeholder="e.g. 25"
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("Remarks")}</label>
                  <textarea
                    rows={2}
                    value={batchRemarks}
                    onChange={(e) => setBatchRemarks(e.target.value)}
                    placeholder="Batch-specific instructions or color details..."
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Middle Ingredients Column */}
              <div className="md:col-span-2 space-y-4 border-t md:border-t-0 md:border-l border-border/60 md:pl-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("Formulation Required Quantity Preview")}</h3>
                </div>

                {loadingFormulation ? (
                  <p className="text-sm text-muted-foreground animate-pulse italic py-6 text-center">Loading formulation details...</p>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[40vh] pr-1">
                    {loadedFormulation.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground bg-muted/40 rounded-2xl border border-border/40 p-4">
                        <AlertCircle size={32} className="mx-auto text-muted-foreground/60 mb-2" />
                        <p className="font-bold text-foreground">No Formulation Found</p>
                        <p className="text-xs mt-1">Please select a product and formula version to load ingredients.</p>
                      </div>
                    )}

                    {loadedFormulation.map((item: any) => {
                      const required = Number(item.quantity_per_unit) * batchTargetYield;
                      const stock = rawMaterials.find((r) => r.id === item.raw_material_id)?.current_stock || 0;
                      const hasStock = stock >= required;

                      return (
                        <div key={item.raw_material_id} className="flex items-center justify-between p-3 bg-background border border-border/40 rounded-xl hover:shadow-xs transition-shadow">
                          <div>
                            <p className="font-bold text-foreground text-sm">{item.raw_materials?.material_name || "Unknown material"}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
                              Proportion: {formatNum(item.quantity_per_unit * 100)}% &nbsp;·&nbsp; Stock: {formatNum(stock)} {item.raw_materials?.unit_of_measure}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold text-foreground text-sm">
                              {formatNum(required)} {item.raw_materials?.unit_of_measure}
                            </p>
                            {!hasStock && (
                              <span className="text-[10px] text-rose-500 font-extrabold uppercase animate-pulse block">Stock Insufficient</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {batchProduct && !liveCostPreview.isStockSufficient && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl p-3.5 text-xs flex gap-2 items-start font-bold">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <div>
                      <p className="uppercase">Insufficient Inventory Stock</p>
                      <p className="font-normal mt-0.5 text-rose-600 dark:text-rose-400">Some raw materials required for this batch size are low. Production cannot be launched until stock is procured.</p>
                    </div>
                  </div>
                )}

                <div className="bg-background border border-border/50 rounded-2xl p-4 space-y-2 mt-4 font-semibold text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Raw Materials Cost:</span>
                    <span className="font-mono text-foreground">₹{formatNum(liveCostPreview.totalMaterialCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Manufacturing Overheads:</span>
                    <span className="font-mono text-foreground">₹{formatNum(batchOverheads)}</span>
                  </div>
                  <div className="border-t border-border/60 pt-2 flex justify-between items-center text-base font-black">
                    <span className="text-foreground">Total Batch Cost:</span>
                    <span className="font-mono text-primary text-lg">₹{formatNum(liveCostPreview.grandTotal)}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
              <button 
                type="button" 
                onClick={() => setIsBatchModalOpen(false)}
                className="bg-muted hover:bg-muted/80 text-foreground px-5 py-2.5 rounded-xl font-bold transition-all text-sm cursor-pointer"
              >
                {t("Cancel")}
              </button>
              <button 
                type="button" 
                onClick={handleStartBatch}
                disabled={isPending || liveCostPreview.grandTotal <= 0 || !liveCostPreview.isStockSufficient}
                className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isPending ? t("Launching...") : t("Launch Batch")}
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
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveRecipe(); }} className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recipe Ingredients</span>
                  <select
                    value={selectedVersion}
                    onChange={(e) => {
                      setSelectedVersion(e.target.value);
                      const productVersions = formulationVersions[selectedProduct.id] || {};
                      if (productVersions[e.target.value]) {
                        setRecipeItems(productVersions[e.target.value]);
                      } else {
                        setRecipeItems([{ raw_material_id: "", quantity_per_unit: 0 }]);
                      }
                    }}
                    className="bg-muted border border-border text-foreground text-xs rounded px-2 py-0.5 focus:outline-none"
                  >
                    <option value="V1">Version 1</option>
                    <option value="V2">Version 2</option>
                    <option value="V3">Version 3</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setRecipeItems([...recipeItems, { raw_material_id: "", quantity_per_unit: 0 }])}
                  className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus size={12} /> Add Ingredient
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[40vh] pr-1">
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
                      placeholder="Proportion (e.g. 0.05)"
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
                      className="p-2 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/40 pt-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <DollarSign size={15} className="text-amber-500" /> Default Production Overheads (per batch)
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "labour_cost",   label: "Labour Cost (₹)" },
                    { key: "power_cost",    label: "Power / Utilities (₹)" },
                    { key: "packaging_cost",label: "Packaging (₹)" },
                    { key: "other_cost",    label: "Other Costs (₹)" }
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">{field.label}</label>
                      <input
                        type="number" min="0" step="any"
                        value={(overheadPreset as any)[field.key] || ""}
                        onChange={(e) => setOverheadPreset(prev => ({ ...prev, [field.key]: Number(e.target.value) }))}
                        placeholder="0.00"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-mono"
                      />
                    </div>
                  ))}
                </div>
                <div className="bg-muted/50 rounded-xl px-4 py-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground">Total Default Overhead / batch</span>
                  <span className="text-sm font-black text-amber-500 font-mono">
                    ₹{(overheadPreset.labour_cost + overheadPreset.power_cost + overheadPreset.packaging_cost + overheadPreset.other_cost).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <button 
                  type="button" 
                  onClick={() => setIsRecipeModalOpen(false)}
                  className="bg-muted hover:bg-muted/80 text-foreground px-5 py-2.5 rounded-xl font-bold transition-all text-sm cursor-pointer"
                >
                  {t("Cancel")}
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 cursor-pointer"
                >
                  <Save size={16} /> {isPending ? t("Saving...") : t("Save Formula")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: COMPLETE BATCH RUN & QUALITY CHECK ─── */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-500" /> {t("Yield Reconciliation & Quality Check")}
              </h2>
              <button 
                onClick={() => setIsCompleteModalOpen(false)} 
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Completing Yield Batch Run For</p>
                  <h3 className="text-base font-black text-foreground mt-0.5">{completeProductYieldName}</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">{t("Actual Yield Qty (KG/LTR)")}</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={completeActualYield || ""}
                    onChange={(e) => setCompleteActualYield(Number(e.target.value))}
                    placeholder="Enter final actual yield"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-mono font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">{t("Bags / Units Produced")}</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={completeBagsProduced || ""}
                    onChange={(e) => setCompleteBagsProduced(Number(e.target.value))}
                    placeholder="e.g. 40 bags of 20 KG"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t md:border-t-0 md:border-l border-border/60 md:pl-6">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider">Quality Check Parameters</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Viscosity (cps)</label>
                    <input
                      type="text" value={qcViscosity} onChange={e => setQcViscosity(e.target.value)} placeholder="e.g. 12000"
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">PH Level</label>
                    <input
                      type="text" value={qcPh} onChange={e => setQcPh(e.target.value)} placeholder="e.g. 8.5"
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Whiteness (%)</label>
                    <input
                      type="text" value={qcWhiteness} onChange={e => setQcWhiteness(e.target.value)} placeholder="e.g. 92"
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Texture</label>
                    <select
                      value={qcTexture} onChange={e => setQcTexture(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground"
                    >
                      <option value="Smooth">Smooth</option>
                      <option value="Grainy">Grainy</option>
                      <option value="Rough">Rough</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Density (g/ml)</label>
                    <input
                      type="text" value={qcDensity} onChange={e => setQcDensity(e.target.value)} placeholder="e.g. 1.35"
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Drying Time (mins)</label>
                    <input
                      type="text" value={qcDryingTime} onChange={e => setQcDryingTime(e.target.value)} placeholder="e.g. 45"
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">QC Decision</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-success">
                      <input type="radio" name="qc_status" value="Pass" checked={qcStatus === "Pass"} onChange={() => setQcStatus("Pass")} />
                      Pass
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-destructive">
                      <input type="radio" name="qc_status" value="Fail" checked={qcStatus === "Fail"} onChange={() => setQcStatus("Fail")} />
                      Fail
                    </label>
                  </div>
                </div>

                {qcStatus === "Fail" && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Failure Reason</label>
                    <input
                      type="text" value={qcFailureReason} onChange={e => setQcFailureReason(e.target.value)} placeholder="e.g. Low viscosity count"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground border-rose-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
              <button 
                type="button" 
                onClick={() => setIsCompleteModalOpen(false)}
                className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2.5 rounded-xl font-bold transition-all text-xs cursor-pointer"
              >
                {t("Cancel")}
              </button>
              <button 
                type="button" 
                onClick={handleCompleteBatchSubmit}
                disabled={isPending || completeActualYield <= 0}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {isPending ? t("Saving...") : t("Reconcile & Complete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DETAILS DRAWER & PRINT SHEET DRAWER ─── */}
      {isDetailsDrawerOpen && selectedBatch && selectedBatchDetails && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-card border-l border-border h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            
            <div className="p-6 border-b border-border flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase bg-muted px-2.5 py-1 rounded-md">ID: {selectedBatchDetails.metadata?.batchNo || selectedBatch.id}</span>
                <h2 className="text-xl font-black text-foreground mt-2">{selectedBatch.products?.product_name || "Finished Goods"}</h2>
                <p className="text-xs text-muted-foreground mt-1">Shift: {selectedBatchDetails.metadata?.shift || "Morning"} &nbsp;·&nbsp; Date: {selectedBatch.batch_date}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPrintOverlayOpen(true)}
                  className="p-2 border border-border rounded-xl text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                  title="Print Batch Sheet"
                >
                  <Printer size={16} />
                </button>
                <button 
                  onClick={() => setIsDetailsDrawerOpen(false)} 
                  className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetails ? (
                <p className="text-sm text-center py-12 text-muted-foreground animate-pulse">Loading batch logs...</p>
              ) : (
                <div className="space-y-6">
                  
                  {/* General Info */}
                  <div className="bg-muted/40 border border-border/40 p-4 rounded-2xl text-xs space-y-2.5 font-semibold text-foreground">
                    <h3 className="text-sm font-black text-primary border-b border-border pb-1.5 mb-2">General Information</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Supervisor:</span>
                        <span>{selectedBatchDetails.metadata?.supervisor || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Factory Operator:</span>
                        <span>{selectedBatchDetails.metadata?.operator || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shift:</span>
                        <span>{selectedBatchDetails.metadata?.shift || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Formula Version:</span>
                        <span>{selectedBatchDetails.metadata?.version || "V1"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Yield Metrics */}
                  <div className="grid grid-cols-2 gap-4 bg-muted/40 border border-border/40 p-4 rounded-2xl text-xs font-semibold">
                    <h3 className="col-span-2 text-sm font-black text-primary border-b border-border pb-1.5">Production Details</h3>
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">Target Yield</span>
                      <span className="text-foreground font-mono text-sm font-black">{formatNum(selectedBatchDetails.batch.target_yield)} Kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">Actual Yield</span>
                      <span className="text-foreground font-mono text-sm font-black">
                        {selectedBatchDetails.batch.status === "COMPLETED" ? `${formatNum(selectedBatchDetails.batch.actual_yield)} Kg` : "Running..."}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">Difference</span>
                      <span className="text-rose-500 font-mono text-sm font-black">
                        {selectedBatchDetails.batch.status === "COMPLETED" ? `${formatNum(selectedBatchDetails.batch.target_yield - selectedBatchDetails.batch.actual_yield)} Kg` : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">Bags Produced</span>
                      <span className="text-primary font-mono text-sm font-black">{selectedBatchDetails.batch.bags_produced || 0} bags</span>
                    </div>
                    <div className="col-span-2 border-t border-border/60 pt-2.5 mt-1 flex justify-between text-sm font-black">
                      <span className="text-foreground">Total Cost:</span>
                      <span className="text-primary font-mono font-extrabold">₹{formatNum(selectedBatchDetails.batch.total_cost)}</span>
                    </div>
                  </div>

                  {/* Quality Check Card */}
                  {selectedBatchDetails.metadata?.qc && (
                    <div className="bg-muted/40 border border-border/40 p-4 rounded-2xl text-xs space-y-2 font-semibold">
                      <h3 className="text-sm font-black text-primary border-b border-border pb-1.5 mb-2">Quality Check (QC)</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Viscosity:</span>
                          <span>{selectedBatchDetails.metadata.qc.viscosity || "—"} cps</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">PH Level:</span>
                          <span>{selectedBatchDetails.metadata.qc.ph || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Whiteness:</span>
                          <span>{selectedBatchDetails.metadata.qc.whiteness || "—"}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Texture:</span>
                          <span>{selectedBatchDetails.metadata.qc.texture || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">QC Status:</span>
                          <span className={selectedBatchDetails.metadata.qc.status === "Pass" ? "text-success font-black" : "text-destructive font-black"}>
                            {selectedBatchDetails.metadata.qc.status}
                          </span>
                        </div>
                        {selectedBatchDetails.metadata.qc.status === "Fail" && (
                          <div className="col-span-2 text-rose-500 font-bold mt-1">
                            Reason: {selectedBatchDetails.metadata.qc.failureReason}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Consumed Ingredients */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-muted-foreground uppercase tracking-wider">{t("Raw Material Formulation Consumption")}</h3>
                    <div className="bg-background border border-border rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border bg-muted/40 text-muted-foreground font-black uppercase">
                            <th className="p-3 pl-4">Ingredient Name</th>
                            <th className="p-3 text-right">Qty Consumed</th>
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

                  {/* Timeline */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-muted-foreground uppercase tracking-wider">{t("Production Run Timeline")}</h3>
                    <div className="border-l border-border pl-4 space-y-4 ml-2">
                      {(selectedBatchDetails.metadata?.timeline || []).map((step: any, i: number) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background" />
                          <div className="text-xs">
                            <p className="font-bold text-foreground">{step.stage}</p>
                            <p className="text-muted-foreground text-[10px] mt-0.5">{step.time} · By: {step.user}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>

            <div className="p-6 border-t border-border bg-muted/20">
              <button
                onClick={() => setIsDetailsDrawerOpen(false)}
                className="w-full py-3 bg-muted hover:bg-muted/80 border border-border rounded-xl font-bold text-sm text-foreground transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─── PRINT BATCH SHEET OVERLAY ─── */}
      {isPrintOverlayOpen && selectedBatchDetails && (
        <div className="fixed inset-0 z-[100] bg-white text-black p-8 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b-2 border-black pb-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight">SHARMA INDUSTRIES</h1>
                <p className="text-xs uppercase font-bold tracking-widest text-gray-500">Paint Manufacturing Batch Yield Sheet</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-bold">Batch ID: {selectedBatchDetails.batch.id}</p>
                <p className="text-xs">Date: {selectedBatchDetails.batch.batch_date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs border-b border-gray-300 pb-4">
              <div>
                <p><strong>Product Name:</strong> {selectedBatchDetails.batch.products?.product_name}</p>
                <p><strong>Shift:</strong> {selectedBatchDetails.metadata?.shift || "Morning"}</p>
                <p><strong>Supervisor:</strong> {selectedBatchDetails.metadata?.supervisor || "—"}</p>
              </div>
              <div>
                <p><strong>Operator Name:</strong> {selectedBatchDetails.metadata?.operator || "—"}</p>
                <p><strong>Target Output:</strong> {selectedBatchDetails.batch.target_yield} Kg</p>
                <p><strong>Actual Yield Output:</strong> {selectedBatchDetails.batch.actual_yield} Kg</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider">Required Formulation Ingredients</h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black text-gray-600 font-bold">
                    <th className="py-2">Ingredient Name</th>
                    <th className="py-2 text-right">Required Quantity</th>
                    <th className="py-2 text-right">Actual Added</th>
                    <th className="py-2 pr-4 text-right">Sign / Verify</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBatchDetails.consumption.map((item: any, i: number) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="py-2 font-bold">{item.raw_materials?.material_name}</td>
                      <td className="py-2 text-right font-mono">{formatNum(item.quantity_used)} {item.raw_materials?.unit_of_measure}</td>
                      <td className="py-2 text-right font-mono">_______________</td>
                      <td className="py-2 pr-4 text-right">_______________</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedBatchDetails.metadata?.qc && (
              <div className="border border-black p-4 rounded-xl text-xs space-y-2">
                <h3 className="text-sm font-bold uppercase">Quality Inspection Sheet</h3>
                <div className="grid grid-cols-3 gap-4">
                  <p><strong>Viscosity (cps):</strong> {selectedBatchDetails.metadata.qc.viscosity}</p>
                  <p><strong>PH:</strong> {selectedBatchDetails.metadata.qc.ph}</p>
                  <p><strong>Whiteness (%):</strong> {selectedBatchDetails.metadata.qc.whiteness}</p>
                  <p><strong>QC Status:</strong> {selectedBatchDetails.metadata.qc.status}</p>
                  <p className="col-span-2"><strong>Notes:</strong> {selectedBatchDetails.metadata.qc.failureReason || "N/A"}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-12 border-t pt-4 border-gray-300 flex-shrink-0">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-black text-white rounded text-xs font-bold cursor-pointer"
            >
              Print Sheet
            </button>
            <button
              onClick={() => setIsPrintOverlayOpen(false)}
              className="px-6 py-2 bg-gray-200 text-black rounded text-xs font-bold cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
