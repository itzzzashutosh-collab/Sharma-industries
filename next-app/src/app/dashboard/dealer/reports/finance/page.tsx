import type { Metadata } from "next";
import { FinanceReportClient } from "./FinanceReportClient";
import { getDealerFinanceReport } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Financial Audit & P&L Statement | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerFinanceReport("monthly");
  return <FinanceReportClient initialData={(res as any).data} />;
}
