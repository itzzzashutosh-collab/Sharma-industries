"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { 
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, 
  Calendar, Plus, Filter, Landmark, FileText, PieChart as PieIcon,
  HelpCircle, X, Coins, CheckSquare, ClipboardList, ShieldAlert,
  Search, Check, Calculator
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend
} from "recharts";
import { getCashFlowData, createCustomTransaction } from "@/actions/cashFlowActions";

interface AuditSession {
  id: string;
  date: string;
  expectedBalance: number;
  physicalCount: number;
  difference: number;
  status: "MATCHED" | "SURPLUS" | "DEFICIT";
  auditedBy: string;
}

export default function CashFlowPage() {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  // Date Filters
  const getStartOfMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  };
  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [dateRange, setDateRange] = useState({
    startDate: getStartOfMonth(),
    endDate: getToday()
  });

  const [activeTab, setActiveTab] = useState<"general" | "register" | "audits">("general");
  const [searchTerm, setSearchTerm] = useState("");

  const [ledgerList, setLedgerList] = useState<any[]>([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // New Transaction Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: getToday(),
    type: "OUTFLOW" as "INFLOW" | "OUTFLOW",
    category: "Overheads",
    amount: "",
    payment_mode: "Bank Transfer",
    note: ""
  });

  // Reconcile Drawer Form State
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);
  const [physicalCount, setPhysicalCount] = useState("");

  // Audit Logs State
  const [auditSessions, setAuditSessions] = useState<AuditSession[]>([
    { id: "AUD-01", date: "2026-07-10", expectedBalance: 24500, physicalCount: 24500, difference: 0, status: "MATCHED", auditedBy: "CA Amit Mehta" },
    { id: "AUD-02", date: "2026-07-05", expectedBalance: 18450, physicalCount: 18400, difference: -50, status: "DEFICIT", auditedBy: "CA Amit Mehta" }
  ]);

  const customCategories = [
    "Overheads",
    "Owner Capital",
    "Tax Payment",
    "Machinery & Assets",
    "Bank Loan & Interest",
    "Marketing & Overhead",
    "Miscellaneous Expense",
    "Miscellaneous Inflow"
  ];

  useEffect(() => {
    fetchCashFlow();
  }, [dateRange.startDate, dateRange.endDate]);

  const fetchCashFlow = async () => {
    setLoading(true);
    const res = await getCashFlowData(dateRange.startDate, dateRange.endDate);
    if (res.success && res.data) {
      setLedgerList(res.data.ledgerList);
      setOpeningBalance(res.data.openingBalance);
    }
    setLoading(false);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    startTransition(async () => {
      const res = await createCustomTransaction({
        date: formData.date,
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        payment_mode: formData.payment_mode,
        note: formData.note
      });

      if (res.success) {
        setIsAddOpen(false);
        setFormData({
          date: getToday(),
          type: "OUTFLOW",
          category: "Overheads",
          amount: "",
          payment_mode: "Bank Transfer",
          note: ""
        });
        fetchCashFlow();
      } else {
        alert("Error saving transaction: " + res.error);
      }
    });
  };

  // Summaries Calculations
  const summaries = useMemo(() => {
    let inflows = 0;
    let outflows = 0;
    const categoryTotals: Record<string, number> = {};

    ledgerList.forEach(item => {
      if (item.type === "INFLOW") {
        inflows += item.amount;
      } else {
        outflows += item.amount;
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
      }
    });

    const netFlow = inflows - outflows;
    const endingBalance = openingBalance + netFlow;

    // Map Category Breakdown for chart
    const categoryData = Object.keys(categoryTotals).map(name => ({
      name,
      value: categoryTotals[name]
    })).sort((a, b) => b.value - a.value);

    return {
      inflows,
      outflows,
      netFlow,
      endingBalance,
      categoryData
    };
  }, [ledgerList, openingBalance]);

  // Cash Register metrics (HARD CASH - payment mode: "Cash" or "CASH")
  const cashRegisterSummary = useMemo(() => {
    let cashIn = 0;
    let cashOut = 0;

    ledgerList.forEach(item => {
      const isCash = item.payment_mode && item.payment_mode.toLowerCase() === "cash";
      if (isCash) {
        if (item.type === "INFLOW") {
          cashIn += item.amount;
        } else {
          cashOut += item.amount;
        }
      }
    });

    // Assume simulated opening cash in drawer
    const openingCash = 15000;
    const netCash = cashIn - cashOut;
    const currentCashInHand = openingCash + netCash;

    return {
      openingCash,
      cashIn,
      cashOut,
      currentCashInHand
    };
  }, [ledgerList]);

  // Handle drawer reconciliation count submit
  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!physicalCount) return;

    const physicalAmt = parseFloat(physicalCount);
    const expectedAmt = cashRegisterSummary.currentCashInHand;
    const diff = physicalAmt - expectedAmt;
    let status: "MATCHED" | "SURPLUS" | "DEFICIT" = "MATCHED";
    if (diff > 0) status = "SURPLUS";
    if (diff < 0) status = "DEFICIT";

    const newAudit: AuditSession = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split("T")[0],
      expectedBalance: expectedAmt,
      physicalCount: physicalAmt,
      difference: diff,
      status,
      auditedBy: "CA Amit Mehta"
    };

    setAuditSessions(prev => [newAudit, ...prev]);
    setIsReconcileOpen(false);
    setPhysicalCount("");
    alert(`Audit logged! Drawer variance: ₹${diff.toLocaleString()}`);
  };

  // Chart Trend Data Compilation (grouped by date)
  const chartData = useMemo(() => {
    const dailyData: Record<string, { date: string; cashIn: number; cashOut: number }> = {};
    
    // Fill all dates in range with zero values to show continuous graph line
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyData[dateStr] = {
        date: new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        cashIn: 0,
        cashOut: 0
      };
    }

    // Accumulate ledger entries
    ledgerList.forEach(item => {
      const dateKey = item.date;
      if (dailyData[dateKey]) {
        if (item.type === "INFLOW") {
          dailyData[dateKey].cashIn += item.amount;
        } else {
          dailyData[dateKey].cashOut += item.amount;
        }
      }
    });

    return Object.values(dailyData).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [ledgerList, dateRange]);

  // Filtered lists for tabs
  const cashTransactionsOnly = useMemo(() => {
    return ledgerList.filter(item => 
      item.payment_mode && item.payment_mode.toLowerCase() === "cash" &&
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ledgerList, searchTerm]);

  return (
    <div className="space-y-6 pb-20 font-sans max-w-7xl mx-auto p-6 animate-in fade-in duration-500">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Coins className="text-primary w-8 h-8" />
            {t("Factory Cash Flow")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t("Track real-time liquidity, material procurements, payroll, and physical cash box balances")}</p>
        </div>
        
        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-card border border-border px-4 py-2.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Calendar size={14} />
            <span>{t("Period")}:</span>
          </div>
          <input 
            type="date"
            value={dateRange.startDate}
            onChange={e => setDateRange({...dateRange, startDate: e.target.value})}
            className="bg-background border border-border text-foreground rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold"
          />
          <span className="text-muted-foreground text-xs font-bold">to</span>
          <input 
            type="date"
            value={dateRange.endDate}
            onChange={e => setDateRange({...dateRange, endDate: e.target.value})}
            className="bg-background border border-border text-foreground rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold"
          />
          <button 
            onClick={() => setIsAddOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ml-2 cursor-pointer shadow-sm"
          >
            <Plus size={14} /> {t("New Entry")}
          </button>
        </div>
      </div>

      {/* KPI Summaries Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Opening Balance", value: `₹${openingBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: "text-foreground", bg: "bg-card" },
          { label: "Cash Inflow", value: `₹${summaries.inflows.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: "text-emerald-500", bg: "bg-card" },
          { label: "Cash Outflow", value: `₹${summaries.outflows.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: "text-rose-500", bg: "bg-card" },
          { label: "Net Cash Flow", value: `₹${summaries.netFlow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: summaries.netFlow >= 0 ? "text-emerald-500" : "text-rose-500", bg: "bg-card" },
          { label: "Cash Drawer Balance", value: `₹${cashRegisterSummary.currentCashInHand.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: "text-primary", bg: "bg-primary/10 border border-primary/20", labelIcon: <Coins size={12} className="text-primary animate-pulse" /> }
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border border-border p-4 rounded-2xl flex flex-col justify-between hover:shadow-sm transition-all`}>
            <div className="flex justify-between items-center text-xs font-bold text-muted-foreground leading-tight">
              <span>{t(stat.label)}</span>
              {stat.labelIcon}
            </div>
            <p className={`text-xl font-black ${stat.color} mt-4`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
        {[
          { key: "general", label: "Cash Flow Analytics", icon: <TrendingUp size={13} /> },
          { key: "register", label: "Cash Register Ledger", icon: <Coins size={13} /> },
          { key: "audits", label: "Cash Drawer Audits", icon: <CheckSquare size={13} /> }
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

      {/* ─── TAB: CASH FLOW ANALYTICS ─── */}
      {activeTab === "general" && (
        <div className="space-y-6">
          {/* Interactive Trend Chart */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-black text-foreground mb-4">{t("Cash Flow Trend (Inflow vs Outflow)")}</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: 'var(--foreground)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area name={t("Cash In")} type="monotone" dataKey="cashIn" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorInflow)" />
                  <Area name={t("Cash Out")} type="monotone" dataKey="cashOut" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorOutflow)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ledger logs Table */}
            <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <h2 className="text-base font-black text-foreground mb-4">{t("Transactional Ledger")}</h2>
                
                {loading ? (
                  <div className="text-center py-12 font-bold text-muted-foreground">{t("Loading ledger logs...")}</div>
                ) : ledgerList.length === 0 ? (
                  <div className="text-center py-12 font-bold text-muted-foreground bg-background rounded-2xl border border-dashed border-border/60">{t("No transactions logged in this period.")}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-bold">
                          <th className="pb-3 pr-3">{t("Date")}</th>
                          <th className="pb-3 px-3">{t("Category")}</th>
                          <th className="pb-3 px-3">{t("Flow")}</th>
                          <th className="pb-3 px-3">{t("Mode")}</th>
                          <th className="pb-3 pl-3 text-right">{t("Amount (₹)")}</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {ledgerList.map((item, idx) => {
                          const isIncoming = item.type === "INFLOW";
                          return (
                            <tr key={idx} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                              <td className="py-3.5 pr-3 font-mono text-xs text-muted-foreground">
                                {new Date(item.date).toLocaleDateString('en-IN')}
                              </td>
                              <td className="py-3.5 px-3">
                                <span className="font-bold text-foreground">{item.category}</span>
                                {item.reference && (
                                  <span className="text-[10px] text-muted-foreground font-mono block">Ref: {item.reference}</span>
                                )}
                              </td>
                              <td className="py-3.5 px-3">
                                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isIncoming ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                }`}>
                                  {isIncoming ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                  {isIncoming ? "IN" : "OUT"}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-muted-foreground text-xs font-semibold">{item.payment_mode}</td>
                              <td className={`py-3.5 pl-3 text-right font-black text-sm ${isIncoming ? 'text-emerald-500' : 'text-foreground'}`}>
                                {isIncoming ? '+' : '-'}₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Categories Breakdown & Visual Pie charts */}
            <div className="lg:col-span-1 space-y-6">
              {/* Expenditure Breakdown */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                <h2 className="text-base font-black text-foreground mb-4 flex items-center gap-2">
                  <PieIcon size={18} className="text-primary" /> {t("Expenditure Breakup")}
                </h2>
                
                {summaries.categoryData.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-semibold italic text-center py-6">{t("No expenditure data to analyze.")}</p>
                ) : (
                  <div className="space-y-4">
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={summaries.categoryData} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} width={100} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '10px' }}
                            formatter={(val: any) => [`₹${Number(val || 0).toLocaleString('en-IN')}`, t("Expenditure")]}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {summaries.categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? "#f43f5e" : index === 1 ? "#fb7185" : "#fda4af"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="pt-2 border-t border-border/40 space-y-2">
                      {summaries.categoryData.slice(0, 3).map((item, idx) => {
                        const pct = summaries.outflows > 0 ? ((item.value / summaries.outflows) * 100).toFixed(0) : "0";
                        return (
                          <div key={idx} className="flex justify-between items-center text-xs font-bold">
                            <span className="text-muted-foreground">{item.name}</span>
                            <span className="text-foreground">₹{item.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })} <span className="text-xs text-muted-foreground opacity-75">({pct}%)</span></span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Informational Notice */}
              <div className="bg-primary/10 border border-primary/20 rounded-3xl p-5 space-y-2">
                <h3 className="text-xs font-black text-primary flex items-center gap-1.5">
                  <HelpCircle size={16} /> {t("ERP Audit Integrity")}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("This cash flow compile aggregates sales inflows from invoices marked PAID, outward chemical/bucket acquisitions, personnel payroll salary disbursements, and factory overhead utilities.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: CASH REGISTER LEDGER ─── */}
      {activeTab === "register" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center gap-4 bg-card border border-border p-5 rounded-2xl">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search cash entries by category…"
                className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-xl text-xs focus:outline-none focus:border-primary font-semibold text-foreground"
              />
            </div>
            
            <button
              onClick={() => setIsReconcileOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Calculator size={14} /> Reconcile Drawer
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-muted/50 border-b border-border">
                  <tr className="text-xs uppercase text-muted-foreground font-bold">
                    <th className="p-4">Date</th>
                    <th className="p-4">Particulars</th>
                    <th className="p-4">Flow</th>
                    <th className="p-4">Method / Reference</th>
                    <th className="p-4 text-right">Inflow Amount</th>
                    <th className="p-4 text-right">Outflow Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs font-semibold">
                  {/* Opening balance line */}
                  <tr className="bg-muted/20">
                    <td className="p-4 font-mono font-bold text-muted-foreground">—</td>
                    <td className="p-4 font-bold text-foreground">Cash Box Opening Balance</td>
                    <td className="p-4"><span className="px-2 py-0.5 bg-muted border border-border rounded text-[9px] font-black text-muted-foreground uppercase">POOL</span></td>
                    <td className="p-4 text-muted-foreground font-mono">Drawer Startup</td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-500">₹{cashRegisterSummary.openingCash.toLocaleString()}</td>
                    <td className="p-4 text-right font-mono text-muted-foreground">—</td>
                  </tr>

                  {cashTransactionsOnly.map((item, idx) => {
                    const isIn = item.type === "INFLOW";
                    return (
                      <tr key={idx} className="hover:bg-background/40 transition-colors">
                        <td className="p-4 font-mono text-muted-foreground">{new Date(item.date).toLocaleDateString('en-IN')}</td>
                        <td className="p-4 text-foreground">
                          <p>{item.category}</p>
                          {item.description && <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{item.description}</p>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-black border uppercase ${
                            isIn ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          }`}>{isIn ? "CASH-IN" : "CASH-OUT"}</span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-muted-foreground">Drawer Allocation</td>
                        <td className="p-4 text-right font-mono font-black text-emerald-500">
                          {isIn ? `₹${item.amount.toLocaleString()}` : "—"}
                        </td>
                        <td className="p-4 text-right font-mono font-black text-rose-500">
                          {!isIn ? `₹${item.amount.toLocaleString()}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                  {cashTransactionsOnly.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium">No cash box transactions logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: CASH DRAWER AUDITS ─── */}
      {activeTab === "audits" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-foreground">Physical Cash Drawer Audit History</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Logs matching expected digital totals vs physical box count values.</p>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/50 border-b border-border">
                <tr className="text-xs uppercase text-muted-foreground font-bold">
                  <th className="p-4">Audit ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Expected Drawer Balance</th>
                  <th className="p-4 text-right">Physical Count Amount</th>
                  <th className="p-4 text-right">Variance / Difference</th>
                  <th className="p-4 text-center">Audit Status</th>
                  <th className="p-4">Audited By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-semibold text-xs">
                {auditSessions.map(aud => (
                  <tr key={aud.id} className="hover:bg-muted/10">
                    <td className="p-4 font-mono font-bold text-primary">{aud.id}</td>
                    <td className="p-4 text-muted-foreground">{aud.date}</td>
                    <td className="p-4 text-right font-mono text-foreground">₹{aud.expectedBalance.toLocaleString()}</td>
                    <td className="p-4 text-right font-mono text-foreground">₹{aud.physicalCount.toLocaleString()}</td>
                    <td className={`p-4 text-right font-mono font-bold ${
                      aud.difference === 0 ? "text-emerald-500" : aud.difference > 0 ? "text-blue-500" : "text-rose-500"
                    }`}>
                      {aud.difference > 0 ? "+" : ""}{aud.difference === 0 ? "₹0 (Balanced)" : `₹${aud.difference.toLocaleString()}`}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${
                        aud.status === "MATCHED" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                        aud.status === "SURPLUS" ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" :
                        "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                      }`}>{aud.status}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">{aud.auditedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD CUSTOM TRANSACTION MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-6 animate-in zoom-in duration-200">
            
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-base font-black text-foreground">{t("Add Custom Cash Entry")}</h2>
              <button 
                onClick={() => setIsAddOpen(false)} 
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4 text-xs font-bold text-muted-foreground">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">{t("Entry Type")}</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="OUTFLOW">Outflow (Debit / Spend)</option>
                    <option value="INFLOW">Inflow (Credit / Receipt)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">{t("Date")}</label>
                  <input 
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">{t("Category")}</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold"
                  >
                    {customCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase block mb-1">{t("Payment Mode")}</label>
                  <select 
                    value={formData.payment_mode}
                    onChange={e => setFormData({...formData, payment_mode: e.target.value})}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI / QR Code">UPI / QR Code</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase block mb-1">{t("Amount (₹)")} *</label>
                <input 
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  placeholder="Enter monetary transaction amount"
                  className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase block mb-1">{t("Note / Description")}</label>
                <textarea 
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                  placeholder="Add note details, invoice reference numbers, etc."
                  rows={3}
                  className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary text-foreground resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="bg-muted hover:bg-muted/80 text-foreground px-5 py-2.5 rounded-xl font-bold transition-all text-sm cursor-pointer"
                >
                  {t("Cancel")}
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 cursor-pointer"
                >
                  {isPending ? t("Saving...") : t("Add Entry")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECONCILE CASH DRAWER MODAL */}
      {isReconcileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-5 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-base font-black text-foreground flex items-center gap-2">
                <Calculator size={16} className="text-primary" /> Reconcile Cash Drawer
              </h2>
              <button 
                onClick={() => setIsReconcileOpen(false)} 
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleReconcileSubmit} className="space-y-4 text-xs font-bold text-muted-foreground">
              <div className="text-center bg-muted/30 border border-border/40 p-4 rounded-2xl space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Expected Drawer Total</p>
                <p className="text-2xl font-black text-foreground font-mono">₹{cashRegisterSummary.currentCashInHand.toLocaleString()}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase block mb-1">Physical Hard Cash Count (₹) *</label>
                <input 
                  type="number"
                  required
                  step="0.01"
                  value={physicalCount}
                  onChange={e => setPhysicalCount(e.target.value)}
                  placeholder="Enter physical cash box count"
                  className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-mono text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsReconcileOpen(false)} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-xs font-bold py-2.5 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-black py-2.5 rounded-xl cursor-pointer">
                  Log Audit Run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
