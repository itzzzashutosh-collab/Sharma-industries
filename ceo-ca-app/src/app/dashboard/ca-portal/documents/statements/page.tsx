import type { Metadata } from "next";
import { StatementsClient } from "./StatementsClient";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Statements | CA Workspace" }; }
export default async function Page() { return <StatementsClient />; }