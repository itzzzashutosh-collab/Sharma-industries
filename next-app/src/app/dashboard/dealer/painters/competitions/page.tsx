import type { Metadata } from "next";
import { ContestsBoardClient } from "./ContestsBoardClient";
import { getDealerCompetitions } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Contractor Leaderboard | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerCompetitions("monthly");
  return <ContestsBoardClient initialData={res} />;
}
