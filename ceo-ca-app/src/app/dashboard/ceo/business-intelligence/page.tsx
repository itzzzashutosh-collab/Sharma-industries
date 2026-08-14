"use client";

import { ExecutivePageTemplate } from "@/components/executive/ExecutivePageTemplate";

const KPIS = [
  { label: "Overall Margin", value: "31.2%", trend: "+1.4%", trendType: "up" as const },
  { label: "Market Share", value: "14.6%", trend: "+0.8%", trendType: "up" as const },
  { label: "Operating Cash Flow", value: "₹32.4 L", trend: "+5.2%", trendType: "up" as const },
  { label: "Customer Lifetime Value", value: "₹4.8 L", trend: "+2.1%", trendType: "up" as const },
];

const INSIGHTS = [
  { text: "Market demand in North Region has grown by 12% in paints sector.", type: "positive" as const },
  { text: "Secret formulation pricing is maintaining stable 30% margin index.", type: "positive" as const },
  { text: "Outstanding payment receivables from Rajasthan region require priority audit.", type: "warning" as const },
];

const RECOMMENDATIONS = [
  "Leverage regional demand trend to launch target marketing in Kota.",
  "Run pricing check on competitors' new premium gloss line.",
  "Optimize working capital distribution to support Q3 factory expansion.",
];

const ACTIVITIES = [
  { time: "10:30 AM", category: "Expansion", title: "Jaipur Node Opened", desc: "Regional dealer network successfully integrated." },
  { time: "Yesterday", category: "Audit", title: "Q2 Financial Audit Signed", desc: "GST declarations matches sales tax records." },
];

export default function BusinessIntelligencePage() {
  return (
    <ExecutivePageTemplate
      title="Business Intelligence"
      subtitle="Strategic analytics, margins, and market intelligence overview"
      summaryText="This Business Intelligence workspace serves as the CEO's primary strategic dashboard, aggregating critical indices across profit margins, expansion opportunities, and macro performance indicators."
      kpis={KPIS}
      healthScore={92}
      healthStatus="Excellent"
      recommendations={RECOMMENDATIONS}
      activities={ACTIVITIES}
      detailedReportsTitle="Executive Analytics Report"
      detailedReportsContent={
        <div className="py-4 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
          Q2 Business Performance Statement generates dynamically at the end of each work week.
        </div>
      }
    />
  );
}
