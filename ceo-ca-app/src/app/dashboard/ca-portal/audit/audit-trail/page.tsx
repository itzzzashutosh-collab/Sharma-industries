import type { Metadata } from "next";
import { AuditTrailClient } from "./AuditTrailClient";
import { getAuditTrail } from "../../actions";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Audit Trail | CA Workspace" }; }
export default async function Page() {
  const res = await getAuditTrail();
  return <AuditTrailClient initialData={(res as any).data || (res as any).entries || []} />;
}
