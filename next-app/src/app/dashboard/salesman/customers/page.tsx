import React from "react";
import SalesmanCustomersClient from "./SalesmanCustomersClient";

export const dynamic = "force-dynamic";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "Salesman Portal - Customers Directory",
  description: "View mapped dealers and upload regional KYC onboarding materials.",
  };
}

export default function SalesmanCustomersPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <SalesmanCustomersClient />
    </div>
  );
}
