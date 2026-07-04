import React from "react";
import SalesTeamAdminClient from "./SalesTeamAdminClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "CEO Mode - Salesmen Management & Distribution",
  description: "Strict Administrative dashboard for salesman KYC, approvals, and route distributions.",
};

export default function SalesTeamAdminPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <SalesTeamAdminClient />
    </div>
  );
}
