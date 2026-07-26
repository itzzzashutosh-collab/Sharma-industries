"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import en from "@/i18n/dictionaries/en.json";
import hi from "@/i18n/dictionaries/hi.json";
import dealerEn from "@/i18n/dictionaries/dealer_en.json";
import dealerHi from "@/i18n/dictionaries/dealer_hi.json";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to flatten nested JSON objects into key-value pairs
function flattenObject(obj: Record<string, any>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key of Object.keys(obj)) {
    const propName = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, propName));
    } else {
      result[propName] = String(value);
      result[key] = String(value); // also save short key
    }
  }

  return result;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("app_language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "hi")) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
  };

  // Build high-performance memoized translation maps
  const { flatEnMap, flatHiMap, englishToHindiMap } = useMemo(() => {
    const mergedEn = { ...en, ...dealerEn };
    const mergedHi = { ...hi, ...dealerHi };

    const flatEn = flattenObject(mergedEn);
    const flatHi = flattenObject(mergedHi);

    // Build direct English string -> Hindi string map
    const enToHi: Record<string, string> = {};

    // Map by key matching in dealer_en and dealer_hi
    Object.keys(flatEn).forEach((key) => {
      const enVal = flatEn[key];
      const hiVal = flatHi[key];
      if (enVal && hiVal) {
        enToHi[enVal] = hiVal;
        enToHi[enVal.trim()] = hiVal;
        enToHi[enVal.toLowerCase()] = hiVal;
      }
    });

    // Add common UI fallback translations
    const staticFallbacks: Record<string, string> = {
      "Dealer Workspace": "डीलर कार्यक्षेत्र",
      "Command Center": "नियंत्रण केंद्र",
      "Welcome back,": "वापसी पर स्वागत है,",
      "POS Terminal Online": "POS टर्मिनल चालू",
      "Today's Gross Sales": "आज की कुल बिक्री",
      "Cash & UPI Collections": "नकद एवं UPI वसूली",
      "Outstanding Khata Balance": "बकाया खाता राशि",
      "Estimated Net Profit Margin": "अनुमानित शुद्ध लाभ मार्जिन",
      "Quick Store Action Shortcuts": "त्वरित दुकान कार्य",
      "New POS Bill": "नया POS बिल",
      "Bills History": "बिक्री बिल इतिहास",
      "Khata Ledger": "खाता लेजर",
      "Painters List": "पेंटर डायरेक्टरी",
      "Painter KYC": "पेंटर केवाईसी",
      "Loyalty Schemes": "लॉयल्टी स्कीम",
      "Leaderboard": "ठेकेदार लीडरबोर्ड",
      "Shop Profile": "दुकान प्रोफाइल",
      "Business Settings": "व्यापारिक सेटिंग्स",
      "Application Settings": "एप्लिकेशन सेटिंग्स",
      "Sales Reports": "बिक्री रिपोर्ट",
      "Inventory Reports": "इन्वेंट्री रिपोर्ट",
      "Finance Reports": "वित्तीय रिपोर्ट",
      "Save App Preferences": "एप्लिकेशन सेटिंग्स सहेजें",
      "Save Business Settings": "व्यापारिक सेटिंग्स सहेजें",
      "Save Store Profile & Stamps": "दुकान प्रोफाइल एवं मोहर सहेजें",
      "Live Store Activity Log": "लाइव दुकान गतिविधि लॉग",
      "Store Analytics & Performance Insights": "स्टोर विश्लेषण एवं प्रदर्शन रिपोर्ट",
      "Weekly Sales": "साप्ताहिक बिक्री",
      "Top Products": "शीर्ष उत्पाद",
      "Contractors": "ठेकेदार"
    };

    Object.assign(enToHi, staticFallbacks);

    return { flatEnMap: flatEn, flatHiMap: flatHi, englishToHindiMap: enToHi };
  }, []);

  const t = (key: string): string => {
    if (!key) return "";

    if (language === "en") {
      return flatEnMap[key] || key;
    }

    // Language is Hindi
    return (
      flatHiMap[key] ||
      englishToHindiMap[key] ||
      englishToHindiMap[key.trim()] ||
      englishToHindiMap[key.toLowerCase()] ||
      key
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
