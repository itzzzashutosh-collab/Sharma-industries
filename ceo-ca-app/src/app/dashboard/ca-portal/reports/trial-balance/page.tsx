import type { Metadata } from "next";
import { TrialBalanceClient } from "./TrialBalanceClient";
import { getTrialBalance } from "../../actions";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Trial Balance | CA Workspace — Sharma ERP" }; }
export default async function TrialBalancePage() {
  const res = await getTrialBalance();
  return <TrialBalanceClient debits={(res as any).debits || []} credits={(res as any).credits || []} totalDebits={(res as any).totalDebits || 0} totalCredits={(res as any).totalCredits || 0} difference={(res as any).difference || 0} />;
}
