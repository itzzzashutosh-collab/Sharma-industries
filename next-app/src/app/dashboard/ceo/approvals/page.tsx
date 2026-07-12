import React from "react";
import { ApprovalsCenterClient } from "./ApprovalsCenterClient";
import { getApprovalsData } from "./actions";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "Executive Approvals Center | Sharma ERP",
  description: "CEO authorization registry for user accounts, raw material POs, and factory expenditures.",
  };
}
export const dynamic = "force-dynamic";

export default async function CEOApprovalsPage() {
  const res = await getApprovalsData();

  const initialData = res.success && res.data ? {
    pendingUsers: res.data.pendingUsers,
    pendingExpenses: res.data.pendingExpenses,
    pendingPurchases: res.data.pendingPurchases,
    auditLogs: res.data.auditLogs
  } : {
    pendingUsers: [],
    pendingExpenses: [],
    pendingPurchases: [],
    auditLogs: []
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <ApprovalsCenterClient
        pendingUsers={initialData.pendingUsers}
        pendingExpenses={initialData.pendingExpenses}
        pendingPurchases={initialData.pendingPurchases}
        auditLogs={initialData.auditLogs}
      />
    </div>
  );
}
