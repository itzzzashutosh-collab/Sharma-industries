"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/LanguageProvider";
import { KPICard } from "@/components/executive/KPICard";
import { ApprovalCard } from "@/components/executive/ApprovalCard";
import { SectionHeader } from "@/components/executive/SectionHeader";
import Link from "next/link";
import {
  Factory, Boxes, Zap, Users, Package, ShoppingCart,
  TrendingUp, Wallet, ArrowRight, CheckCircle,
  BarChart2, Activity,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from "recharts";

interface PendingUser {
  id: string; name: string; phone: string; role: string; created_at: string;
}
interface Props {
  pendingUsers: PendingUser[];
  chartData: { date: string; manufactured: number; dispatched: number }[];
  totalRawMaterialValue: number;
  totalFinishedGoodsValue: number;
}

const FACTORY_MARGINS = [
  { product: "Rustic Royale",   cost: 1200, price: 1800, margin: 33 },
  { product: "Wall Putty",      cost: 400,  price: 550,  margin: 27 },
  { product: "WeatherGuard",    cost: 900,  price: 1350, margin: 33 },
];

const RM_ALERTS = [
  { material: "Titanium Dioxide",  stock: 150, threshold: 200, unit: "kg" },
  { material: "Acrylic Emulsion",  stock: 45,  threshold: 100, unit: "L" },
];

export function CoFounderDashboardClient({
  pendingUsers, chartData, totalRawMaterialValue, totalFinishedGoodsValue,
}: Props) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const today = mounted
    ? new Date().toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "";

  return (
    <div className="space-y-8 pb-12">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-sm font-medium text-muted-foreground mb-0.5">{today}</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {t("Operations Overview")} 🏭
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{t("Co-Founder")} — {t("Factory Management")} & {t("Business")}</p>
      </motion.div>

      {/* KPI Strip */}
      <div>
        <SectionHeader title="Today's Summary" delay={0.05} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
          <KPICard label="Inventory Value"    value={totalRawMaterialValue + totalFinishedGoodsValue} prefix="₹" color="primary" icon={Boxes}       trend="up"      trendLabel="+5%"  delay={0.06} />
          <KPICard label="Raw Material Value" value={totalRawMaterialValue} prefix="₹"              color="amber"   icon={Package}     trend="down"    trendLabel="-3%"  delay={0.08} />
          <KPICard label="Finished Goods Value" value={totalFinishedGoodsValue} prefix="₹"          color="emerald" icon={Factory}     trend="up"      trendLabel="+8%"  delay={0.10} />
          <KPICard label="Factory Efficiency" value={87}             suffix="%"                     color="blue"    icon={Zap}         trend="up"      trendLabel="+8%"  delay={0.12} />
          <KPICard label="Active Dealers"     value={142}                                           color="violet"  icon={Users}       trend="up"      trendLabel="+3"   delay={0.14} />
          <KPICard label="Monthly Orders"     value={486}                                           color="cyan"    icon={ShoppingCart} trend="up"    trendLabel="+9%"  delay={0.16} />
          <KPICard label="Monthly Revenue"    value={15450000} prefix="₹"                          color="primary" icon={TrendingUp}  trend="up"      trendLabel="+14%" delay={0.18} />
          <KPICard label="Working Capital"    value={8900000} prefix="₹"                           color="emerald" icon={Wallet}      trend="up"      trendLabel="+6%"  delay={0.20} />
        </div>
      </div>

      {/* Production Chart */}
      <div className="space-y-4">
        <SectionHeader title="Manufacturing Intelligence" delay={0.22} />
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">{t("Production vs. Dispatch (Last 7 Days)")}</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "10px", fontSize: "12px" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="manufactured" name="Manufactured" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="dispatched" name="Dispatched" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Factory Intel Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Product Margins */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground">{t("Product Margins")}</h3>
          {FACTORY_MARGINS.map((m, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium text-foreground">{m.product}</span>
                <span className="text-emerald-500 font-bold">{m.margin}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${m.margin}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Cost ₹{m.cost} → Sell ₹{m.price}</p>
            </div>
          ))}
        </div>

        {/* RM Alerts */}
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-rose-500 flex items-center gap-2">
            ⚠️ {t("Raw Material Alerts")}
          </h3>
          {RM_ALERTS.map((a, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-foreground">{a.material}</span>
                <span className="text-rose-400 font-bold">{a.stock} / {a.threshold} {a.unit}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-rose-500 h-1.5 rounded-full"
                  style={{ width: `${(a.stock / a.threshold) * 100}%` }}
                />
              </div>
            </div>
          ))}
          <p className="text-xs text-rose-400/70 mt-2">Restock immediately to avoid production halt.</p>
        </div>
      </div>

      {/* Approval Center */}
      <div className="space-y-4">
        <SectionHeader
          title="Approval Center"
          delay={0.35}
          action={
            pendingUsers.length > 0 && (
              <Link href="/dashboard/admin/approvals" className="flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2 transition-all">
                {t("View All Approvals")} <ArrowRight size={13} />
              </Link>
            )
          }
        />
        {pendingUsers.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-emerald-500">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">{t("No pending approvals.")}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {pendingUsers.slice(0, 8).map((user, i) => (
              <ApprovalCard key={user.id} user={user} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <SectionHeader title="Quick Actions" delay={0.45} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Factory Management",  href: "/dashboard/factory/production",  icon: "🏭" },
            { label: "Inventory",           href: "/dashboard/factory/inventory",   icon: "📦" },
            { label: "Factory Expenses",    href: "/dashboard/factory/expenses",    icon: "💰" },
            { label: "Products",            href: "/dashboard/ceo/products",        icon: "🎨" },
            { label: "Dealer Network",      href: "/dashboard/ceo/dealers",         icon: "🤝" },
            { label: "Employees & HR",      href: "/dashboard/employees",           icon: "👥" },
          ].map((action, i) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.47 + i * 0.04 }}
            >
              <Link
                href={action.href}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/25 hover:bg-primary/5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 text-center"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{action.icon}</span>
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors leading-tight">{t(action.label)}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
