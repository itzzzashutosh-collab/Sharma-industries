import type { Metadata } from "next";
import { ComparisonClient } from "@/app/dashboard/ca-portal/reports/comparison/ComparisonClient";
import { getFinancialComparisonData } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Financial Comparison | CA Workspace" };
}

export default async function Page() {
  const res = await getFinancialComparisonData();
  return <ComparisonClient initialData={res.comparisonList || []} />;
}
