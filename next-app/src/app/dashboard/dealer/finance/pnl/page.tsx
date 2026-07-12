import type { Metadata } from "next";
import { EstimatedPnLClient } from "./EstimatedPnLClient";
import { getDealerInvoices } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Estimated Profit & Loss | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerInvoices();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <EstimatedPnLClient initialData={data} />;
}
