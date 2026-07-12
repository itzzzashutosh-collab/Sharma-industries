"use client";

import { useLanguage } from "@/components/LanguageProvider";

type StatusVariant = "active" | "pending" | "overdue" | "low-stock" | "applied" | "approved" | "neutral";

interface StatusBadgeProps {
  variant: StatusVariant;
  label?: string;
}

const variantMap: Record<StatusVariant, string> = {
  active:    "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  pending:   "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
  overdue:   "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20",
  "low-stock":"text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20",
  applied:   "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
  approved:  "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  neutral:   "text-muted-foreground bg-muted border-border",
};

const defaultLabels: Record<StatusVariant, string> = {
  active:    "Active",
  pending:   "Pending",
  overdue:   "Overdue",
  "low-stock":"Low Stock",
  applied:   "Applied",
  approved:  "Approved",
  neutral:   "—",
};

export function StatusBadge({ variant, label }: StatusBadgeProps) {
  const { t } = useLanguage();
  const text = label ?? defaultLabels[variant];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${variantMap[variant]}`}>
      {t(text)}
    </span>
  );
}
