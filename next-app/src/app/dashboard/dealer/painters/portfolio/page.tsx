import type { Metadata } from "next";
import { WorkPortfolioReviewClient } from "./WorkPortfolioReviewClient";
import { getDealerPainters } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Work Portfolio Review | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerPainters();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <WorkPortfolioReviewClient initialData={data} />;
}
