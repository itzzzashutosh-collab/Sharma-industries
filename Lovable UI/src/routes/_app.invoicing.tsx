import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Eye, X } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/lib/i18n";
import { useData, formatINR, type Invoice, type InvoiceItem } from "@/lib/data";
import { computeGst } from "@/lib/company";
import {
  PageHeader,
  TableCard,
  Th,
  Td,
  EmptyRow,
} from "@/components/erp/ui";
import { InvoicePreview } from "@/components/erp/InvoicePreview";
import {
  INVOICE_TEMPLATES,
  type TemplateId,
} from "@/components/erp/InvoiceDocument";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/invoicing")({
  head: () => ({ meta: [{ title: "Invoicing — Sharma Industries ERP" }] }),
  component: Invoicing,
});

function Invoicing() {
  const { t } = useI18n();
  const { data, add, update } = useData();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Invoice | null>(null);

  const [dealerId, setDealerId] = useState("");
  const [status, setStatus] = useState<Invoice["status"]>("pending");
  const [template, setTemplate] = useState<TemplateId>("classic");
  const [lines, setLines] = useState<InvoiceItem[]>([]);

  const reset = () => {
    setDealerId("");
    setStatus("pending");
    setTemplate("classic");
    setLines([]);
  };

  const addLine = () => {
    const p = data.products[0];
    if (!p) {
      toast.error("Add products first");
      return;
    }
    setLines((l) => [
      ...l,
      { productId: p.id, name: p.name, qty: 1, rate: p.price, hsn: p.hsn, unit: p.unit },
    ]);
  };

  const updateLine = (idx: number, patch: Partial<InvoiceItem>) =>
    setLines((l) => l.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

  const setProduct = (idx: number, productId: string) => {
    const p = data.products.find((x) => x.id === productId);
    if (p)
      updateLine(idx, { productId: p.id, name: p.name, rate: p.price, hsn: p.hsn, unit: p.unit });
  };

  const dealer = data.dealers.find((d) => d.id === dealerId) || null;
  const gst = useMemo(() => computeGst(lines, dealer), [lines, dealer]);

  const save = () => {
    if (!dealer) {
      toast.error("Select a dealer");
      return;
    }
    if (lines.length === 0) {
      toast.error("Add at least one item");
      return;
    }
    const number = `INV-${1043 + data.invoices.length}`;
    const date = new Date().toISOString().slice(0, 10);
    add("invoices", {
      number,
      dealerId,
      dealerName: dealer.name,
      date,
      items: lines,
      subtotal: Math.round(gst.subtotal),
      taxTotal: Math.round(gst.taxTotal),
      total: gst.grandTotal,
      status,
      template,
    });
    // reduce stock
    lines.forEach((l) => {
      const p = data.products.find((x) => x.id === l.productId);
      if (p) update("products", p.id, { stock: Math.max(0, p.stock - l.qty) });
    });
    // increase dealer balance if not paid
    if (status !== "paid") {
      update("dealers", dealer.id, { balance: dealer.balance + gst.grandTotal });
    }
    // record in ledger
    add("ledger", {
      date,
      party: dealer.name,
      type: "debit",
      amount: gst.grandTotal,
      note: `${number} (GST invoice)`,
    });
    toast.success(t("inv.savedLedger"));
    reset();
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title={t("inv.title")}
        subtitle={t("inv.subtitle")}
        action={
          <Button onClick={() => { reset(); setOpen(true); }}>
            <Plus className="h-4 w-4" /> {t("inv.new")}
          </Button>
        }
      />

      <TableCard>
        <thead>
          <tr>
            <Th>{t("inv.number")}</Th>
            <Th>{t("inv.dealer")}</Th>
            <Th>{t("common.date")}</Th>
            <Th className="text-right">{t("common.total")}</Th>
            <Th>{t("common.status")}</Th>
            <Th className="text-right">{t("common.actions")}</Th>
          </tr>
        </thead>
        <tbody>
          {data.invoices.length === 0 ? (
            <EmptyRow colSpan={6} label={t("common.none")} />
          ) : (
            data.invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-muted/30">
                <Td className="font-mono font-semibold text-foreground">{inv.number}</Td>
                <Td>{inv.dealerName}</Td>
                <Td className="text-muted-foreground">{inv.date}</Td>
                <Td className="text-right font-semibold">{formatINR(inv.total)}</Td>
                <Td>
                  <Select
                    value={inv.status}
                    onValueChange={(v) =>
                      update("invoices", inv.id, { status: v as Invoice["status"] })
                    }
                  >
                    <SelectTrigger className="h-8 w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">{t("inv.paid")}</SelectItem>
                      <SelectItem value="partial">{t("inv.partial")}</SelectItem>
                      <SelectItem value="pending">{t("inv.pending")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setView(inv)}>
                      <Eye className="h-4 w-4" /> {t("inv.view")}
                    </Button>
                  </div>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableCard>

      {/* New invoice dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("inv.new")}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label>{t("inv.dealer")}</Label>
                <Select value={dealerId} onValueChange={setDealerId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("inv.dealer")} />
                  </SelectTrigger>
                  <SelectContent>
                    {data.dealers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>{t("common.status")}</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Invoice["status"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t("inv.pending")}</SelectItem>
                    <SelectItem value="partial">{t("inv.partial")}</SelectItem>
                    <SelectItem value="paid">{t("inv.paid")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>{t("inv.template")}</Label>
                <Select value={template} onValueChange={(v) => setTemplate(v as TemplateId)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVOICE_TEMPLATES.map((tpl) => (
                      <SelectItem key={tpl.id} value={tpl.id}>{tpl.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>{t("inv.items")}</Label>
                <Button variant="outline" size="sm" onClick={addLine}>
                  <Plus className="h-4 w-4" /> {t("inv.addItem")}
                </Button>
              </div>
              <div className="space-y-2">
                {lines.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
                    {t("inv.addItem")}
                  </p>
                )}
                {lines.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Select value={line.productId} onValueChange={(v) => setProduct(idx, v)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {data.products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      className="w-20"
                      value={line.qty}
                      onChange={(e) => updateLine(idx, { qty: Number(e.target.value) || 0 })}
                      placeholder={t("inv.qty")}
                    />
                    <Input
                      type="number"
                      className="w-28"
                      value={line.rate}
                      onChange={(e) => updateLine(idx, { rate: Number(e.target.value) || 0 })}
                      placeholder={t("inv.rate")}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setLines((l) => l.filter((_, i) => i !== idx))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1 rounded-lg bg-muted/50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("inv.subtotal")}</span>
                <span className="font-medium">{formatINR(gst.subtotal)}</span>
              </div>
              {gst.interState ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IGST @ {gst.rate}%</span>
                  <span className="font-medium">{formatINR(gst.igst)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CGST @ {gst.rate / 2}%</span>
                    <span className="font-medium">{formatINR(gst.cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SGST @ {gst.rate / 2}%</span>
                    <span className="font-medium">{formatINR(gst.sgst)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between border-t border-border pt-1 text-base font-bold">
                <span>{t("inv.grandTotal")}</span>
                <span>{formatINR(gst.grandTotal)}</span>
              </div>
              {!dealer?.gstin && dealer && (
                <p className="pt-1 text-xs text-muted-foreground">
                  Dealer has no GSTIN — taxed as intra-state (CGST + SGST).
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={save}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GST invoice preview + print/PDF */}
      <InvoicePreview
        invoice={view}
        open={!!view}
        onOpenChange={(v) => !v && setView(null)}
      />
    </div>
  );
}
