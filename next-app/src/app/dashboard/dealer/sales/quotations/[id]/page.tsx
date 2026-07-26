import { createAdminClient } from "@/utils/supabase/server";
import { DealerQuotationDetailView } from "./DealerQuotationDetailView";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Quotation Detail | Dealer Portal – Sharma ERP`,
  };
}

export default async function DealerQuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAdminClient();
  const { data: quotation } = await supabase
    .from("quotations")
    .select("*")
    .eq("id", id)
    .single();

  if (!quotation) {
    return (
      <div className="p-10 text-center space-y-3">
        <h1 className="text-2xl font-bold text-rose-500">Quotation Not Found</h1>
        <p className="text-xs text-muted-foreground">The quotation you are looking for does not exist or has been deleted.</p>
      </div>
    );
  }

  return <DealerQuotationDetailView quotation={quotation} />;
}
