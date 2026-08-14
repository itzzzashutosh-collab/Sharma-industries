import type { Metadata } from "next";
import { AuditFilesClient } from "./AuditFilesClient";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Audit Files | CA Workspace" }; }
export default async function Page() { return <AuditFilesClient />; }