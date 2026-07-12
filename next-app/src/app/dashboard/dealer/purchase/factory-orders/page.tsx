import type { Metadata } from "next";
import { FactoryOrdersLogClient } from "./FactoryOrdersLogClient";
import { getDealerFactoryOrders } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Factory Orders Log | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerFactoryOrders();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <FactoryOrdersLogClient initialData={data} />;
}
