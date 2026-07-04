"use client";

import * as React from "react";
import { useLanguage } from "./LanguageProvider";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-2 py-1 rounded-md text-sm font-bold uppercase tracking-wider bg-transparent hover:bg-card text-muted-foreground hover:text-foreground border border-border transition-all focus:outline-none"
      aria-label="Toggle language"
    >
      {language === "en" ? "HI" : "EN"}
    </button>
  );
}
