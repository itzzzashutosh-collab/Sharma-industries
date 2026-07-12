import React from "react";
import { CADashboardClient } from "./CADashboardClient";
import { getCaDashboardData } from "./actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "CA Workspace | Sharma ERP",
    description: "Chartered Accountant Dashboard — audit, reconcile, file taxes, generate financial statements.",
  };
}

export default async function CADashboardPage() {
  const res = await getCaDashboardData();
  const data = res.success && res.data ? res.data : {
    monthlyRevenue: 0,
    monthlyPurchases: 0,
    monthlyExpenses: 0,
    totalReceivables: 0,
    totalPayables: 0,
    pendingExpenses: 0,
    totalInvoices: 0,
    totalPurchases: 0,
    activities: [],
    nudges: [],
    recentUsers: [],
    financialYear: "FY 2024-25",
  };

  return <CADashboardClient data={data} />;
}
