import type { Metadata } from "next";
import { StockLevelsClient } from "./StockLevelsClient";
import { getDealerProductsList, getDealerStockMovement } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Stock Register & Inventory | Dealer Workspace" };
}

export default async function Page() {
  const [prodRes, moveRes] = await Promise.all([
    getDealerProductsList(),
    getDealerStockMovement()
  ]);

  return (
    <StockLevelsClient
      initialProducts={(prodRes.list || []) as any[]}
      initialMovements={(moveRes.list || []) as any[]}
    />
  );
}
