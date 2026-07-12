"use client";

import { ExecutivePageTemplate } from "@/components/executive/ExecutivePageTemplate";

const KPIS = [
  { label: "Factory Efficiency", value: "87.4%", trend: "+8.0%", trendType: "up" as const },
  { label: "Machine Utilization", value: "92.1%", trend: "+1.2%", trendType: "up" as const },
  { label: "Production Target", value: "4,500 Units", trend: "On Track", trendType: "neutral" as const },
  { label: "Quality Index", value: "99.8%", trend: "+0.1%", trendType: "up" as const },
];

const INSIGHTS = [
  { text: "Factory efficiency reached 87.4% due to updated recipe mixing schedule.", type: "positive" as const },
  { text: "Chemical mixer utilization reached capacity limit. Consider expanding mixer equipment.", type: "warning" as const },
  { text: "Quality index remains near perfect at 99.8% with zero batch failures registered.", type: "positive" as const },
];

const RECOMMENDATIONS = [
  "Approve budget allocate request for new heavy chemical mixer installation.",
  "Schedule preventative machine maintenance check for early next week.",
  "Restock critical raw chemical emulsions before current stock drops past low stock threshold.",
];

const ACTIVITIES = [
  { time: "08:00 AM", category: "Batch", title: "Batch COMPLETED", desc: "Batch #410 produced 240 buckets of Rustic Royale." },
  { time: "2 days ago", category: "Inventory", title: "Raw Material Delivery received", desc: "1,200kg of Titanium Dioxide checked into warehouse stock." },
];

export default function ManufacturingIntelligencePage() {
  return (
    <ExecutivePageTemplate
      title="Manufacturing Intelligence"
      subtitle="Factory yield stats, machine runtimes, formulation status, and assets"
      summaryText="High-level dashboard for factory productivity monitoring, batch yields audits, machine health checks, and raw chemical stock status."
      kpis={KPIS}
      healthScore={94}
      healthStatus="Excellent"
      recommendations={RECOMMENDATIONS}
      activities={ACTIVITIES}
      detailedReportsTitle="Asset & Machine Performance Records"
      detailedReportsContent={
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
            <div>Asset Unit</div>
            <div className="text-right">Daily Output</div>
            <div className="text-right">Runtime status</div>
          </div>
          {[
            { name: "Heavy Mixer Unit A", output: "1,200 L", runtime: "Active" },
            { name: "Packaging Line 1", output: "340 Buckets", runtime: "Active" },
            { name: "Reserve Emulsion Tank B", output: "—", runtime: "Idle (Reserve)" },
          ].map((item, idx) => (
            <div key={idx} className="grid grid-cols-3 text-sm text-foreground">
              <div>{item.name}</div>
              <div className="text-right text-muted-foreground font-mono">{item.output}</div>
              <div className="text-right font-bold text-emerald-500 font-mono">{item.runtime}</div>
            </div>
          ))}
        </div>
      }
    />
  );
}
