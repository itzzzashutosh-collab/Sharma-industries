import type { Metadata } from "next";
import { LedgerClient } from "./LedgerClient";
import { getLedgers } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Ledger Management | CA Workspace" };
}

export default async function Page() {
  const res = await getLedgers();
  return <LedgerClient initialLedgers={res.data || []} />;
}
