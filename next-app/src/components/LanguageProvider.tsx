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
      "Contractors": "ठेकेदार",
      "AI Dealer Executive Advisor": "AI डीलर कार्यकारी सलाहकार",
      "Live Telemetry": "लाइव टेलीमेट्री",
      "Smart Sales Insight:": "स्मार्ट बिक्री अंतर्दृष्टि:",
      "Today's billing revenue is": "आज की बिलिंग आय",
      "14.2% higher": "14.2% अधिक है",
      "than average.": "औसत से।",
      "is in high demand. Reorder suggested for 10 buckets before Tuesday to avoid stockout.": "की उच्च मांग है। स्टॉक खत्म होने से पहले मंगलवार तक 10 बाल्टी का रीऑर्डर करें।",
      "Authorized Store Outlet #SRP-9812": "अधिकृत दुकान आउटलेट #SRP-9812",
      "Sharma Industries ERP Portal": "शर्मा इंडस्ट्रीज ERP पोर्टल",
      "Direct checkout & contractor bookings": "सीधी बिक्री एवं ठेकेदार बुकिंग",
      "+14.2% vs yesterday": "+14.2% कल की तुलना में",
      "Instant liquid cash inflow today": "आज की तत्काल नकद आवक",
      "82.7% cleared rate": "82.7% क्लियर दर",
      "Awaiting contractor repayment": "ठेकेदार भुगतान की प्रतीक्षा",
      "4 active credit Khatas": "4 सक्रिय क्रेडिट खाते",
      "Gross sales minus COGS & overheads": "सकल बिक्री घटाकर माल लागत एवं ओवरहेड",
      "15% net margin": "15% शुद्ध मार्जिन",
      "Deep analysis of weekly sales, bestselling products, and contractor loyalty": "साप्ताहिक बिक्री, सर्वाधिक बिके उत्पाद एवं ठेकेदार लॉयल्टी का गहन विश्लेषण",
      "1-Click Launchers": "1-क्लिक लांचर",
      "Real-Time": "रीयल-टाइम",
      "Mon": "सोम",
      "Tue": "मंगल",
      "Wed": "बुध",
      "Thu": "गुरु",
      "Fri": "शुक्र",
      "Sat": "शनि",
      "Sun": "रवि",
      "Interior Paint": "आंतरिक पेंट",
      "Exterior Primer": "बाहरी प्राइमर",
      "Wall Putty": "वॉल पुट्टी",
      "Wood Coating": "लकड़ी कोटिंग",
      "Volume:": "मात्रा:",
      "Gold Contractor": "गोल्ड ठेकेदार",
      "Silver Contractor": "सिल्वर ठेकेदार",
      "Bronze Contractor": "ब्रॉन्ज ठेकेदार",
      "Total Liters:": "कुल लीटर:",
      "Top #1 Rank": "शीर्ष #1 रैंक",
      "Top #2 Rank": "शीर्ष #2 रैंक",
      "Top #3 Rank": "शीर्ष #3 रैंक",
      "Projects": "प्रोजेक्ट",
      "House Color Studio": "घर रंग स्टूडियो",
      "Quotations": "कोटेशन",
      "Suppliers & Vendors": "आपूर्तिकर्ता एवं विक्रेता",
      "Stock Register & Inventory": "स्टॉक रजिस्टर एवं इन्वेंट्री",
      "Store Expenses & Wages": "दुकान खर्च एवं मजदूरी",
      "Customer & Client Ledger": "ग्राहक एवं क्लाइंट लेजर"
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
