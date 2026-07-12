import type { Metadata } from "next";
import { PurchaseBillsClient } from "./PurchaseBillsClient";
import { getDealerPurchaseBills } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Purchase Bills | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerPurchaseBills();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <PurchaseBillsClient initialData={data} />;
}
