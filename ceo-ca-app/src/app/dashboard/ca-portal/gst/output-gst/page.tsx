import type { Metadata } from "next";
import { OutputGSTClient } from "@/app/dashboard/ca-portal/gst/output-gst/OutputGSTClient";
import { getGSTOutputSummary } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Output GST | CA Workspace" };
}

export default async function Page() {
  const res = await getGSTOutputSummary();
  return <OutputGSTClient initialData={(res as any).data || { cgst: 0, sgst: 0, igst: 0, collected: 0, payable: 0 }} />;
}
