import type { Metadata } from "next";
import { TaxReportsClient } from "./TaxReportsClient";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Tax Reports | CA Workspace" }; }
export default async function Page() { return <TaxReportsClient />; }
