import type { Metadata } from "next";
import { DealerDashboardClient } from "./DealerDashboardClient";
import { getDealerDashboardData } from "./actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Dealer Dashboard | Sharma Industries OS" };
}

export default async function DealerDashboard() {
  const res = await getDealerDashboardData();
  return (
    <DealerDashboardClient
      session={res.data.session}
      metrics={res.data.metrics}
      activities={res.data.activities}
    />
  );
}
