import { createAdminClient } from "@/utils/supabase/server";
import { DealerInvoiceDetailView } from "./DealerInvoiceDetailView";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Invoice ${id} | Dealer Portal` };
}

export default async function DealerInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createAdminClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (!invoice) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold text-rose-500">Invoice not found</h1>
        <p className="text-muted-foreground text-sm mt-2">
          The invoice you are looking for does not exist or has been removed.
        </p>
      </div>
    );
  }

  return <DealerInvoiceDetailView invoice={invoice} />;
}
