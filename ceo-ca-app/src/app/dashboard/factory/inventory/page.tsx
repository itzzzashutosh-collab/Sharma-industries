"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Boxes,
  Search,
  AlertTriangle,
  PlusCircle,
  Upload,
  X,
  ChevronRight,
  FlaskConical,
  History,
  BookOpen,
  ArrowDownCircle,
  ArrowUpCircle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Layers,
  TrendingDown,
  Package,
} from "lucide-react";
import { createMaterialAndLog, updateMaterialThreshold, adjustStock, transferStock } from "./actions";
import { getInventorySummary, getMaterialDetails } from "@/actions/inventoryActions";
import { useLanguage } from "@/components/LanguageProvider";

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface InwardRecord {
  date: string;
  vendor: string;
  qty: number;
  rate: number;
  invoice_ref: string;
}

interface Formulation {
  product: string;
  sku: string;
  usage_pct: number;
  qty_per_batch: number;
  batch_size: string;
}

interface LedgerEntry {
  date: string;
  type: "IN" | "OUT" | "ADJUST";
  reference: string;
  description: string;
  qty_in: number | null;
  qty_out: number | null;
  balance: number;
}

interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  current_stock: number;
  min_threshold: number;
  supplier: string;
  inwardHistory: InwardRecord[];
  formulations: Formulation[];
  ledgerLogs: LedgerEntry[];
}

const PRESET_CATEGORIES = [
  "Chemicals - Binders & Resins",
  "Chemicals - Primary Pigments",
  "Chemicals - Extenders & Fillers",
  "Chemicals - Solvents & Vehicles",
  "Chemicals - Additives",
  "Packaging - Buckets",
  "Packaging - Bottles",
  "Packaging - Stickers & Labels"
];

const getCategoryColor = (cat: string) => {
  return "bg-muted text-muted-foreground border-border/60 dark:bg-muted/40 dark:text-muted-foreground dark:border-border/30";
};

const formatNum = (n: number) => n.toLocaleString("en-IN");

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, width = "max-w-lg" }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${width} bg-card border border-border rounded-3xl shadow-2xl z-10 max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// ─── INPUT FIELD ─────────────────────────────────────────────────────────────
function Field({ label, id, ...props }: { label: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
      <input
        id={id}
        {...props}
        className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
      />
    </div>
  );
}

// ─── SHEET DRAWER ─────────────────────────────────────────────────────────────
function Sheet({ open, onClose, material, onUpdateThreshold }: { open: boolean; onClose: () => void; material: Material | null; onUpdateThreshold: (id: string, val: number) => void }) {
  const [activeTab, setActiveTab] = useState<"inward" | "formulation" | "ledger">("inward");
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState("");

  useEffect(() => {
    if (material) {
      setEditVal(material.min_threshold.toString());
      setIsEditing(false);
    }
  }, [material]);

  const tabs = [
    { key: "inward" as const,      label: "Inward History",    icon: <History size={14} /> },
    { key: "formulation" as const, label: "Formulation Matrix",icon: <FlaskConical size={14} /> },
    { key: "ledger" as const,      label: "Stock Ledger",      icon: <BookOpen size={14} /> },
  ];

  const isLow = material ? material.current_stock <= material.min_threshold : false;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full z-50 w-full max-w-2xl bg-background border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* Sheet Header */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-border bg-card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Package size={18} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground leading-tight">{material?.name}</h2>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{material?.id} · {material?.category}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {/* Stock Summary Cards */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-muted/60 rounded-2xl p-3 border border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Current Stock</p>
              <p className={`text-xl font-black font-mono ${isLow ? "text-destructive" : "text-primary"}`}>
                {formatNum(material?.current_stock || 0)}
                <span className="text-xs font-sans text-muted-foreground ml-1">{material?.unit}</span>
              </p>
            </div>
            <div className="bg-muted/60 rounded-2xl p-3 border border-border flex flex-col justify-between">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Min Threshold</p>
              {isEditing ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    type="number"
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    className="w-16 bg-background border border-border rounded px-1.5 py-0.5 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const val = parseFloat(editVal);
                      if (isNaN(val) || val < 0) {
                        alert("Please enter a valid threshold.");
                        return;
                      }
                      if (material) {
                        const res = await updateMaterialThreshold(material.id, val);
                        if (res.success) {
                          onUpdateThreshold(material.id, val);
                          setIsEditing(false);
                        } else {
                          alert("Failed to update threshold: " + res.error);
                        }
                      }
                    }}
                    className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-bold hover:bg-primary-hover transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditVal(material?.min_threshold?.toString() || "0");
                      setIsEditing(false);
                    }}
                    className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded hover:bg-muted/80 transition-colors cursor-pointer"
                  >
                    X
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xl font-black font-mono text-foreground">
                    {formatNum(material?.min_threshold || 0)}
                    <span className="text-xs font-sans text-muted-foreground ml-1">{material?.unit}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditVal(material?.min_threshold?.toString() || "0");
                      setIsEditing(true);
                    }}
                    className="p-0.5 hover:bg-muted text-primary hover:text-primary-hover rounded transition-colors cursor-pointer"
                    title="Edit Threshold"
                  >
                    <PlusCircle size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="bg-muted/60 rounded-2xl p-3 border border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Status</p>
              {isLow ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-destructive mt-1">
                  <TrendingDown size={15} /> Low Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-success mt-1">
                  <CheckCircle2 size={15} /> In Stock
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-muted p-1 rounded-2xl border border-border">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-card text-primary shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sheet Body */}
        <div className="flex-1 overflow-y-auto bg-background">

          {/* TAB 1: INWARD HISTORY */}
          {activeTab === "inward" && (
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-4">All purchase inward records for this material.</p>
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/60 border-b border-border">
                      {["Date", "Supplier", "Qty Added", "Invoice Ref"].map((h) => (
                        <th key={h} className={`py-3 px-4 text-[11px] text-muted-foreground uppercase tracking-wider font-semibold ${h === "Qty Added" ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(material?.inwardHistory || []).map((row, i) => (
                      <tr key={i} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{row.date}</td>
                        <td className="py-3 px-4 text-foreground font-medium">{row.vendor}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-bold text-primary">+{formatNum(row.qty)}</span>
                          <span className="text-muted-foreground text-xs ml-1">{material?.unit}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-muted text-muted-foreground text-xs font-mono px-2 py-1 rounded-lg border border-border">
                            {row.invoice_ref}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!material?.inwardHistory?.length && (
                  <p className="py-10 text-center text-muted-foreground text-sm">No inward records found.</p>
                )}
              </div>
              {!!material?.inwardHistory?.length && (
                <div className="mt-4 flex justify-end">
                  <div className="bg-card border border-border rounded-2xl px-5 py-3 text-sm shadow-sm">
                    <span className="text-muted-foreground">Total Purchased: </span>
                    <span className="font-black font-mono text-primary ml-2">
                      {formatNum(material.inwardHistory.reduce((s, r) => s + r.qty, 0))} {material.unit}
                    </span>
                    <span className="text-muted-foreground mx-3">|</span>
                    <span className="text-muted-foreground">Total Value: </span>
                    <span className="font-black font-mono text-foreground ml-2">
                      ₹{formatNum(material.inwardHistory.reduce((s, r) => s + r.qty * r.rate, 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FORMULATION MATRIX */}
          {activeTab === "formulation" && (
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-4">Products that depend on this raw material, with usage details per batch.</p>
              <div className="space-y-3">
                {(material?.formulations || []).map((f, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-bold text-foreground text-sm">{f.product}</p>
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">{f.sku}</p>
                      </div>
                      <span className="text-xs font-mono bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-xl font-bold flex-shrink-0">
                        {f.usage_pct}% of batch
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/60 rounded-xl px-3 py-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Qty per Batch</p>
                        <p className="font-mono font-bold text-foreground text-sm mt-0.5">
                          {formatNum(f.qty_per_batch)} <span className="text-xs text-muted-foreground">{material?.unit}</span>
                        </p>
                      </div>
                      <div className="bg-muted/60 rounded-xl px-3 py-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Batch Size</p>
                        <p className="font-mono font-bold text-foreground text-sm mt-0.5">{f.batch_size}</p>
                      </div>
                    </div>
                    {material && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Batches possible with current stock:</span>
                        <span className={`font-black font-mono ${Math.floor(material.current_stock / f.qty_per_batch) < 2 ? "text-destructive" : "text-success"}`}>
                          {Math.floor(material.current_stock / f.qty_per_batch)} batches
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {!material?.formulations?.length && (
                  <p className="py-10 text-center text-muted-foreground text-sm">Not used in any active formulations.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STOCK LEDGER */}
          {activeTab === "ledger" && (
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-4">Chronological ledger of all stock movements proving the current balance.</p>
              <div className="relative pl-5">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-3">
                  {(material?.ledgerLogs || []).map((entry, i) => (
                    <div key={i} className="relative flex gap-4">
                      <div className={`absolute -left-[17px] top-4 w-3 h-3 rounded-full border-2 ring-2 ring-background flex-shrink-0 ${
                        entry.type === "IN"     ? "bg-success border-success" :
                        entry.type === "OUT"    ? "bg-destructive border-destructive" :
                                                  "bg-warning border-warning"
                      }`} />
                      <div className="flex-1 ml-2">
                        <div className="bg-card border border-border rounded-2xl p-4 hover:border-primary/20 hover:shadow-sm transition-all">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {entry.type === "IN" && (
                                <span className="flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-lg border border-success/20">
                                  <ArrowDownCircle size={11} /> INWARD
                                </span>
                              )}
                              {entry.type === "OUT" && (
                                <span className="flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-lg border border-destructive/20">
                                  <ArrowUpCircle size={11} /> OUTWARD
                                </span>
                              )}
                              {entry.type === "ADJUST" && (
                                <span className="flex items-center gap-1 text-xs font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-lg border border-warning/20">
                                  <RotateCcw size={11} /> ADJUST
                                </span>
                              )}
                              <span className="bg-muted text-muted-foreground text-[10px] font-mono px-2 py-0.5 rounded-lg border border-border">
                                {entry.reference}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">{entry.date}</span>
                          </div>
                          <p className="text-sm text-foreground mb-3">{entry.description}</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-muted/60 rounded-xl px-2.5 py-2">
                              <p className="text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">In</p>
                              <p className="font-mono font-bold text-success mt-0.5">
                                {entry.qty_in != null ? `+${formatNum(entry.qty_in)}` : "—"}
                              </p>
                            </div>
                            <div className="bg-muted/60 rounded-xl px-2.5 py-2">
                              <p className="text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">Out</p>
                              <p className="font-mono font-bold text-destructive mt-0.5">
                                {entry.qty_out != null ? `-${formatNum(entry.qty_out)}` : "—"}
                              </p>
                            </div>
                            <div className="bg-muted/60 rounded-xl px-2.5 py-2">
                              <p className="text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">Balance</p>
                              <p className="font-mono font-bold text-foreground mt-0.5">{formatNum(entry.balance)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!material?.ledgerLogs?.length && (
                    <p className="py-10 text-center text-muted-foreground text-sm ml-4">No ledger entries found.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [search, setSearch] = useState("");
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [newMat, setNewMat] = useState({ name: "", category: "", unit: "KG", min_threshold: "", initial_qty: "", rate: "", invoice_ref: "", supplier: "" });
  const [addError, setAddError] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [jsonResult, setJsonResult] = useState<{ success: boolean; message: string } | null>(null);

  // Unified Procurement Purchase History State
  const [isPurchaseHistoryOpen, setIsPurchaseHistoryOpen] = useState(false);

  // Stock Transfer Form State
  const [isStockTransferOpen, setIsStockTransferOpen] = useState(false);
  const [transferSourceId, setTransferSourceId] = useState("");
  const [transferTargetId, setTransferTargetId] = useState("");
  const [transferQty, setTransferQty] = useState("");
  const [transferRef, setTransferRef] = useState("");
  const [transferError, setTransferError] = useState("");
  const [isTransferPending, setIsTransferPending] = useState(false);

  // Stock Adjustment Form State
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [adjustMaterialId, setAdjustMaterialId] = useState("");
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustRef, setAdjustRef] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustError, setAdjustError] = useState("");
  const [isAdjustPending, setIsAdjustPending] = useState(false);

  const handleUpdateThreshold = useCallback((id: string, newThreshold: number) => {
    setMaterials(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, min_threshold: newThreshold };
      }
      return m;
    }));
    setSelectedMaterial(prev => {
      if (prev && prev.id === id) {
        return { ...prev, min_threshold: newThreshold };
      }
      return prev;
    });
  }, []);

  const loadSummary = async () => {
    const res = await getInventorySummary();
    if (res.success && res.data) {
      const items = (res.data.allMaterials || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        unit: m.unit,
        current_stock: m.current_stock,
        min_threshold: m.min_threshold,
        supplier: m.supplier || "—",
        inwardHistory: [],
        formulations: [],
        ledgerLogs: []
      }));
      setMaterials(items);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const filtered = useMemo(() => {
    let list = materials;
    if (showLowOnly) list = list.filter((m) => m.current_stock <= m.min_threshold);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) =>
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [materials, search, showLowOnly]);

  const lowCount = useMemo(
    () => materials.filter((m) => m.current_stock <= m.min_threshold).length,
    [materials]
  );

  const handleRowClick = useCallback(async (mat: Material) => {
    setSelectedMaterial(mat);
    setSheetOpen(true);

    const res = await getMaterialDetails(mat.id);
    if (res.success && res.data) {
      const apiFormulations = (res.data.formulations || []).map((f: any) => ({
        product: f.products?.name || "Unknown Product",
        sku: f.products?.sku || "-",
        usage_pct: Number(f.usage_percentage) || Number(f.quantity_per_unit * 100) || 0,
        qty_per_batch: Number(f.quantity_per_unit * 1000) || 0,
        batch_size: "1000 L"
      }));

      const apiLedgerLogs = (res.data.stockLogs || []).map((l: any) => ({
        date: l.date,
        type: l.type as "IN" | "OUT" | "ADJUST",
        reference: l.reference || "-",
        description: l.type === "IN" ? `Inward from ${l.supplier_or_buyer || 'Supplier'}` : l.type === "OUT" ? `Consumed in production` : `Stock adjustment`,
        qty_in: l.type === "IN" ? Number(l.qty) : null,
        qty_out: l.type === "OUT" ? Number(l.qty) : null,
        balance: Number(l.resulting_stock)
      }));

      const apiInwardHistory = (res.data.purchaseHistory || []).map((l: any) => ({
        date: l.date,
        vendor: l.vendor || l.supplier_or_buyer || "—",
        qty: Number(l.qty),
        rate: 0,
        invoice_ref: l.reference || "-"
      }));

      setSelectedMaterial(prev => {
        if (!prev || prev.id !== mat.id) return prev;
        return {
          ...prev,
          formulations: apiFormulations,
          ledgerLogs: apiLedgerLogs,
          inwardHistory: apiInwardHistory
        };
      });

      setMaterials(prevList => prevList.map(m => {
        if (m.id === mat.id) {
          return {
            ...m,
            formulations: apiFormulations,
            ledgerLogs: apiLedgerLogs,
            inwardHistory: apiInwardHistory
          };
        }
        return m;
      }));
    }
  }, [materials]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMaterial = async () => {
    if (!newMat.name.trim()) return setAddError("Material name is required.");
    if (!newMat.category.trim()) return setAddError("Category is required.");
    const threshold = parseFloat(newMat.min_threshold);
    if (isNaN(threshold) || threshold < 0) return setAddError("Invalid threshold value.");
    
    const qty = parseFloat(newMat.initial_qty) || 0;
    const rate = parseFloat(newMat.rate) || 0;
    const vendor = newMat.supplier.trim() || "—";
    const invoice_ref = newMat.invoice_ref.trim() || "—";
    const today = new Date().toISOString().split("T")[0];

    setIsSubmitting(true);
    setAddError("");

    try {
      const res = await createMaterialAndLog({
        name: newMat.name.trim(),
        category: newMat.category.trim(),
        unit: newMat.unit,
        min_stock: threshold,
        initial_qty: qty,
        rate: rate,
        supplier: vendor,
        invoice_ref: invoice_ref
      });

      if (!res.success) {
        setAddError(res.error || "Failed to save to database");
        setIsSubmitting(false);
        return;
      }

      // Add to local state (UI mock) as well so it shows immediately
      const inwardHistory = qty > 0 ? [{ date: today, vendor, qty, rate, invoice_ref }] : [];
      const ledgerLogs = qty > 0 ? [{ date: today, type: "IN" as const, reference: invoice_ref, description: `Initial Stock – ${vendor}`, qty_in: qty, qty_out: null, balance: qty }] : [];

      const entry: Material = {
        id: res.material?.id || `MAT-${String(materials.length + 1).padStart(3, "0")}`,
        name: newMat.name.trim(),
        category: newMat.category.trim(),
        unit: newMat.unit,
        current_stock: qty,
        min_threshold: threshold,
        supplier: vendor,
        inwardHistory: inwardHistory,
        formulations: [],
        ledgerLogs: ledgerLogs,
      };
      setMaterials((p) => [...p, entry]);
      setNewMat({ name: "", category: "", unit: "KG", min_threshold: "", initial_qty: "", rate: "", invoice_ref: "", supplier: "" });
      setAddDialogOpen(false);
    } catch (err: any) {
      setAddError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJsonInward = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const entries: { material_id: string; qty: number; vendor?: string; supplier?: string; rate: number; invoice_ref: string }[] =
        Array.isArray(parsed) ? parsed : [parsed];
      let updated = 0;
      const today = new Date().toISOString().split("T")[0];
      setMaterials((prev) =>
        prev.map((mat) => {
          const entry = entries.find((e) => e.material_id === mat.id);
          if (!entry) return mat;
          updated++;
          const supplierName = entry.supplier || entry.vendor || "—";
          const newStock = mat.current_stock + (entry.qty || 0);
          return {
            ...mat,
            current_stock: newStock,
            inwardHistory: [{ date: today, vendor: supplierName, qty: entry.qty || 0, rate: entry.rate || 0, invoice_ref: entry.invoice_ref || `JSON-${Date.now()}` }, ...mat.inwardHistory],
            ledgerLogs: [{ date: today, type: "IN", reference: entry.invoice_ref || `JSON-${Date.now()}`, description: `Quick Inward – ${supplierName}`, qty_in: entry.qty, qty_out: null, balance: newStock }, ...mat.ledgerLogs],
          };
        })
      );
      setJsonResult({ success: true, message: `✓ Successfully updated ${updated} material(s).` });
    } catch {
      setJsonResult({ success: false, message: "✕ Invalid JSON. Please check the format and try again." });
    }
  };

  // Stock Adjustment Executer
  const handleStockAdjustment = async () => {
    if (!adjustMaterialId || !adjustQty) return;
    const qtyNum = parseFloat(adjustQty);
    if (isNaN(qtyNum) || qtyNum === 0) {
      setAdjustError(t("Please enter a non-zero adjustment quantity."));
      return;
    }
    const mat = materials.find(m => m.id === adjustMaterialId);
    if (mat && mat.current_stock + qtyNum < 0) {
      setAdjustError(t("Resulting stock cannot be negative."));
      return;
    }

    setIsAdjustPending(true);
    try {
      const res = await adjustStock({
        materialId: adjustMaterialId,
        qtyChange: qtyNum,
        reference: adjustRef || "MANUAL-ADJ",
        reason: adjustReason || "Manual adjustment"
      });

      if (res.success) {
        // Reload all materials summary from DB
        await loadSummary();
        setIsAdjustStockOpen(false);
        setAdjustQty("");
        setAdjustRef("");
        setAdjustReason("");
        setAdjustMaterialId("");
        alert(t("Stock adjusted successfully!"));
      } else {
        setAdjustError(res.error || t("Failed to adjust stock."));
      }
    } catch (err: any) {
      setAdjustError(err.message || t("An error occurred."));
    } finally {
      setIsAdjustPending(false);
    }
  };

  // Stock Transfer Executer
  const handleStockTransfer = async () => {
    if (!transferSourceId || !transferTargetId || !transferQty) return;
    if (transferSourceId === transferTargetId) {
      setTransferError(t("Source and Target materials must be different."));
      return;
    }
    const qtyNum = parseFloat(transferQty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setTransferError(t("Please enter a valid transfer quantity (> 0)."));
      return;
    }
    const sourceMat = materials.find(m => m.id === transferSourceId);
    if (sourceMat && sourceMat.current_stock < qtyNum) {
      setTransferError(t("Insufficient stock in source material."));
      return;
    }

    setIsTransferPending(true);
    try {
      const res = await transferStock({
        sourceId: transferSourceId,
        targetId: transferTargetId,
        qty: qtyNum,
        reference: transferRef || "TRANSFER-TR"
      });

      if (res.success) {
        // Reload summary from DB
        await loadSummary();
        setIsStockTransferOpen(false);
        setTransferQty("");
        setTransferRef("");
        setTransferSourceId("");
        setTransferTargetId("");
        alert(t("Stock transferred successfully!"));
      } else {
        setTransferError(res.error || t("Failed to transfer stock."));
      }
    } catch (err: any) {
      setTransferError(err.message || t("An error occurred."));
    } finally {
      setIsTransferPending(false);
    }
  };

  const JSON_EXAMPLE = `[\n  {\n    "material_id": "MAT-002",\n    "qty": 800,\n    "supplier": "Rajasthan Minerals Co.",\n    "rate": 42,\n    "invoice_ref": "PO-2026-101"\n  }\n]`;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 relative overflow-x-hidden p-6">

      {/* Breadcrumb Navigation */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
        <span>{t("Home")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Raw Materials & Inventory")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Boxes className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Raw Materials & Inventory")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {materials.length} {t("materials tracked")} &nbsp;·&nbsp;
              <span className={lowCount > 0 ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}>
                {lowCount} {t("below threshold")}
              </span>
            </p>
          </div>
        </div>

        {/* Quick Actions Row (Suppliers button removed, others activated) */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
          <button onClick={() => { setAddError(""); setAddDialogOpen(true); }} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer">
            <PlusCircle size={14} /> {t("Add Master Item")}
          </button>
          <button onClick={() => { setJsonText(""); setJsonResult(null); setJsonDialogOpen(true); }} className="bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl text-xs font-bold border border-border/60 transition-colors cursor-pointer">
            {t("Quick Inward")}
          </button>
          <button 
            onClick={() => setIsPurchaseHistoryOpen(true)}
            className="bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl text-xs font-bold border border-border/60 transition-colors cursor-pointer"
          >
            {t("Purchase History")}
          </button>
          <button 
            onClick={() => {
              setTransferSourceId("");
              setTransferTargetId("");
              setTransferQty("");
              setTransferRef("");
              setTransferError("");
              setIsStockTransferOpen(true);
            }}
            className="bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl text-xs font-bold border border-border/60 transition-colors cursor-pointer"
          >
            {t("Stock Transfer")}
          </button>
          <button 
            onClick={() => {
              setAdjustMaterialId("");
              setAdjustQty("");
              setAdjustRef("");
              setAdjustReason("");
              setAdjustError("");
              setIsAdjustStockOpen(true);
            }}
            className="bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl text-xs font-bold border border-border/60 transition-colors cursor-pointer"
          >
            {t("Adjust Stock")}
          </button>
        </div>
      </div>

      {/* ── LOW STOCK ALERT BANNER ── */}
      {lowCount > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-destructive" />
            <h2 className="text-sm font-bold text-destructive">Critical Stock Alerts</h2>
            <span className="ml-auto text-xs text-muted-foreground">Click a card to view details</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {materials.filter((m) => m.current_stock <= m.min_threshold).map((m) => (
              <button
                key={m.id}
                onClick={() => handleRowClick(m)}
                className="text-left bg-card border border-destructive/20 rounded-2xl p-3 hover:border-destructive/50 hover:shadow-sm transition-all group cursor-pointer"
              >
                <p className="font-bold text-foreground text-xs leading-tight group-hover:text-primary transition-colors">{m.name}</p>
                <p className="font-mono font-black text-destructive text-lg mt-1">
                  {formatNum(m.current_stock)}
                  <span className="text-xs font-sans text-muted-foreground ml-1">{m.unit}</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">min: {formatNum(m.min_threshold)} {m.unit}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN TABLE ── */}
      <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-border">
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search name, category, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <span className="text-sm text-muted-foreground font-medium">Show Low Stock Only</span>
            <div
              onClick={() => setShowLowOnly((v) => !v)}
              className={`relative w-11 h-6 rounded-full border-2 transition-all duration-200 ${showLowOnly ? "bg-destructive border-destructive" : "bg-muted border-border"}`}
            >
              <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all duration-200 ${showLowOnly ? "left-5" : "left-0.5"}`} />
            </div>
          </label>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["ID", "Material Name", "Category", "Unit", "Current Stock", "Min Threshold", "Status", ""].map((h) => (
                  <th key={h} className={`py-3.5 px-4 text-[11px] text-muted-foreground uppercase tracking-wider font-bold ${h === "Current Stock" || h === "Min Threshold" ? "text-right" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-muted-foreground">
                    <Layers size={32} className="mx-auto mb-3 opacity-30" />
                    No materials match your filters.
                  </td>
                </tr>
              )}
              {filtered.map((mat) => {
                const isLow = mat.current_stock <= mat.min_threshold;
                return (
                  <tr
                    key={mat.id}
                    onClick={() => handleRowClick(mat)}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-mono text-xs text-muted-foreground">{mat.id}</td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{mat.name}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${getCategoryColor(mat.category)}`}>
                        {mat.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-xs font-mono font-semibold">{mat.unit}</td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-mono font-bold text-base ${isLow ? "text-destructive" : "text-primary"}`}>
                        {formatNum(mat.current_stock)}
                      </span>
                      <span className="text-muted-foreground text-xs ml-1">{mat.unit}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-mono text-muted-foreground">{formatNum(mat.min_threshold)}</span>
                      <span className="text-muted-foreground/50 text-xs ml-1">{mat.unit}</span>
                    </td>
                    <td className="py-4 px-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 px-2.5 py-1 rounded-xl">
                          <XCircle size={12} /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-xl">
                          <CheckCircle2 size={12} /> In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
          <span>Showing {filtered.length} of {materials.length} materials</span>
          <span>Click any row to open full material profile →</span>
        </div>
      </div>

      {/* ── ADD MATERIAL DIALOG ── */}
      <Modal open={addDialogOpen} onClose={() => setAddDialogOpen(false)} title="Add Master Item">
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-4">
            <h3 className="text-sm font-bold text-foreground mb-2">Basic Details</h3>
            <Field label="Material Name" id="mat-name" placeholder="e.g. Acrylic Emulsion" value={newMat.name} onChange={(e) => setNewMat((p) => ({ ...p, name: e.target.value }))} />
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Category</label>
              <select
                id="mat-cat"
                value={newMat.category}
                onChange={(e) => setNewMat((p) => ({ ...p, category: e.target.value }))}
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
              >
                <option value="">Select Category...</option>
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Unit" id="mat-unit" placeholder="KG / LTR / NOS" value={newMat.unit} onChange={(e) => setNewMat((p) => ({ ...p, unit: e.target.value }))} />
              <Field label="Min Threshold" id="mat-threshold" type="number" placeholder="500" value={newMat.min_threshold} onChange={(e) => setNewMat((p) => ({ ...p, min_threshold: e.target.value }))} />
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-4">
            <h3 className="text-sm font-bold text-foreground mb-2">Initial Purchase Inward (Optional)</h3>
            <Field label="Supplier Name" id="mat-supplier" placeholder="e.g. ChemCorp India" value={newMat.supplier} onChange={(e) => setNewMat((p) => ({ ...p, supplier: e.target.value }))} />
            <Field label="Invoice / PO Number" id="mat-invoice" placeholder="e.g. INV-2026-001" value={newMat.invoice_ref} onChange={(e) => setNewMat((p) => ({ ...p, invoice_ref: e.target.value }))} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Initial Quantity" id="mat-qty" type="number" placeholder="e.g. 1000" value={newMat.initial_qty} onChange={(e) => setNewMat((p) => ({ ...p, initial_qty: e.target.value }))} />
              <Field label="Rate per Unit (₹)" id="mat-rate" type="number" placeholder="e.g. 120" value={newMat.rate} onChange={(e) => setNewMat((p) => ({ ...p, rate: e.target.value }))} />
            </div>
            {parseFloat(newMat.initial_qty) > 0 && parseFloat(newMat.rate) > 0 && (
              <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex justify-between items-center">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Total Bill Amount</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  ₹{(parseFloat(newMat.initial_qty) * parseFloat(newMat.rate)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          {addError && <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-xl">{addError}</p>}
          <p className="text-xs text-muted-foreground">Any quantity entered will automatically create an inward history and ledger entry.</p>
          <button onClick={handleAddMaterial} disabled={isSubmitting} className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary-hover transition-all text-sm shadow-sm mt-2 disabled:opacity-50 cursor-pointer">
            {isSubmitting ? "Saving to Database..." : "Create Material Profile"}
          </button>
        </div>
      </Modal>

      {/* ── JSON INWARD DIALOG ── */}
      <Modal open={jsonDialogOpen} onClose={() => setJsonDialogOpen(false)} title="Quick Inward via JSON" width="max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Paste JSON Inward Data</label>
            <textarea
              rows={9}
              value={jsonText}
              onChange={(e) => { setJsonText(e.target.value); setJsonResult(null); }}
              placeholder={JSON_EXAMPLE}
              className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-sm text-foreground font-mono placeholder-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-y"
            />
          </div>
          <div className="bg-muted/60 border border-border rounded-2xl p-4 text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground mb-2">Required JSON fields per entry:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
              {[["material_id","— e.g. \"MAT-002\""],["qty","— quantity to add (number)"],["supplier (or vendor)","— supplier name"],["rate","— rate per unit (number)"],["invoice_ref","— PO / invoice number"]].map(([k,v]) => (
                <React.Fragment key={k}><span className="text-primary">{k}</span><span>{v}</span></React.Fragment>
              ))}
            </div>
          </div>
          {jsonResult && (
            <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-3 rounded-2xl border ${jsonResult.success ? "bg-success/10 border-success/30 text-success" : "bg-destructive/10 border-destructive/30 text-destructive"}`}>
              {jsonResult.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {jsonResult.message}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => { setJsonText(JSON_EXAMPLE); setJsonResult(null); }} className="flex-1 py-2.5 bg-muted border border-border text-foreground font-semibold rounded-2xl hover:border-primary/30 transition-all text-sm cursor-pointer">
              Load Example
            </button>
            <button onClick={handleJsonInward} disabled={!jsonText.trim()} className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary-hover transition-all text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
              Parse &amp; Apply Inward
            </button>
          </div>
        </div>
      </Modal>

      {/* ── PURCHASE HISTORY DIALOG ── */}
      <Modal open={isPurchaseHistoryOpen} onClose={() => setIsPurchaseHistoryOpen(false)} title="Procurement & Purchase History" width="max-w-4xl">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Comprehensive historical logs of raw material procurements.</p>
          <div className="overflow-x-auto rounded-2xl border border-border max-h-[400px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted text-muted-foreground font-black uppercase tracking-wider sticky top-0 bg-card z-10">
                <tr className="border-b border-border">
                  <th className="p-3">{t("Date")}</th>
                  <th className="p-3">{t("Material ID")}</th>
                  <th className="p-3">{t("Material Name")}</th>
                  <th className="p-3">{t("Quantity")}</th>
                  <th className="p-3">{t("Invoice Ref")}</th>
                  <th className="p-3">{t("Supplier")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {materials.flatMap(m => (m.inwardHistory || []).map(h => ({ ...h, id: m.id, name: m.name, unit: m.unit }))).sort((a,b) => b.date.localeCompare(a.date)).map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/15">
                    <td className="p-3 font-mono text-muted-foreground">{row.date}</td>
                    <td className="p-3 font-mono font-bold text-foreground">{row.id}</td>
                    <td className="p-3 font-bold text-foreground">{row.name}</td>
                    <td className="p-3 font-mono font-bold text-primary">+{formatNum(row.qty)} {row.unit}</td>
                    <td className="p-3 font-mono text-muted-foreground"><span className="bg-muted px-2 py-0.5 rounded-lg border border-border">{row.invoice_ref}</span></td>
                    <td className="p-3 font-semibold text-foreground">{row.vendor}</td>
                  </tr>
                ))}
                {materials.every(m => !m.inwardHistory || m.inwardHistory.length === 0) && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground font-bold">
                      {t("No purchase records found.")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* ── STOCK TRANSFER DIALOG ── */}
      <Modal open={isStockTransferOpen} onClose={() => setIsStockTransferOpen(false)} title="Stock Transfer (Inter-Material)" width="max-w-lg">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Transfer raw materials quantities between material profiles.</p>
          
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{t("Source Material")}</label>
            <select
              value={transferSourceId}
              onChange={e => {
                setTransferSourceId(e.target.value);
                setTransferError("");
              }}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary font-bold"
            >
              <option value="">-- Select Source Material (with Stock) --</option>
              {materials.filter(m => m.current_stock > 0).map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id}) - Stock: {m.current_stock} {m.unit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{t("Target Material")}</label>
            <select
              value={transferTargetId}
              onChange={e => {
                setTransferTargetId(e.target.value);
                setTransferError("");
              }}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary font-bold"
            >
              <option value="">-- Select Target Material --</option>
              {materials.filter(m => m.id !== transferSourceId).map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id}) - Stock: {m.current_stock} {m.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{t("Quantity to Transfer")}</label>
              <input
                type="number"
                value={transferQty}
                placeholder="e.g. 100"
                onChange={e => { setTransferQty(e.target.value); setTransferError(""); }}
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{t("Reference Code")}</label>
              <input
                type="text"
                value={transferRef}
                placeholder="e.g. TR-2026-001"
                onChange={e => { setTransferRef(e.target.value); setTransferError(""); }}
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          {transferError && (
            <p className="text-xs text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
              {transferError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              disabled={isTransferPending || !transferSourceId || !transferTargetId || !transferQty}
              onClick={handleStockTransfer}
              className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {isTransferPending ? t("Transferring...") : t("Execute Transfer")}
            </button>
            <button
              onClick={() => setIsStockTransferOpen(false)}
              className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border rounded-xl transition-all cursor-pointer"
            >
              {t("Cancel")}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── STOCK ADJUSTMENT DIALOG ── */}
      <Modal open={isAdjustStockOpen} onClose={() => setIsAdjustStockOpen(false)} title="Manual Stock Adjustment" width="max-w-lg">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Manually add or deduct raw materials stock with tracking logs.</p>
          
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{t("Select Material")}</label>
            <select
              value={adjustMaterialId}
              onChange={e => {
                setAdjustMaterialId(e.target.value);
                setAdjustError("");
              }}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary font-bold"
            >
              <option value="">-- Select Material to Adjust --</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id}) - Current: {m.current_stock} {m.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{t("Adjustment Qty (+/-)")}</label>
              <input
                type="number"
                value={adjustQty}
                placeholder="e.g. 50 or -30"
                onChange={e => { setAdjustQty(e.target.value); setAdjustError(""); }}
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{t("Reference Code")}</label>
              <input
                type="text"
                value={adjustRef}
                placeholder="e.g. ADJ-2026-001"
                onChange={e => { setAdjustRef(e.target.value); setAdjustError(""); }}
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{t("Reason for Adjustment")}</label>
            <input
              type="text"
              value={adjustReason}
              placeholder="e.g. Spillage, audit corrections, or bonus stock"
              onChange={e => setAdjustReason(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          {adjustError && (
            <p className="text-xs text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
              {adjustError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              disabled={isAdjustPending || !adjustMaterialId || !adjustQty}
              onClick={handleStockAdjustment}
              className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {isAdjustPending ? t("Saving...") : t("Save Adjustment")}
            </button>
            <button
              onClick={() => setIsAdjustStockOpen(false)}
              className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border rounded-xl transition-all cursor-pointer"
            >
              {t("Cancel")}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MATERIAL SHEET ── */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} material={selectedMaterial} onUpdateThreshold={handleUpdateThreshold} />
    </div>
  );
}
