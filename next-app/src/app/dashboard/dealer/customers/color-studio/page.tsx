import type { Metadata } from "next";
import { ColorStudioClient } from "./ColorStudioClient";
import { getDealerCustomers, getDealerProductsList } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "AI Paint Studio | Dealer Workspace" };
}

export default async function Page() {
  const [custsRes, prodsRes] = await Promise.all([
    getDealerCustomers(),
    getDealerProductsList()
  ]);

  return (
    <ColorStudioClient
      customers={(custsRes.list || []) as any[]}
      products={(prodsRes.list || []) as any[]}
    />
  );
}
