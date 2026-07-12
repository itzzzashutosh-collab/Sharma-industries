import type { Metadata } from "next";
import { CouponsAuditingClient } from "./CouponsAuditingClient";
import { getDealerCoupons, getDealerPainters } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Coupons Auditing | Dealer Workspace" };
}

export default async function Page() {
  const [couponsRes, paintersRes] = await Promise.all([
    getDealerCoupons(),
    getDealerPainters()
  ]);

  return (
    <CouponsAuditingClient
      initialData={(couponsRes.list || []) as any[]}
      painters={(paintersRes.list || []) as any[]}
    />
  );
}
