import { createClient } from "@/utils/supabase/server";
import { POSForm } from "./POSForm";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "POS Billing | Sharma ERP",
  };
}

export default async function POSPage() {
  const supabase = await createClient();

  // Fetch products
  const { data: productsData } = await supabase
    .from("products")
    .select("id, product_name, selling_cost, tags")
    .eq("is_master_product", true)
    .order("product_name");

  // Map to match expected component props
  const products = productsData?.map((p: any) => ({
    id: p.id,
    name: p.product_name,
    selling_price: p.selling_cost,
    sku: p.id,
    tags: p.tags
  })) || [];

  // Fetch painters
  const { data: painters } = await supabase
    .from("painters")
    .select("id, name, phone")
    .order("name");

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">New Invoice (POS)</h1>
        <p className="text-slate-400 mt-2">Create a new bill and optionally record internal commissions.</p>
      </div>

      <POSForm products={products || []} painters={painters || []} />
    </div>
  );
}
