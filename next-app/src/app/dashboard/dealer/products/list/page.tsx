import type { Metadata } from "next";
import { ProductsCatalogueClient } from "./ProductsCatalogueClient";
import { getDealerProductsList } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Products Catalogue | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerProductsList();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <ProductsCatalogueClient initialData={data} />;
}
