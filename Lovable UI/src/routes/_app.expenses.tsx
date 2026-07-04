import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/lib/i18n";
import { useData, formatINR, type Expense } from "@/lib/data";
import { PageHeader, TableCard, Th, Td, EmptyRow } from "@/components/erp/ui";
import { FormDialog, type Field } from "@/components/erp/FormDialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/expenses")({
  head: () => ({ meta: [{ title: "Factory Expenses — Sharma Industries ERP" }] }),
  component: Expenses,
});

function Expenses() {
  const { t } = useI18n();
  const { data, add, update, remove } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const total = data.expenses.reduce((s, e) => s + e.amount, 0);

  const fields: Field[] = [
    { name: "date", label: t("common.date"), type: "date" },
    { name: "category", label: t("common.category") },
    { name: "amount", label: t("common.amount"), type: "number" },
    { name: "note", label: t("common.note") },
  ];

  const submit = (v: Record<string, string>) => {
    const payload = {
      date: v.date || new Date().toISOString().slice(0, 10),
      category: v.category,
      amount: Number(v.amount) || 0,
      note: v.note,
    };
    if (editing) {
      update("expenses", editing.id, payload);
      toast.success("Expense updated");
    } else {
      add("expenses", payload);
      toast.success("Expense added");
    }
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title={t("exp.title")}
        subtitle={t("exp.subtitle")}
        action={
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4" /> {t("exp.new")}
          </Button>
        }
      />

      <div className="mb-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">{t("common.total")}</p>
        <p className="mt-1 text-2xl font-extrabold text-foreground">{formatINR(total)}</p>
      </div>

      <TableCard>
        <thead>
          <tr>
            <Th>{t("common.date")}</Th>
            <Th>{t("common.category")}</Th>
            <Th>{t("common.note")}</Th>
            <Th className="text-right">{t("common.amount")}</Th>
            <Th className="text-right">{t("common.actions")}</Th>
          </tr>
        </thead>
        <tbody>
          {data.expenses.length === 0 ? (
            <EmptyRow colSpan={5} label={t("common.none")} />
          ) : (
            data.expenses.map((e) => (
              <tr key={e.id} className="hover:bg-muted/30">
                <Td className="text-muted-foreground">{e.date}</Td>
                <Td className="font-medium text-foreground">{e.category}</Td>
                <Td className="text-muted-foreground">{e.note}</Td>
                <Td className="text-right font-semibold">{formatINR(e.amount)}</Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(e); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { remove("expenses", e.id); toast.success("Deleted"); }}>
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
        title={editing ? t("common.edit") : t("exp.new")}
        fields={fields}
        initial={editing ?? undefined}
        onSubmit={submit}
      />
    </div>
  );
}
