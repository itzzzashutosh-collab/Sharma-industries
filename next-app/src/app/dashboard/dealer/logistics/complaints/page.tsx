import type { Metadata } from "next";
import { ComplaintsClaimsClient } from "./ComplaintsClaimsClient";
import { getDealerComplaints } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Complaints & Claims | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerComplaints();
  return <ComplaintsClaimsClient initialData={(res.list || []) as any[]} />;
}
