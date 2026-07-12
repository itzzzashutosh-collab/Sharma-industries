import type { Metadata } from "next";
import { CustomersClient } from "./CustomersClient";
import { getDealerCustomers } from "../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Customers Registry | Dealer Workspace" };
}

export default async function Page() {
  const res = await getDealerCustomers();
  return <CustomersClient initialData={res.list || []} />;
}
