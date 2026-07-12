"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { AnimatedCounter } from "./AnimatedCounter";
import { type LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  icon: LucideIcon;
  color: "primary" | "emerald" | "rose" | "amber" | "blue" | "violet" | "cyan";
  delay?: number;
}

const colorMap = {
  primary:  { text: "text-primary",  bg: "bg-primary/8",   border: "border-primary/15",   icon: "text-primary",   glow: "hover:shadow-primary/10" },
  emerald:  { text: "text-emerald-500", bg: "bg-emerald-500/8", border: "border-emerald-500/15", icon: "text-emerald-500", glow: "hover:shadow-emerald-500/10" },
  rose:     { text: "text-rose-500",  bg: "bg-rose-500/8",  border: "border-rose-500/15",  icon: "text-rose-500",  glow: "hover:shadow-rose-500/10" },
  amber:    { text: "text-amber-500", bg: "bg-amber-500/8", border: "border-amber-500/15", icon: "text-amber-500", glow: "hover:shadow-amber-500/10" },
  blue:     { text: "text-blue-500",  bg: "bg-blue-500/8",  border: "border-blue-500/15",  icon: "text-blue-500",  glow: "hover:shadow-blue-500/10" },
  violet:   { text: "text-violet-500",bg: "bg-violet-500/8",border: "border-violet-500/15",icon: "text-violet-500",glow: "hover:shadow-violet-500/10" },
  cyan:     { text: "text-cyan-500",  bg: "bg-cyan-500/8",  border: "border-cyan-500/15",  icon: "text-cyan-500",  glow: "hover:shadow-cyan-500/10" },
};

export function KPICard({
  label, value, prefix = "", suffix = "", decimals = 0,
  trend = "neutral", trendLabel, icon: Icon, color, delay = 0,
}: KPICardProps) {
  const { t } = useLanguage();
  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={`group relative bg-card border border-border rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-lg ${c.glow} transition-all duration-300 overflow-hidden cursor-default`}
    >
      {/* Subtle bg glow */}
      <div className={`absolute inset-0 ${c.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
      
      <div className="relative z-10 flex flex-col gap-3">
        {/* Icon + Label */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-none">
            {t(label)}
          </p>
          <div className={`w-8 h-8 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
            <Icon size={15} className={c.icon} />
          </div>
        </div>

        {/* Value */}
        <div className={`text-2xl font-black ${c.text} tabular-nums`}>
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        </div>

        {/* Trend */}
        {trendLabel && (
          <div className="flex items-center gap-1">
            {trend === "up" && <TrendingUp size={12} className="text-emerald-500" />}
            {trend === "down" && <TrendingDown size={12} className="text-rose-500" />}
            {trend === "neutral" && <Minus size={12} className="text-muted-foreground" />}
            <span className={`text-xs font-medium ${
              trend === "up" ? "text-emerald-500" :
              trend === "down" ? "text-rose-500" :
              "text-muted-foreground"
            }`}>
              {trendLabel} {t("vs last month")}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
