import type { Metadata } from "next";
import { LogisticsTrackingClient } from "./LogisticsTrackingClient";
import { getDealerFactoryOrders } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Order Tracking | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerFactoryOrders();
  return <LogisticsTrackingClient initialData={(res.list || []) as any[]} />;
}
