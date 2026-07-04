import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/lib/i18n";
import { useData, formatINR, type Employee } from "@/lib/data";
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

export const Route = createFileRoute("/_app/employees")({
  head: () => ({ meta: [{ title: "Employees — Sharma Industries ERP" }] }),
  component: Employees,
});

function Employees() {
  const { t } = useI18n();
  const { data, add, update, remove } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const fields: Field[] = [
    { name: "name", label: t("common.name") },
    { name: "role", label: t("emp.role") },
    { name: "phone", label: t("common.phone") },
    { name: "salary", label: t("emp.salary"), type: "number" },
    { name: "joinDate", label: t("emp.joinDate"), type: "date" },
    {
      name: "status",
      label: t("common.status"),
      type: "select",
      options: [
        { value: "active", label: t("emp.active") },
        { value: "inactive", label: t("emp.inactive") },
      ],
    },
  ];

  const submit = (v: Record<string, string>) => {
    const payload = {
      name: v.name,
      role: v.role,
      phone: v.phone,
      salary: Number(v.salary) || 0,
      joinDate: v.joinDate || new Date().toISOString().slice(0, 10),
      status: (v.status === "inactive" ? "inactive" : "active") as Employee["status"],
    };
    if (editing) {
      update("employees", editing.id, payload);
      toast.success("Employee updated");
    } else {
      add("employees", payload);
      toast.success("Employee added");
    }
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title={t("emp.title")}
        subtitle={t("emp.subtitle")}
        action={
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4" /> {t("emp.new")}
          </Button>
        }
      />

      <TableCard>
        <thead>
          <tr>
            <Th>{t("common.name")}</Th>
            <Th>{t("emp.role")}</Th>
            <Th>{t("common.phone")}</Th>
            <Th className="text-right">{t("emp.salary")}</Th>
            <Th>{t("common.status")}</Th>
            <Th className="text-right">{t("common.actions")}</Th>
          </tr>
        </thead>
        <tbody>
          {data.employees.length === 0 ? (
            <EmptyRow colSpan={6} label={t("common.none")} />
          ) : (
            data.employees.map((e) => (
              <tr key={e.id} className="hover:bg-muted/30">
                <Td className="font-medium text-foreground">{e.name}</Td>
                <Td>{e.role}</Td>
                <Td className="text-muted-foreground">{e.phone}</Td>
                <Td className="text-right font-semibold">{formatINR(e.salary)}</Td>
                <Td>
                  <StatusBadge
                    label={e.status === "active" ? t("emp.active") : t("emp.inactive")}
                    variant={e.status === "active" ? "success" : "muted"}
                  />
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(e); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { remove("employees", e.id); toast.success("Deleted"); }}>
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
        title={editing ? t("common.edit") : t("emp.new")}
        fields={fields}
        initial={editing ?? undefined}
        onSubmit={submit}
      />
    </div>
  );
}
