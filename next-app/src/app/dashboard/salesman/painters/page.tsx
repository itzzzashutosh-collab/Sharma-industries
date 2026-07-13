import type { Metadata } from "next";
import SalesmanPaintersClient from "./SalesmanPaintersClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Painters Directory | Sales Executive" };
}

export default async function Page() {
  return <SalesmanPaintersClient />;
}
