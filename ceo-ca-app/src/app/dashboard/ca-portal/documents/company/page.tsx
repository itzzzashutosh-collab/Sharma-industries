import type { Metadata } from "next";
import { CompanyDocsClient } from "./CompanyDocsClient";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Company Documents | CA Workspace" }; }
export default async function Page() { return <CompanyDocsClient />; }