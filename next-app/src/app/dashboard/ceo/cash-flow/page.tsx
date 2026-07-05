"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Plus, 
  Filter, 
  Landmark, 
  FileText,
  PieChart as PieIcon,
  HelpCircle,
  X
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend
} from "recharts";
import { getCashFlowData, createCustomTransaction } from "@/actions/cashFlowActions";

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

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">{t("Factory Cash Flow")}</h1>
          <p className="text-muted-foreground text-sm font-medium">{t("Track real-time liquidity, material procurements, payroll, and overhead expenses")}</p>
        </div>
        
        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-card border border-border px-4 py-2.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Calendar size={16} />
            <span>{t("Period")}:</span>
          </div>
          <input 
            type="date"
            value={dateRange.startDate}
            onChange={e => setDateRange({...dateRange, startDate: e.target.value})}
            className="bg-background border border-border text-foreground rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-bold"
          />
          <span className="text-muted-foreground text-xs font-bold">to</span>
          <input 
            type="date"
            value={dateRange.endDate}
            onChange={e => setDateRange({...dateRange, endDate: e.target.value})}
            className="bg-background border border-border text-foreground rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-bold"
          />
          <button 
            onClick={() => setIsAddOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ml-2"
          >
            <Plus size={14} /> {t("New Entry")}
          </button>
        </div>
      </div>

      {/* KPI Summaries Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        
        {/* Opening Balance */}
        <div className="bg-card border border-border p-5 rounded-3xl relative overflow-hidden group shadow-sm">
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-wider">{t("Opening Balance")}</p>
          <p className="text-2xl font-black text-foreground mt-2">₹{openingBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{t("Pre-selected start date cash pool")}</p>
        </div>

        {/* Total Inflows */}
        <div className="bg-card border border-border p-5 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-emerald-500/10 transition-shadow">
          <div className="absolute top-4 right-4 bg-emerald-500/10 p-1.5 rounded-lg text-emerald-400"><TrendingUp size={16} /></div>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-wider">{t("Cash Inflow")}</p>
          <p className="text-2xl font-black text-emerald-500 mt-2">₹{summaries.inflows.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{t("Sales + Custom receipts")}</p>
        </div>

        {/* Total Outflows */}
        <div className="bg-card border border-border p-5 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-rose-500/10 transition-shadow">
          <div className="absolute top-4 right-4 bg-rose-500/10 p-1.5 rounded-lg text-rose-400"><TrendingDown size={16} /></div>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-wider">{t("Cash Outflow")}</p>
          <p className="text-2xl font-black text-rose-500 mt-2">₹{summaries.outflows.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{t("Procurement + Salaries + Expenses")}</p>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-card border border-border p-5 rounded-3xl relative overflow-hidden group shadow-sm">
          <div className="absolute top-4 right-4 p-1.5 text-muted-foreground">
            {summaries.netFlow >= 0 ? <ArrowUpRight size={18} className="text-emerald-500" /> : <ArrowDownRight size={18} className="text-rose-500" />}
          </div>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-wider">{t("Net Cash Flow")}</p>
          <p className={`text-2xl font-black mt-2 ${summaries.netFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            ₹{summaries.netFlow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">{t("Net balance variance in period")}</p>
        </div>

        {/* Ending Balance */}
        <div className="bg-card border border-border p-5 rounded-3xl relative overflow-hidden group shadow-sm">
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-wider">{t("Ending Balance")}</p>
          <p className="text-2xl font-black text-primary mt-2">₹{summaries.endingBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{t("Total net available liquid funds")}</p>
        </div>

      </div>

      {/* Interactive Trend Chart */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-foreground mb-4">{t("Cash Flow Trend (Inflow vs Outflow)")}</h2>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ledger logs Table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-foreground mb-4">{t("Transactional Ledger")}</h2>
            
            {loading ? (
              <div className="text-center py-12 font-bold text-muted-foreground">{t("Loading ledger logs...")}</div>
            ) : ledgerList.length === 0 ? (
              <div className="text-center py-12 font-bold text-muted-foreground bg-background rounded-2xl border border-dashed border-border/60">{t("No transactions logged in this period.")}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-bold">
                      <th className="pb-3 pr-3">{t("Date")}</th>
                      <th className="pb-3 px-3">{t("Category")}</th>
                      <th className="pb-3 px-3">{t("Flow")}</th>
                      <th className="pb-3 px-3">{t("Mode")}</th>
                      <th className="pb-3 pl-3 text-right">{t("Amount (₹)")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerList.map((item, idx) => {
                      const isIncoming = item.type === "INFLOW";
                      return (
                        <tr key={idx} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                          <td className="py-3.5 pr-3 font-mono text-xs text-muted-foreground">
                            {new Date(item.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="font-bold text-foreground text-sm">{item.category}</span>
                            {item.reference && (
                              <span className="text-[10px] text-muted-foreground font-mono block">Ref: {item.reference}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                              isIncoming ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
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
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
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
                      <div key={idx} className="flex justify-between items-center text-sm font-semibold">
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
            <h3 className="text-sm font-black text-primary flex items-center gap-1.5">
              <HelpCircle size={16} /> {t("ERP Audit Integrity")}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("This cash flow compile aggregates sales inflows from invoices marked PAID, outward chemical/bucket acquisitions, personnel payroll salary disbursements, and factory overhead utilities. Custom transactions can be added to record capital injections or miscellaneous cash flows.")}
            </p>
          </div>

        </div>

      </div>

      {/* ADD CUSTOM TRANSACTION MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-6">
            
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-xl font-black text-foreground">{t("Add Custom Cash Entry")}</h2>
              <button 
                onClick={() => setIsAddOpen(false)} 
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t("Entry Type")}</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="OUTFLOW">Outflow (Debit / Spend)</option>
                    <option value="INFLOW">Inflow (Credit / Receipt)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t("Date")}</label>
                  <input 
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t("Category")}</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    {customCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t("Payment Mode")}</label>
                  <select 
                    value={formData.payment_mode}
                    onChange={e => setFormData({...formData, payment_mode: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI / QR Code">UPI / QR Code</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t("Amount (₹)")} *</label>
                <input 
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  placeholder="Enter monetary transaction amount"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t("Note / Description")}</label>
                <textarea 
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                  placeholder="Add note details, invoice reference numbers, etc."
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary text-foreground resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="bg-muted hover:bg-muted/80 text-foreground px-5 py-2.5 rounded-xl font-bold transition-all text-sm"
                >
                  {t("Cancel")}
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2"
                >
                  {isPending ? t("Saving...") : t("Add Entry")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
