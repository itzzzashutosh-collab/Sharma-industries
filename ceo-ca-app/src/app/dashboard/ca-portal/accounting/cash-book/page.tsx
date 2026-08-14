import { getCashBook } from "../../actions";
import type { Metadata } from "next";
import { CashBookClient } from "./CashBookClient";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return { title: "Cash Book | CA Workspace — Sharma ERP" };
}

export default async function CashBookPage() {
  const today = new Date().toISOString().split("T")[0];
  const res = await getCashBook(today);
  return (
    <CashBookClient
      initialReceipts={(res as any).receipts || []}
      initialPayments={(res as any).payments || []}
      totalReceipts={(res as any).totalReceipts || 0}
      totalPayments={(res as any).totalPayments || 0}
      closingBalance={(res as any).closingBalance || 0}
    />
  );
}
