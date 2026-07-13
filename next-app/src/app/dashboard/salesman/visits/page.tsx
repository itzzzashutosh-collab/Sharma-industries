import type { Metadata } from "next";
import { VisitsClient } from "./VisitsClient";
import { getSalesmanDashboardData } from "../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Field Visits | Sales Executive" };
}

export default async function Page() {
  const res = await getSalesmanDashboardData();

  if (!res.success) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        <p className="font-bold text-red-500">Failed to load route pipeline</p>
        <p className="mt-1">{res.error}</p>
      </div>
    );
  }

  return <VisitsClient initialData={(res as any)} />;
}
