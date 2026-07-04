import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useI18n } from "@/lib/i18n";
import { useData, formatINR } from "@/lib/data";
import { PageHeader, StatCard } from "@/components/erp/ui";

export const Route = createFileRoute("/_app/finance")({
  head: () => ({ meta: [{ title: "Finance — Sharma Industries ERP" }] }),
  component: Finance,
});

function Finance() {
  const { t } = useI18n();
  const { data } = useData();

  const metrics = useMemo(() => {
    const income = data.invoices.reduce((s, i) => s + i.total, 0);
    const expenses = data.expenses.reduce((s, e) => s + e.amount, 0);
    const purchases = data.purchases.reduce((s, p) => s + p.amount, 0);
    const payroll = data.employees
      .filter((e) => e.status === "active")
      .reduce((s, e) => s + e.salary, 0);
    const totalOut = expenses + purchases + payroll;
    const profit = income - totalOut;
    const receivables = data.dealers.reduce((s, d) => s + d.balance, 0);
    const payables = data.purchases
      .filter((p) => p.status === "pending")
      .reduce((s, p) => s + p.amount, 0);
    return { income, totalOut, profit, receivables, payables, expenses, purchases, payroll };
  }, [data]);

  const chartData = [
    { name: t("fin.income"), v: metrics.income },
    { name: t("exp.title"), v: metrics.expenses },
    { name: t("nav.purchases"), v: metrics.purchases },
    { name: t("emp.salary"), v: metrics.payroll },
  ];

  return (
    <div>
      <PageHeader title={t("fin.title")} subtitle={t("fin.subtitle")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label={t("fin.income")} value={formatINR(metrics.income)} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label={t("fin.expense")} value={formatINR(metrics.totalOut)} icon={<TrendingDown className="h-5 w-5" />} accent />
        <StatCard
          label={t("fin.profit")}
          value={formatINR(metrics.profit)}
          icon={<Wallet className="h-5 w-5" />}
          trend={metrics.profit >= 0 ? "Profitable" : "Loss"}
          trendUp={metrics.profit >= 0}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-base font-bold text-foreground">{t("fin.cashflow")}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  formatter={(v: number) => formatINR(v)}
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.75rem",
                    color: "var(--popover-foreground)",
                  }}
                />
                <Bar dataKey="v" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t("fin.receivables")}</p>
              <ArrowDownLeft className="h-4 w-4 text-success" />
            </div>
            <p className="mt-2 text-xl font-extrabold text-success">{formatINR(metrics.receivables)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t("fin.payables")}</p>
              <ArrowUpRight className="h-4 w-4 text-destructive" />
            </div>
            <p className="mt-2 text-xl font-extrabold text-destructive">{formatINR(metrics.payables)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
