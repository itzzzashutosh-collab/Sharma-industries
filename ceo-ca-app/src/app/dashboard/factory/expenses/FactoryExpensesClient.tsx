"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Receipt, Plus, X, Calendar, CheckCircle2, Wallet, RefreshCw,
  Search, ShieldAlert, Check, Ban, AlertTriangle, TrendingDown,
  BarChart3, Clock, LayoutDashboard, Coins
} from "lucide-react";
import { markAsPaid, recordExpense } from "@/actions/expenseActions";
import { motion, AnimatePresence } from "framer-motion";

interface ExpenseItem {
  id: string;
  expense_name: string;
  category: string; // "DAILY" | "PERMANENT"
  amount: number;
  status: "PENDING" | "PAID";
  due_date?: string | null;
  paid_date?: string | null;
  payment_mode?: string | null;
  created_at: string;
  description?: string; // e.g. "Raw Materials", "Rent", "Salaries", "Utilities"
}

interface Props {
  initialDaily: ExpenseItem[];
  initialPermanent: ExpenseItem[];
}

type TabType = "overheads" | "analysis" | "liabilities" | "authorizations";

export default function FactoryExpensesClient({
  initialDaily,
  initialPermanent,
}: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("overheads");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  const [daily, setDaily] = useState<ExpenseItem[]>(initialDaily);
  const [permanent, setPermanent] = useState<ExpenseItem[]>(initialPermanent);

  const [loading, setLoading] = useState(false);

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Selected expense for payment
  const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);
  const [paymentMode, setPaymentMode] = useState("CASH");

  // Record Form state
  const [formData, setFormData] = useState({
    expense_name: "",
    category: "DAILY",
    amount: "",
    due_date: "",
    description: "Raw Material", // Defaults to Raw Material category
  });

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.expense_name || !formData.amount) {
      showToast("error", "Name and amount are required.");
      return;
    }

    const amt = parseFloat(formData.amount);
    const payload = {
      expense_name: formData.expense_name,
      category: formData.category,
      amount: amt,
      due_date: formData.due_date || undefined,
    };

    startTransition(async () => {
      const res = await recordExpense(payload);
      if (res.success) {
        const created: ExpenseItem = {
          id: `EXP-${Date.now()}`,
          expense_name: payload.expense_name,
          category: payload.category,
          amount: payload.amount,
          status: "PENDING",
          due_date: payload.due_date || null,
          created_at: new Date().toISOString(),
          description: formData.description,
        };

        if (payload.category === "DAILY") {
          setDaily(prev => [created, ...prev]);
        } else {
          setPermanent(prev => [created, ...prev]);
        }

        setIsRecordModalOpen(false);
        setFormData({ expense_name: "", category: "DAILY", amount: "", due_date: "", description: "Raw Material" });
        showToast("success", "Expense overhead logged successfully!");
      } else {
        showToast("error", `Failed: ${res.error}`);
      }
    });
  };

  const handleMarkPaidClick = (expense: ExpenseItem) => {
    setSelectedExpense(expense);
    setPaymentMode("CASH");
    setIsPayModalOpen(true);
  };

  const submitPayment = async () => {
    if (!selectedExpense) return;

    startTransition(async () => {
      const res = await markAsPaid(selectedExpense.id, { payment_mode: paymentMode });
      if (res.success) {
        const today = new Date().toISOString().split("T")[0];

        const updater = (list: ExpenseItem[]) =>
          list.map(item =>
            item.id === selectedExpense.id
              ? { ...item, status: "PAID" as const, paid_date: today, payment_mode: paymentMode }
              : item
          );

        if (selectedExpense.category === "DAILY") {
          setDaily(prev => updater(prev));
        } else {
          setPermanent(prev => updater(prev));
        }

        setIsPayModalOpen(false);
        setSelectedExpense(null);
        showToast("success", `Payment for ${selectedExpense.expense_name} confirmed.`);
      } else {
        showToast("error", `Error: ${res.error}`);
      }
    });
  };

  // Aggregated lists
  const allExpenses = useMemo(() => {
    return [...daily, ...permanent];
  }, [daily, permanent]);

  // Filtered lists for rendering
  const filteredDaily = useMemo(() => {
    return daily.filter(exp => exp.expense_name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [daily, searchTerm]);

  const filteredPermanent = useMemo(() => {
    return permanent.filter(exp => exp.expense_name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [permanent, searchTerm]);

  // KPI Calculations
  const mtdExpenses = useMemo(() => {
    return allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [allExpenses]);

  const unpaidLiabilities = useMemo(() => {
    return allExpenses.filter(exp => exp.status === "PENDING").reduce((sum, exp) => sum + exp.amount, 0);
  }, [allExpenses]);

  const burnRate = useMemo(() => {
    const paidExpenses = allExpenses.filter(exp => exp.status === "PAID");
    if (paidExpenses.length === 0) return 0;
    return Math.round(paidExpenses.reduce((sum, exp) => sum + exp.amount, 0) / 30); // 30 day average
  }, [allExpenses]);

  // Category splits for visual analysis
  const categorySplits = useMemo(() => {
    const categories = ["Raw Material", "Rent", "Salaries", "Utilities", "Logistics", "Other"];
    const splits: Record<string, number> = {};
    categories.forEach(c => { splits[c] = 0; });

    allExpenses.forEach(exp => {
      // Map mock types or description if they exist
      const desc = exp.description || "Other";
      splits[desc] = (splits[desc] || 0) + exp.amount;
    });

    const maxAmt = Math.max(...Object.values(splits), 1);

    return Object.entries(splits).map(([name, amount]) => {
      const pct = Math.round((amount / maxAmt) * 100);
      return { name, amount, pct };
    });
  }, [allExpenses]);

  // High-value authorizations (claims > 50,000)
  const pendingAuthorizations = useMemo(() => {
    return allExpenses.filter(exp => exp.status === "PENDING" && exp.amount >= 50000);
  }, [allExpenses]);

  const handleAuthorizeClaim = (expense: ExpenseItem) => {
    handleMarkPaidClick(expense);
  };

  const handleRejectClaim = (expenseId: string) => {
    // Simulate rejection by removing from list or changing status
    setDaily(prev => prev.filter(item => item.id !== expenseId));
    setPermanent(prev => prev.filter(item => item.id !== expenseId));
    showToast("error", "Expense authorization claim rejected and voided.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto p-6 pb-20 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom duration-300 ${
          notification.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
        }`}>
          <span className="font-bold text-sm">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-muted/50 rounded-lg ml-2"><X size={14}/></button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
        <span>{t("Home")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Factory Expenses")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Receipt className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Factory Expenses")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t("Manage operating overheads, raw material bills, rent, utilities and salary registers.")}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus size={14} /> Record Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Overhead MTD", value: `₹${mtdExpenses.toLocaleString("en-IN")}`, icon: <Coins className="text-emerald-500" />, trend: "Total logged this month" },
          { label: "Unpaid Liabilities", value: `₹${unpaidLiabilities.toLocaleString("en-IN")}`, icon: <AlertTriangle className="text-amber-500" />, trend: "Awaiting payment settlement" },
          { label: "Average Burn Rate", value: `₹${burnRate.toLocaleString("en-IN")}/day`, icon: <TrendingDown className="text-rose-500" />, trend: "Paid expense daily index" },
          { label: "Operating Budget MTD", value: "₹5.0 L", icon: <LayoutDashboard className="text-violet-500" />, trend: "68% Utilized" }
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between hover:shadow-sm transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-muted-foreground leading-tight">{stat.label}</span>
              <div className="p-1.5 bg-muted rounded-lg border border-border/50">{stat.icon}</div>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-xl font-black text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-0.5">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Navigation Row */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
        {[
          { key: "overheads", label: "Overheads Ledger", icon: <Receipt size={13} /> },
          { key: "analysis", label: "Spending Analysis", icon: <BarChart3 size={13} /> },
          { key: "liabilities", label: "Unpaid Liabilities", icon: <AlertTriangle size={13} /> },
          { key: "authorizations", label: "Pending Authorizations", icon: <ShieldAlert size={13} /> }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key as any); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.key ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            {tab.icon}{t(tab.label)}
            {tab.key === "authorizations" && pendingAuthorizations.length > 0 && (
              <span className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[9px] font-black text-white animate-pulse">{pendingAuthorizations.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── TAB: OVERHEADS LEDGER ─── */}
      {activeTab === "overheads" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search expenses by name…"
                className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-xl text-xs focus:outline-none focus:border-primary font-semibold text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily overheads */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-6 bg-primary rounded-full"></div>
                <h2 className="text-base font-bold text-foreground">Daily Overheads ({filteredDaily.length})</h2>
              </div>
              {filteredDaily.length === 0 ? (
                <p className="text-muted-foreground text-xs border border-dashed border-border p-6 rounded-2xl text-center font-semibold">No daily overheads matches search.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredDaily.map(exp => (
                    <div key={exp.id} className={`p-4 rounded-2xl border transition-all ${exp.status === 'PAID' ? 'border-border/50 bg-muted/10 opacity-70' : 'border-border bg-card shadow-sm hover:border-primary/50'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className={`font-bold text-xs ${exp.status === 'PAID' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{exp.expense_name}</h3>
                          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 font-mono">
                            <Calendar size={12} /> {exp.due_date ? `Due: ${exp.due_date}` : new Date(exp.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`font-black font-mono text-sm ${exp.status === 'PAID' ? 'text-muted-foreground' : 'text-primary'}`}>
                          ₹{exp.amount.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50 text-xs">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${exp.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                          {exp.status}
                        </span>
                        {exp.status !== 'PAID' ? (
                          <button onClick={() => handleMarkPaidClick(exp)} className="text-[11px] font-bold bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg hover:shadow-md transition-all flex items-center gap-1 cursor-pointer">
                            <CheckCircle2 size={13} /> Mark Paid
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                            <Wallet size={12} /> {exp.payment_mode} - {exp.paid_date}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Permanent Expenses */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
                <h2 className="text-base font-bold text-foreground">Permanent / Fixed Costs ({filteredPermanent.length})</h2>
              </div>
              {filteredPermanent.length === 0 ? (
                <p className="text-muted-foreground text-xs border border-dashed border-border p-6 rounded-2xl text-center font-semibold">No permanent expenses matches search.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredPermanent.map(exp => (
                    <div key={exp.id} className={`p-4 rounded-2xl border transition-all ${exp.status === 'PAID' ? 'border-border/50 bg-muted/10 opacity-70' : 'border-border bg-card shadow-sm hover:border-primary/50'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className={`font-bold text-xs ${exp.status === 'PAID' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{exp.expense_name}</h3>
                          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 font-mono">
                            <Calendar size={12} /> {exp.due_date ? `Due: ${exp.due_date}` : new Date(exp.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`font-black font-mono text-sm ${exp.status === 'PAID' ? 'text-muted-foreground' : 'text-primary'}`}>
                          ₹{exp.amount.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50 text-xs">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${exp.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                          {exp.status}
                        </span>
                        {exp.status !== 'PAID' ? (
                          <button onClick={() => handleMarkPaidClick(exp)} className="text-[11px] font-bold bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg hover:shadow-md transition-all flex items-center gap-1 cursor-pointer">
                            <CheckCircle2 size={13} /> Mark Paid
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                            <Wallet size={12} /> {exp.payment_mode} - {exp.paid_date}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: SPENDING ANALYSIS ─── */}
      {activeTab === "analysis" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground">Operational Budget Distribution Analysis</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Summary of MTD spending allocations across major categories.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-black text-foreground">Outflow Share by Category</h4>
              <div className="space-y-4 pt-2">
                {categorySplits.map(cat => (
                  <div key={cat.name}>
                    <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                      <span className="text-foreground">{cat.name}</span>
                      <span className="font-mono text-muted-foreground">₹{cat.amount.toLocaleString()} ({cat.pct}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-border/30">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${cat.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-sm font-black text-foreground">Cost Optimization Insights</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Raw material overheads comprise the largest share of MTD factory outflow. We recommend locking supply contract rates for chemical solvents to check rising bulk freight tariffs.
                </p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-xs text-primary font-semibold mt-4">
                💡 Current daily operational threshold is optimal (burn rate ₹{burnRate.toLocaleString()}/day vs ₹25,000 threshold budget).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: UNPAID LIABILITIES ─── */}
      {activeTab === "liabilities" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-5 rounded-2xl flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-foreground">Account Liabilities & Pending Bills</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Manage credit invoices and utility overhead payments.</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-rose-500">₹{unpaidLiabilities.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Net Pending Payables</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-muted/50 border-b border-border">
                  <tr className="text-xs uppercase text-muted-foreground font-bold">
                    <th className="p-4">Bill Particulars</th>
                    <th className="p-4">Expense Type</th>
                    <th className="p-4 text-right">Amount Pending</th>
                    <th className="p-4">Due Date / Incurred Date</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {allExpenses.filter(e => e.status === "PENDING").map(exp => (
                    <tr key={exp.id} className="hover:bg-background/40 transition-colors">
                      <td className="p-4 font-bold text-foreground">{exp.expense_name}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-muted border border-border rounded text-[10px] font-black text-muted-foreground uppercase">{exp.category}</span>
                      </td>
                      <td className="p-4 text-right font-mono font-black text-rose-500">₹{exp.amount.toLocaleString()}</td>
                      <td className="p-4 text-muted-foreground font-semibold">{exp.due_date ? exp.due_date : new Date(exp.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleMarkPaidClick(exp)} className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                          Settle Balance
                        </button>
                      </td>
                    </tr>
                  ))}
                  {allExpenses.filter(e => e.status === "PENDING").length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium">No pending liabilities found. All bills cleared!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: PENDING AUTHORIZATIONS ─── */}
      {activeTab === "authorizations" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground">Operational Payout Authorizations</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Control gate for high-value expense payouts exceeding ₹50,000 threshold.</p>
          </div>

          {pendingAuthorizations.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-12 text-center">
              <CheckCircle2 size={40} className="mx-auto text-emerald-500/30 mb-3" />
              <p className="text-sm font-bold text-muted-foreground">All caught up! No pending authorization claims.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingAuthorizations.map(exp => (
                <div key={exp.id} className="bg-card border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-black text-base border border-amber-500/20">₹</div>
                    <div>
                      <p className="font-black text-sm text-foreground">{exp.expense_name}</p>
                      <p className="text-xs text-muted-foreground">Category: {exp.category} · ID: {exp.id}</p>
                    </div>
                    <span className="ml-auto px-2.5 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[9px] font-black rounded-full uppercase tracking-wider">Awaiting Sign-off</span>
                  </div>
                  <div className="bg-muted/40 border border-border/40 rounded-xl p-3.5 text-xs text-muted-foreground font-semibold relative z-10">
                    <div className="flex justify-between mb-1"><span>Overhead Value:</span><span className="font-mono font-black text-rose-500 text-sm">₹{exp.amount.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Requested On:</span><span className="font-bold text-foreground">{new Date(exp.created_at).toLocaleDateString()}</span></div>
                  </div>
                  <div className="flex gap-3 pt-2 relative z-10 border-t border-border/40">
                    <button onClick={() => handleRejectClaim(exp.id)} className="flex-1 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-black rounded-xl hover:bg-rose-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <Ban size={13} /> Void Claim
                    </button>
                    <button onClick={() => handleAuthorizeClaim(exp)} className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <Check size={13} /> Sign & Settle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Record Expense Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-base font-black text-foreground flex items-center gap-2">
                <Plus size={16} className="text-primary" /> Record Factory Expense
              </h2>
              <button onClick={() => setIsRecordModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleRecordSubmit} className="p-6 space-y-5 text-xs font-bold text-muted-foreground">
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-muted-foreground">Expense Title Name *</label>
                <input 
                  type="text" 
                  value={formData.expense_name}
                  onChange={e => setFormData({...formData, expense_name: e.target.value})}
                  placeholder="e.g. Chemical dye invoice #90"
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-muted-foreground">Amount (₹) *</label>
                  <input 
                    type="number" 
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    placeholder="25000"
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary outline-none font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-muted-foreground">Overhead Class</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none"
                  >
                    <option value="DAILY" className="text-foreground">Daily Overhead</option>
                    <option value="PERMANENT" className="text-foreground">Permanent / Fixed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-muted-foreground">Analysis Category</label>
                  <select 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none"
                  >
                    {["Raw Material", "Rent", "Salaries", "Utilities", "Logistics", "Other"].map(opt => (
                      <option key={opt} value={opt} className="text-foreground">{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-muted-foreground">Due Date (Optional)</label>
                  <input 
                    type="date" 
                    value={formData.due_date}
                    onChange={e => setFormData({...formData, due_date: e.target.value})}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3 border-t border-border">
                <button type="button" onClick={() => setIsRecordModalOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="flex-1 bg-primary hover:bg-primary-hover text-white text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">
                  {isPending ? "Logging Overhead…" : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {isPayModalOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-sm font-black text-foreground">Mark as Settled</h2>
              <button onClick={() => setIsPayModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-5 text-xs font-bold text-muted-foreground">
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">Confirm payment settlement for</p>
                <p className="text-sm font-black text-foreground">{selectedExpense.expense_name}</p>
                <p className="text-2xl font-black font-mono text-primary pt-2">₹{selectedExpense.amount.toLocaleString()}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground text-center block">Settle Payment Via</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {['CASH', 'UPI', 'BANK'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setPaymentMode(mode)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${paymentMode === mode ? 'bg-primary border-primary text-white' : 'bg-muted border-border text-muted-foreground hover:border-primary/50'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3 border-t border-border">
                <button type="button" onClick={() => setIsPayModalOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">Cancel</button>
                <button onClick={submitPayment} disabled={isPending} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">
                  {isPending ? "Settling..." : "Confirm Payout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
