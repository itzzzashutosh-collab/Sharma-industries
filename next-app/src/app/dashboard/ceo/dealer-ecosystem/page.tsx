"use client";

import { ExecutivePageTemplate } from "@/components/executive/ExecutivePageTemplate";

const KPIS = [
  { label: "Total Dealers", value: "142", trend: "+3 new", trendType: "up" as const },
  { label: "Active Network Share", value: "94.2%", trend: "+1.2%", trendType: "up" as const },
  { label: "Total Dealer Revenue YTD", value: "₹1.24 Cr", trend: "+12%", trendType: "up" as const },
  { label: "Outstanding Dealer Amount", value: "₹21 L", trend: "+5%", trendType: "down" as const },
];

const INSIGHTS = [
  { text: "Jaipur region dealers are driving 45% of total company sales volume.", type: "positive" as const },
  { text: "Four dealers in Kota have pending outstanding invoices past 30 days.", type: "warning" as const },
  { text: "Dealer satisfaction score reached 92% after the Q1 loyalty bonus payout.", type: "positive" as const },
];

const RECOMMENDATIONS = [
  "Approve Q1 loyalty cash back and reward payouts for top dealers.",
  "Schedule regional sales manager visit to Kota division dealers.",
  "Onboard 3 pending dealer registrations currently waiting for access approval.",
];

const ACTIVITIES = [
  { time: "02:30 PM", category: "Network", title: "New Dealer Onboarded", desc: "Saraswati Paints (Jodhpur) registered and approved." },
  { time: "Yesterday", category: "Payment", title: "Partial payment received", desc: "Jaipur Distributors settled ₹3,00,000 against INV-2025-003." },
];

export default function DealerEcosystemPage() {
  return (
    <ExecutivePageTemplate
      title="Dealer Ecosystem"
      subtitle="Dealer performance, ranking, collections, and rewards"
      summaryText="This workspace monitors the dealer retail network. Track active dealer sales performance, regional rankings, rewards payout milestones, and outstanding payments."
      kpis={KPIS}
      healthScore={86}
      healthStatus="Good"
      recommendations={RECOMMENDATIONS}
      activities={ACTIVITIES}
      detailedReportsTitle="Top Performing Dealers Ranking"
      detailedReportsContent={
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
            <div>Dealer Name</div>
            <div>Location</div>
            <div className="text-right">Revenue YTD</div>
            <div className="text-right">Outstanding</div>
          </div>
          {[
            { name: "Ravi Traders", loc: "Jaipur", rev: "₹45 L", debt: "₹0" },
            { name: "Apex Distributors", loc: "Jodhpur", rev: "₹38 L", debt: "₹2.4 L" },
            { name: "Karan Paints", loc: "Kota", rev: "₹22 L", debt: "₹1.8 L" },
          ].map((item, idx) => (
            <div key={idx} className="grid grid-cols-4 text-sm text-foreground">
              <div className="font-semibold">{item.name}</div>
              <div className="text-muted-foreground">{item.loc}</div>
              <div className="text-right font-mono">{item.rev}</div>
              <div className="text-right font-mono text-rose-500 font-bold">{item.debt}</div>
            </div>
          ))}
        </div>
      }
    />
  );
}
