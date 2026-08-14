import type { Metadata } from "next";
import { BankStatementsClient } from "./BankStatementsClient";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Bank Statements | CA Workspace" }; }
export default async function Page() { return <BankStatementsClient />; }
