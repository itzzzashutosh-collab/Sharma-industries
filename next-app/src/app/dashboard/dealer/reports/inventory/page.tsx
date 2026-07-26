import type { Metadata } from "next";
import { InventoryReportClient } from "./InventoryReportClient";
import { getDealerInventoryReport } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Inventory Audit & Stock Valuation | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerInventoryReport();
  return <InventoryReportClient initialData={(res as any).data} />;
}
