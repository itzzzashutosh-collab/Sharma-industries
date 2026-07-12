import type { Metadata } from "next";
import { RevenueSummaryClient } from "./RevenueSummaryClient";
import { getDealerInvoices } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Revenue Summary | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerInvoices();
  return <RevenueSummaryClient initialData={(res.list || []) as any[]} />;
}
