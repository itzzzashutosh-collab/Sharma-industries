import type { Metadata } from "next";
import { FactoryOrdersLogClient } from "./FactoryOrdersLogClient";
import { getDealerFactoryOrders } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Factory Orders Log | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerFactoryOrders();
  return <FactoryOrdersLogClient initialData={(res.list || []) as any[]} />;
}
