import type { Metadata } from "next";
import { PaymentRegisterClient } from "./PaymentRegisterClient";
import { getExpenseRegister } from "../../actions";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Payment Register | CA Workspace" }; }
export default async function Page() {
  const res = await getExpenseRegister();
  return <PaymentRegisterClient initialData={(res as any).data || (res as any).entries || []} />;
}
