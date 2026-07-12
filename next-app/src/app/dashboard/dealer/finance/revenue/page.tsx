import type { Metadata } from "next";
import { RevenueSummaryClient } from "./RevenueSummaryClient";
import { getDealerInvoices } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Revenue Summary | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerInvoices();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <RevenueSummaryClient initialData={data} />;
}
