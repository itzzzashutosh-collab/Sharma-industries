import type { Metadata } from "next";
import { SalesReportClient } from "./SalesReportClient";
import { getDealerSalesReport } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Sales Reports & Revenue Analytics | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerSalesReport("monthly");
  return <SalesReportClient initialData={(res as any).data} />;
}
