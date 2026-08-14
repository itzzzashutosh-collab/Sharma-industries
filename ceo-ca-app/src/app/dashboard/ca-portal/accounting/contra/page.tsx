import type { Metadata } from "next";
import { ContraClient } from "./ContraClient";
import { getContraEntries, getLedgers } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Contra Entries | CA Workspace" };
}

export default async function Page() {
  const entriesRes = await getContraEntries();
  const ledgersRes = await getLedgers();
  return (
    <ContraClient
      initialEntries={entriesRes.data || []}
      ledgers={ledgersRes.data || []}
    />
  );
}
