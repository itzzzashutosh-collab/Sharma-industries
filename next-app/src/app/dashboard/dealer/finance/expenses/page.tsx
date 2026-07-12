import type { Metadata } from "next";
import { BusinessExpensesClient } from "./BusinessExpensesClient";
import { getDealerExpenses } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Business Expenses | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerExpenses();
  return <BusinessExpensesClient initialData={(res.list || []) as any[]} />;
}
