import type { Metadata } from "next";
import { BalanceSheetClient } from "./BalanceSheetClient";
import { createAdminClient } from "@/utils/supabase/server";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Balance Sheet | CA Workspace" }; }
export default async function BalanceSheetPage() {
  const supabase = await createAdminClient();
  const [{ data: products }, { data: invoices }, { data: purchases }] = await Promise.all([
    supabase.from("products").select("stock, selling_price"),
    supabase.from("invoices").select("total_amount"),
    supabase.from("purchase_master").select("total_amount"),
  ]);
  const stockValue = (products || []).reduce((s,p) => s + Number(p.stock||0)*Number(p.selling_price||0), 0);
  const revenue = (invoices || []).reduce((s,i) => s + Number(i.total_amount||0), 0);
  const purchaseTotal = (purchases || []).reduce((s,p) => s + Number(p.total_amount||0), 0);
  return <BalanceSheetClient stockValue={stockValue} revenue={revenue} purchases={purchaseTotal} />;
}