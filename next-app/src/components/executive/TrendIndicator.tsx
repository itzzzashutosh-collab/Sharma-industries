"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface TrendIndicatorProps {
  trend: "up" | "down" | "neutral";
  label?: string;
  className?: string;
}

export function TrendIndicator({ trend, label, className = "" }: TrendIndicatorProps) {
  const { t } = useLanguage();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {trend === "up" && <TrendingUp size={12} className="text-emerald-500" />}
      {trend === "down" && <TrendingDown size={12} className="text-rose-500" />}
      {trend === "neutral" && <Minus size={12} className="text-muted-foreground" />}
      {label && (
        <span className={`text-xs font-semibold ${
          trend === "up" ? "text-emerald-500" :
          trend === "down" ? "text-rose-500" :
          "text-muted-foreground"
        }`}>
          {t(label)}
        </span>
      )}
    </div>
  );
}
