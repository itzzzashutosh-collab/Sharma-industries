import type { Metadata } from "next";
import { ExpenseRegisterClient } from "./ExpenseRegisterClient";
import { getExpenseRegister } from "../../actions";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Expense Register | CA Workspace" }; }
export default async function Page() {
  const res = await getExpenseRegister();
  return <ExpenseRegisterClient initialData={(res as any).data || (res as any).entries || []} />;
}
