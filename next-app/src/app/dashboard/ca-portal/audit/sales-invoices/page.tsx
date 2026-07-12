import type { Metadata } from "next";
import { SalesInvoicesClient } from "./SalesInvoicesClient";
import { getAuditSalesInvoices } from "../../actions";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return { title: "Sales Invoices | CA Workspace — Sharma ERP" }; }
export default async function SalesInvoicesPage() {
  const res = await getAuditSalesInvoices();
  return <SalesInvoicesClient initialData={res.data || []} />;
}
