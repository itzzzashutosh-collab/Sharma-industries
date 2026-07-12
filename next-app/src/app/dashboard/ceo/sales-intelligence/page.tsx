"use client";

import { ExecutivePageTemplate } from "@/components/executive/ExecutivePageTemplate";

const KPIS = [
  { label: "Active Orders", value: "486", trend: "+9%", trendType: "up" as const },
  { label: "Quotation Conversion", value: "68.4%", trend: "+2.1%", trendType: "up" as const },
  { label: "Avg Order Value", value: "₹45,200", trend: "+1.8%", trendType: "up" as const },
  { label: "Collection Rate", value: "91.2%", trend: "+0.4%", trendType: "up" as const },
];

const INSIGHTS = [
  { text: "Sales volume in Jaipur and Kota region increased due to seasonal house construction.", type: "positive" as const },
  { text: "Quotation conversion rate reached a record 68% this month.", type: "positive" as const },
  { text: "Three dealers are tracking 20% below their quarterly sales goals.", type: "warning" as const },
];

const RECOMMENDATIONS = [
  "Incentivize high-performing sales executives in Jaipur region.",
  "Launch promotional dealer packages in Kota to capture local seasonal demand.",
  "Automate SMS payment reminders to improve the dealer outstanding collection rate.",
];

const ACTIVITIES = [
  { time: "11:45 AM", category: "Order", title: "New Bulk Order registered", desc: "Karan Paints ordered 250 buckets of Rustic Royale." },
  { time: "Yesterday", category: "Conversion", title: "Quotation converted to Invoice", desc: "Converted Quotation #948 for ₹1,80,000." },
];

export default function SalesIntelligencePage() {
  return (
    <ExecutivePageTemplate
      title="Sales Intelligence"
      subtitle="Dealer orders, conversion funnels, regional ranks, and live sales"
      summaryText="High-level dashboard monitoring the sales pipelines, regional sales distribution, dealer performance indices, and quotation-to-invoice conversion stats."
      kpis={KPIS}
      healthScore={90}
      healthStatus="Excellent"
      recommendations={RECOMMENDATIONS}
      activities={ACTIVITIES}
      detailedReportsTitle="Regional Performance Indexes"
      detailedReportsContent={
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
            <div>Region</div>
            <div className="text-right">Active Dealers</div>
            <div className="text-right">Sales YTD</div>
          </div>
          {[
            { region: "Jaipur Division", dealers: "45", sales: "₹89 L" },
            { region: "Kota & Hadoti", dealers: "32", sales: "₹54 L" },
            { region: "Jodhpur Division", dealers: "28", sales: "₹42 L" },
          ].map((item, idx) => (
            <div key={idx} className="grid grid-cols-3 text-sm text-foreground">
              <div>{item.region}</div>
              <div className="text-right text-muted-foreground font-mono">{item.dealers}</div>
              <div className="text-right font-bold font-mono text-primary">{item.sales}</div>
            </div>
          ))}
        </div>
      }
    />
  );
}
