"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/LanguageProvider";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  delay?: number;
}

export function SectionHeader({ title, subtitle, action, delay = 0 }: SectionHeaderProps) {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="flex items-center justify-between gap-4"
    >
      <div>
        <h2 className="text-base font-bold text-foreground">{t(title)}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{t(subtitle)}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.div>
  );
}
