import type { Metadata } from "next";
import { CouponsAuditingClient } from "./CouponsAuditingClient";
import { getDealerCoupons } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Coupons Auditing | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerCoupons();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <CouponsAuditingClient initialData={data} />;
}
