import type { Metadata } from "next";
import { PnLClient } from "./PnLClient";
import { getPnLReport, getCAFirmDetails } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Profit & Loss | CA Workspace" };
}

export default async function PnLPage() {
  const [pnlRes, firmRes] = await Promise.all([
    getPnLReport("monthly"),
    getCAFirmDetails(),
  ]);
  return (
    <PnLClient
      initialReport={(pnlRes as any).report || null}
      firmDetails={firmRes.success ? firmRes.data : null}
    />
  );
}
