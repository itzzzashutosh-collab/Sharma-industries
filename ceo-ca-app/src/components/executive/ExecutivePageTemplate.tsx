"use client";

import { motion } from "framer-motion";
import { Shield, Activity, ListFilter, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface KPI {
  label: string;
  value: string | number;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  color?: string;
}



interface ActivityItem {
  time: string;
  category: string;
  title: string;
  desc: string;
}

interface ExecutivePageTemplateProps {
  title: string;
  subtitle: string;
  summaryText: string;
  kpis: KPI[];
  analyticsContent?: React.ReactNode;
  healthScore?: number;
  healthStatus?: "Excellent" | "Good" | "Average" | "Needs Attention" | "Critical";
  approvalsContent?: React.ReactNode;
  recommendations: string[];
  activities: ActivityItem[];
  detailedReportsTitle?: string;
  detailedReportsContent?: React.ReactNode;
}

const statusColorMap = {
  Excellent: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5",
  Good: "text-blue-500 border-blue-500/20 bg-blue-500/5",
  Average: "text-amber-500 border-amber-500/20 bg-amber-500/5",
  "Needs Attention": "text-orange-500 border-orange-500/20 bg-orange-500/5",
  Critical: "text-rose-500 border-rose-500/20 bg-rose-500/5",
};

export function ExecutivePageTemplate({
  title,
  subtitle,
  summaryText,
  kpis,
  analyticsContent,
  healthScore = 85,
  healthStatus = "Good",
  approvalsContent,
  recommendations,
  activities,
  detailedReportsTitle = "Detailed Reports",
  detailedReportsContent,
}: ExecutivePageTemplateProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-16 max-w-7xl mx-auto"
    >
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t(title)}</h1>
          <p className="text-xs text-muted-foreground mt-1">{t(subtitle)}</p>
        </div>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted/30 px-2 font-mono text-[10px] text-muted-foreground select-none">
          {t("Press")} <span className="text-xs font-bold text-foreground">Ctrl + K</span> {t("to search")}
        </kbd>
      </div>

      {/* 2. Executive Summary */}
      <div className="bg-muted/35 border border-border/50 rounded-2xl p-5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{t("Executive Summary")}</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">{t(summaryText)}</p>
      </div>

      {/* 3. KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-card border border-border/60 rounded-xl p-5 hover:shadow-md transition-all duration-200">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{t(kpi.label)}</p>
            <p className="text-xl font-black text-foreground">{kpi.value}</p>
            {kpi.trend && (
              <p className={`text-xs font-medium mt-1 ${
                kpi.trendType === "up" ? "text-emerald-500" :
                kpi.trendType === "down" ? "text-rose-500" :
                "text-muted-foreground"
              }`}>
                {kpi.trend} {t("vs last month")}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* 4. Analytics */}
      {analyticsContent && (
        <div className="bg-card border border-border/60 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">{t("Analytics Overview")}</h2>
          {analyticsContent}
        </div>
      )}

      {/* 6. Performance & Health Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col justify-between md:col-span-1">
          <div>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">{t("Business Health Score")}</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-foreground">{healthScore}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className={`mt-4 px-3 py-1.5 rounded-xl border text-center font-bold text-xs capitalize ${statusColorMap[healthStatus]}`}>
            {t(healthStatus)}
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-5 md:col-span-2 space-y-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">{t("Performance Indicators")}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">System Speed Index</p>
              <p className="text-base font-bold text-foreground mt-0.5">0.8s (Excellent)</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Reliability Index</p>
              <p className="text-base font-bold text-foreground mt-0.5">99.98% (Perfect)</p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Approvals */}
      {approvalsContent && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("Approvals Center")}</h2>
          {approvalsContent}
        </div>
      )}

      {/* 8. Recommendations */}
      <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("Recommended Actions")}</h2>
        <div className="space-y-2">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-background border border-border/40 hover:border-primary/20 transition-all duration-150">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <p className="text-sm text-foreground/80">{t(rec)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Recent Activities (Executive Timeline) */}
      <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("Recent Activities")}</h2>
        <div className="relative border-l border-border pl-4 ml-2 space-y-5">
          {activities.map((act, idx) => (
            <div key={idx} className="relative">
              <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border border-card bg-primary" />
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{t(act.category)}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{act.time}</span>
              </div>
              <p className="text-xs font-bold text-foreground mt-0.5">{t(act.title)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t(act.desc)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 10. Detailed Reports */}
      {detailedReportsContent && (
        <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-widest">{t(detailedReportsTitle)}</h2>
            <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
              <ListFilter size={11} /> {t("Filter Reports")}
            </button>
          </div>
          {detailedReportsContent}
        </div>
      )}

    </motion.div>
  );
}
