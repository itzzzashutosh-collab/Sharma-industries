import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/lib/i18n";
import { useData, formatINR, type LedgerEntry } from "@/lib/data";
import {
  PageHeader,
  TableCard,
  Th,
  Td,
  EmptyRow,
} from "@/components/erp/ui";
import { FormDialog, type Field } from "@/components/erp/FormDialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/ledger")({
  head: () => ({ meta: [{ title: "Ledger — Sharma Industries ERP" }] }),
  component: Ledger,
});

function Ledger() {
  const { t } = useI18n();
  const { data, add, remove } = useData();
  const [open, setOpen] = useState(false);

  const { credit, debit } = useMemo(() => {
    let credit = 0;
    let debit = 0;
    data.ledger.forEach((l) => {
      if (l.type === "credit") credit += l.amount;
      else debit += l.amount;
    });
    return { credit, debit };
  }, [data.ledger]);

  const fields: Field[] = [
    { name: "date", label: t("common.date"), type: "date" },
    { name: "party", label: t("inv.dealer") },
    {
      name: "type",
      label: t("common.status"),
      type: "select",
      options: [
        { value: "credit", label: t("fin.income") },
        { value: "debit", label: t("fin.expense") },
      ],
    },
    { name: "amount", label: t("common.amount"), type: "number" },
    { name: "note", label: t("common.note") },
  ];

  const submit = (v: Record<string, string>) => {
    add("ledger", {
      date: v.date || new Date().toISOString().slice(0, 10),
      party: v.party,
      type: (v.type === "debit" ? "debit" : "credit") as LedgerEntry["type"],
      amount: Number(v.amount) || 0,
      note: v.note,
    });
    toast.success("Entry added");
  };

  return (
    <div>
      <PageHeader
        title={t("nav.ledger")}
        subtitle={t("deal.subtitle")}
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> {t("common.add")}
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">{t("fin.income")}</p>
          <p className="mt-1 text-xl font-extrabold text-success">{formatINR(credit)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">{t("fin.expense")}</p>
          <p className="mt-1 text-xl font-extrabold text-destructive">{formatINR(debit)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">{t("common.total")}</p>
          <p className="mt-1 text-xl font-extrabold text-foreground">{formatINR(credit - debit)}</p>
        </div>
      </div>

      <TableCard>
        <thead>
          <tr>
            <Th>{t("common.date")}</Th>
            <Th>{t("inv.dealer")}</Th>
            <Th>{t("common.note")}</Th>
            <Th className="text-right">{t("common.amount")}</Th>
            <Th className="text-right">{t("common.actions")}</Th>
          </tr>
        </thead>
        <tbody>
          {data.ledger.length === 0 ? (
            <EmptyRow colSpan={5} label={t("common.none")} />
          ) : (
            data.ledger.map((l) => (
              <tr key={l.id} className="hover:bg-muted/30">
                <Td className="text-muted-foreground">{l.date}</Td>
                <Td className="font-medium text-foreground">{l.party}</Td>
                <Td className="text-muted-foreground">{l.note}</Td>
                <Td className="text-right">
                  <span
                    className={
                      l.type === "credit"
                        ? "inline-flex items-center gap-1 font-semibold text-success"
                        : "inline-flex items-center gap-1 font-semibold text-destructive"
                    }
                  >
                    {l.type === "credit" ? (
                      <ArrowDownLeft className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    )}
                    {formatINR(l.amount)}
                  </span>
                </Td>
                <Td className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { remove("ledger", l.id); toast.success("Deleted"); }}>
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
        title={t("common.add")}
        fields={fields}
        onSubmit={submit}
      />
    </div>
  );
}
