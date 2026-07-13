import type { Metadata } from "next";
import { getDealerGrowthPrograms } from "../actions";
import { SchemesClient } from "./SchemesClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Dealer Growth Programs | Sales Executive" };
}

export default async function Page() {
  const res = await getDealerGrowthPrograms();

  const programs = res.success ? res.programs || [] : [];

  return <SchemesClient initialPrograms={programs} />;
}
