import type { Metadata } from "next";
import { LoyaltySchemesClient } from "./LoyaltySchemesClient";
import { getDealerSchemes } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Loyalty Schemes | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerSchemes();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <LoyaltySchemesClient initialData={data} />;
}
