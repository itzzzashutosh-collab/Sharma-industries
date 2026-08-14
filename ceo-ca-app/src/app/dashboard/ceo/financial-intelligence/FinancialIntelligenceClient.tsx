"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  TrendingUp, IndianRupee, FileText, CreditCard, Award, Plus, X, Search,
  Check, Percent, PieChart, Banknote, Calendar, BarChart3, AlertTriangle,
  ArrowUpRight, ArrowDownRight, BellRing, ClipboardCheck, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES ---
interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
}

interface DBInvoice {
  id: string;
  invoice_no: string;
  invoice_date: string;
  client_id?: string | null;
  client_details: {
    name: string;
    phone?: string;
    gstin?: string;
    address?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  total_tax: number;
  grand_total: number;
  balance_due?: number;
}

interface DBDealer {
  id: string;
  name: string;
  phone: string;
  territory: string;
  outstanding: number;
  totalRevenue: number;
}

interface DBExpense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface Props {
  initialInvoices: DBInvoice[];
  dealers: DBDealer[];
  initialExpenses: DBExpense[];
}

type TabType = "sales" | "receivables" | "profitability" | "expenses" | "tax";

export default function FinancialIntelligenceClient({
  initialInvoices,
  dealers,
  initialExpenses,
}: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("sales");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  // Local state representing lists
  const [invoices, setInvoices] = useState<DBInvoice[]>(initialInvoices);
  const [expenses, setExpenses] = useState<DBExpense[]>(initialExpenses);
  const [dealerList, setDealerList] = useState<DBDealer[]>(dealers);

  // Modals controllers
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isPaymentInflowOpen, setIsPaymentInflowOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Form states
  const [newInvoice, setNewInvoice] = useState({
    invoice_no: "",
    dealerId: "",
    dealerName: "",
    itemName: "",
    qty: "",
    price: "",
    isTaxInclusive: false,
  });

  const [newInflow, setNewInflow] = useState({
    dealerId: "",
    amount: "",
    mode: "NEFT",
    reference: "",
  });

  const [newExpense, setNewExpense] = useState({
    category: "Raw Material",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Add Invoice handler
  const handleAddInvoice = () => {
    if (!newInvoice.invoice_no || !newInvoice.itemName || !newInvoice.qty || !newInvoice.price) {
      showToast("error", "Invoice number, item details, quantity, and price are required.");
      return;
    }

    const priceNum = Number(newInvoice.price) || 0;
    const qtyNum = Number(newInvoice.qty) || 0;
    const itemSubtotal = priceNum * qtyNum;
    const taxRate = 0.18; // 18% GST standard
    const taxAmount = itemSubtotal * taxRate;
    const grandTotal = itemSubtotal + taxAmount;

    let targetDealerName = newInvoice.dealerName;
    if (newInvoice.dealerId) {
      const found = dealerList.find(d => d.id === newInvoice.dealerId);
      if (found) targetDealerName = found.name;
    }

    const created: DBInvoice = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      invoice_no: newInvoice.invoice_no,
      invoice_date: new Date().toISOString().split("T")[0],
      client_id: newInvoice.dealerId || null,
      client_details: {
        name: targetDealerName || "Direct Client / Walk-in",
        phone: "+91 9900990099",
      },
      items: [
        { name: newInvoice.itemName, qty: qtyNum, price: priceNum }
      ],
      subtotal: itemSubtotal,
      total_tax: taxAmount,
      grand_total: grandTotal,
      balance_due: grandTotal,
    };

    // Update dealers state locally to reflect outstanding and sales changes
    if (newInvoice.dealerId) {
      setDealerList(prev => prev.map(d => {
        if (d.id === newInvoice.dealerId) {
          return {
            ...d,
            outstanding: d.outstanding + grandTotal,
            totalRevenue: d.totalRevenue + grandTotal,
          };
        }
        return d;
      }));
    }

    setInvoices(prev => [created, ...prev]);
    setIsAddInvoiceOpen(false);
    setNewInvoice({ invoice_no: "", dealerId: "", dealerName: "", itemName: "", qty: "", price: "", isTaxInclusive: false });
    showToast("success", `Invoice ${created.invoice_no} raised successfully!`);
  };

  // Record Inflow handler
  const handleRecordInflow = () => {
    if (!newInflow.dealerId || !newInflow.amount) {
      showToast("error", "Dealer and amount are required.");
      return;
    }

    const inflowAmt = Number(newInflow.amount) || 0;

    // Deduct outstanding from dealerList
    setDealerList(prev => prev.map(d => {
      if (d.id === newInflow.dealerId) {
        return {
          ...d,
          outstanding: Math.max(0, d.outstanding - inflowAmt),
        };
      }
      return d;
    }));

    // Deduct balance due from invoices that belong to this dealer
    setInvoices(prev => {
      let remainingPayment = inflowAmt;
      return prev.map(inv => {
        if (inv.client_id === newInflow.dealerId && (inv.balance_due || 0) > 0) {
          const currentDue = inv.balance_due || 0;
          if (remainingPayment >= currentDue) {
            remainingPayment -= currentDue;
            return { ...inv, balance_due: 0 };
          } else {
            const updatedDue = currentDue - remainingPayment;
            remainingPayment = 0;
            return { ...inv, balance_due: updatedDue };
          }
        }
        return inv;
      });
    });

    const dealerObj = dealerList.find(d => d.id === newInflow.dealerId);
    setIsPaymentInflowOpen(false);
    setNewInflow({ dealerId: "", amount: "", mode: "NEFT", reference: "" });
    showToast("success", `Payment of ₹${inflowAmt.toLocaleString("en-IN")} recorded from ${dealerObj?.name ?? "Dealer"}.`);
  };

  // Add Expense handler
  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.description) {
      showToast("error", "Amount and description are required.");
      return;
    }

    const created: DBExpense = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      category: newExpense.category,
      amount: Number(newExpense.amount) || 0,
      description: newExpense.description,
      date: newExpense.date,
    };

    setExpenses(prev => [created, ...prev]);
    setIsAddExpenseOpen(false);
    setNewExpense({ category: "Raw Material", amount: "", description: "", date: new Date().toISOString().split("T")[0] });
    showToast("success", `Expense for ${created.category} of ₹${created.amount.toLocaleString("en-IN")} logged.`);
  };

  // Metrics calculators
  const totalSalesRevenue = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.grand_total, 0);
  }, [invoices]);

  const totalOutstanding = useMemo(() => {
    return dealerList.reduce((sum, d) => sum + d.outstanding, 0);
  }, [dealerList]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const netProfit = totalSalesRevenue - totalExpenses;
  const grossMarginPct = totalSalesRevenue > 0 ? ((totalSalesRevenue - totalExpenses) / totalSalesRevenue) * 100 : 0;

  // Filter invoices for display
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv =>
      inv.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client_details.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [invoices, searchTerm]);

  return (
    <div className="space-y-6">
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

      {/* Breadcrumb Navigation */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
        <span>{t("Home")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Financial Intelligence")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <TrendingUp className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Financial Intelligence")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t("Corporate balance sheet, sales margins, outstanding aging index, and profit audit.")}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsPaymentInflowOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Banknote size={14} /> Record Inflow
          </button>
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <CreditCard size={14} /> Record Expense
          </button>
          <button
            onClick={() => setIsAddInvoiceOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={14} /> Raise Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Gross Revenue", value: `₹${(totalSalesRevenue / 100000).toFixed(2)} L`, icon: <TrendingUp className="text-emerald-500" />, trend: "YTD Sales Logged" },
          { label: "Net Operating Profit", value: `₹${(netProfit / 100000).toFixed(2)} L`, icon: <IndianRupee className="text-primary" />, trend: "Gross less expenses" },
          { label: "Gross Margin Rate", value: `${grossMarginPct.toFixed(1)}%`, icon: <Percent className="text-violet-500" />, trend: "Target: 30%+" },
          { label: "Outstanding Dues", value: `₹${(totalOutstanding / 100000).toFixed(2)} L`, icon: <AlertTriangle className="text-rose-500" />, trend: "Active Credit Exposure" }
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
          { key: "sales", label: "Sales & Revenue Ledger", icon: <FileText size={13} /> },
          { key: "receivables", label: "Receivables & Aging", icon: <AlertTriangle size={13} /> },
          { key: "profitability", label: "Product Profitability", icon: <BarChart3 size={13} /> },
          { key: "expenses", label: "Expense Ledger", icon: <CreditCard size={13} /> },
          { key: "tax", label: "Tax & GST Prediction", icon: <PieChart size={13} /> }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key as any); setSearchTerm(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.key ? "bg-muted text-foreground border-border/80" : "bg-background hover:bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            {tab.icon}{t(tab.label)}
          </button>
        ))}
      </div>

      {/* ─── TAB: SALES & REVENUE LEDGER ─── */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search invoices by number or client…"
                className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-xl text-xs focus:outline-none focus:border-primary font-semibold text-foreground"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-muted/50 border-b border-border">
                  <tr className="text-xs uppercase text-muted-foreground font-bold">
                    <th className="p-4">Invoice No</th>
                    <th className="p-4">Billing Client</th>
                    <th className="p-4">Invoice Date</th>
                    <th className="p-4">Tax (GST 18%)</th>
                    <th className="p-4 text-right">Grand Total</th>
                    <th className="p-4 text-right">Balance Due</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {filteredInvoices.map(inv => {
                    const balance = inv.balance_due !== undefined ? inv.balance_due : inv.grand_total;
                    const isSettled = balance <= 0;
                    return (
                      <tr key={inv.id} className="hover:bg-background/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-primary">{inv.invoice_no}</td>
                        <td className="p-4 font-bold text-foreground">
                          <p>{inv.client_details.name}</p>
                          <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{inv.client_details.phone || "No phone"}</p>
                        </td>
                        <td className="p-4 text-muted-foreground font-semibold">{inv.invoice_date}</td>
                        <td className="p-4 text-muted-foreground font-mono">₹{inv.total_tax.toLocaleString("en-IN")}</td>
                        <td className="p-4 text-right font-mono font-bold text-foreground">₹{inv.grand_total.toLocaleString("en-IN")}</td>
                        <td className="p-4 text-right font-mono font-black text-rose-500">₹{balance.toLocaleString("en-IN")}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-black border uppercase ${
                            isSettled ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          }`}>{isSettled ? "SETTLED" : "UNPAID"}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground font-medium">No sales invoices logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: RECEIVABLES & AGING ─── */}
      {activeTab === "receivables" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-5 rounded-2xl flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-foreground">Receivables Credit Age</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Dealer credits grouped by overdue intervals.</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-rose-500">₹{totalOutstanding.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Net Account Receivables</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "0 - 30 Days Overdue", val: totalOutstanding * 0.65, count: "5 Invoices", progress: "w-[65%]", color: "bg-emerald-500" },
              { label: "31 - 60 Days Overdue", val: totalOutstanding * 0.25, count: "2 Invoices", progress: "w-[25%]", color: "bg-amber-500" },
              { label: "60+ Days Overdue (Critical)", val: totalOutstanding * 0.10, count: "1 Invoice", progress: "w-[10%]", color: "bg-rose-500" }
            ].map(col => (
              <div key={col.label} className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-start text-xs font-semibold">
                  <span className="text-muted-foreground">{col.label}</span>
                  <span className="text-foreground">{col.count}</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground font-mono">₹{col.val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mt-2">
                    <div className={`h-full ${col.progress} ${col.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h4 className="text-sm font-black text-foreground mb-4">Outstanding Balances By Partner</h4>
            <div className="space-y-3">
              {dealerList.filter(d => d.outstanding > 0).map(d => (
                <div key={d.id} className="flex justify-between items-center bg-muted/30 border border-border/40 p-4 rounded-xl text-xs font-semibold">
                  <div>
                    <p className="text-foreground">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground">ID: {d.id} · {d.territory}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-mono font-black text-rose-500 text-sm">₹{d.outstanding.toLocaleString("en-IN")}</p>
                    <button onClick={() => showToast("success", `Overdue balance reminder dispatched to ${d.name}`)}
                      className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                      Trigger Alert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: PRODUCT PROFITABILITY ─── */}
      {activeTab === "profitability" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground">Gross Margins & Manufacturing Cost Breakdowns</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Calculated product profitability logs comparing standard selling price vs raw material cost.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { name: "Weather Shield Ultima Smooth (20L)", mrp: 8800, cost: 5800, margin: "34%" },
              { name: "Rustic Royale Luxe Emulsion (20L)", mrp: 7400, cost: 4900, margin: "33%" },
              { name: "Acrylic Wall Putty Superfine (40Kg)", mrp: 1100, cost: 720, margin: "34%" },
              { name: "Gloss Enamel White Premium (20L)", mrp: 5400, cost: 3800, margin: "29%" }
            ].map(prod => (
              <div key={prod.name} className="bg-card border border-border rounded-2xl p-5 space-y-3 hover:border-primary/20 transition-all">
                <div className="flex justify-between items-start text-xs font-semibold">
                  <p className="text-foreground font-bold text-sm">{prod.name}</p>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded font-black">{prod.margin} Margin</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center pt-2">
                  <div className="bg-muted/40 p-2.5 rounded border border-border">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold">Billing Price</span>
                    <span className="font-bold text-foreground mt-0.5 block">₹{prod.mrp.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="bg-muted/40 p-2.5 rounded border border-border">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold">Mfg Cost</span>
                    <span className="font-bold text-foreground mt-0.5 block">₹{prod.cost.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="bg-muted/40 p-2.5 rounded border border-border">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold">Net Profit</span>
                    <span className="font-black text-emerald-500 mt-0.5 block">₹{(prod.mrp - prod.cost).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB: EXPENSE LEDGER ─── */}
      {activeTab === "expenses" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-5 rounded-2xl flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-foreground">Operational Expenses Ledger</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Audit outflows mapped to factory operations, raw materials procurement, and utility salaries.</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-rose-500">₹{totalExpenses.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Total Expenses Outflow</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-muted/50 border-b border-border">
                  <tr className="text-xs uppercase text-muted-foreground font-bold">
                    <th className="p-4">Expense ID</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-right">Amount Paid</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-background/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-primary">{exp.id}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                          exp.category === "Raw Material" ? "bg-violet-500/10 text-violet-500 border-violet-500/20" :
                          exp.category === "Rent" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                          exp.category === "Salaries" ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" :
                          "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}>{exp.category}</span>
                      </td>
                      <td className="p-4 text-muted-foreground font-semibold">{exp.description}</td>
                      <td className="p-4 text-right font-mono font-bold text-rose-500">₹{exp.amount.toLocaleString("en-IN")}</td>
                      <td className="p-4 text-muted-foreground font-semibold">{exp.date}</td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium">No expenses logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: TAX & GST PREDICTION ─── */}
      {activeTab === "tax" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-5 rounded-2xl flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-foreground">Predictive GST & Income Tax Liability</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Provisional metrics based on YTD transactions for internal audits.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GST breakdown */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-black text-foreground">GST Ledger (18% Collected)</h4>
              <div className="bg-muted/40 border border-border/40 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex justify-between text-muted-foreground"><span>Collected CGST (9%)</span><span className="font-mono font-bold text-foreground">₹{(totalSalesRevenue * 0.09).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Collected SGST (9%)</span><span className="font-mono font-bold text-foreground">₹{(totalSalesRevenue * 0.09).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></div>
                <div className="h-px bg-border/40" />
                <div className="flex justify-between text-xs font-bold text-foreground"><span>Total GST Collected Liability</span><span className="font-mono font-black text-primary">₹{(totalSalesRevenue * 0.18).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></div>
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold">⚠️ All calculations are estimates based on standard CGST/SGST invoicing splits.</p>
            </div>

            {/* Income Tax */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-black text-foreground">Corporate Income Tax Estimate (Provisional 25%)</h4>
              <div className="bg-muted/40 border border-border/40 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex justify-between text-muted-foreground"><span>Estimated Net Taxable Profit</span><span className="font-mono font-bold text-foreground">₹{Math.max(0, netProfit).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Corporate Tax Slab</span><span className="font-bold text-foreground">25.0% Flat</span></div>
                <div className="h-px bg-border/40" />
                <div className="flex justify-between text-xs font-bold text-foreground"><span>Estimated Tax Provision</span><span className="font-mono font-black text-rose-500">₹{Math.max(0, netProfit * 0.25).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></div>
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold">⚠️ Final figures may change during CA Audit filing schedules.</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: RECORD PAYMENT INFLOW
      ══════════════════════════════════════════ */}
      {isPaymentInflowOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-base font-black text-foreground">Record Payment Inflow</h2>
              <button onClick={() => setIsPaymentInflowOpen(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X size={16}/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Select Dealer Store *</label>
                <select
                  value={newInflow.dealerId}
                  onChange={e => setNewInflow(i => ({ ...i, dealerId: e.target.value }))}
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                >
                  <option value="">Choose partner…</option>
                  {dealerList.map(d => (
                    <option key={d.id} value={d.id}>{d.name} (Due: ₹{d.outstanding.toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Settlement Amount (₹) *</label>
                <input
                  type="number" value={newInflow.amount}
                  onChange={e => setNewInflow(i => ({ ...i, amount: e.target.value }))}
                  placeholder="50000"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Payment Mode</label>
                  <select
                    value={newInflow.mode}
                    onChange={e => setNewInflow(i => ({ ...i, mode: e.target.value }))}
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  >
                    {["NEFT", "RTGS", "UPI", "Cheque", "Cash"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Reference / Note</label>
                  <input
                    type="text" value={newInflow.reference}
                    onChange={e => setNewInflow(i => ({ ...i, reference: e.target.value }))}
                    placeholder="TXN99123..."
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsPaymentInflowOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleRecordInflow} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: RECORD EXPENSE OUTFLOW
      ══════════════════════════════════════════ */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-base font-black text-foreground">Record Expense Outflow</h2>
              <button onClick={() => setIsAddExpenseOpen(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X size={16}/></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Expense Category *</label>
                  <select
                    value={newExpense.category}
                    onChange={e => setNewExpense(x => ({ ...x, category: e.target.value }))}
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  >
                    {["Raw Material", "Rent", "Salaries", "Utilities", "Logistics", "Other"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Amount (₹) *</label>
                  <input
                    type="number" value={newExpense.amount}
                    onChange={e => setNewExpense(x => ({ ...x, amount: e.target.value }))}
                    placeholder="120000"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Description / Particulars *</label>
                <textarea
                  value={newExpense.description}
                  onChange={e => setNewExpense(x => ({ ...x, description: e.target.value }))}
                  rows={2} placeholder="e.g. Chemical dye purchase Bill #90"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Date</label>
                <input
                  type="date" value={newExpense.date}
                  onChange={e => setNewExpense(x => ({ ...x, date: e.target.value }))}
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsAddExpenseOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleAddExpense} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">
                Log Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: RAISE INVOICE
      ══════════════════════════════════════════ */}
      {isAddInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-base font-black text-foreground">Raise Sales Invoice</h2>
              <button onClick={() => setIsAddInvoiceOpen(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X size={16}/></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Invoice Number *</label>
                  <input
                    type="text" value={newInvoice.invoice_no}
                    onChange={e => setNewInvoice(i => ({ ...i, invoice_no: e.target.value }))}
                    placeholder="e.g. INV-2026-042"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Map to Dealer (Store)</label>
                  <select
                    value={newInvoice.dealerId}
                    onChange={e => setNewInvoice(i => ({ ...i, dealerId: e.target.value }))}
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  >
                    <option value="">Direct / One-off Client</option>
                    {dealerList.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {!newInvoice.dealerId && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Client Name (Direct Billing) *</label>
                  <input
                    type="text" value={newInvoice.dealerName}
                    onChange={e => setNewInvoice(i => ({ ...i, dealerName: e.target.value }))}
                    placeholder="e.g. Ramesh Kumar Retailer"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Product Description *</label>
                <input
                  type="text" value={newInvoice.itemName}
                  onChange={e => setNewInvoice(i => ({ ...i, itemName: e.target.value }))}
                  placeholder="e.g. Weather Shield Ext (20L)"
                  className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Quantity *</label>
                  <input
                    type="number" value={newInvoice.qty}
                    onChange={e => setNewInvoice(i => ({ ...i, qty: e.target.value }))}
                    placeholder="10"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Unit Price (₹ Excl Tax) *</label>
                  <input
                    type="number" value={newInvoice.price}
                    onChange={e => setNewInvoice(i => ({ ...i, price: e.target.value }))}
                    placeholder="6500"
                    className="w-full bg-muted/40 border border-border rounded-xl text-sm px-3 py-2.5 text-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsAddInvoiceOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleAddInvoice} className="flex-1 bg-primary hover:bg-primary-hover text-white text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer">
                Raise Invoice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
