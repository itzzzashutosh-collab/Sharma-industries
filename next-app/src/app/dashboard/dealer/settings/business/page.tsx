import type { Metadata } from "next";
import { InvoiceCustomizerClient } from "./InvoiceCustomizerClient";
import { getDealerShopProfile } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Invoice Customizer | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerShopProfile();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <InvoiceCustomizerClient initialData={data} />;
}
