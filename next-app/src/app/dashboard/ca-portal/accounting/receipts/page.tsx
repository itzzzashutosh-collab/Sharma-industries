import type { Metadata } from "next";
import { ReceiptsClient } from "./ReceiptsClient";
import { getReceipts } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Receipts Register | CA Workspace" };
}

export default async function Page() {
  const res = await getReceipts();
  return <ReceiptsClient initialReceipts={res.data || []} />;
}
