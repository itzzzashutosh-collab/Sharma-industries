import { createClient } from "@supabase/supabase-js";
import { CompetitorsClient } from "./client";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "Competitor Intelligence | Sharma ERP",
  description: "Track and analyze competitor paint brands, SKU pricing, dealer margins, and product specifications.",
  };
}
export const dynamic = "force-dynamic";

export default async function CompetitorsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: competitorProducts, error } = await supabase
    .from("competitor_products")
    .select("*")
    .order("brand", { ascending: true })
    .order("product_name", { ascending: true });

  if (error) {
    console.error("Error fetching competitor products:", error);
  }

  return (
    <CompetitorsClient initialData={competitorProducts || []} />
  );
}
