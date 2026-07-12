import type { Metadata } from "next";
import { MeetingsLogClient } from "./MeetingsLogClient";
import { getDealerMeetings } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Meetings Log | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerMeetings();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <MeetingsLogClient initialData={data} />;
}
