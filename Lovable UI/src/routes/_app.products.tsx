import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/lib/i18n";
import { useData, formatINR, type Product } from "@/lib/data";
import {
  PageHeader,
  TableCard,
  Th,
  Td,
  EmptyRow,
  StatusBadge,
} from "@/components/erp/ui";
import { FormDialog, type Field } from "@/components/erp/FormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/products")({
  head: () => ({ meta: [{ title: "Products & SKUs — Sharma Industries ERP" }] }),
  component: Products,
});

function Products() {
  const { t } = useI18n();
  const { data, add, update, remove } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [q, setQ] = useState("");

  const fields: Field[] = [
    { name: "name", label: t("common.name") },
    { name: "sku", label: t("prod.sku") },
    { name: "category", label: t("common.category") },
    { name: "unit", label: t("prod.unit") },
    { name: "price", label: t("prod.price"), type: "number" },
    { name: "stock", label: t("prod.stock"), type: "number" },
    { name: "reorder", label: t("prod.reorder"), type: "number" },
  ];

  const filtered = useMemo(
    () =>
      data.products.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.sku.toLowerCase().includes(q.toLowerCase()),
      ),
    [data.products, q],
  );

  const submit = (v: Record<string, string>) => {
    const payload = {
      name: v.name,
      sku: v.sku,
      category: v.category,
      unit: v.unit,
      price: Number(v.price) || 0,
      stock: Number(v.stock) || 0,
      reorder: Number(v.reorder) || 0,
    };
    if (editing) {
      update("products", editing.id, payload);
      toast.success("Product updated");
    } else {
      add("products", payload);
      toast.success("Product added");
    }
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title={t("prod.title")}
        subtitle={t("prod.subtitle")}
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> {t("prod.new")}
          </Button>
        }
      />

      <div className="relative mb-4 max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("common.search")}
          className="pl-9"
        />
      </div>

      <TableCard>
        <thead>
          <tr>
            <Th>{t("common.name")}</Th>
            <Th>{t("prod.sku")}</Th>
            <Th>{t("common.category")}</Th>
            <Th className="text-right">{t("prod.price")}</Th>
            <Th className="text-right">{t("prod.stock")}</Th>
            <Th className="text-right">{t("common.actions")}</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <EmptyRow colSpan={6} label={t("common.none")} />
          ) : (
            filtered.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <Td className="font-medium text-foreground">{p.name}</Td>
                <Td className="font-mono text-xs text-muted-foreground">{p.sku}</Td>
                <Td>{p.category}</Td>
                <Td className="text-right font-semibold">{formatINR(p.price)}</Td>
                <Td className="text-right">
                  <span className="mr-2">{p.stock}</span>
                  {p.stock <= p.reorder && (
                    <StatusBadge label={t("stock.low")} variant="danger" />
                  )}
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(p);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        remove("products", p.id);
                        toast.success("Deleted");
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableCard>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? t("common.edit") : t("prod.new")}
        fields={fields}
        initial={editing ?? undefined}
        onSubmit={submit}
      />
    </div>
  );
}
