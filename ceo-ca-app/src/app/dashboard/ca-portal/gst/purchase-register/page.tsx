import type { Metadata } from "next";
import { PurchaseRegisterClient } from "./PurchaseRegisterClient";
import { getPurchaseRegister } from "../../actions";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Purchase Register | CA Workspace" }; }
export default async function Page() {
  const res = await getPurchaseRegister();
  return <PurchaseRegisterClient initialData={(res as any).data || (res as any).entries || []} />;
}
