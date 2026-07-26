import type { Metadata } from "next";
import { InvoiceCustomizerClient } from "./InvoiceCustomizerClient";
import { getDealerBusinessSettings } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Business Settings & Invoice Customizer | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerBusinessSettings();
  return <InvoiceCustomizerClient initialData={(res as any).data || {}} />;
}
