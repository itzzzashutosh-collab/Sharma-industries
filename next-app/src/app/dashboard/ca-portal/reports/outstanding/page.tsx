import type { Metadata } from "next";
import { OutstandingClient } from "./OutstandingClient";
import { getOutstandingData } from "../../actions";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Outstanding Reports | CA Workspace" }; }
export default async function Page() {
  const res = await getOutstandingData();
  return <OutstandingClient initialData={(res as any).receivables || (res as any).comparisonList || (res as any).history || []} extraData={res} />;
}
