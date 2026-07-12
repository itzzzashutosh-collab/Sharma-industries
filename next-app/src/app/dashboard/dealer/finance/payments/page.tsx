import type { Metadata } from "next";
import { PaymentRegistryClient } from "./PaymentRegistryClient";
import { getDealerInvoices } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Payment Registry | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerInvoices();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <PaymentRegistryClient initialData={data} />;
}
