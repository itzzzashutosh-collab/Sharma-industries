import { createAdminClient } from "@/utils/supabase/server";
import { QuotationsClient } from "./QuotationsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quotations | Dealer Portal – Sharma ERP",
};

export default async function DealerQuotationsPage() {
  const supabase = await createAdminClient();

  const { data: quotations } = await supabase
    .from("quotations")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <QuotationsClient initialData={quotations || []} />
  );
}
