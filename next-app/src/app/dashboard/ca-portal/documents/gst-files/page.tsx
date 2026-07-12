import type { Metadata } from "next";
import { GSTFilesClient } from "./GSTFilesClient";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "GST Files | CA Workspace" }; }
export default async function Page() { return <GSTFilesClient />; }