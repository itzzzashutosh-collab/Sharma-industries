import type { Metadata } from "next";
import { FirmDetailsClient } from "./FirmDetailsClient";
import { getCAFirmDetails } from "../../actions";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Firm Details | CA Settings — Sharma ERP" }; }
export default async function FirmPage() {
  const res = await getCAFirmDetails();
  return <FirmDetailsClient initialData={res.data || null} />;
}
