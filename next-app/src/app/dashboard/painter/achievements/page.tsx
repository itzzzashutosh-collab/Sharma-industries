import type { Metadata } from "next";
import { AchievementsClient } from "./AchievementsClient";
import { getPainterRewardsData } from "../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Achievements | Painter Workspace" };
}

export default async function Page() {
  const res = await getPainterRewardsData();
  return <AchievementsClient initialData={(res as any)} />;
}
