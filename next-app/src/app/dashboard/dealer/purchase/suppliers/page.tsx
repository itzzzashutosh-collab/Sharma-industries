import type { Metadata } from "next";
import { SuppliersDirectoryClient } from "./SuppliersDirectoryClient";
import { getDealerSuppliers } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Suppliers Directory | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerSuppliers();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <SuppliersDirectoryClient initialData={data} />;
}
