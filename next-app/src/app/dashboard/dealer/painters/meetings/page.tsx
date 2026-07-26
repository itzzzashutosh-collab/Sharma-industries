import type { Metadata } from "next";
import { MeetingsLogClient } from "./MeetingsLogClient";
import { getDealerMeetings, getDealerPainters } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Meetings & Contractor Invites | Dealer Workspace" };
}

export default async function Page() {
  const [meetingsRes, paintersRes] = await Promise.all([
    getDealerMeetings(),
    getDealerPainters()
  ]);

  const meetingsData = (meetingsRes as any).list || [];
  const paintersData = (paintersRes as any).list || [];

  return <MeetingsLogClient initialData={meetingsData} initialPainters={paintersData} />;
}
