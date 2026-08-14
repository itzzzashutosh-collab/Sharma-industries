import React from "react";
import ReportsCenterClient from "./ReportsCenterClient";
import { generateReportData } from "./actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Executive Reports Center | Sharma ERP",
    description: "Generate and download business operations log sheets, sales reconciliations, inventory audits, and financials.",
  };
}

export default async function ReportsPage() {
  // Generate initial Daily Report data server-side
  const res = await generateReportData("daily");

  const initialReport = res.success && res.report ? res.report : {
    title: "Daily Operations Log",
    headers: ["Metric / Activity Name", "Category", "Date / Reference", "Status", "Amount / Value"],
    rows: []
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <ReportsCenterClient
        initialReport={initialReport}
      />
    </div>
  );
}
