"use client";

import { ExecutivePageTemplate } from "@/components/executive/ExecutivePageTemplate";

const KPIS = [
  { label: "Active Painters", value: "318", trend: "+12 new", trendType: "up" as const },
  { label: "Coupon Scans", value: "1,245", trend: "+14.2%", trendType: "up" as const },
  { label: "Rewards Distributed", value: "₹2,45,000", trend: "+8.5%", trendType: "up" as const },
  { label: "Painter Growth Rate", value: "12%", trend: "Stable", trendType: "neutral" as const },
];

const INSIGHTS = [
  { text: "Painter engagement reached an all-time high of 84% after current QR coupon system deployment.", type: "positive" as const },
  { text: "Jaipur region represents 55% of all scanned loyalty coupons.", type: "positive" as const },
  { text: "15 registered painters have been inactive in scan activities for past 45 days.", type: "warning" as const },
];

const RECOMMENDATIONS = [
  "Launch target marketing campaign via SMS/WhatsApp for inactive painter registry list.",
  "Run special weekend multiplier points events to boost QR scans for Wall Putty products.",
  "Delegate painter reward validation audits to the Co-Founder dashboard.",
];

const ACTIVITIES = [
  { time: "03:15 PM", category: "Scan", title: "New Coupon Scanned", desc: "Painter Rajesh Kumar scanned coupon code QR-948 for ₹150." },
  { time: "Yesterday", category: "Rewards", title: "Reward Payout approved", desc: "Loyalty cashback transfer approved to Amit Sharma." },
];

export default function PainterEcosystemPage() {
  return (
    <ExecutivePageTemplate
      title="Painter Ecosystem"
      subtitle="Painter network statistics, QR scan tracking, and loyalty rewards"
      summaryText="This workspace registers and logs painter ecosystem activities. Review active painter growth, scanned product loyalty coupons, and cashbacks distributed."
      kpis={KPIS}
      healthScore={92}
      healthStatus="Excellent"
      recommendations={RECOMMENDATIONS}
      activities={ACTIVITIES}
      detailedReportsTitle="Top Scanners & Loyalty Ranking"
      detailedReportsContent={
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
            <div>Painter Name</div>
            <div>Scans YTD</div>
            <div className="text-right">Cashback Earned</div>
            <div className="text-right">Loyalty Rank</div>
          </div>
          {[
            { name: "Amit Sharma", scans: "340", cash: "₹24,500", rank: "Platinum" },
            { name: "Rajesh Kumar", scans: "210", cash: "₹15,400", rank: "Gold" },
            { name: "Vikram Singh", scans: "120", cash: "₹8,900", rank: "Silver" },
          ].map((item, idx) => (
            <div key={idx} className="grid grid-cols-4 text-sm text-foreground">
              <div className="font-semibold">{item.name}</div>
              <div className="text-muted-foreground font-mono">{item.scans}</div>
              <div className="text-right font-mono font-bold text-emerald-500">{item.cash}</div>
              <div className="text-right font-bold text-primary">{item.rank}</div>
            </div>
          ))}
        </div>
      }
    />
  );
}
