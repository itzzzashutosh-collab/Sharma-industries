import type { Metadata } from "next";
import { InvoicesClient } from "./InvoicesClient";
import { getDealerInvoices, getDealerCustomers, getDealerProductsList } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Invoices | Dealer Workspace" };
}

export default async function Page() {
  const [invsRes, custsRes, prodsRes] = await Promise.all([
    getDealerInvoices(),
    getDealerCustomers(),
    getDealerProductsList()
  ]);

  return (
    <InvoicesClient
      initialData={invsRes.list || []}
      customers={custsRes.list || []}
      products={(prodsRes.list || []) as any[]}
    />
  );
}
