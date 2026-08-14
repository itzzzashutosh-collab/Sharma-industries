"use client";

import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon: Icon = Inbox,
}: EmptyStateProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border/80 text-center bg-card/40 my-4"
    >
      <div className="w-12 h-12 rounded-2xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground mb-4">
        <Icon size={20} />
      </div>
      <h3 className="text-sm font-bold text-foreground mb-1">{t(title)}</h3>
      <p className="text-xs text-muted-foreground max-w-sm leading-relaxed mb-4">{t(description)}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-hover shadow-sm hover:shadow-md transition-all"
        >
          {t(actionText)}
        </button>
      )}
    </motion.div>
  );
}
