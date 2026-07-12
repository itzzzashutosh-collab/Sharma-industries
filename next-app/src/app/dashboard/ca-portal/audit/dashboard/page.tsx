import type { Metadata } from "next";
import { AuditDashboardClient } from "@/app/dashboard/ca-portal/audit/dashboard/AuditDashboardClient";
import { getAuditDashboardData } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Audit Dashboard | CA Workspace" };
}

export default async function Page() {
  const res = await getAuditDashboardData();
  return <AuditDashboardClient initialData={(res as any).data || null} />;
}
