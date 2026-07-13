import type { Metadata } from "next";
import { BrandingClient } from "./BrandingClient";
import { getSalesmanDashboardData } from "../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Branding & Merchandising | Sales Executive" };
}

export default async function Page() {
  const res = await getSalesmanDashboardData();

  if (!res.success) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        <p className="font-bold text-red-500">Failed to load branding logs</p>
        <p className="mt-1">{res.error}</p>
      </div>
    );
  }

  // Pre-seed dynamic mock branding items
  const branding = [
    {
      id: "BRAND-9482",
      dealer_name: (res.dealers && res.dealers[0]?.name) || "Shree Ram Paints",
      item_type: "Glow Sign Board",
      status: "Installed",
      last_inspected: "2026-07-01"
    },
    {
      id: "BRAND-9511",
      dealer_name: "Mahadev Paints & Sanitary",
      item_type: "Product Display Rack",
      status: "Requested",
      last_inspected: "2026-07-10"
    }
  ];

  const payload = {
    dealers: res.dealers || [],
    branding
  };

  return <BrandingClient initialData={payload} />;
}
