import type { Metadata } from "next";
import { PointsClient } from "./PointsClient";
import { getPainterRewardsData } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Reward Points | Painter Workspace" };
}

export default async function Page() {
  const res = await getPainterRewardsData();
  return <PointsClient initialData={(res as any)} />;
}
