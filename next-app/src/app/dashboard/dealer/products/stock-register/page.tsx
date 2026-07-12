import type { Metadata } from "next";
import { StockRegisterClient } from "./StockRegisterClient";
import { getDealerStockMovement } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Stock Register | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerStockMovement();
  return <StockRegisterClient initialData={(res.list || []) as any[]} />;
}
