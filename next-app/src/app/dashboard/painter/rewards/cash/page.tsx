import type { Metadata } from "next";
import { CashClient } from "./CashClient";
import { getPainterRewardsData } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Cash Wallet | Painter Workspace" };
}

export default async function Page() {
  const res = await getPainterRewardsData();
  return <CashClient initialData={(res as any)} />;
}
