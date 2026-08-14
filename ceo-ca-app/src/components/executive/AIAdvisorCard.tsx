"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";

const AI_INSIGHTS = [
  { type: "positive", text: "Revenue increased 14% compared to last month." },
  { type: "warning",  text: "Profit margin decreased 2%. Review raw material costs." },
  { type: "positive", text: "Factory efficiency improved by 8% this week." },
  { type: "positive", text: "Three dealers crossed monthly targets." },
  { type: "warning",  text: "Rustic Royale inventory running low — 145 units remaining." },
  { type: "warning",  text: "Outstanding collections pending: ₹18,45,000." },
];

const RECOMMENDED_ACTIONS = [
  "Increase Rustic Royale production to meet demand.",
  "Collect overdue payments from 4 dealers.",
  "Approve 3 pending dealer registrations.",
  "Restock Acrylic Emulsion (critical level).",
];

export function AIAdvisorCard() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-violet-500/5 p-6 shadow-sm"
    >
      {/* Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/8 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Sparkles size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base">{t("AI Business Advisor")}</h3>
            <p className="text-xs text-muted-foreground">{t("Today's Summary")} · {mounted ? new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</p>
          </div>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Insights */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t("AI Insights")}</p>
            <div className="space-y-2">
              {AI_INSIGHTS.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="flex items-start gap-2.5"
                >
                  {insight.type === "positive"
                    ? <TrendingUp size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                    : <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                  }
                  <span className="text-sm text-foreground/80 leading-snug">{insight.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recommended Actions */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t("Recommended Actions")}</p>
            <div className="space-y-2">
              {RECOMMENDED_ACTIONS.map((action, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.07 }}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-background/60 border border-border/50 hover:border-primary/20 transition-colors"
                >
                  <CheckCircle2 size={13} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground/80 leading-snug">{action}</span>
                </motion.div>
              ))}
            </div>

            <Link
              href="/dashboard/ceo/ai-advisor"
              className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary hover:gap-2.5 transition-all duration-200"
            >
              {t("Open AI Advisor")} <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
