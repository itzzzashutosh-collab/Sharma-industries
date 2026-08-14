import type { Metadata } from "next";
import { FinancialReportsClient } from "./FinancialReportsClient";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Financial Reports | CA Workspace" }; }
export default async function Page() { return <FinancialReportsClient />; }
