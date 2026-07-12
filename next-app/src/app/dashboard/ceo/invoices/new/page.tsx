import { InvoiceEngine } from "./InvoiceEngine";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "Smart GST Invoicing | Sharma ERP",
  };
}

interface PageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function NewInvoicePage({ searchParams }: PageProps) {
  const { orderId } = await searchParams;

  return (
    <div className="animate-in fade-in duration-500 space-y-6 max-w-screen-2xl mx-auto">
      {/* Invoice Engine Client Component */}
      <InvoiceEngine orderId={orderId} />
    </div>
  );
}
