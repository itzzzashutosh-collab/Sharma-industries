import type { Metadata } from "next";
import { PaintersPortfolioClient } from "./PaintersPortfolioClient";
import { getDealerPainters, getDealerMeetings } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Painters Directory | Dealer Workspace" };
}

export default async function Page() {
  const [paintersRes, meetingsRes] = await Promise.all([
    getDealerPainters(),
    getDealerMeetings()
  ]);

  const paintersData = (paintersRes as any).list || [];
  const meetingsData = (meetingsRes as any).list || [];

  return <PaintersPortfolioClient initialData={paintersData} initialMeetings={meetingsData} />;
}
