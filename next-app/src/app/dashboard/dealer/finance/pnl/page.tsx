import type { Metadata } from "next";
import { EstimatedPnLClient } from "./EstimatedPnLClient";
import { getDealerInvoices, getDealerExpenses, getDealerPurchaseBills, getDealerCustomerLedger } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Profit & Loss Statement | Dealer Workspace" };
}

export default async function Page() {
  const [invRes, expRes, billRes, ledgerRes] = await Promise.all([
    getDealerInvoices(),
    getDealerExpenses(),
    getDealerPurchaseBills(),
    getDealerCustomerLedger()
  ]);

  return (
    <EstimatedPnLClient
      initialInvoices={(invRes.list || []) as any[]}
      initialExpenses={(expRes.list || []) as any[]}
      initialPurchaseBills={(billRes.list || []) as any[]}
      initialClients={(ledgerRes.clients || []) as any[]}
    />
  );
}
