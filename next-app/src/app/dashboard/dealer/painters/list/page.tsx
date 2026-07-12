import type { Metadata } from "next";
import { PaintersPortfolioClient } from "./PaintersPortfolioClient";
import { getDealerPainters } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Painters Directory | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerPainters();
  return <PaintersPortfolioClient initialData={(res.list || []) as any[]} />;
}
