import { QuotationEngine } from "./QuotationEngine";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "Smart GST Invoicing | Sharma ERP",
  };
}

export default function NewQuotationPage() {
  return (
    <div className="animate-in fade-in duration-500 space-y-6 max-w-screen-2xl mx-auto">
      {/* Quotation Engine Client Component */}
      <QuotationEngine />
    </div>
  );
}
