import type { Metadata } from "next";
import { PurchaseBillsClient } from "./PurchaseBillsClient";
import { getDealerPurchaseBills, getDealerSuppliers } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Purchase Bills | Dealer Workspace" };
}

export default async function Page() {
  const [billsRes, suppliersRes] = await Promise.all([
    getDealerPurchaseBills(),
    getDealerSuppliers()
  ]);

  return (
    <PurchaseBillsClient
      initialData={billsRes.list || []}
      suppliers={(suppliersRes.list || []) as any[]}
    />
  );
}
