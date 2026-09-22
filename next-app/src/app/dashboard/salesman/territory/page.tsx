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

  // Approved territory operational hubs (Bundi HQ & 150km radius city markets)
  const cities = [
    { city: "Bundi (HQ)", dealers: 0, painters: 0, revenue: 0, growth: "HQ Base" },
    { city: "Kota City", dealers: 0, painters: 0, revenue: 0, growth: "Expansion Hub" },
    { city: "Talera", dealers: 0, painters: 0, revenue: 0, growth: "Corridor" },
    { city: "Bijoliya", dealers: 0, painters: 0, revenue: 0, growth: "Trade Market" },
    { city: "Baran", dealers: 0, painters: 0, revenue: 0, growth: "Commercial" },
    { city: "Rawatbhata", dealers: 0, painters: 0, revenue: 0, growth: "Retail" },
    { city: "Deoli", dealers: 0, painters: 0, revenue: 0, growth: "Retail" }
  ];

  const payload = {
    cities,
    targetStats: res.targetStats || { mtdRevenue: 0, targetRevenue: 200000 },
    assignedTerritory: res.assignedTerritory || "Hadoti Region (Bundi & Kota)"
  };

  return <TerritoryClient initialData={payload} />;
}
