"use client";

import React, { useState, useTransition } from "react";
import {
  Wallet, Plus, Search, Sparkles, X, PlusCircle, Calendar,
  Building2, IndianRupee, Tag, Filter, CheckCircle2, ShieldAlert
} from "lucide-react";
import { createDealerExpense } from "../../actions";

interface Expense {
  id: string;
  title?: string;
  category: string;
  expense_type?: "daily_wages" | "fixed_costs";
  amount: number;
  payment_mode?: string;
  expense_date: string;
  remarks?: string;
}

interface Props {
  initialData: Expense[];
}

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const INITIAL_MOCK_EXPENSES: Expense[] = [
  {
    id: "EXP_001",
    title: "Store Helpers & Dispatch Daily Wages",
    category: "Daily Wages & Labor",
    expense_type: "daily_wages",
    amount: 1400,
    payment_mode: "Cash",
    expense_date: "2026-07-26",
    remarks: "2 Helpers Daily Helper Shift Allowance"
  },
  {
    id: "EXP_002",
    title: "Monthly Store Showroom Rent",
    category: "Fixed Costs & Overheads",
    expense_type: "fixed_costs",
    amount: 25000,
    payment_mode: "Bank Transfer",
    expense_date: "2026-07-01",
    remarks: "Bundi Road Shop Premises Rent"
  },
  {
    id: "EXP_003",
    title: "Unloading Paint Pails Labor Charges",
    category: "Daily Wages & Labor",
    expense_type: "daily_wages",
    amount: 850,
    payment_mode: "Cash",
    expense_date: "2026-07-24",
    remarks: "Factory Container Truck Offloading Labor"
  },
  {
    id: "EXP_004",
    title: "Store Electricity & Power Utility Bill",
    category: "Fixed Costs & Overheads",
    expense_type: "fixed_costs",
    amount: 4680,
    payment_mode: "UPI",
    expense_date: "2026-07-15",
    remarks: "Monthly Commercial Electricity Meter Bill"
  }
];

export function BusinessExpensesClient({ initialData }: Props) {
  const [list, setList] = useState<Expense[]>(() => {
    if (initialData && initialData.length > 0) return initialData;
    return INITIAL_MOCK_EXPENSES;
  });

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [form, setForm] = useState({
    title: "",
    expense_type: "daily_wages" as "daily_wages" | "fixed_costs",
    amount: "",
    payment_mode: "Cash",
    expense_date: new Date().toISOString().split("T")[0],
    remarks: ""
  });

  // Totals
  const totalExpenses = list.reduce((s, e) => s + Number(e.amount || 0), 0);
  const dailyWagesTotal = list
    .filter(e => e.expense_type === "daily_wages" || e.category.toLowerCase().includes("daily") || e.category.toLowerCase().includes("wage") || e.category.toLowerCase().includes("labor"))
    .reduce((s, e) => s + Number(e.amount || 0), 0);

  const fixedCostsTotal = totalExpenses - dailyWagesTotal;

  // Filtered List
  const filtered = list.filter(exp => {
    const s = search.toLowerCase();
    const matchesSearch = !search || (exp.title || "").toLowerCase().includes(s) || exp.category.toLowerCase().includes(s) || (exp.remarks || "").toLowerCase().includes(s);
    const isDaily = exp.expense_type === "daily_wages" || exp.category.toLowerCase().includes("daily") || exp.category.toLowerCase().includes("wage");
    const matchesType = typeFilter === "all" || (typeFilter === "daily_wages" && isDaily) || (typeFilter === "fixed_costs" && !isDaily);
    return matchesSearch && matchesType;
  });

  // Add Expense
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return;

    const categoryName = form.expense_type === "daily_wages" ? "Daily Wages & Labor" : "Fixed Costs & Overheads";

    startTransition(async () => {
      await createDealerExpense({
        category: categoryName,
        amount: Number(form.amount),
        expense_date: form.expense_date
      });

      const newExpense: Expense = {
        id: `EXP_${Date.now()}`,
        title: form.title || (form.expense_type === "daily_wages" ? "Helper Daily Wage" : "Store Overhead Cost"),
        category: categoryName,
        expense_type: form.expense_type,
        amount: Number(form.amount),
        payment_mode: form.payment_mode,
        expense_date: form.expense_date,
        remarks: form.remarks
      };

      setList(prev => [newExpense, ...prev]);
      setShowAddModal(false);
      setForm({
        title: "",
        expense_type: "daily_wages",
        amount: "",
        payment_mode: "Cash",
        expense_date: new Date().toISOString().split("T")[0],
        remarks: ""
      });
      alert("Store expense logged successfully!");
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── Top Header Navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Finance</span><span className="opacity-40">/</span><span className="text-foreground">Store Expenses</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <Wallet size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                Store Expenses & Daily Wages Payouts
              </h1>
              <p className="text-xs text-muted-foreground">
                Track outlet daily helper wages, loading labor payouts, shop rent, utility bills, and fixed overhead costs
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-2xs cursor-pointer"
        >
          <Plus size={15} /> + Log Store Expense / Wage
        </button>
      </div>

      {/* ── Summary Metric Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Store Expenses</span>
          <p className="text-2xl font-black text-rose-500 font-mono">{fmt(totalExpenses)}</p>
          <p className="text-[11px] text-muted-foreground">{list.length} Expense Logs</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Daily Wages & Labor</span>
          <p className="text-2xl font-black text-blue-600 font-mono">{fmt(dailyWagesTotal)}</p>
          <p className="text-[11px] text-muted-foreground">Helper & Unloading Payouts</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Fixed Costs & Overheads</span>
          <p className="text-2xl font-black text-amber-500 font-mono">{fmt(fixedCostsTotal)}</p>
          <p className="text-[11px] text-muted-foreground">Shop Rent & Utility Bills</p>
        </div>
      </div>

      {/* ── Search & Category Filter Controls Bar ────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search expense title or remarks..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold bg-muted/60 p-1 rounded-xl border border-border">
          {[
            { id: "all", label: "All Expenses" },
            { id: "daily_wages", label: "👷 Daily Wages & Labor" },
            { id: "fixed_costs", label: "🏢 Fixed Costs & Rent" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                typeFilter === t.id
                  ? "bg-primary text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Expenses Log Table ─────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/40 uppercase font-black text-[10px] text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">Expense Title / Description</th>
                <th className="px-4 py-3.5">Category Type</th>
                <th className="px-4 py-3.5">Expense Date</th>
                <th className="px-4 py-3.5">Payment Mode</th>
                <th className="px-4 py-3.5 text-right">Expense Amount</th>
                <th className="px-4 py-3.5">Remarks / Voucher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {filtered.map((exp) => {
                const isDaily = exp.expense_type === "daily_wages" || exp.category.toLowerCase().includes("daily") || exp.category.toLowerCase().includes("wage");

                return (
                  <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-foreground">
                      {exp.title || exp.category}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase font-mono tracking-wider ${
                        isDaily
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}>
                        {isDaily ? "Daily Wages & Labor" : "Fixed Costs & Overheads"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground font-mono">
                      {exp.expense_date ? new Date(exp.expense_date).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <span className="px-2 py-0.5 bg-muted rounded text-[11px] font-bold text-foreground border border-border uppercase">
                        {exp.payment_mode || "Cash"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-black text-rose-500 text-sm">
                      {fmt(exp.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {exp.remarks || "—"}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground font-medium">
                    No store expenses logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: LOG STORE EXPENSE / DAILY WAGES ─────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <Wallet size={16} className="text-primary" /> Log Store Expense / Wage Payout
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4 text-xs">
              {/* Category Type Toggle */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Expense Type *</label>
                <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, expense_type: "daily_wages" }))}
                    className={`py-2 rounded-lg font-black text-xs transition-all ${
                      form.expense_type === "daily_wages"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Daily Wages & Labor
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, expense_type: "fixed_costs" }))}
                    className={`py-2 rounded-lg font-black text-xs transition-all ${
                      form.expense_type === "fixed_costs"
                        ? "bg-amber-500 text-white shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Fixed Costs & Overheads
                  </button>
                </div>
              </div>

              {/* Title / Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Expense Title / Description *</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder={form.expense_type === "daily_wages" ? "E.g. Store Helper Daily Wages (2 Workers)" : "E.g. Monthly Showroom Rent / Power Bill"}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              {/* Amount & Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="E.g. 1500"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Payment Mode</label>
                  <select
                    value={form.payment_mode}
                    onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                  >
                    <option value="Cash">Store Cash</option>
                    <option value="UPI">UPI / GPay</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  </select>
                </div>
              </div>

              {/* Expense Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Expense Date</label>
                <input
                  type="date"
                  value={form.expense_date}
                  onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              {/* Remarks / Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Remarks / Voucher Notes</label>
                <textarea
                  value={form.remarks}
                  onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                  placeholder="E.g. Cash voucher #V-102 or truck loading charges"
                  rows={2}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary text-foreground resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-primary text-white font-black rounded-xl hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
                >
                  {isPending ? "Logging..." : "Log Expense →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
