import type { Metadata } from "next";
import { ContestsBoardClient } from "./ContestsBoardClient";
import { getDealerCompetitions } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Contests Board | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerCompetitions();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <ContestsBoardClient initialData={data} />;
}
