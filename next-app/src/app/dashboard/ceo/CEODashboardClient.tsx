"use client";

import { useState } from "react";
import { TrendingUp, Users, Package, DollarSign, AlertTriangle, CheckCircle, Download } from "lucide-react";
import { FactoryHealthWidget } from "./FactoryHealthWidget";
import { useLanguage } from "@/components/LanguageProvider";
import { approveUser } from "./actions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface PendingUser {
  id: string;
  name: string;
  phone: string;
  role: string;
  created_at: string;
}

interface ChartDataPoint {
  date: string;
  manufactured: number;
  dispatched: number;
}

interface Props {
  pendingUsers: PendingUser[];
  chartData: ChartDataPoint[];
  totalRawMaterialValue: number;
  totalFinishedGoodsValue: number;
}

// Dummy Finance Data
const FINANCE_DATA = {
  metrics: {
    totalRevenue: 15450000,
    netProfit: 4500000,
    receivables: 2100000,
    activeDealers: 142,
  },
  charts: {
    revenueVsExpenseChart: [
      { month: "Jan", revenue: 2000000, expenses: 1500000 },
      { month: "Feb", revenue: 2200000, expenses: 1600000 },
      { month: "Mar", revenue: 2800000, expenses: 1750000 },
      { month: "Apr", revenue: 2400000, expenses: 1800000 },
      { month: "May", revenue: 3100000, expenses: 1900000 },
      { month: "Jun", revenue: 2950000, expenses: 1850000 },
    ],
    expenseDistributionChart: [
      { name: "Raw Materials & Purchases", value: 6500000 },
      { name: "Salary & Wages", value: 2000000 },
      { name: "Freight", value: 850000 },
      { name: "Marketing", value: 450000 },
      { name: "Other Operations", value: 600000 },
    ]
  }
};

const PIE_COLORS = ["#a3e635", "#06b6d4", "#a855f7", "#374151", "#fb923c"];

const FACTORY_SUMMARY_DATA = {
  expenses: [
    { id: "EXP-1", name: "Factory Rent", amount: 120000 },
    { id: "EXP-2", name: "Electricity", amount: 45000 },
    { id: "EXP-3", name: "Machine Maintenance", amount: 15000 },
  ],
  margins: [
    { product: "Rustic Royale", cost: 1200, price: 1800, margin: "33%" },
    { product: "Wall Putty", cost: 400, price: 550, margin: "27%" },
    { product: "WeatherGuard", cost: 900, price: 1350, margin: "33%" },
  ],
  alerts: [
    { material: "Titanium Dioxide", stock: 150, threshold: 200, unit: "kg" },
    { material: "Acrylic Emulsion", stock: 45, threshold: 100, unit: "Liters" },
  ]
};

export function CEODashboardClient({
  pendingUsers,
  chartData,
  totalRawMaterialValue,
  totalFinishedGoodsValue,
}: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"finance" | "factory">("finance");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const handleDownload = () => {
    alert("Downloading Master Report... (Dummy Trigger)");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("Command Center")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("Executive overview of Sharma Industries.")}
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:shadow-md transition-all"
        >
          <Download size={18} /> {t("Download Master Report")}
        </button>
      </div>

      {/* The Ultimate KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">{t("Total Monthly Revenue")}</p>
            <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
              <TrendingUp size={20} className="text-primary" />
            </div>
          </div>
          <p className="text-3xl font-black text-primary relative z-10">{formatCurrency(FINANCE_DATA.metrics.totalRevenue)}</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">{t("Net Profit")}</p>
            <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
              <DollarSign size={20} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 relative z-10">{formatCurrency(FINANCE_DATA.metrics.netProfit)}</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300">
          <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-rose-500/20 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">{t("Outstanding Receivables")}</p>
            <div className="bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
              <AlertTriangle size={20} className="text-rose-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)] relative z-10">{formatCurrency(FINANCE_DATA.metrics.receivables)}</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/10 transition-all duration-300">
          <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-foreground/20 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">{t("Active Dealers")}</p>
            <div className="bg-muted p-2 rounded-lg border border-border">
              <Users size={20} className="text-foreground" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground relative z-10">{FINANCE_DATA.metrics.activeDealers}</p>
        </div>
      </div>

      {/* Tabbed Chart Section */}
      <div className="space-y-6">
        <div className="flex space-x-2 border-b border-border">
          <button
            onClick={() => setActiveTab("finance")}
            className={`px-6 py-3 font-semibold text-sm uppercase tracking-wider transition-all duration-300 border-b-2 ${
              activeTab === "finance" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            }`}
          >
            Financial Health
          </button>
          <button
            onClick={() => setActiveTab("factory")}
            className={`px-6 py-3 font-semibold text-sm uppercase tracking-wider transition-all duration-300 border-b-2 ${
              activeTab === "factory" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            }`}
          >
            Factory Operations
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "finance" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Chart A: Revenue vs Expenses */}
              <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                <h2 className="text-lg font-bold mb-6 text-foreground">{t("Revenue vs Expenses")}</h2>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={FINANCE_DATA.charts.revenueVsExpenseChart} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2e33" vertical={false} />
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                      <RechartsTooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: "#111", borderColor: "#2a2e33", borderRadius: "8px", color: "#fff" }} 
                        itemStyle={{ fontWeight: "bold" }}
                        formatter={(value: any) => formatCurrency(Number(value) || 0)}
                      />
                      <Legend iconType="circle" />
                      <Bar dataKey="revenue" name={t("Revenue")} fill="#a3e635" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name={t("Expenses")} fill="#4b5563" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart B: Expense Distribution */}
              <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                <h2 className="text-lg font-bold mb-6 text-foreground">{t("Expense Distribution")}</h2>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={FINANCE_DATA.charts.expenseDistributionChart}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {FINANCE_DATA.charts.expenseDistributionChart.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: "#111", borderColor: "#2a2e33", borderRadius: "8px", color: "#fff" }} 
                        itemStyle={{ fontWeight: "bold" }}
                        formatter={(value: any) => formatCurrency(Number(value) || 0)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "factory" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full space-y-6">
              <FactoryHealthWidget
                chartData={chartData}
                totalRawMaterialValue={totalRawMaterialValue}
                totalFinishedGoodsValue={totalFinishedGoodsValue}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-border">
                {/* Product Margins */}
                <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                  <h3 className="text-lg font-bold text-foreground mb-4">{t("Product Margins")}</h3>
                  <div className="space-y-4">
                    {FACTORY_SUMMARY_DATA.margins.map((m, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-border/50 pb-2">
                        <div>
                          <p className="font-semibold text-foreground text-sm">{m.product}</p>
                          <p className="text-sm text-muted-foreground">Cost: ₹{m.cost} | Selling: ₹{m.price}</p>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2 py-1 rounded-md text-sm">{m.margin}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Major Factory Expenses */}
                <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                  <h3 className="text-lg font-bold text-foreground mb-4">{t("Major Factory Expenses")}</h3>
                  <div className="space-y-4">
                    {FACTORY_SUMMARY_DATA.expenses.map((e, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-border/50 pb-2">
                        <p className="font-semibold text-foreground text-sm">{e.name}</p>
                        <span className="text-rose-400 font-black text-sm">₹{e.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RM Alerts */}
                <div className="bg-card border border-rose-500/30 p-6 rounded-3xl shadow-[0_0_15px_rgba(244,63,94,0.05)]">
                  <h3 className="text-lg font-bold text-rose-500 mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} /> {t("Raw Material Alerts")}
                  </h3>
                  <div className="space-y-4">
                    {FACTORY_SUMMARY_DATA.alerts.map((a, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-bold text-foreground">{a.material}</span>
                          <span className="text-rose-400 font-bold">{a.stock} / {a.threshold} {a.unit}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${(a.stock / a.threshold) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Metrics & Actions (Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Selling Product */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-foreground">{t("Top Selling Product")}</h3>
            <div className="bg-violet-500/10 p-2 rounded-xl border border-violet-500/20">
              <Package size={24} className="text-violet-400" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-foreground">Rustic Royale</p>
            <p className="text-violet-400 font-semibold mt-1">24% of all sales volume</p>
          </div>
          <div className="mt-4 space-y-2">
             <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Revenue</span>
                <span className="font-bold">₹12,40,000</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Units Sold</span>
                <span className="font-bold">340 Buckets</span>
             </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-card border border-border rounded-3xl p-6 flex flex-col lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{t("Pending Approvals")}</h3>
              {pendingUsers.length > 0 && (
                <span className="bg-rose-500/20 text-rose-400 text-sm font-bold px-2 py-0.5 rounded-full">
                  {pendingUsers.length}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 max-h-[300px]">
            {pendingUsers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3 py-8">
                <CheckCircle size={48} className="text-border" />
                <p className="text-sm font-semibold">{t("No pending approvals.")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 rounded-xl bg-background border border-border flex flex-col justify-between gap-4 hover:border-primary/30 transition-colors"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-foreground">{user.name}</p>
                        <span className="text-sm uppercase tracking-wider font-bold text-violet-400 bg-violet-500/10 px-2 py-1 rounded-md border border-violet-500/20">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 font-mono">{user.phone}</p>
                    </div>

                    <form action={async () => {
                      await approveUser(user.id);
                    }}>
                      <button
                        type="submit"
                        className="w-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-white font-bold text-sm py-2 rounded-lg transition-all shadow-sm"
                      >
                        {t("Approve Access")}
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
