import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/lib/i18n";
import { useData, formatINR, type Purchase } from "@/lib/data";
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

export const Route = createFileRoute("/_app/purchases")({
  head: () => ({ meta: [{ title: "Purchase History — Sharma Industries ERP" }] }),
  component: Purchases,
});

function Purchases() {
  const { t } = useI18n();
  const { data, add, remove } = useData();
  const [open, setOpen] = useState(false);

  const fields: Field[] = [
    { name: "date", label: t("common.date"), type: "date" },
    { name: "supplier", label: t("pur.supplier") },
    { name: "item", label: t("inv.items") },
    { name: "amount", label: t("common.amount"), type: "number" },
    {
      name: "status",
      label: t("common.status"),
      type: "select",
      options: [
        { value: "paid", label: t("inv.paid") },
        { value: "pending", label: t("inv.pending") },
      ],
    },
  ];

  const submit = (v: Record<string, string>) => {
    add("purchases", {
      date: v.date || new Date().toISOString().slice(0, 10),
      supplier: v.supplier,
      item: v.item,
      amount: Number(v.amount) || 0,
      status: (v.status === "pending" ? "pending" : "paid") as Purchase["status"],
    });
    toast.success("Purchase added");
  };

  return (
    <div>
      <PageHeader
        title={t("pur.title")}
        subtitle={t("pur.subtitle")}
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> {t("pur.new")}
          </Button>
        }
      />

      <TableCard>
        <thead>
          <tr>
            <Th>{t("common.date")}</Th>
            <Th>{t("pur.supplier")}</Th>
            <Th>{t("inv.items")}</Th>
            <Th className="text-right">{t("common.amount")}</Th>
            <Th>{t("common.status")}</Th>
            <Th className="text-right">{t("common.actions")}</Th>
          </tr>
        </thead>
        <tbody>
          {data.purchases.length === 0 ? (
            <EmptyRow colSpan={6} label={t("common.none")} />
          ) : (
            data.purchases.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <Td className="text-muted-foreground">{p.date}</Td>
                <Td className="font-medium text-foreground">{p.supplier}</Td>
                <Td className="text-muted-foreground">{p.item}</Td>
                <Td className="text-right font-semibold">{formatINR(p.amount)}</Td>
                <Td>
                  <StatusBadge
                    label={p.status === "paid" ? t("inv.paid") : t("inv.pending")}
                    variant={p.status === "paid" ? "success" : "warning"}
                  />
                </Td>
                <Td className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { remove("purchases", p.id); toast.success("Deleted"); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableCard>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={t("pur.new")}
        fields={fields}
        onSubmit={submit}
      />
    </div>
  );
}
