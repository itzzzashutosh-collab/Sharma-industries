import type { Metadata } from "next";
import { PainterDashboardClient } from "./PainterDashboardClient";
import { getPainterDashboardData } from "./actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Dashboard | Painter Workspace" };
}

export default async function Page() {
  const res = await getPainterDashboardData();
  return <PainterDashboardClient initialData={(res as any)} />;
}
