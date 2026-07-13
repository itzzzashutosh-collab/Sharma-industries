import type { Metadata } from "next";
import { TerritoryClient } from "./TerritoryClient";
import { getSalesmanDashboardData } from "../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Territory Coverage | Sales Executive" };
}

export default async function Page() {
  const res = await getSalesmanDashboardData();

  if (!res.success) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        <p className="font-bold text-red-500">Failed to load territory statistics</p>
        <p className="mt-1">{res.error}</p>
      </div>
    );
  }

  // Pre-seed dynamic mock cities performance data
  const cities = [
    { city: "Jaipur", dealers: 8, painters: 12, revenue: 220000, growth: "+12%" },
    { city: "Kota", dealers: 4, painters: 8, revenue: 150000, growth: "+24%" },
    { city: "Bundi", dealers: 2, painters: 4, revenue: 80000, growth: "-5%" }
  ];

  const payload = {
    cities,
    targetStats: res.targetStats || { mtdRevenue: 0, targetRevenue: 500000 },
    assignedTerritory: res.assignedTerritory || "Rajasthan East"
  };

  return <TerritoryClient initialData={payload} />;
}
