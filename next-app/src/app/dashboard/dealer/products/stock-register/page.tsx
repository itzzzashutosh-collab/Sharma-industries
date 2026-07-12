import type { Metadata } from "next";
import { StockRegisterClient } from "./StockRegisterClient";
import { getDealerProductsList } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Stock Register | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerProductsList();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <StockRegisterClient initialData={data} />;
}
