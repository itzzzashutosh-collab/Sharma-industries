import type { Metadata } from "next";
import { CashFlowClient } from "./CashFlowClient";
import { createAdminClient } from "@/utils/supabase/server";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Cash Flow | CA Workspace" }; }
export default async function CashFlowPage() {
  const supabase = await createAdminClient();
  const [{ data: invoices }, { data: purchases }, { data: expenses }] = await Promise.all([
    supabase.from("invoices").select("total_amount"),
    supabase.from("purchase_master").select("total_amount"),
    supabase.from("factory_expenses").select("amount"),
  ]);
  const revenue = (invoices || []).reduce((s,i) => s + Number(i.total_amount||0), 0);
  const purchaseTotal = (purchases || []).reduce((s,p) => s + Number(p.total_amount||0), 0);
  const expenseTotal = (expenses || []).reduce((s,e) => s + Number(e.amount||0), 0);
  return <CashFlowClient revenue={revenue} purchases={purchaseTotal} expenses={expenseTotal} />;
}