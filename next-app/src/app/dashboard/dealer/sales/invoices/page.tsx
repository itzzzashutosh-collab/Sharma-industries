import type { Metadata } from "next";
import { POSClient } from "../../pos/POSClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Invoices & POS Billing | Dealer Workspace" };
}

export default function Page() {
  return <POSClient />;
}
