import type { Metadata } from "next";
import { WorkPortfolioReviewClient } from "./WorkPortfolioReviewClient";
import { getDealerWorkPortfolios, getDealerPainters } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Work Portfolio Showcase | Dealer Workspace" };
}

export default async function Page() {
  const [portRes, paintersRes] = await Promise.all([
    getDealerWorkPortfolios(),
    getDealerPainters()
  ]);

  const portData = (portRes as any).list || [];
  const paintersData = (paintersRes as any).list || [];

  return <WorkPortfolioReviewClient initialData={portData} paintersList={paintersData} />;
}
