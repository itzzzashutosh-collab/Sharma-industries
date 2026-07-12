import type { Metadata } from "next";
import { GSTFilingCenterClient } from "@/app/dashboard/ca-portal/gst/filing-center/GSTFilingCenterClient";
import { getGSTFilingData } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "GST Filing Center | CA Workspace" };
}

export default async function Page() {
  const res = await getGSTFilingData();
  return <GSTFilingCenterClient initialData={res.list || []} />;
}
