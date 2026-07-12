import React from "react";
import { SettingsDashboardClient } from "./SettingsDashboardClient";
import { getCompanySettings, getAllUsers, getAiConfigs, getAiSpendSummary } from "./actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "CEO System Settings | Sharma ERP",
    description: "Configure business identities, GST tax parameters, user profiles roles, permission matrices, and AI spend limits.",
  };
}

export default async function CEOSettingsPage() {
  const settingsRes = await getCompanySettings();
  const usersRes = await getAllUsers();
  const configsRes = await getAiConfigs();
  const spendRes = await getAiSpendSummary();

  const initialData = {
    settings: settingsRes.success && settingsRes.data ? settingsRes.data : {
      companyName: "Sharma Industries",
      ownerName: "",
      gstin: "",
      phone: "",
      address: "Bundi, Rajasthan, India",
      stateCode: "08",
      pincode: "",
      bankName: "",
      accountNumber: "",
      ifsc: "",
      upiId: "",
      termsAndConditions: "",
      notes: "",
      companyStampUrl: null,
      signatureUrl: null
    },
    users: usersRes.success && usersRes.data ? usersRes.data : [],
    aiConfigs: configsRes.success && configsRes.data ? configsRes.data : [],
    spendLogs: (spendRes.success ? spendRes.logs : []) as any[],
    spendAggregate: (spendRes.success ? spendRes.aggregate : []) as any[],
    grandTotalSpend: spendRes.success ? spendRes.grandTotal : 0
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <SettingsDashboardClient
        initialSettings={initialData.settings}
        initialUsers={initialData.users}
        initialAiConfigs={initialData.aiConfigs}
        initialSpendLogs={initialData.spendLogs}
        initialSpendAggregate={initialData.spendAggregate}
        initialSpendGrandTotal={initialData.grandTotalSpend}
      />
    </div>
  );
}
