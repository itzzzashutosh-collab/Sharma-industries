import type { Metadata } from "next";
import { PaintersPortfolioClient } from "./PaintersPortfolioClient";
import { getDealerPainters } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Painters Portfolio | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerPainters();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <PaintersPortfolioClient initialData={data} />;
}
