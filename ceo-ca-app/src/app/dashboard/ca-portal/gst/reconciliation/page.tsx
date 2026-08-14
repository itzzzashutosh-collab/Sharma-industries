import type { Metadata } from "next";
import { ReconciliationClient } from "./ReconciliationClient";
import { getGSTReconciliation } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "GST Reconciliation | CA Workspace" };
}

export default async function Page() {
  const res = await getGSTReconciliation();
  return <ReconciliationClient initialAnomalies={(res as any).anomalies || []} />;
}
