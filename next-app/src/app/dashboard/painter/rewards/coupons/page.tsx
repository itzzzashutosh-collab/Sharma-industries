import type { Metadata } from "next";
import { CouponsClient } from "./CouponsClient";
import { getPainterRewardsData } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Coupon Wallet | Painter Workspace" };
}

export default async function Page() {
  const res = await getPainterRewardsData();
  return <CouponsClient initialData={(res as any)} />;
}
