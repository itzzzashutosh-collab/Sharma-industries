import type { Metadata } from "next";
import { CustomerLedgerClient } from "./CustomerLedgerClient";
import { getDealerCustomerLedger } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Customer & Client Ledger | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerCustomerLedger();
  return (
    <CustomerLedgerClient
      initialInvoices={(res.invoices || []) as any[]}
      initialClients={(res.clients || []) as any[]}
    />
  );
}
