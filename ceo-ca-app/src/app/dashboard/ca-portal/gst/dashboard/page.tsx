import type { Metadata } from "next";
import { GSTDashboardClient } from "./GSTDashboardClient";
import { getGSTDashboardData } from "../../actions";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "GST Dashboard | CA Workspace — Sharma ERP" }; }
export default async function GSTDashboardPage() {
  const res = await getGSTDashboardData();
  return <GSTDashboardClient initialData={res.success ? res.data : null} />;
}
