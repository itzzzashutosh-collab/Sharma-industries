import type { Metadata } from "next";
import { AppSettingsClient } from "./AppSettingsClient";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "App Settings | CA Workspace — Sharma ERP" }; }
export default async function AppSettingsPage() { return <AppSettingsClient />; }
