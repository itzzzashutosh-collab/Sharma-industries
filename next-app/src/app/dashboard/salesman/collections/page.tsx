import type { Metadata } from "next";
import { CollectionsClient } from "./CollectionsClient";
import { getSalesmanDashboardData } from "../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Collections & AR | Sales Executive" };
}

export default async function Page() {
  const res = await getSalesmanDashboardData();

  if (!res.success) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        <p className="font-bold text-red-500">Failed to load collections ledger</p>
        <p className="mt-1">{res.error}</p>
      </div>
    );
  }

  // Pre-seed dynamic mock outstanding invoices
  const invoices: any[] = [
    {
      id: "INV-10824",
      dealer_name: (res.dealers && res.dealers[0]?.name) || "Shree Ram Paints",
      amount: 45000,
      due_days: 49,
      priority: "Critical"
    },
    {
      id: "INV-10941",
      dealer_name: "Mahadev Paints & Sanitary",
      amount: 28000,
      due_days: 12,
      priority: "Medium"
    }
  ];

  const payload = {
    dealers: res.dealers || [],
    invoices
  };

  return <CollectionsClient initialData={payload} />;
}
