import { createAdminClient } from "@/utils/supabase/server";
import { QuotationDetailView } from "./QuotationDetailView";

export default async function QuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAdminClient();
  const { data: quotation } = await supabase
    .from("quotations")
    .select("*")
    .eq("id", id)
    .single();

  if (!quotation) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold text-rose-500">Quotation not found</h1>
      </div>
    );
  }

  return <QuotationDetailView quotation={quotation} />;
}
