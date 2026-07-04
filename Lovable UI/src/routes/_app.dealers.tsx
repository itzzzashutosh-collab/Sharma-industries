import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/lib/i18n";
import { useData, formatINR, type Dealer } from "@/lib/data";
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

export const Route = createFileRoute("/_app/dealers")({
  head: () => ({ meta: [{ title: "Dealers — Sharma Industries ERP" }] }),
  component: Dealers,
});

function Dealers() {
  const { t } = useI18n();
  const { data, add, update, remove } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Dealer | null>(null);

  const fields: Field[] = [
    { name: "name", label: t("common.name") },
    { name: "contact", label: t("deal.contact") },
    { name: "phone", label: t("common.phone") },
    { name: "city", label: t("common.city") },
    { name: "gstin", label: t("deal.gstin") },
    { name: "balance", label: t("deal.balance"), type: "number" },
  ];

  const submit = (v: Record<string, string>) => {
    const payload = {
      name: v.name,
      contact: v.contact,
      phone: v.phone,
      city: v.city,
      gstin: v.gstin,
      balance: Number(v.balance) || 0,
    };
    if (editing) {
      update("dealers", editing.id, payload);
      toast.success("Dealer updated");
    } else {
      add("dealers", payload);
      toast.success("Dealer added");
    }
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title={t("deal.title")}
        subtitle={t("deal.subtitle")}
        action={
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4" /> {t("deal.new")}
          </Button>
        }
      />

      <TableCard>
        <thead>
          <tr>
            <Th>{t("common.name")}</Th>
            <Th>{t("deal.contact")}</Th>
            <Th>{t("common.phone")}</Th>
            <Th>{t("common.city")}</Th>
            <Th className="text-right">{t("deal.balance")}</Th>
            <Th className="text-right">{t("common.actions")}</Th>
          </tr>
        </thead>
        <tbody>
          {data.dealers.length === 0 ? (
            <EmptyRow colSpan={6} label={t("common.none")} />
          ) : (
            data.dealers.map((d) => (
              <tr key={d.id} className="hover:bg-muted/30">
                <Td className="font-medium text-foreground">{d.name}</Td>
                <Td>{d.contact}</Td>
                <Td className="text-muted-foreground">{d.phone}</Td>
                <Td>{d.city}</Td>
                <Td className="text-right">
                  {d.balance > 0 ? (
                    <StatusBadge label={formatINR(d.balance)} variant="warning" />
                  ) : (
                    <StatusBadge label={formatINR(0)} variant="success" />
                  )}
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(d); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { remove("dealers", d.id); toast.success("Deleted"); }}>
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
        title={editing ? t("common.edit") : t("deal.new")}
        fields={fields}
        initial={editing ?? undefined}
        onSubmit={submit}
      />
    </div>
  );
}
