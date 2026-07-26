import type { Metadata } from "next";
import { PaymentRegistryClient } from "./PaymentRegistryClient";
import { getDealerInvoices, getDealerExpenses, getDealerCustomerLedger } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Payment Register | Dealer Workspace" };
}

export default async function Page() {
  const [invRes, expRes, ledgerRes] = await Promise.all([
    getDealerInvoices(),
    getDealerExpenses(),
    getDealerCustomerLedger()
  ]);

  return (
    <PaymentRegistryClient
      initialInvoices={(invRes.list || []) as any[]}
      initialExpenses={(expRes.list || []) as any[]}
      initialClients={(ledgerRes.clients || []) as any[]}
    />
  );
}
