import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Warehouse, TrendingUp, AlertTriangle, PackageX } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/lib/i18n";
import { useData, formatINR, type Product } from "@/lib/data";
import {
  PageHeader,
  StatCard,
  TableCard,
  Th,
  Td,
  EmptyRow,
  StatusBadge,
} from "@/components/erp/ui";
import { FormDialog } from "@/components/erp/FormDialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Sharma Industries ERP" }] }),
  component: Inventory,
});

function Inventory() {
  const { t } = useI18n();
  const { data, update } = useData();
  const [adjust, setAdjust] = useState<Product | null>(null);

  const stats = useMemo(() => {
    const totalValue = data.products.reduce((s, p) => s + p.price * p.stock, 0);
    const low = data.products.filter((p) => p.stock <= p.reorder && p.stock > 0).length;
    const out = data.products.filter((p) => p.stock === 0).length;
    return { totalValue, low, out, count: data.products.length };
  }, [data.products]);

  const stockStatus = (p: Product) => {
    if (p.stock === 0) return { label: t("stock.out"), variant: "danger" as const };
    if (p.stock <= p.reorder) return { label: t("stock.low"), variant: "warning" as const };
    return { label: t("stock.healthy"), variant: "success" as const };
  };

  return (
    <div>
      <PageHeader title={t("stock.title")} subtitle={t("stock.subtitle")} />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("stock.value")} value={formatINR(stats.totalValue)} icon={<Warehouse className="h-5 w-5" />} />
        <StatCard label={t("prod.title")} value={String(stats.count)} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label={t("stock.low")} value={String(stats.low)} icon={<AlertTriangle className="h-5 w-5" />} accent />
        <StatCard label={t("stock.out")} value={String(stats.out)} icon={<PackageX className="h-5 w-5" />} accent />
      </div>

      <TableCard>
        <thead>
          <tr>
            <Th>{t("common.name")}</Th>
            <Th>{t("prod.sku")}</Th>
            <Th className="text-right">{t("stock.inStock")}</Th>
            <Th className="text-right">{t("prod.reorder")}</Th>
            <Th className="text-right">{t("stock.value")}</Th>
            <Th>{t("common.status")}</Th>
            <Th className="text-right">{t("common.actions")}</Th>
          </tr>
        </thead>
        <tbody>
          {data.products.length === 0 ? (
            <EmptyRow colSpan={7} label={t("common.none")} />
          ) : (
            data.products.map((p) => {
              const st = stockStatus(p);
              return (
                <tr key={p.id} className="hover:bg-muted/30">
                  <Td className="font-medium text-foreground">{p.name}</Td>
                  <Td className="font-mono text-xs text-muted-foreground">{p.sku}</Td>
                  <Td className="text-right font-semibold">{p.stock} <span className="text-xs text-muted-foreground">{p.unit}</span></Td>
                  <Td className="text-right text-muted-foreground">{p.reorder}</Td>
                  <Td className="text-right">{formatINR(p.price * p.stock)}</Td>
                  <Td><StatusBadge label={st.label} variant={st.variant} /></Td>
                  <Td className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setAdjust(p)}>
                      {t("stock.adjust")}
                    </Button>
                  </Td>
                </tr>
              );
            })
          )}
        </tbody>
      </TableCard>

      <FormDialog
        open={!!adjust}
        onOpenChange={(v) => !v && setAdjust(null)}
        title={`${t("stock.adjust")} — ${adjust?.name ?? ""}`}
        fields={[{ name: "stock", label: t("stock.inStock"), type: "number" }]}
        initial={adjust ? { stock: adjust.stock } : undefined}
        onSubmit={(v) => {
          if (adjust) {
            update("products", adjust.id, { stock: Number(v.stock) || 0 });
            toast.success("Stock updated");
            setAdjust(null);
          }
        }}
      />
    </div>
  );
}
