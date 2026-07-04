import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  IndianRupee,
  AlertTriangle,
  Warehouse,
  Receipt,
  ArrowRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useI18n } from "@/lib/i18n";
import { useData, formatINR } from "@/lib/data";
import { PageHeader, StatCard, StatusBadge } from "@/components/erp/ui";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Sharma Industries ERP" },
      {
        name: "description",
        content:
          "Sharma Industries paint manufacturing ERP dashboard with sales, inventory and finance overview.",
      },
    ],
  }),
  component: Dashboard,
});

const salesTrend = [
  { m: "Jan", v: 420000 },
  { m: "Feb", v: 510000 },
  { m: "Mar", v: 480000 },
  { m: "Apr", v: 620000 },
  { m: "May", v: 580000 },
  { m: "Jun", v: 710000 },
];

function Dashboard() {
  const { t, lang } = useI18n();
  const { data } = useData();

  const revenue = data.invoices.reduce((s, i) => s + i.total, 0);
  const outstanding = data.dealers.reduce((s, d) => s + d.balance, 0);
  const stockValue = data.products.reduce(
    (s, p) => s + p.price * p.stock,
    0,
  );
  const monthlyExpenses = data.expenses.reduce((s, e) => s + e.amount, 0);

  const lowStock = data.products.filter((p) => p.stock <= p.reorder);

  const expenseByCat = Object.entries(
    data.expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const pieColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  const topDealers = [...data.dealers]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 4);

  const statusVariant = (s: string) =>
    s === "paid" ? "success" : s === "partial" ? "warning" : "danger";

  return (
    <div>
      <PageHeader title={t("dash.title")} subtitle={t("dash.subtitle")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("dash.revenue")}
          value={formatINR(revenue)}
          icon={<IndianRupee className="h-5 w-5" />}
          trend={`+12.5% ${t("dash.vsLast")}`}
          trendUp
        />
        <StatCard
          label={t("dash.outstanding")}
          value={formatINR(outstanding)}
          icon={<AlertTriangle className="h-5 w-5" />}
          accent
        />
        <StatCard
          label={t("dash.stockValue")}
          value={formatINR(stockValue)}
          icon={<Warehouse className="h-5 w-5" />}
          trend={`+4.2% ${t("dash.vsLast")}`}
          trendUp
        />
        <StatCard
          label={t("dash.expenses")}
          value={formatINR(monthlyExpenses)}
          icon={<Receipt className="h-5 w-5" />}
          trend={`-3.1% ${t("dash.vsLast")}`}
          trendUp
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-base font-bold text-foreground">
            {t("dash.salesTrend")}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  formatter={(v: number) => formatINR(v)}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.75rem",
                    color: "var(--popover-foreground)",
                  }}
                />
                <Area type="monotone" dataKey="v" stroke="var(--chart-2)" strokeWidth={2.5} fill="url(#salesFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-foreground">
            {t("dash.expenseBreakdown")}
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCat}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {expenseByCat.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatINR(v)}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.75rem",
                    color: "var(--popover-foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-1.5">
            {expenseByCat.slice(0, 4).map((e, i) => (
              <div key={e.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                  {e.name}
                </span>
                <span className="font-semibold text-foreground">{formatINR(e.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent invoices */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">{t("dash.recentInvoices")}</h3>
            <Link to="/invoicing" className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
              {t("common.viewAll")} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {data.invoices.slice(0, 5).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-foreground">{inv.number}</p>
                  <p className="text-xs text-muted-foreground">{inv.dealerName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-foreground">{formatINR(inv.total)}</span>
                  <StatusBadge label={t(`inv.${inv.status}`)} variant={statusVariant(inv.status)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock + top dealers */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-foreground">
              <AlertTriangle className="h-4 w-4 text-accent" />
              {t("dash.lowStock")}
            </h3>
            {lowStock.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t("common.none")}</p>
            ) : (
              <div className="space-y-2">
                {lowStock.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-foreground">{p.name}</span>
                    <StatusBadge label={`${p.stock}`} variant="danger" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-base font-bold text-foreground">{t("dash.topDealers")}</h3>
            <div className="space-y-2">
              {topDealers.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <span className="truncate text-foreground">{d.name}</span>
                  <span className="font-semibold text-foreground">{formatINR(d.balance)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {lang === "hi"
          ? "डेटा इस ब्राउज़र में सहेजा जाता है। स्थायी क्लाउड डेटाबेस के लिए पूछें।"
          : "Data is saved in this browser. Ask to connect a cloud database for permanent multi-user storage."}
      </p>
    </div>
  );
}
