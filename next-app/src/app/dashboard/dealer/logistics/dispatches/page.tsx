import type { Metadata } from "next";
import { DispatchesReturnsClient } from "./DispatchesReturnsClient";
import { getDealerDispatches } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Dispatches & Manifests | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerDispatches();
  return <DispatchesReturnsClient initialData={(res.list || []) as any[]} />;
}
