"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/LanguageProvider";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative flex items-center gap-0.5 bg-muted/60 border border-border rounded-full p-0.5 shrink-0 w-[84px] h-[28px]" />
    );
  }

  return (
    <div className="relative flex items-center gap-0.5 bg-muted/60 border border-border rounded-full p-0.5 shrink-0">
      {(["en", "hi"] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className="relative px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 z-10"
          style={{ color: language === lang ? undefined : undefined }}
        >
          <AnimatePresence>
            {language === lang && (
              <motion.div
                suppressHydrationWarning
                layoutId="lang-pill"
                className="absolute inset-0 bg-background border border-border rounded-full shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
          <span className={`relative z-10 ${language === lang ? "text-foreground" : "text-muted-foreground"}`}>
            {lang === "en" ? "EN" : "हिन्दी"}
          </span>
        </button>
      ))}
    </div>
  );
}
