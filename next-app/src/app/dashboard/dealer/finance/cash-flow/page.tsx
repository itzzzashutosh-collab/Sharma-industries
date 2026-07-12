import type { Metadata } from "next";
import { CashFlowLedgerClient } from "./CashFlowLedgerClient";
import { getDealerInvoices } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Cash Flow Ledger | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerInvoices();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <CashFlowLedgerClient initialData={data} />;
}
