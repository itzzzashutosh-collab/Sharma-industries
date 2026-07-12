import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

const INSIGHTS = [
  { type: "positive", text: "Revenue is up 14% compared to last month. Rustic Royale and Wall Putty are the key drivers." },
  { type: "warning",  text: "Net profit margin dropped from 30% to 28%. Review raw material procurement costs." },
  { type: "positive", text: "Dealer network grew by 3 new active dealers this month." },
  { type: "warning",  text: "Acrylic Emulsion inventory is critically low at 45L against 100L threshold." },
  { type: "positive", text: "Factory efficiency improved 8% after the new mixing schedule." },
  { type: "warning",  text: "₹18,45,000 in collections overdue from 4 dealers. Immediate follow-up needed." },
  { type: "positive", text: "Painter network activation is up 12 painters this month." },
  { type: "warning",  text: "Outstanding payables to suppliers: ₹9,80,000 — review before month end." },
];

const ACTIONS = [
  "Increase Rustic Royale production batch by 20% to meet growing demand.",
  "Schedule collection call with overdue dealers — priority: Ravi Traders (₹2.4L).",
  "Raise Acrylic Emulsion purchase order immediately.",
  "Review and approve 3 pending dealer registrations.",
  "Negotiate bulk discount on Titanium Dioxide with primary supplier.",
  "Launch WhatsApp campaign to reactivate 15 inactive painters.",
];

export default function AIAdvisorPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
          <Sparkles size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">AI Business Advisor</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Intelligent insights for Sharma Industries · <span suppressHydrationWarning>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</span>
          </p>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Business Insights</h2>
        <div className="space-y-3">
          {INSIGHTS.map((item, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${
              item.type === "positive"
                ? "bg-emerald-500/5 border-emerald-500/15"
                : "bg-amber-500/5 border-amber-500/15"
            }`}>
              {item.type === "positive"
                ? <TrendingUp size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                : <AlertCircle size={15} className="text-amber-500 mt-0.5 shrink-0" />
              }
              <p className="text-sm text-foreground/85 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Recommended Actions</h2>
        <div className="space-y-3">
          {ACTIONS.map((action, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border hover:border-primary/20 transition-colors">
              <CheckCircle2 size={15} className="text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground/85 leading-relaxed">{action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
