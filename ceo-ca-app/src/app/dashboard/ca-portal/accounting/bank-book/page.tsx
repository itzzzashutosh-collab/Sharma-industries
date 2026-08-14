import type { Metadata } from "next";
import { BankBookClient } from "./BankBookClient";
import { getBankBookData } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Bank Book | CA Workspace" };
}

export default async function Page() {
  const res = await getBankBookData();
  return (
    <BankBookClient
      bankAccounts={res.bankAccounts || []}
      receipts={res.receipts || []}
      payments={res.payments || []}
    />
  );
}
