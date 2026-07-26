import type { Metadata } from "next";
import { PaymentsClient } from "./PaymentsClient";
import { getDealerPayments } from "./actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Payment Hub & UPI Setup | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerPayments();

  return (
    <PaymentsClient
      initialPayments={res.payments || []}
      initialInvoices={res.invoices || []}
    />
  );
}
