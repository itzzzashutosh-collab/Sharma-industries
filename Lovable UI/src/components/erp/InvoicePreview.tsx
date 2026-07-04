import { useState } from "react";
import { createPortal } from "react-dom";
import { Printer, Download } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { useData, type Invoice } from "@/lib/data";
import {
  InvoiceDocument,
  INVOICE_TEMPLATES,
  type TemplateId,
} from "@/components/erp/InvoiceDocument";
import {
  Dialog,
  DialogContent,
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

export function InvoicePreview({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useI18n();
  const { data, update } = useData();
  const [template, setTemplate] = useState<TemplateId>(
    (invoice?.template as TemplateId) || "classic",
  );

  if (!invoice) return null;
  const dealer = data.dealers.find((d) => d.id === invoice.dealerId) || null;

  const onTemplate = (v: string) => {
    setTemplate(v as TemplateId);
    update("invoices", invoice.id, { template: v });
  };

  const doPrint = () => window.print();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-hidden p-0">
          <DialogHeader className="flex-row items-center justify-between gap-3 border-b border-border px-5 py-3">
            <DialogTitle>
              {t("inv.preview")} · {invoice.number}
            </DialogTitle>
            <div className="flex items-center gap-2 pr-6">
              <Select value={template} onValueChange={onTemplate}>
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_TEMPLATES.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      {tpl.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={doPrint} className="gap-2">
                <Printer className="h-4 w-4" /> {t("inv.print")}
              </Button>
            </div>
          </DialogHeader>

          <div className="max-h-[78vh] overflow-y-auto bg-muted/40 p-5">
            <div className="mx-auto w-full max-w-[800px] bg-white shadow-lg">
              <InvoiceDocument invoice={invoice} dealer={dealer} template={template} />
            </div>
            <p className="mx-auto mt-3 max-w-[800px] text-center text-xs text-muted-foreground">
              <Download className="mr-1 inline h-3 w-3" />
              {t("inv.pdfHint")}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden print-only document */}
      {open &&
        createPortal(
          <div className="print-doc">
            <InvoiceDocument invoice={invoice} dealer={dealer} template={template} />
          </div>,
          document.body,
        )}
    </>
  );
}
