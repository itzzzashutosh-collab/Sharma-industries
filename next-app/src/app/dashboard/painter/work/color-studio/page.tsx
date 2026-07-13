import type { Metadata } from "next";
import { PainterColorStudioClient } from "./PainterColorStudioClient";
import { getDealerCustomers, getDealerProductsList } from "@/app/dashboard/dealer/actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "House Color Studio | Painter Workspace" };
}

export default async function Page() {
  const [custRes, prodRes] = await Promise.all([
    getDealerCustomers(),
    getDealerProductsList()
  ]);

  const customers = custRes.success ? custRes.list : [];
  const products = prodRes.success ? prodRes.list : [];

  return <PainterColorStudioClient customers={customers} products={products} />;
}
