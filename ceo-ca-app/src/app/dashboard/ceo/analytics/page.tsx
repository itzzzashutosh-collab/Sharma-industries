import { BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Business Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comprehensive data analytics and trend analysis for Sharma Industries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Revenue Trend",     icon: "📈", desc: "6-month revenue and growth analysis." },
          { title: "Dealer Analytics",  icon: "🤝", desc: "Dealer-wise performance, region map." },
          { title: "Product Analytics", icon: "🎨", desc: "Top products, margin trend, volume." },
          { title: "Factory Analytics", icon: "🏭", desc: "Batch efficiency, output vs. target." },
          { title: "Customer Insights", icon: "👥", desc: "Painter & dealer activation trends." },
          { title: "Financial KPIs",    icon: "💹", desc: "P&L, working capital, receivables." },
        ].map((card, i) => (
          <div key={i} className="group p-5 rounded-2xl bg-card border border-border hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">{card.icon}</div>
            <h3 className="text-sm font-bold text-foreground mb-1">{card.title}</h3>
            <p className="text-xs text-muted-foreground">{card.desc}</p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <span>Coming Soon</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 rounded-md border border-primary/20">Q3 2025</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
