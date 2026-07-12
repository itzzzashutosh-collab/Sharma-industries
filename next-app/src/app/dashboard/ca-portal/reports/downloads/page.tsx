import type { Metadata } from "next";
import { DownloadsClient } from "@/app/dashboard/ca-portal/reports/downloads/DownloadsClient";
import { getDownloadHistory } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Download Center | CA Workspace" };
}

export default async function Page() {
  const res = await getDownloadHistory();
  return <DownloadsClient initialData={res.history || []} />;
}
