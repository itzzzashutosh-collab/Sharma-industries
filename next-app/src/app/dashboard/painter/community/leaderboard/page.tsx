import type { Metadata } from "next";
import { LeaderboardClient } from "./LeaderboardClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Leaderboard | Community Workspace" };
}

export default async function Page() {
  return <LeaderboardClient />;
}
