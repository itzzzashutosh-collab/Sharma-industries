import React from "react";
import AIDashboardClient from "./AIDashboardClient";
import { getAIChatMessages, getLatestAIInsights } from "./actions";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "AI Dashboard | Sharma ERP",
  description: "Unified AI Dashboard tracking chat sessions, domain telemetry, and executive recommended actions.",
  };
}
export const dynamic = "force-dynamic";

export default async function AIDashboardPage() {
  const msgRes = await getAIChatMessages();
  const insightRes = await getLatestAIInsights();

  const initialMessages = msgRes.success && msgRes.data ? msgRes.data.map((m: any) => ({
    role: m.role,
    content: m.content
  })) : [];

  const initialInsights = insightRes.success && insightRes.data ? insightRes.data : {};

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AIDashboardClient 
        initialMessages={initialMessages}
        initialInsights={initialInsights}
      />
    </div>
  );
}
