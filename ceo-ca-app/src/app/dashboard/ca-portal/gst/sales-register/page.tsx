import type { Metadata } from "next";
import { SalesRegisterClient } from "./SalesRegisterClient";
import { getSalesRegister } from "../../actions";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Sales Register | CA Workspace" }; }
export default async function Page() {
  const res = await getSalesRegister();
  return <SalesRegisterClient initialData={(res as any).data || (res as any).entries || []} />;
}
