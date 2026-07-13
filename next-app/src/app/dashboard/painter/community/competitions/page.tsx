import type { Metadata } from "next";
import { CompetitionsClient } from "./CompetitionsClient";
import { getPainterCommunityData } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Competitions | Community Workspace" };
}

export default async function Page() {
  const res = await getPainterCommunityData();
  return <CompetitionsClient initialData={(res as any)} />;
}
