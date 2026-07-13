import type { Metadata } from "next";
import { StoreClient } from "./StoreClient";
import { getPainterRewardsData } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Reward Store | Painter Workspace" };
}

export default async function Page() {
  const res = await getPainterRewardsData();
  return <StoreClient initialData={(res as any)} />;
}
