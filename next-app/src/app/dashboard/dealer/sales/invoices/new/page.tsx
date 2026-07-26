import { DealerInvoiceEngine } from "./DealerInvoiceEngine";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "New Invoice | Dealer Portal – Sharma ERP",
  };
}

export default async function DealerNewInvoicePage() {
  return (
    <div className="animate-in fade-in duration-500 space-y-6 max-w-screen-2xl mx-auto p-6">
      <DealerInvoiceEngine />
    </div>
  );
}
