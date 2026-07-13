import type { Metadata } from "next";
import { MeetingsClient } from "./MeetingsClient";
import { getPainterCommunityData } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Painter Meetings | Community Workspace" };
}

export default async function Page() {
  const res = await getPainterCommunityData();
  return <MeetingsClient initialData={(res as any)} />;
}
