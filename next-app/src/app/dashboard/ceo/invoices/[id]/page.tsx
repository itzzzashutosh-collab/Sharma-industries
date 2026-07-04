import { createAdminClient } from "@/utils/supabase/server";
import { InvoiceDetailView } from "./InvoiceDetailView";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
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
      </div>
    );
  }

  return <InvoiceDetailView invoice={invoice} />;
}
