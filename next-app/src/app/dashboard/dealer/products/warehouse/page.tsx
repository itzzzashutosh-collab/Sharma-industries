import type { Metadata } from "next";
import { WarehouseLocationsClient } from "./WarehouseLocationsClient";
import { getDealerProductsList } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Warehouse Locations | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerProductsList();
  return <WarehouseLocationsClient initialData={(res.list || []) as any[]} />;
}
