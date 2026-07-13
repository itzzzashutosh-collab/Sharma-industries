import type { Metadata } from "next";
import { ColorStudioClient } from "@/app/dashboard/dealer/customers/color-studio/ColorStudioClient";
import { getDealerCustomers, getDealerProductsList } from "@/app/dashboard/dealer/actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "House Color Studio | Painter Workspace" };
}

export default async function Page() {
  const [custRes, prodRes] = await Promise.all([
    getDealerCustomers(),
    getDealerProductsList()
  ]);


  const customers = custRes.success ? custRes.list : [];
  const products = prodRes.success ? prodRes.list : [];

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto px-4">
        <ColorStudioClient customers={customers} products={products} />
      </div>
    </div>
  );
}
