import type { Metadata } from "next";
import { StockRegisterClient } from "./StockRegisterClient";
import { getStockRegister } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Stock Register | CA Workspace" };
}

export default async function Page() {
  const res = await getStockRegister();
  return (
    <StockRegisterClient
      products={(res as any).products || []}
      rawMaterials={(res as any).rawMaterials || []}
    />
  );
}
