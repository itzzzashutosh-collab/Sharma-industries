import type { Metadata } from "next";
import { InputGSTClient } from "@/app/dashboard/ca-portal/gst/input-gst/InputGSTClient";
import { getGSTInputSummary } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Input GST | CA Workspace" };
}

export default async function Page() {
  const res = await getGSTInputSummary();
  return <InputGSTClient initialData={(res as any).data || { cgst: 0, sgst: 0, igst: 0, totalInput: 0, eligibleCredit: 0, blockedCredit: 0, pendingCredit: 0, availableITC: 0 }} />;
}
