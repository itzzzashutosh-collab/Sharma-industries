"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { Factory, Package, AlertTriangle, DollarSign, Plus, CheckCircle, Clock, Download, RefreshCw, Smartphone, QrCode, Tag, User, X } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { startNewProductionBatch, markLaborAttendance, logFactoryExpense } from "./actions";

interface Props {
  initialProducts: any[];
  initialRawMaterials: any[];
  initialBatches: any[];
  initialLabor: any[];
  initialAttendance: any[];
  initialExpenses: any[];
  initialDealers: any[];
  initialPainters: any[];
}

export default function FactoryOperationsClient({
  initialProducts = [],
  initialRawMaterials = [],
  initialBatches = [],
  initialLabor = [],
  initialAttendance = [],
  initialExpenses = [],
  initialDealers = [],
  initialPainters = [],
}: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"production" | "materials" | "labor" | "expenses" | "qr_coupons">("production");
  const [isPending, startTransition] = useTransition();

  // Lists states
  const [products] = useState<any[]>(initialProducts);
  const [rawMaterials, setRawMaterials] = useState<any[]>(initialRawMaterials);
  const [batches, setBatches] = useState<any[]>(initialBatches);
  const [labor, setLabor] = useState<any[]>(initialLabor);
  const [attendance, setAttendance] = useState<any[]>(initialAttendance);
  const [expenses, setExpenses] = useState<any[]>(initialExpenses);
  const [dealers] = useState<any[]>(initialDealers);
  const [painters, setPainters] = useState<any[]>(initialPainters);

  // Forms and Modals State
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedProd, setSelectedProd] = useState("");
  const [quantity, setQuantity] = useState("");
  const [generating, setGenerating] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState("");
  const [cashbackValue, setCashbackValue] = useState("50");
  const [couponRegistry, setCouponRegistry] = useState<any[]>([]);
  const [loadingRegistry, setLoadingRegistry] = useState(false);
  const [refreshRegistryTrigger, setRefreshRegistryTrigger] = useState(0);

  // New Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    name: "",
    category: "OPERATIONAL",
    amount: "",
    dueDate: new Date().toISOString().split("T")[0]
  });

  // Simulation Playground states
  const [simPainter, setSimPainter] = useState("");
  const [simQrCode, setSimQrCode] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Fetch QR codes list
  useEffect(() => {
    if (activeTab === "qr_coupons") {
      setLoadingRegistry(true);
      fetch("/api/production/list-qrs")
        .then(res => res.json())
        .then(data => {
          if (data.success) setCouponRegistry(data.data || []);
        })
        .catch(err => console.error("Error loading QR registry:", err))
        .finally(() => setLoadingRegistry(false));
    }
  }, [activeTab, refreshRegistryTrigger]);

  // Pre-fill cashback amount when product changes
  useEffect(() => {
    if (selectedProd) {
      const prod = products.find(p => p.id === selectedProd);
      if (prod && prod.token_value) {
        setCashbackValue(prod.token_value.toString());
      } else {
        setCashbackValue("50");
      }
    }
  }, [selectedProd, products]);

  const activeBatchesCount = useMemo(() => {
    return batches.filter(b => b.status === "IN_PROGRESS").length;
  }, [batches]);

  const completedBucketsCount = useMemo(() => {
    return batches.filter(b => b.status === "COMPLETED").reduce((sum, b) => sum + (Number(b.quantity_produced) || Number(b.target_yield) || 0), 0);
  }, [batches]);

  const overheadCostSum = useMemo(() => {
    return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses]);

  const lowStockCount = useMemo(() => {
    return rawMaterials.filter(rm => {
      const stock = Number(rm.current_stock) || 0;
      const threshold = Number(rm.min_stock) || 100;
      return stock < threshold;
    }).length;
  }, [rawMaterials]);

  const lowStockProductsCount = useMemo(() => {
    return products.filter(p => {
      const stock = Number(p.stock) || 0;
      const threshold = Number(p.min_stock) || 10;
      return stock < threshold;
    }).length;
  }, [products]);

  const handleStartBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProd || !quantity) return;

    startTransition(async () => {
      const res = await startNewProductionBatch(selectedProd, Number(quantity));
      if (res.success) {
        const prodObj = products.find(p => p.id === selectedProd);
        const newBatch = {
          id: `BATCH-${Date.now().toString().slice(-4)}`,
          product_id: selectedProd,
          status: "IN_PROGRESS",
          target_yield: Number(quantity),
          batch_date: new Date().toISOString().split("T")[0],
          products: { product_name: prodObj ? prodObj.name : "New Product" }
        };
        setBatches(prev => [newBatch, ...prev]);
        setIsAddBatchOpen(false);
        setQuantity("");
      } else {
        alert(`Error starting batch: ${res.error}`);
      }
    });
  };

  const handleAttendanceChange = async (laborId: string, status: "Present" | "Absent") => {
    startTransition(async () => {
      const res = await markLaborAttendance(laborId, status);
      if (res.success) {
        setAttendance(prev => {
          const filtered = prev.filter(a => a.labor_id !== laborId);
          return [...filtered, { labor_id: laborId, status }];
        });
      } else {
        alert(`Error: ${res.error}`);
      }
    });
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.name || !expenseForm.amount) return;

    startTransition(async () => {
      const payload = {
        expenseName: expenseForm.name,
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        dueDate: expenseForm.dueDate
      };

      const res = await logFactoryExpense(payload);
      if (res.success) {
        const newExp = {
          id: `EXP_${Date.now().toString().slice(-4)}`,
          expense_name: payload.expenseName,
          category: payload.category,
          amount: payload.amount,
          due_date: payload.dueDate,
          status: "PENDING"
        };
        setExpenses(prev => [newExp, ...prev]);
        setIsAddExpenseOpen(false);
        setExpenseForm({ name: "", category: "OPERATIONAL", amount: "", dueDate: new Date().toISOString().split("T")[0] });
      } else {
        alert(`Error logging expense: ${res.error}`);
      }
    });
  };

  // Handle coupon range generation and allocation
  const handleGenerateQRs = async () => {
    if (!selectedProd || !quantity) {
      alert("Please select a product and enter the quantity.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/production/generate-qrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProd,
          quantity: parseInt(quantity, 10),
          dealerId: selectedDealer || null,
          tokenValue: parseInt(cashbackValue, 10) || 50
        })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const prod = products.find(p => p.id === selectedProd);
        const name = prod ? prod.name.replace(/\s+/g, "_") : selectedProd;
        a.download = `qrs_${name}_${quantity}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        alert("Loyalty QR coupons generated and package ZIP downloaded successfully!");
        setRefreshRegistryTrigger(prev => prev + 1);
        setQuantity("");
        setSelectedDealer("");
      } else {
        const err = await res.json();
        alert(err.error || "Generation failed.");
      }
    } catch (e) {
      alert("An error occurred during generation.");
    } finally {
      setGenerating(false);
    }
  };

  // Simulate coupon scan and redemption in Supabase
  const handleSimulateScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simQrCode || !simPainter) {
      alert("Please select a painter and enter/click a coupon QR code.");
      return;
    }
    setSimulating(true);
    setSimMessage(null);
    try {
      const res = await fetch("/api/production/simulate-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode: simQrCode,
          painterId: simPainter
        })
      });
      const data = await res.json();
      if (data.success) {
        setSimMessage({ text: data.message, type: "success" });
        setSimQrCode("");
        setRefreshRegistryTrigger(prev => prev + 1);
      } else {
        setSimMessage({ text: data.error || "Scan redemption failed.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setSimMessage({ text: "Communication error with scan API.", type: "error" });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 p-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Factory size={18} className="text-primary animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">{t("Factory Control Panel")}</h1>
          </div>
          <p className="text-xs text-muted-foreground ml-10">
            {t("Manage production batches, raw materials, labor wages, and loyalty coupon ranges.")}
          </p>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-primary/10 transition-all duration-300">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start">
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-wider">Buckets Produced</p>
            <div className="bg-primary/10 p-2 rounded-lg"><Package size={20} className="text-primary" /></div>
          </div>
          <p className="text-3xl font-black text-foreground mt-2">{completedBucketsCount}</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start">
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-wider">Active Batches</p>
            <div className="bg-emerald-500/10 p-2 rounded-lg"><Clock size={20} className="text-emerald-400" /></div>
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-2">{activeBatchesCount}</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-rose-500/10 transition-all duration-300">
          <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start">
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-wider">Inventory Alerts</p>
            <div className="bg-rose-500/10 p-2 rounded-lg"><AlertTriangle size={20} className="text-rose-500" /></div>
          </div>
          <p className="text-3xl font-black text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)] mt-2">{lowStockCount + lowStockProductsCount} Alerts</p>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">
            {lowStockCount} Materials · {lowStockProductsCount} Products below threshold
          </p>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-foreground/10 transition-all duration-300">
          <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start">
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-wider">Today's Overhead</p>
            <div className="bg-muted p-2 rounded-lg border border-border"><DollarSign size={20} className="text-foreground" /></div>
          </div>
          <p className="text-3xl font-black text-foreground mt-2">₹{overheadCostSum.toLocaleString()}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="flex overflow-x-auto border-b border-border hide-scrollbar">
          {(["production", "materials", "labor", "expenses", "qr_coupons"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-bold text-sm uppercase tracking-wider transition-all duration-300 border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {tab === "production" ? "Production Batches" :
               tab === "materials" ? "Raw Materials" :
               tab === "labor" ? "Labor Wages" :
               tab === "expenses" ? "Daily Expenses" :
               "Loyalty QR Coupons"}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-6 min-h-[400px]">
          
          {/* TAB 1: PRODUCTION BATCHES */}
          {activeTab === "production" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Side: Production Table */}
              <div className="lg:col-span-3 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-foreground">Current Production Run</h2>
                  <button onClick={() => setIsAddBatchOpen(true)} className="flex items-center gap-2 bg-primary text-black hover:bg-primary/95 px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer">
                    <Plus size={14} /> Start New Batch
                  </button>
                </div>
                <div className="overflow-x-auto bg-card/50 border border-border/60 rounded-2xl p-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-bold">
                        <th className="pb-4 pr-4">Batch ID</th>
                        <th className="pb-4 px-4">Product</th>
                        <th className="pb-4 px-4">Status</th>
                        <th className="pb-4 pl-4 text-right">Yield (Buckets)</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-semibold">
                      {batches.map(b => (
                        <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-4 pr-4 font-mono font-bold text-foreground">{b.id}</td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-foreground">{b.products?.product_name || "Unknown Product"}</p>
                            <p className="text-xs text-muted-foreground font-semibold mt-0.5">{b.batch_date || "Today"}</p>
                          </td>
                          <td className="py-4 px-4">
                            {b.status === "COMPLETED" ? (
                              <span className="flex items-center gap-1.5 w-fit bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                                <CheckCircle size={10} /> Completed
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 w-fit bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                                <Clock size={10} /> In-Progress
                              </span>
                            )}
                          </td>
                          <td className="py-4 pl-4 text-right font-black text-foreground">
                            {b.quantity_produced || b.target_yield || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RAW MATERIALS */}
          {activeTab === "materials" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-foreground mb-6">Raw Material Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold font-mono">
                {rawMaterials.map(rm => {
                  const stock = Number(rm.current_stock) || 0;
                  const threshold = Number(rm.min_stock) || 100;
                  const isLow = stock < threshold;
                  const maxDisplay = threshold * 3;
                  const progress = Math.min((stock / maxDisplay) * 100, 100);
                  
                  return (
                    <div key={rm.id} className="border border-border p-5 rounded-2xl bg-background hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-foreground text-lg">{rm.material_name}</h4>
                          <p className="text-xs text-muted-foreground mt-1 font-semibold">ID: {rm.id}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-black ${isLow ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'text-primary'}`}>
                            {stock} {rm.unit_of_measure || "KG"}
                          </p>
                          <p className="text-xs text-muted-foreground font-semibold">Min: {threshold} {rm.unit_of_measure || "KG"}</p>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 mb-1 overflow-hidden font-sans">
                        <div 
                          className={`h-2.5 rounded-full ${isLow ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-primary'}`} 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      {isLow && <p className="text-xs text-rose-400 font-bold mt-2">Critical Stock Level - Reorder Immediately</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: LABOR WAGES */}
          {activeTab === "labor" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-foreground">Labor & Attendance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-bold">
                      <th className="pb-4 pr-4">ID</th>
                      <th className="pb-4 px-4">Name & Role</th>
                      <th className="pb-4 px-4">Attendance Status</th>
                      <th className="pb-4 px-4 text-center">Action</th>
                      <th className="pb-4 pl-4 text-right">Daily Wage (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold">
                    {labor.map(l => {
                      const todayAtt = attendance.find(a => a.labor_id === l.id);
                      const isPresent = todayAtt ? todayAtt.status === "Present" : false;
                      const isAbsent = todayAtt ? todayAtt.status === "Absent" : false;
                      return (
                        <tr key={l.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-4 pr-4 font-mono font-bold text-muted-foreground">{l.id}</td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-foreground">{l.name}</p>
                            <p className="text-xs text-muted-foreground font-semibold mt-0.5">{l.role}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                              isPresent ? 'bg-primary/10 text-primary border-primary/20' : isAbsent ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-muted text-muted-foreground border-border'
                            }`}>
                              {todayAtt ? todayAtt.status : "Not Marked"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => handleAttendanceChange(l.id, "Present")} className="px-2.5 py-1 rounded bg-primary/25 border border-primary/40 text-primary hover:bg-primary/50 cursor-pointer">Present</button>
                              <button onClick={() => handleAttendanceChange(l.id, "Absent")} className="px-2.5 py-1 rounded bg-rose-500/25 border border-rose-500/40 text-rose-500 hover:bg-rose-500/50 cursor-pointer">Absent</button>
                            </div>
                          </td>
                          <td className="py-4 pl-4 text-right font-black text-foreground">
                            ₹{l.wage}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DAILY EXPENSES */}
          {activeTab === "expenses" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-foreground">Daily Overheads</h2>
                <button onClick={() => setIsAddExpenseOpen(true)} className="flex items-center gap-2 border border-primary text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary hover:text-black transition-all cursor-pointer">
                  <Plus size={14} /> Log Expense
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-bold">
                      <th className="pb-4 pr-4">ID</th>
                      <th className="pb-4 px-4">Description</th>
                      <th className="pb-4 px-4">Category</th>
                      <th className="pb-4 pl-4 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold">
                    {expenses.map(e => (
                      <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-4 pr-4 font-mono font-bold text-muted-foreground">{e.id}</td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-foreground">{e.expense_name}</p>
                          <p className="text-xs text-muted-foreground font-semibold mt-0.5">{e.due_date}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-muted px-2 py-0.5 border border-border/50 rounded text-[10px] font-bold text-muted-foreground">{e.category}</span>
                        </td>
                        <td className="py-4 pl-4 text-right font-black text-foreground">
                          ₹{Number(e.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: LOYALTY QR COUPONS */}
          {activeTab === "qr_coupons" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coupon Allocation Form */}
                <div className="bg-card/50 border border-border p-6 rounded-3xl space-y-4">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <QrCode className="text-primary animate-pulse" size={20} /> Generate & Assign Coupon Range
                  </h3>
                  
                  <div className="space-y-4 text-xs font-bold text-muted-foreground">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase">Select Paint Product SKU *</label>
                      <select 
                        value={selectedProd} 
                        onChange={e => setSelectedProd(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none"
                      >
                        <option value="">-- Choose Product --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Value: {p.token_value || 50} pts)</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase">Coupons to Print *</label>
                        <input 
                          type="number" 
                          value={quantity} 
                          onChange={e => setQuantity(e.target.value)}
                          placeholder="e.g. 50" 
                          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase">Points Value per Coupon</label>
                        <input 
                          type="number" 
                          value={cashbackValue} 
                          onChange={e => setCashbackValue(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase">Assign to Dispatching Dealer (Optional)</label>
                      <select 
                        value={selectedDealer} 
                        onChange={e => setSelectedDealer(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none"
                      >
                        <option value="">-- No Dealer / Print Only --</option>
                        {dealers.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.gst_number || "Unregistered"})</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      onClick={handleGenerateQRs}
                      disabled={generating}
                      className="w-full bg-primary hover:bg-primary-hover text-black font-black py-3 rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
                    >
                      <Download size={14} />
                      {generating ? "Generating Coupon ZIP..." : "Generate & Download QR Package (ZIP)"}
                    </button>
                  </div>
                </div>

                {/* Scan Redemption Sandbox */}
                <div className="bg-card/50 border border-border p-6 rounded-3xl space-y-4">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Smartphone className="text-emerald-400" size={20} /> Mobile Scanner Simulation Sandbox
                  </h3>
                  <p className="text-xs text-muted-foreground">Simulate scan logs from the painter's mobile loyalty app to claim cashbacks.</p>

                  <form onSubmit={handleSimulateScan} className="space-y-4 text-xs font-bold text-muted-foreground">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase">Redeeming Painter *</label>
                      <select 
                        value={simPainter} 
                        onChange={e => setSimPainter(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none"
                      >
                        <option value="">-- Select Scanner --</option>
                        {painters.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Balance: ₹{p.total_tokens || 0})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase">Scanned Coupon QR Code *</label>
                      <input 
                        type="text" 
                        value={simQrCode} 
                        onChange={e => setSimQrCode(e.target.value)}
                        placeholder="Paste or click a code from registry table below" 
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={simulating}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
                    >
                      <Tag size={14} />
                      {simulating ? "Processing Redemption..." : "Submit Coupon Scan"}
                    </button>

                    {simMessage && (
                      <div className={`p-4 rounded-xl border flex items-center gap-2 ${
                        simMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        <AlertTriangle size={14} />
                        <p>{simMessage.text}</p>
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Coupon registry table */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground">Active Coupons Registry</h3>
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
                        <tr className="text-muted-foreground uppercase font-bold">
                          <th className="p-4">QR Code String</th>
                          <th className="p-4">Points</th>
                          <th className="p-4">Scanned By</th>
                          <th className="p-4">Scanned At</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-center">Simulate Click</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-xs font-semibold">
                        {loadingRegistry ? (
                          <tr>
                            <td colSpan={6} className="p-12 text-center text-muted-foreground">
                              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-primary" />
                              Loading registry logs...
                            </td>
                          </tr>
                        ) : couponRegistry.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-12 text-center text-muted-foreground">
                              No loyalty coupons generated yet.
                            </td>
                          </tr>
                        ) : (
                          couponRegistry.map(item => {
                            const scanner = painters.find(p => p.id === item.scanned_by);
                            return (
                              <tr key={item.id} className="hover:bg-muted/20">
                                <td className="p-4 font-mono font-bold text-foreground">{item.qr_code}</td>
                                <td className="p-4 font-black text-foreground">₹{item.token_value}</td>
                                <td className="p-4 text-muted-foreground">{scanner ? scanner.name : "—"}</td>
                                <td className="p-4 text-muted-foreground">{item.scanned_at ? new Date(item.scanned_at).toLocaleString() : "—"}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 text-[10px] rounded font-black border uppercase ${
                                    item.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'
                                  }`}>
                                    {item.status}
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  {item.status === 'AVAILABLE' && (
                                    <button 
                                      onClick={() => {
                                        setSimQrCode(item.qr_code);
                                        // Scroll to Sandbox form
                                        window.scrollTo({ top: 300, behavior: "smooth" });
                                      }} 
                                      className="px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded hover:bg-primary/40 cursor-pointer"
                                    >
                                      Use in Simulator
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ══════════════════════════════════════════
          MODAL: START NEW BATCH
      ══════════════════════════════════════════ */}
      {isAddBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border bg-muted/20">
              <h2 className="text-base font-black text-foreground flex items-center gap-2">
                <Factory size={16} className="text-primary animate-pulse" /> Start New Batch Run
              </h2>
              <button onClick={() => setIsAddBatchOpen(false)} className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"><X size={16}/></button>
            </div>
            
            <form onSubmit={handleStartBatchSubmit} className="p-6 space-y-4 text-xs font-bold text-muted-foreground">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase block mb-1">Select Product *</label>
                <select required value={selectedProd} onChange={e => setSelectedProd(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option value="">-- Select --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase block mb-1">Target Yield (Buckets) *</label>
                <input type="number" required value={quantity} onChange={e => setQuantity(e.target.value)}
                  placeholder="e.g. 100" className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none font-mono" />
              </div>

              <div className="pt-2 flex gap-3 border-t border-border">
                <button type="button" onClick={() => setIsAddBatchOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-xs font-bold py-2.5 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="flex-1 bg-primary hover:bg-primary-hover text-black text-xs font-black py-2.5 rounded-xl transition-colors cursor-pointer">
                  {isPending ? "Starting..." : "Start Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: LOG DAILY EXPENSE
      ══════════════════════════════════════════ */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border bg-muted/20">
              <h2 className="text-base font-black text-foreground flex items-center gap-2">
                <DollarSign size={16} className="text-primary animate-pulse" /> Log Factory Expense
              </h2>
              <button onClick={() => setIsAddExpenseOpen(false)} className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"><X size={16}/></button>
            </div>
            
            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4 text-xs font-bold text-muted-foreground">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase block mb-1">Expense Description *</label>
                <input type="text" required value={expenseForm.name} onChange={e => setExpenseForm({...expenseForm, name: e.target.value})}
                  placeholder="e.g. Mixing Motor repair" className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Amount (₹) *</label>
                  <input type="number" required value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                    placeholder="3500" className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">Category</label>
                  <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                    <option value="OPERATIONAL">OPERATIONAL</option>
                    <option value="UTILITIES">UTILITIES</option>
                    <option value="REPAIRS">REPAIRS</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="MISC">MISC</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase block mb-1">Due Date</label>
                <input type="date" value={expenseForm.dueDate} onChange={e => setExpenseForm({...expenseForm, dueDate: e.target.value})}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none font-mono" />
              </div>

              <div className="pt-2 flex gap-3 border-t border-border">
                <button type="button" onClick={() => setIsAddExpenseOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-xs font-bold py-2.5 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="flex-1 bg-primary hover:bg-primary-hover text-black text-xs font-black py-2.5 rounded-xl transition-colors cursor-pointer">
                  {isPending ? "Logging..." : "Log Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
