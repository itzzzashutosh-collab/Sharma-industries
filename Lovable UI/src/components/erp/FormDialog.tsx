import { useEffect, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
};

export function FormDialog({
  open,
  onOpenChange,
  title,
  fields,
  initial,
  onSubmit,
  extra,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  fields: Field[];
  initial?: Record<string, unknown>;
  onSubmit: (values: Record<string, string>) => void;
  extra?: ReactNode;
}) {
  const { t } = useI18n();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const base: Record<string, string> = {};
      fields.forEach((f) => {
        const v = initial?.[f.name];
        base[f.name] = v != null ? String(v) : "";
      });
      setValues(base);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (name: string, v: string) =>
    setValues((p) => ({ ...p, [name]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {fields.map((f) => (
            <div key={f.name} className="grid gap-1.5">
              <Label htmlFor={f.name}>{f.label}</Label>
              {f.type === "select" ? (
                <Select
                  value={values[f.name] ?? ""}
                  onValueChange={(v) => set(f.name, v)}
                >
                  <SelectTrigger id={f.name}>
                    <SelectValue placeholder={f.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options?.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={f.name}
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                  value={values[f.name] ?? ""}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
            </div>
          ))}
          {extra}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={() => {
              onSubmit(values);
              onOpenChange(false);
            }}
          >
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
