import { DealerQuotationEngine } from "./DealerQuotationEngine";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Quotation | Dealer Portal – Sharma ERP",
};

export default async function DealerNewQuotationPage() {
  return (
    <div className="animate-in fade-in duration-500 space-y-6 max-w-screen-2xl mx-auto p-6">
      <DealerQuotationEngine />
    </div>
  );
}
