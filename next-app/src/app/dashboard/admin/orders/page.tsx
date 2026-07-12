import React from "react";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "CEO Dashboard - Master Order Management",
  description: "Master order book processing, visual logistics dispatching, and invoicing triggers.",
  };
}

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <OrdersClient />
    </div>
  );
}
