import { InvoiceEngine } from "./InvoiceEngine";

export const metadata = {
  title: "Smart GST Invoicing | Sharma ERP",
};

export default function NewInvoicePage() {
  return (
    <div className="animate-in fade-in duration-500 space-y-6 max-w-screen-2xl mx-auto">
      {/* Invoice Engine Client Component */}
      <InvoiceEngine />
    </div>
  );
}
