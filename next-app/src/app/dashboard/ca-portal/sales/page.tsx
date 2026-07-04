import React from "react";
import SalesLedgerClient from "./SalesLedgerClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "CA Portal - Sales Ledger",
  description: "Auditor Mode - Sales Invoices Reverse Calculation Ledger",
};

export default function CASalesLedgerPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <SalesLedgerClient />
    </div>
  );
}
