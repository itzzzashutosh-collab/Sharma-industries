"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { 
  TrendingUp, TrendingDown, Home, Zap, Users, Coffee, Truck, X,
  Plus, DollarSign, Wallet, FileText, CheckCircle2, ChevronRight,
  PieChart as PieIcon, ShieldAlert, AlertTriangle, ArrowUpRight,
  Coins, Sparkles
} from "lucide-react";
import { addExpense } from "./actions";

interface ExpenseItem {
  category: string;
  amount: number;
  expense_date: string;
}

interface Props {
  totalSales: number;
  purchaseCost: number;
  totalExpenses: number;
  totalCommission: number;
  trueProfit: number;
  expenseItems: ExpenseItem[];
}

const CATEGORY_META: Record<string, { icon: any; color: string; bg: string }> = {
  "Rent": { icon: Home, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  "Electricity": { icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  "Staff Salary": { icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  "Chai-Paani": { icon: Coffee, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
  "Transport": { icon: Truck, color: "text-violet-500", bg: "bg-violet-500/10 border-violet-500/20" },
};

export default function PnLClient({
  totalSales,
  purchaseCost,
  totalExpenses,
  totalCommission,
  trueProfit,
  expenseItems,
}: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"calculator" | "expenses" | "charts">("calculator");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Local state for dynamically added expenses during session
  const [localExpenses, setLocalExpenses] = useState<ExpenseItem[]>(expenseItems);
  const [currentExpensesSum, setCurrentExpensesSum] = useState(totalExpenses);

  const profitMarginPercent = useMemo(() => {
    if (totalSales === 0) return 0;
    return Math.round((trueProfit / totalSales) * 100);
  }, [trueProfit, totalSales]);

  const handleOpen = (category: string) => {
    setActiveCategory(category);
  };

  const handleClose = () => {
    setActiveCategory(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const amountVal = parseFloat(data.get("amount") as string);
    data.append("category", activeCategory || "");

    startTransition(async () => {
      const res = await addExpense(data);
      if (res?.success) {
        // Optimistically update frontend stats
        const newExpense: ExpenseItem = {
          category: activeCategory || "Other",
          amount: amountVal,
          expense_date: new Date().toISOString().split("T")[0]
        };
        setLocalExpenses(prev => [newExpense, ...prev]);
        setCurrentExpensesSum(prev => prev + amountVal);
        handleClose();
      } else {
        alert("Failed to save expense");
      }
    });
  };

  const dynamicTrueProfit = useMemo(() => {
    return totalSales - purchaseCost - currentExpensesSum - totalCommission;
  }, [totalSales, purchaseCost, currentExpensesSum, totalCommission]);

  const dynamicProfitMarginPercent = useMemo(() => {
    if (totalSales === 0) return 0;
    return Math.round((dynamicTrueProfit / totalSales) * 100);
  }, [dynamicTrueProfit, totalSales]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 animate-in fade-in duration-500 font-sans pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Coins className="text-primary w-8 h-8 animate-pulse" />
            True P&L Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track your real store margins, overhead expenditures, and painter reward commissions.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Gross Sales Revenue", value: `₹${totalSales.toLocaleString()}`, trend: "Base revenue from invoices", icon: <TrendingUp className="text-emerald-500" /> },
          { label: "Painter Commissions", value: `₹${totalCommission.toLocaleString()}`, trend: "Reward cash outs paid", icon: <TrendingDown className="text-rose-500" /> },
          { label: "Operational Overhead", value: `₹${currentExpensesSum.toLocaleString()}`, trend: "Rent, power and staff expenses", icon: <TrendingDown className="text-amber-500" /> },
          { label: "Actual Net Profit", value: `₹${dynamicTrueProfit.toLocaleString()}`, trend: `True Margin: ${dynamicProfitMarginPercent}%`, icon: <Wallet className="text-primary" />, highlight: true }
        ].map(stat => (
          <div key={stat.label} className={`border border-border p-4 rounded-2xl flex flex-col justify-between hover:shadow-sm transition-all ${stat.highlight ? 'bg-primary/10 border-primary/20' : 'bg-card'}`}>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-muted-foreground leading-tight">{t(stat.label)}</span>
              <div className="p-1.5 bg-muted rounded-lg border border-border/50">{stat.icon}</div>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-xl font-black text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-0.5">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
        {[
          { key: "calculator", label: "Profit & Loss Ledger", icon: <FileText size={13} /> },
          { key: "expenses", label: "Operational Expenses", icon: <TrendingDown size={13} /> }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.key ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            {tab.icon}{t(tab.label)}
          </button>
        ))}
      </div>

      {/* ─── TAB: PROFIT & LOSS LEDGER ─── */}
      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Detailed calculator sheet */}
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 relative overflow-hidden shadow-sm">
            {/* Soft decorative glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 blur-3xl rounded-full pointer-events-none" />

            <h2 className="text-base font-black text-foreground mb-6 relative z-10 flex items-center gap-2">
              <Sparkles size={16} className="text-primary animate-pulse" /> Margin Calculation Matrix
            </h2>

            <div className="space-y-5 relative z-10 text-xs font-bold text-muted-foreground">
              <div className="flex justify-between items-center py-2.5 border-b border-border/40">
                <span className="text-foreground">Total Sales Revenue</span>
                <span className="font-mono text-sm text-foreground">₹{totalSales.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-2.5 border-b border-border/40 text-rose-500">
                <span>Minus (-) Cost of Goods Sold <span className="text-[10px] text-muted-foreground ml-1.5 font-normal">(Est. 70% Paint cost)</span></span>
                <span className="font-mono text-sm">- ₹{purchaseCost.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-border/40 text-rose-500">
                <span>Minus (-) Painter Commissions Paid</span>
                <span className="font-mono text-sm">- ₹{totalCommission.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-border/40 text-rose-500">
                <span>Minus (-) Operational Outflow</span>
                <span className="font-mono text-sm">- ₹{currentExpensesSum.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-end pt-5">
                <div>
                  <span className="text-sm font-black text-foreground block">Actual In-Hand Profit</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Remaining dealer margin after rewards and materials.</span>
                </div>
                <span className="text-3xl font-black text-primary font-mono drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
                  ₹{dynamicTrueProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Expense buttons */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h2 className="text-sm font-black text-foreground mb-4">Quick Add Expense</h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { name: "Rent", category: "Rent" },
                  { name: "Electricity", category: "Electricity" },
                  { name: "Staff Salary", category: "Staff Salary" },
                  { name: "Chai-Paani", category: "Chai-Paani" },
                  { name: "Transport", category: "Transport" }
                ].map(cat => {
                  const meta = CATEGORY_META[cat.category];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => handleOpen(cat.category)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/60 hover:bg-muted transition-all cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${meta.bg} ${meta.color}`}>
                          <Icon size={16} />
                        </div>
                        <span className="text-xs font-bold text-foreground">{cat.name}</span>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: OPERATIONAL EXPENSES ─── */}
      {activeTab === "expenses" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground">Logged Store Expenses</h3>
            <p className="text-xs text-muted-foreground mt-0.5">List of general overhead transactions tracked for this dealer profile.</p>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-muted/50 border-b border-border">
                  <tr className="text-xs uppercase text-muted-foreground font-bold">
                    <th className="p-4">Category</th>
                    <th className="p-4">Transaction Date</th>
                    <th className="p-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs font-semibold">
                  {localExpenses.map((exp, idx) => {
                    const meta = CATEGORY_META[exp.category] || { icon: FileText, color: "text-muted-foreground", bg: "bg-muted" };
                    const Icon = meta.icon;
                    return (
                      <tr key={idx} className="hover:bg-background/40 transition-colors">
                        <td className="p-4 flex items-center gap-3 font-bold text-foreground">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.bg} ${meta.color}`}><Icon size={14} /></div>
                          {exp.category}
                        </td>
                        <td className="p-4 text-muted-foreground">{exp.expense_date}</td>
                        <td className="p-4 text-right font-mono font-black text-rose-500">₹{exp.amount.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {localExpenses.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground font-medium">No expenses logged. Use the Profit Ledger panel to add.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quick Add Expense */}
      {activeCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                Add {activeCategory} Expense
              </h3>
              <button onClick={handleClose} className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-bold text-muted-foreground">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Amount (₹) *</label>
                <input
                  type="number"
                  name="amount"
                  min="1"
                  required
                  autoFocus
                  placeholder="e.g. 5000"
                  className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-foreground text-sm font-mono focus:outline-none focus:border-primary outline-none"
                />
              </div>
              
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={handleClose} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-xs font-bold py-2.5 rounded-xl cursor-pointer">Cancel</button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-black py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  {isPending ? "Saving..." : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
