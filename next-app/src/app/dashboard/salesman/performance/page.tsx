import type { Metadata } from "next";
import { PerformanceClient } from "./PerformanceClient";
import { getSalesmanDashboardData } from "../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Target & Salary | Sales Executive" };
}

export default async function Page() {
  const res = await getSalesmanDashboardData();

  if (!res.success) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        <p className="font-bold text-red-500">Failed to load performance parameters</p>
        <p className="mt-1">{res.error}</p>
      </div>
    );
  }

  const payload = {
    mtdRevenue: res.targetStats?.mtdRevenue || 0,
    targetRevenue: res.targetStats?.targetRevenue || 500000
  };

  return <PerformanceClient initialData={payload} />;
}
