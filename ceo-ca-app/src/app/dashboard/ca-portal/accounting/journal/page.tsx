import type { Metadata } from "next";
import { JournalClient } from "./JournalClient";
import { getJournalEntries, getLedgers } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Journal Entries | CA Workspace" };
}

export default async function Page() {
  const entriesRes = await getJournalEntries();
  const ledgersRes = await getLedgers();
  return (
    <JournalClient
      initialEntries={entriesRes.data || []}
      ledgers={ledgersRes.data || []}
    />
  );
}
