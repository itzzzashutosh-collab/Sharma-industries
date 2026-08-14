import type { Metadata } from "next";
import { DayBookClient } from "./DayBookClient";
import { getDayBookData } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Day Book | CA Workspace" };
}

export default async function Page() {
  const today = new Date().toISOString().split("T")[0];
  const res = await getDayBookData(today);
  return <DayBookClient initialEntries={res.data || []} />;
}
