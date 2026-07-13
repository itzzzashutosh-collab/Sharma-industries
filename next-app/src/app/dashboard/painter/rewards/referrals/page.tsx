import type { Metadata } from "next";
import { ReferralsClient } from "./ReferralsClient";
import { getPainterRewardsData } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Referral Program | Painter Workspace" };
}

export default async function Page() {
  const res = await getPainterRewardsData();
  return <ReferralsClient initialData={(res as any)} />;
}
