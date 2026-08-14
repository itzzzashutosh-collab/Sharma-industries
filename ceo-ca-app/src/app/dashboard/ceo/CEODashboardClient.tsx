"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/LanguageProvider";
import { AnimatedCounter } from "@/components/executive/AnimatedCounter";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckSquare,
  Package,
  Factory,
  Store,
  ArrowRight,
  Clock,
  FileText,
  ShoppingCart,
  UserCheck,
  Sparkles,
  AlertTriangle,
  Circle,
} from "lucide-react";

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface PendingUser {
  id: string;
  name: string;
  phone: string;
  role: string;
  created_at: string;
}

interface Props {
  pendingUsers: PendingUser[];
  totalRawMaterialValue: number;
  totalFinishedGoodsValue: number;
}

// ─── Fade-in variant ─────────────────────────────────────────────────────────
const fadeUp: any = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: "easeOut" },
  }),
};

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({
  label,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  subtext,
  icon: Icon,
  accent,
  delay,
  href,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  subtext?: string;
  icon: React.ElementType;
  accent: string;
  delay: number;
  href?: string;
}) {
  const { t } = useLanguage();
  const content = (
    <motion.div
      custom={delay}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-default group"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t(label)}</span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}25` }}
        >
          <Icon size={15} style={{ color: accent }} />
        </div>
      </div>
      <div className="text-2xl font-black text-foreground tabular-nums">
        {prefix}
        <AnimatedCounter value={value} decimals={decimals} />
        {suffix}
      </div>
      {subtext && (
        <p className="text-[11px] text-muted-foreground font-medium leading-snug">{t(subtext)}</p>
      )}
    </motion.div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

// ─── Status Tile ─────────────────────────────────────────────────────────────
function StatusTile({
  label,
  value,
  status,
  icon: Icon,
  href,
  delay,
}: {
  label: string;
  value: string;
  status: "ok" | "warn" | "alert";
  icon: React.ElementType;
  href: string;
  delay: number;
}) {
  const { t } = useLanguage();
  const statusColors = {
    ok:    { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", ring: "border-emerald-200 dark:border-emerald-800" },
    warn:  { dot: "bg-amber-500",   text: "text-amber-600 dark:text-amber-400",   ring: "border-amber-200 dark:border-amber-800" },
    alert: { dot: "bg-rose-500",    text: "text-rose-600 dark:text-rose-400",    ring: "border-rose-200 dark:border-rose-800" },
  };
  const c = statusColors[status];

  return (
    <Link href={href}>
      <motion.div
        custom={delay}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group"
      >
        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t(label)}</p>
          <p className="text-sm font-bold text-foreground mt-0.5 truncate">{value}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${c.ring} bg-transparent`}>
          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
          <span className={`text-[10px] font-black uppercase tracking-wide ${c.text}`}>
            {status === "ok" ? t("OK") : status === "warn" ? t("Low") : t("Alert")}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

// ─── Activity Item ────────────────────────────────────────────────────────────
function ActivityItem({
  time,
  title,
  desc,
  color,
  delay,
}: {
  time: string;
  title: string;
  desc: string;
  color: string;
  delay: number;
}) {
  const { t } = useLanguage();
  return (
    <motion.div
      custom={delay}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="flex items-start gap-3"
    >
      <div className="flex flex-col items-center gap-1 pt-0.5">
        <Circle size={7} fill={color} style={{ color }} />
        <div className="w-px flex-1 bg-border min-h-[20px]" />
      </div>
      <div className="pb-3 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-foreground truncate">{t(title)}</p>
          <span className="text-[10px] text-muted-foreground shrink-0">{time}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{t(desc)}</p>
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function CEODashboardClient({
  pendingUsers,
  totalRawMaterialValue,
  totalFinishedGoodsValue,
}: Props) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const today = mounted
    ? new Date().toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "";

  const pendingCount = pendingUsers.length;

  return (
    <div className="space-y-8 pb-6">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2"
      >
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Good Morning")} 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/ceo/invoices/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
          >
            <FileText size={13} />
            {t("New Invoice")}
          </Link>
          <Link
            href="/dashboard/ceo/quotations/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-muted text-foreground text-xs font-bold rounded-xl hover:bg-muted/80 border border-border transition-colors"
          >
            <ShoppingCart size={13} />
            {t("New Quotation")}
          </Link>
        </div>
      </motion.div>

      {/* ── Section 1: Today's Snapshot ─────────────────────────────────── */}
      <section>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">{t("Today's Snapshot")}</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Today's Revenue"
            value={284000}
            prefix="₹"
            subtext="3 invoices collected"
            icon={TrendingUp}
            accent="#10b981"
            delay={0}
            href="/dashboard/ceo/financial-intelligence"
          />
          <MetricCard
            label="Today's Profit"
            value={68000}
            prefix="₹"
            subtext="24% margin"
            icon={DollarSign}
            accent="#8b5cf6"
            delay={1}
            href="/dashboard/ceo/financial-intelligence"
          />
          <MetricCard
            label="Outstanding"
            value={12}
            suffix=" bills"
            subtext="₹8.4L overdue"
            icon={AlertCircle}
            accent="#f59e0b"
            delay={2}
            href="/dashboard/ceo/invoices"
          />
          <MetricCard
            label="Pending Approvals"
            value={pendingCount}
            subtext={pendingCount > 0 ? "Needs attention" : "All clear"}
            icon={CheckSquare}
            accent={pendingCount > 0 ? "#ef4444" : "#10b981"}
            delay={3}
            href="/dashboard/ceo/approvals"
          />
        </div>
      </section>

      {/* ── Section 2: Operations Status ─────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("Operations Status")}</p>
          <Link href="/dashboard/factory" className="text-[11px] text-primary font-bold flex items-center gap-1">
            {t("Factory")} <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatusTile
            label="Raw Materials"
            value={`₹${(totalRawMaterialValue / 100000).toFixed(1)}L in stock`}
            status={totalRawMaterialValue > 500000 ? "ok" : totalRawMaterialValue > 100000 ? "warn" : "alert"}
            icon={Package}
            href="/dashboard/factory/inventory"
            delay={4}
          />
          <StatusTile
            label="Production"
            value="3 active batches"
            status="ok"
            icon={Factory}
            href="/dashboard/factory/production"
            delay={5}
          />
          <StatusTile
            label="Dealer Network"
            value="48 active dealers"
            status="ok"
            icon={Store}
            href="/dashboard/ceo/dealers"
            delay={6}
          />
        </div>
      </section>

      {/* ── Section 3: Recent Activity + AI Summary ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Activity timeline */}
        <section className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("Recent Activity")}</p>
            <Link href="/dashboard/ceo/reports" className="text-[11px] text-primary font-bold flex items-center gap-1">
              {t("All Activity")} <ArrowRight size={11} />
            </Link>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <ActivityItem time="9:42 AM"  title="Invoice INV-2025-041 Created"  desc="Ravi Paints — ₹2,40,000"       color="#10b981" delay={7} />
            <ActivityItem time="9:15 AM"  title="New Dealer Approval"           desc="Mohan Traders, Jaipur"          color="#8b5cf6" delay={8} />
            <ActivityItem time="8:50 AM"  title="Production Batch #48 Started"  desc="420 bags — Exterior White"     color="#3b82f6" delay={9} />
            <ActivityItem time="8:30 AM"  title="Payment Received"              desc="Karan Paints — ₹1,80,000"      color="#10b981" delay={10} />
            <ActivityItem time="Yesterday" title="Low Stock Alert"              desc="Stone Powder — 2 days left"     color="#f59e0b" delay={11} />

            {/* View pending approvals */}
            {pendingCount > 0 && (
              <motion.div custom={12} variants={fadeUp} initial="hidden" animate="show">
                <Link
                  href="/dashboard/ceo/approvals"
                  className="mt-3 flex items-center gap-2 px-4 py-3 bg-rose-500/5 border border-rose-500/20 rounded-xl hover:bg-rose-500/10 transition-colors"
                >
                  <AlertTriangle size={14} className="text-rose-500" />
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    {pendingCount} {t("dealer registration")} {pendingCount === 1 ? t("needs") : t("need")} {t("approval")}
                  </span>
                  <ArrowRight size={12} className="text-rose-500 ml-auto" />
                </Link>
              </motion.div>
            )}
          </div>
        </section>

        {/* Quick Actions + AI Insights link */}
        <section className="lg:col-span-2 flex flex-col gap-4">

          {/* Quick Actions */}
          <motion.div
            custom={13}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="bg-card border border-border rounded-2xl p-5"
          >
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">{t("Quick Actions")}</p>
            <div className="space-y-1.5">
              {[
                { label: "New Invoice",      href: "/dashboard/ceo/invoices/new",     icon: FileText },
                { label: "New Quotation",    href: "/dashboard/ceo/quotations/new",   icon: ShoppingCart },
                { label: "Add Purchase",     href: "/dashboard/purchase/new",         icon: Package },
                { label: "Start Production", href: "/dashboard/factory/production",   icon: Factory },
                { label: "Approve Dealers",  href: "/dashboard/ceo/approvals",        icon: UserCheck },
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
                  >
                    <Icon size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{t(action.label)}</span>
                    <ArrowRight size={11} className="ml-auto text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* AI Insights Hub entry */}
          <motion.div
            custom={14}
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <Link
              href="/dashboard/ceo/ai-insights"
              className="flex items-center gap-4 bg-gradient-to-br from-primary/8 via-card to-violet-500/5 border border-primary/20 rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{t("AI Insights Hub")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("Live analysis • Business intelligence • Recommendations")}</p>
              </div>
              <ArrowRight size={15} className="text-primary opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          </motion.div>

        </section>
      </div>

      {/* ── Section 4: Upcoming Tasks ─────────────────────────────────────── */}
      <section>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">{t("Upcoming Tasks")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: Clock, label: "GST Filing due in 4 days", href: "/dashboard/ca-portal", color: "#f59e0b" },
            { icon: Package, label: "Reorder Stone Powder — stock critical", href: "/dashboard/purchase/new", color: "#ef4444" },
            { icon: UserCheck, label: `${pendingCount} dealer approvals pending`, href: "/dashboard/ceo/approvals", color: "#8b5cf6" },
          ].map((task, i) => {
            const Icon = task.icon;
            return (
              <motion.div key={i} custom={15 + i} variants={fadeUp} initial="hidden" animate="show">
                <Link
                  href={task.href}
                  className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-sm transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${task.color}15` }}>
                    <Icon size={14} style={{ color: task.color }} />
                  </div>
                  <span className="text-xs font-semibold text-foreground leading-snug">{t(task.label)}</span>
                  <ArrowRight size={12} className="ml-auto text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
