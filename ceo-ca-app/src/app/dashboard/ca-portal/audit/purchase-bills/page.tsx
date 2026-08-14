import type { Metadata } from "next";
import { PurchaseBillsClient } from "./PurchaseBillsClient";
import { getAuditPurchaseBills } from "../../actions";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Purchase Bills | CA Workspace — Sharma ERP" }; }
export default async function PurchaseBillsPage() {
  const res = await getAuditPurchaseBills();
  return <PurchaseBillsClient initialData={res.data || []} />;
}
