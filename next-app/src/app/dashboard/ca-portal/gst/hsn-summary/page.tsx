import type { Metadata } from "next";
import { HSNSummaryClient } from "@/app/dashboard/ca-portal/gst/hsn-summary/HSNSummaryClient";
import { getHSNSummary } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "HSN Summary | CA Workspace" };
}

export default async function Page() {
  const res = await getHSNSummary();
  return <HSNSummaryClient initialData={(res as any).data || []} />;
}
