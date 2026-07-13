import type { Metadata } from "next";
import { getSalesmanTargets } from "../actions";
import { SalesIntelligenceClient } from "./SalesIntelligenceClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Sales Intelligence | CEO" };
}

export default async function Page() {
  const res = await getSalesmanTargets();

  const salesmanTargets = res.success ? res.targets || [] : [];

  return <SalesIntelligenceClient initialTargets={salesmanTargets} />;
}
