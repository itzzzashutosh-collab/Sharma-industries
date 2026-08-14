import type { Metadata } from "next";
import { PaymentsClient } from "./PaymentsClient";
import { getPayments } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Payments Register | CA Workspace" };
}

export default async function Page() {
  const res = await getPayments();
  return <PaymentsClient initialPayments={res.data || []} />;
}
