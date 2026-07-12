import type { Metadata } from "next";
import { StockLevelsClient } from "./StockLevelsClient";
import { getDealerProductsList } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Stock Levels | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerProductsList();
  return <StockLevelsClient initialData={(res.list || []) as any[]} />;
}
