import type { Metadata } from "next";
import { SchemesClient } from "./SchemesClient";
import { getPainterCommunityData } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Loyalty Schemes | Community Workspace" };
}

export default async function Page() {
  const res = await getPainterCommunityData();
  return <SchemesClient initialData={(res as any)} />;
}
