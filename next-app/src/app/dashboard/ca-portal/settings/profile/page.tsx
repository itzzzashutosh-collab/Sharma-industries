import type { Metadata } from "next";
import { ProfileClient } from "./ProfileClient";
import { getCAFirmDetails } from "../../actions";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "CA Profile | Settings — Sharma ERP" }; }
export default async function ProfilePage() {
  const res = await getCAFirmDetails();
  return <ProfileClient initialData={res.data || null} />;
}
