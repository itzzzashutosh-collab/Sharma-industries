"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import {
  BookOpen,
  Search,
  AlertTriangle,
  MinusCircle,
  X,
  Package,
  History,
  TrendingDown,
  Sparkles,
  Clock,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { consumeMaterial } from "../inventory/actions";
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

const formatNum = (n: number) => n.toLocaleString("en-IN");

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl z-10 max-h-[90vh] flex flex-col">
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

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function StockRegisterPage() {
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"registry" | "history">("registry");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isConsumeOpen, setIsConsumeOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Consume Modal State
  const [consumeQty, setConsumeQty] = useState("");
  const [consumeRef, setConsumeRef] = useState("");
  const [consumeReason, setConsumeReason] = useState("");
  const [consumeError, setConsumeError] = useState("");

  const loadData = async () => {
    const res = await getInventorySummary();
    if (res.success && res.data) {
      // Map all materials and fetch details to get logs populated
      const baseMaterials = (res.data.allMaterials || []).map((m: any) => ({
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

      // Fetch logs for all materials in parallel to build history tab
      const populated = await Promise.all(
        baseMaterials.map(async (m: Material) => {
          const detailRes = await getMaterialDetails(m.id);
          if (detailRes.success && detailRes.data) {
            const logs = (detailRes.data.stockLogs || []).map((l: any) => ({
              date: l.date,
              type: l.type as "IN" | "OUT" | "ADJUST",
              reference: l.reference || "-",
              description: l.type === "IN" ? `Inward procurement` : l.type === "OUT" ? `Consumed in production` : `Stock adjustment`,
              qty_in: l.type === "IN" ? Number(l.qty) : null,
              qty_out: l.type === "OUT" ? Number(l.qty) : null,
              balance: Number(l.resulting_stock)
            }));
            return { ...m, ledgerLogs: logs };
          }
          return m;
        })
      );
      setMaterials(populated);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMaterials = useMemo(() => {
    if (!search.trim()) return materials;
    const q = search.toLowerCase();
    return materials.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  }, [materials, search]);

  const allConsumptions = useMemo(() => {
    const list: { date: string; materialId: string; materialName: string; qty: number; reference: string; reason: string; unit: string }[] = [];
    materials.forEach(m => {
      (m.ledgerLogs || []).forEach(log => {
        if (log.type === "OUT" && log.qty_out) {
          list.push({
            date: log.date,
            materialId: m.id,
            materialName: m.name,
            qty: log.qty_out,
            reference: log.reference,
            reason: log.description || "Production run",
            unit: m.unit
          });
        }
      });
    });
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [materials]);

  const handleConsumeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    const qtyVal = parseFloat(consumeQty);
    if (isNaN(qtyVal) || qtyVal <= 0) {
      setConsumeError(t("Please enter a valid quantity greater than zero."));
      return;
    }

    if (qtyVal > selectedMaterial.current_stock) {
      setConsumeError(t("Cannot consume more than current available stock."));
      return;
    }

    setConsumeError("");
    startTransition(async () => {
      try {
        const res = await consumeMaterial({
          materialId: selectedMaterial.id,
          qty: qtyVal,
          reference: consumeRef || "PRODUCTION-RUN",
          reason: consumeReason || "Consumed for production batch"
        });

        if (res.success) {
          alert(t("Stock usage logged successfully!"));
          setIsConsumeOpen(false);
          setConsumeQty("");
          setConsumeRef("");
          setConsumeReason("");
          loadData(); // reload
        } else {
          setConsumeError(res.error || t("Failed to save consumption."));
        }
      } catch (err: any) {
        setConsumeError(err.message || t("An error occurred."));
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 p-6">
      {/* Breadcrumbs */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
        <span>{t("Home")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span>{t("Factory Operations")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Stock Register")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <BookOpen className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Personal Stock Register")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {materials.length} {t("materials in registry")} &nbsp;·&nbsp;
              <span className="text-primary font-bold">{allConsumptions.length} {t("production logs")}</span>
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 border-t border-border/60 pt-3">
          <button
            onClick={() => setActiveTab("registry")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "registry"
                ? "bg-primary text-white shadow-sm"
                : "bg-background text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            {t("Active Stock Registry")}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-primary text-white shadow-sm"
                : "bg-background text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            {t("Consumption Register")}
          </button>
        </div>
      </div>

      {/* Registry Tab */}
      {activeTab === "registry" && (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">{t("Total Active Profiles")}</span>
              <p className="text-2xl font-black text-foreground mt-1">{materials.length}</p>
            </div>
            <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">{t("Consumptions Recorded")}</span>
              <p className="text-2xl font-black text-primary mt-1">{allConsumptions.reduce((acc, curr) => acc + curr.qty, 0).toLocaleString()} units</p>
            </div>
            <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">{t("Critical Low Warning")}</span>
              <p className="text-2xl font-black text-rose-500 mt-1">{materials.filter(m => m.current_stock <= m.min_threshold).length}</p>
            </div>
          </div>

          {/* Main Registry Table */}
          <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
              <div className="relative w-full sm:w-72">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("Filter materials…")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground uppercase font-black tracking-wider">
                    <th className="py-3.5 px-6">{t("Material Details")}</th>
                    <th className="py-3.5 px-6">{t("Category")}</th>
                    <th className="py-3.5 px-6 text-right">{t("Current Stock")}</th>
                    <th className="py-3.5 px-6 text-right">{t("Safety Limit")}</th>
                    <th className="py-3.5 px-6 text-right">{t("Action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredMaterials.map(m => {
                    const isLow = m.current_stock <= m.min_threshold;
                    return (
                      <tr key={m.id} className="hover:bg-muted/15 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-foreground">{m.name}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{m.id}</p>
                        </td>
                        <td className="py-4 px-6 text-xs font-semibold text-muted-foreground">
                          {m.category}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`font-mono font-black text-sm ${isLow ? "text-rose-500 animate-pulse" : "text-primary"}`}>
                            {formatNum(m.current_stock)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">{m.unit}</span>
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-muted-foreground">
                          {formatNum(m.min_threshold)} {m.unit}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            disabled={m.current_stock <= 0}
                            onClick={() => {
                              setSelectedMaterial(m);
                              setConsumeQty("");
                              setConsumeRef("");
                              setConsumeReason("");
                              setConsumeError("");
                              setIsConsumeOpen(true);
                            }}
                            className="bg-primary hover:bg-primary-hover disabled:bg-muted text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:text-muted-foreground flex items-center gap-1.5 ml-auto"
                          >
                            <MinusCircle size={13} />
                            {t("Use / Consume")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredMaterials.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground font-semibold">
                        {t("No material profiles found in register.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Consumption History Tab */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden p-6">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              {t("Chronological Stock Consumption Ledger")}
            </h2>

            <div className="overflow-x-auto border border-border rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground font-black uppercase tracking-wider">
                  <tr className="border-b border-border">
                    <th className="p-3">{t("Date")}</th>
                    <th className="p-3">{t("Material")}</th>
                    <th className="p-3">{t("Quantity Used")}</th>
                    <th className="p-3">{t("Production Ref")}</th>
                    <th className="p-3">{t("Purpose / Note")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allConsumptions.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/15 transition-colors">
                      <td className="p-3 font-mono text-muted-foreground">{row.date}</td>
                      <td className="p-3">
                        <p className="font-bold text-foreground">{row.materialName}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{row.materialId}</p>
                      </td>
                      <td className="p-3 font-mono font-bold text-rose-500">
                        -{formatNum(row.qty)} {row.unit}
                      </td>
                      <td className="p-3 font-mono">
                        <span className="bg-muted border border-border text-foreground px-2 py-0.5 rounded-lg">
                          {row.reference}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-muted-foreground">{row.reason}</td>
                    </tr>
                  ))}
                  {allConsumptions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground font-bold">
                        {t("No stock consumption records logged yet.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── CONSUME STOCK MODAL ── */}
      <Modal
        open={isConsumeOpen}
        onClose={() => setIsConsumeOpen(false)}
        title={`${t("Use / Consume Raw Material")}`}
      >
        {selectedMaterial && (
          <form onSubmit={handleConsumeSubmit} className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-black">{t("Selected Item")}</p>
                <h4 className="font-bold text-foreground text-sm mt-0.5">{selectedMaterial.name}</h4>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase font-black">{t("Available Stock")}</p>
                <p className="font-black text-primary font-mono text-base mt-0.5">
                  {formatNum(selectedMaterial.current_stock)} {selectedMaterial.unit}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                {t("Quantity to Consume")} ({selectedMaterial.unit})
              </label>
              <input
                type="number"
                step="any"
                required
                value={consumeQty}
                placeholder={t("e.g. 100")}
                onChange={e => setConsumeQty(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                {t("Production Batch Reference")}
              </label>
              <input
                type="text"
                required
                value={consumeRef}
                placeholder={t("e.g. Batch #401-Acrylic")}
                onChange={e => setConsumeRef(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                {t("Specific Purpose / Notes")}
              </label>
              <input
                type="text"
                value={consumeReason}
                placeholder={t("e.g. Mixing run for Royal Gold Emulsion")}
                onChange={e => setConsumeReason(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
              />
            </div>

            {consumeError && (
              <p className="text-xs text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                {consumeError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending || !consumeQty || !consumeRef}
                className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-2xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? t("Saving consumption...") : t("Record Stock Usage")}
              </button>
              <button
                type="button"
                onClick={() => setIsConsumeOpen(false)}
                className="flex-1 py-3 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border rounded-2xl transition-all cursor-pointer"
              >
                {t("Cancel")}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
