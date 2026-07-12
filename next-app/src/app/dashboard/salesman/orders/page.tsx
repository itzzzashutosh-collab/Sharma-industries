import React from "react";
import SalesmanOrdersClient from "./SalesmanOrdersClient";

export const dynamic = "force-dynamic";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "Salesman Portal - My Orders",
  description: "View order pipeline and submit new stock orders.",
  };
}

export default function SalesmanOrdersPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <SalesmanOrdersClient />
    </div>
  );
}
