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
      "Customer & Client Ledger": "ग्राहक एवं क्लाइंट लेजर",

      // ── Finance Pages ────────────────────────────────────────────────────
      "Finance": "वित्त",
      // "Dealer Workspace" already defined above
      "Revenue Summary": "राजस्व सारांश",
      "Dealer Sales Revenue Summary": "डीलर बिक्री राजस्व सारांश",
      "Track gross sales revenue, UPI digital settlements, cash collections, and credit receivables stream": "सकल बिक्री राजस्व, UPI डिजिटल निपटान, नकद संग्रह और क्रेडिट प्राप्य की निगरानी करें",
      "Total Billed Sales Revenue": "कुल बिल किया गया बिक्री राजस्व",
      "Sales Invoices Generated": "बिक्री बिल जारी किए गए",
      "UPI & Digital Receipts": "UPI एवं डिजिटल रसीदें",
      "Direct Bank Instant Settlement": "सीधा बैंक तत्काल निपटान",
      "Cash Collections": "नकद संग्रह",
      "Store Cash Drawer Balances": "दुकान नकद दराज शेष",
      "Credit Sales Receivables": "क्रेडिट बिक्री प्राप्य",
      "Khata Outstanding Credit": "खाता बकाया क्रेडिट",
      "Filter invoice code or customer name...": "इनवॉइस कोड या ग्राहक नाम से खोजें...",
      "All Sales": "सभी बिक्री",
      "Invoice #": "बिल नंबर",
      "Date": "तारीख",
      "Customer / Client": "ग्राहक / क्लाइंट",
      "Payment Mode": "भुगतान विधि",
      "Taxable Subtotal": "कर योग्य उप-कुल",
      "GST Tax": "GST कर",
      "Grand Total Revenue": "कुल राजस्व",
      "Status": "स्थिति",
      "No revenue invoices found.": "कोई राजस्व बिल नहीं मिला।",
      "Fully Paid": "पूर्ण भुगतान",
      "Credit Due": "क्रेडिट बकाया",
      "Retail Customer": "खुदरा ग्राहक",

      // Cash Flow
      "Cash Flow & Liquidity": "नकद प्रवाह एवं तरलता",
      "Cash Flow & Store Liquidity Intelligence": "नकद प्रवाह एवं स्टोर तरलता विश्लेषण",
      "Monitor operating cash receipts, cash register drawer balances, bank settlements, and 30-day liquidity forecasts": "परिचालन नकद रसीदें, नकद दराज शेष, बैंक निपटान और 30 दिन के तरलता पूर्वानुमान की निगरानी करें",
      "Total Operating Cash Inflows": "कुल परिचालन नकद आवक",
      "POS Cash & Digital UPI Receipts": "POS नकद एवं डिजिटल UPI रसीदें",
      "Total Cash Outflows": "कुल नकद बहिर्वाह",
      "Store Wages, Rent & Factory Bills": "दुकान मजदूरी, किराया एवं कारखाना बिल",
      "Net Cashflow Surplus": "शुद्ध नकद प्रवाह अधिशेष",
      "Positive Operating Liquidity": "सकारात्मक परिचालन तरलता",
      "Cash Register Drawer": "नकद रजिस्टर दराज",
      "Physical Store Cash in Hand": "दुकान में भौतिक नकद राशि",
      "Loading Cash Flow & Liquidity Dashboard...": "नकद प्रवाह डैशबोर्ड लोड हो रहा है...",
      "+ Reconcile Cash Drawer": "+ नकद दराज मिलान करें",
      "Export Cashflow CSV": "नकद प्रवाह CSV निर्यात करें",
      "30-Day Cash Flow Forecast": "30-दिन का नकद प्रवाह पूर्वानुमान",
      "AI-Powered Liquidity Engine": "AI-संचालित तरलता इंजन",
      "Cash Drawer Balance": "नकद दराज शेष",
      "Bank Account Balance": "बैंक खाता शेष",
      "All Transactions": "सभी लेनदेन",
      "Cash Inflows": "नकद आवक",
      "Cash Outflows": "नकद बहिर्वाह",
      "Cash Drawer": "नकद दराज",
      "Bank / UPI": "बैंक / UPI",
      "Transaction": "लेनदेन",
      "Type": "प्रकार",
      "No transactions found.": "कोई लेनदेन नहीं मिला।",

      // Customer Ledger
      "Customer Ledger": "ग्राहक बहीखाता",
      "Khata Book & Credit Management": "खाता बुक एवं क्रेडिट प्रबंधन",
      "Manage customer credit accounts, track outstanding balances, and record khata transactions": "ग्राहक क्रेडिट खाते प्रबंधित करें, बकाया शेष ट्रैक करें और खाता लेनदेन दर्ज करें",
      "+ New Khata": "+ नया खाता",
      "Total Customers": "कुल ग्राहक",
      "Outstanding Balance": "बकाया शेष",
      "Fully Cleared Accounts": "पूर्ण रूप से निपटाए खाते",
      "Overdue Accounts": "अतिदेय खाते",
      "Customer Name": "ग्राहक नाम",
      "Phone": "फोन",
      "Address": "पता",
      "Credit Limit": "क्रेडिट सीमा",
      "Balance Due": "बकाया राशि",
      "Transactions": "लेनदेन",
      "Actions": "कार्रवाई",
      "No customers found.": "कोई ग्राहक नहीं मिला।",
      "No Khata entries found": "कोई खाता प्रविष्टि नहीं मिली",
      "Transaction History": "लेनदेन इतिहास",
      "Add Transaction": "लेनदेन जोड़ें",
      "Close": "बंद करें",
      "View Khata": "खाता देखें",
      "Edit": "संपादित करें",
      "Clear": "साफ़ करें",

      // Business Expenses
      "Business Expenses & Overheads": "व्यवसाय खर्च एवं ओवरहेड",
      "Store Operating Expense Tracker": "दुकान परिचालन खर्च ट्रैकर",
      "Record daily store expenses including wages, rent, utilities, and business operational costs": "दैनिक दुकान खर्च दर्ज करें जिसमें मजदूरी, किराया, उपयोगिताएं और व्यावसायिक लागत शामिल हैं",
      "+ Add Expense": "+ खर्च जोड़ें",
      "Export Expenses": "खर्च निर्यात करें",
      "Total Expenses This Month": "इस महीने का कुल खर्च",
      "Wages & Labour": "मजदूरी एवं श्रम",
      "Rent & Utilities": "किराया एवं उपयोगिताएं",
      "Category": "श्रेणी",
      "Description": "विवरण",
      "Amount": "राशि",
      "Expense Title": "खर्च का नाम",
      "Expense Category": "खर्च श्रेणी",
      "Save Expense": "खर्च सहेजें",
      "No expenses found.": "कोई खर्च नहीं मिला।",

      // Payment Registry
      "Payment Registry": "भुगतान रजिस्ट्री",
      "Track all incoming payments from customers": "ग्राहकों से सभी आने वाले भुगतान ट्रैक करें",
      "Total Collected": "कुल वसूली",
      "UPI Payments": "UPI भुगतान",
      "Cash Payments": "नकद भुगतान",
      "Credit Payments": "क्रेडिट भुगतान",
      "Amount Paid": "भुगतान की गई राशि",
      "No payments found.": "कोई भुगतान नहीं मिला।",
      "Paid": "भुगतान किया",
      "Partial": "आंशिक",
      "Pending": "लंबित",

      // ── Products Pages ───────────────────────────────────────────────────
      "Products Catalogue": "उत्पाद सूची",
      "Full Product Catalogue & Price List": "पूर्ण उत्पाद सूची एवं मूल्य सूची",
      "Browse and manage your complete product inventory with pricing, GST rates, and stock information": "मूल्य, GST दरों और स्टॉक जानकारी के साथ अपनी संपूर्ण उत्पाद सूची ब्राउज़ करें",
      "+ Add Product": "+ उत्पाद जोड़ें",
      "Total Products": "कुल उत्पाद",
      "In Stock": "स्टॉक में",
      "Out of Stock": "स्टॉक खत्म",
      "Product Name": "उत्पाद नाम",
      "Price": "मूल्य",
      "Stock": "स्टॉक",
      "MRP": "एमआरपी",
      "HSN Code": "HSN कोड",
      "GST Rate": "GST दर",
      "No products found.": "कोई उत्पाद नहीं मिला।",

      // Stock Levels
      "Stock Levels": "स्टॉक स्तर",
      "Inventory & Stock Management": "इन्वेंट्री एवं स्टॉक प्रबंधन",
      "Monitor product stock levels, track low inventory, and manage reorder points": "उत्पाद स्टॉक स्तरों की निगरानी करें, कम इन्वेंट्री ट्रैक करें और रिऑर्डर पॉइंट प्रबंधित करें",
      "Total Stock Value": "कुल स्टॉक मूल्य",
      "Low Stock Items": "कम स्टॉक आइटम",
      "Low Stock": "कम स्टॉक",
      "Reorder Level": "रिऑर्डर स्तर",
      "Current Stock": "वर्तमान स्टॉक",
      "Export Inventory": "इन्वेंट्री निर्यात करें",
      "No products in inventory.": "इन्वेंट्री में कोई उत्पाद नहीं।",
      "Stock Value": "स्टॉक मूल्य",
      "Inventory Overview": "इन्वेंट्री अवलोकन",
      "Low Stock Alert": "कम स्टॉक चेतावनी",

      // ── Painters Pages ───────────────────────────────────────────────────
      "Painters Directory": "पेंटर निर्देशिका",
      "Registered Painters & Contractors Hub": "पंजीकृत पेंटर एवं ठेकेदार केंद्र",
      "Manage painter KYC document verification (Aadhaar, PAN, Bank Passbook), coupon points balance, and onboarding": "पेंटर KYC दस्तावेज़ सत्यापन (आधार, पैन, बैंक पासबुक), कूपन पॉइंट बैलेंस और ऑनबोर्डिंग प्रबंधित करें",
      "+ Onboard New Painter & KYC": "+ नया पेंटर KYC ऑनबोर्ड करें",
      "Total Registered Painters": "कुल पंजीकृत पेंटर",
      "Store Loyalty Scheme Members": "स्टोर लॉयल्टी स्कीम सदस्य",
      "KYC Verified Painters": "KYC सत्यापित पेंटर",
      "Aadhaar & Bank Details Approved": "आधार एवं बैंक विवरण स्वीकृत",
      "Total Scanned Points Balance": "कुल स्कैन किया गया पॉइंट बैलेंस",
      "Store Reward Scheme Points": "स्टोर रिवॉर्ड स्कीम पॉइंट",
      "Search painter by name, mobile phone, or address...": "नाम, मोबाइल नंबर या पते से पेंटर खोजें...",
      "All Painters": "सभी पेंटर",
      "✅ KYC Verified": "✅ KYC सत्यापित",
      "⏳ Pending KYC": "⏳ KYC लंबित",
      "Painter Name": "पेंटर नाम",
      "City": "शहर",
      "Tier": "स्तर",
      "Points": "पॉइंट",
      "No painters found.": "कोई पेंटर नहीं मिला।",

      // Painter KYC Register
      "Onboard Painter KYC": "पेंटर KYC ऑनबोर्ड करें",
      "Painter Registration & Verification": "पेंटर पंजीकरण एवं सत्यापन",
      "Register new painters with KYC verification and add them to the loyalty program": "KYC सत्यापन के साथ नए पेंटर पंजीकृत करें और उन्हें लॉयल्टी कार्यक्रम में जोड़ें",
      "Submit KYC": "KYC जमा करें",
      "Mobile Number": "मोबाइल नंबर",
      "Aadhar Number": "आधार नंबर",
      "PAN Card": "पैन कार्ड",
      "State": "राज्य",
      "Upload Photo": "फोटो अपलोड करें",
      "Upload Aadhar": "आधार अपलोड करें",
      "Upload PAN": "पैन अपलोड करें",
      "Register Painter": "पेंटर पंजीकृत करें",
      "Cancel": "रद्द करें",

      // Loyalty Schemes ("Loyalty Schemes" key already defined above)
      "Painter Reward Programs": "पेंटर रिवॉर्ड कार्यक्रम",
      "Manage loyalty programs and reward schemes for painters and contractors": "पेंटर और ठेकेदारों के लिए लॉयल्टी कार्यक्रम और रिवॉर्ड स्कीम प्रबंधित करें",
      "Active Schemes": "सक्रिय स्कीम",
      "Total Points Awarded": "कुल पुरस्कृत पॉइंट",
      "Redemptions This Month": "इस महीने की रिडेम्पशन",
      "Gold Tier": "गोल्ड स्तर",
      "Silver Tier": "सिल्वर स्तर",
      "Bronze Tier": "ब्रॉन्ज स्तर",
      "Points Required": "आवश्यक पॉइंट",
      "Reward Value": "रिवॉर्ड मूल्य",
      "Participants": "प्रतिभागी",
      "Active": "सक्रिय",
      "Expired": "समाप्त",
      "No schemes found.": "कोई स्कीम नहीं मिली।",

      // Meetings
      "Painter Meetups": "पेंटर मीटअप",
      "Schedule & Track Painter Meetings": "पेंटर मीटिंग शेड्यूल एवं ट्रैक करें",
      "Schedule meetings, track attendance, and manage painter community events": "मीटिंग शेड्यूल करें, उपस्थिति ट्रैक करें और पेंटर समुदाय कार्यक्रम प्रबंधित करें",
      "+ Schedule Meeting": "+ मीटिंग शेड्यूल करें",
      "Upcoming Meetings": "आगामी मीटिंग",
      "Past Meetings": "पिछली मीटिंग",
      "Total Meetings": "कुल मीटिंग",
      "Location": "स्थान",
      "Time": "समय",
      "Attendees": "उपस्थित लोग",
      "No meetings scheduled.": "कोई मीटिंग शेड्यूल नहीं।",

      // Competitions / Leaderboard
      "Contractor Leaderboard": "ठेकेदार लीडरबोर्ड",
      "Top Performing Painters & Contractors": "शीर्ष प्रदर्शन करने वाले पेंटर एवं ठेकेदार",
      "Track contractor performance, loyalty points, and competition standings": "ठेकेदार प्रदर्शन, लॉयल्टी पॉइंट और प्रतियोगिता स्तर ट्रैक करें",
      "Total Points": "कुल पॉइंट",
      "Rank": "रैंक",
      "Contractor Name": "ठेकेदार नाम",
      "Level": "स्तर",
      "Projects Completed": "पूर्ण परियोजनाएं",
      "Liters Used": "उपयोग किए गए लीटर",
      "Gold": "गोल्ड",
      "Silver": "सिल्वर",
      "Bronze": "ब्रॉन्ज",

      // Portfolio Review
      "Work Portfolio Review": "कार्य पोर्टफोलियो समीक्षा",
      "Review Painter Work Submissions": "पेंटर कार्य प्रस्तुतियों की समीक्षा करें",
      "Review and approve painter work portfolio submissions": "पेंटर कार्य पोर्टफोलियो प्रस्तुतियों की समीक्षा और अनुमोदन करें",
      "Pending Review": "समीक्षा लंबित",
      "Approved": "स्वीकृत",
      "Rejected": "अस्वीकृत",
      "Approve": "स्वीकृत करें",
      "Reject": "अस्वीकार करें",
      "View Details": "विवरण देखें",
      "No submissions found.": "कोई प्रस्तुति नहीं मिली।",

      // ── Settings Pages ("Shop Profile", "Business Settings", "Application Settings" already defined above)
      "Store Profile & Branding Settings": "स्टोर प्रोफाइल एवं ब्रांडिंग सेटिंग्स",
      "Manage your store profile, upload logo, signature, and customize invoice branding": "अपनी दुकान प्रोफाइल प्रबंधित करें, लोगो, हस्ताक्षर अपलोड करें और चालान ब्रांडिंग कस्टमाइज़ करें",
      "Store Name": "दुकान का नाम",
      "Owner Name": "मालिक का नाम",
      "GST Number": "GST नंबर",
      "Phone Number": "फोन नंबर",
      "Store Address": "दुकान का पता",
      "Pincode": "पिनकोड",
      "Upload Logo": "लोगो अपलोड करें",
      "Upload Stamp": "मोहर अपलोड करें",
      "Signature": "हस्ताक्षर",
      "Save Store Profile": "दुकान प्रोफाइल सहेजें",
      "Save & Apply Changes": "सहेजें एवं परिवर्तन लागू करें",

      // "Business Settings" already defined above
      "Invoice & Business Customization": "चालान एवं व्यवसाय अनुकूलन",
      "Configure invoice prefix, GST settings, payment terms, and business rules": "चालान उपसर्ग, GST सेटिंग्स, भुगतान शर्तें और व्यावसायिक नियम कॉन्फ़िगर करें",
      "Invoice Prefix": "चालान उपसर्ग",
      "Invoice Footer": "चालान पादलेख",
      "Tax Rate": "कर दर",
      "Payment Terms": "भुगतान शर्तें",
      "Default Currency": "डिफ़ॉल्ट मुद्रा",
      "Save Settings": "सेटिंग्स सहेजें",
      "Reset to Default": "डिफ़ॉल्ट पर रीसेट करें",

      // "Application Settings" already defined above
      "App Preferences & Configuration": "ऐप प्राथमिकताएं एवं कॉन्फ़िगरेशन",
      "Configure language, theme, notifications, and application display preferences": "भाषा, थीम, सूचनाएं और एप्लिकेशन प्रदर्शन प्राथमिकताएं कॉन्फ़िगर करें",
      "Language": "भाषा",
      "Theme": "थीम",
      "Notifications": "सूचनाएं",
      "Dark Mode": "डार्क मोड",
      "Light Mode": "लाइट मोड",
      "System Default": "सिस्टम डिफ़ॉल्ट",
      "Save Preferences": "प्राथमिकताएं सहेजें",
      "English": "अंग्रेज़ी",
      "Hindi": "हिन्दी",
      // "Save App Preferences" already defined above

      // ── Reports Pages ("Sales Reports", "Inventory Reports", "Finance Reports" already defined above)
      "Sales Performance Analysis": "बिक्री प्रदर्शन विश्लेषण",
      "Comprehensive sales reports including revenue breakdown, top products, and customer analysis": "राजस्व विभाजन, शीर्ष उत्पाद और ग्राहक विश्लेषण सहित व्यापक बिक्री रिपोर्ट",
      "Total Sales": "कुल बिक्री",
      "Invoices Raised": "जारी किए गए बिल",
      "Average Order Value": "औसत ऑर्डर मूल्य",
      "Top Customer": "शीर्ष ग्राहक",
      "Export Report": "रिपोर्ट निर्यात करें",
      "Download PDF": "PDF डाउनलोड करें",

      // "Inventory Reports" already defined above
      "Stock & Inventory Analysis": "स्टॉक एवं इन्वेंट्री विश्लेषण",
      "Comprehensive inventory reports including stock movements, valuations, and turnover analysis": "स्टॉक आवाजाही, मूल्यांकन और टर्नओवर विश्लेषण सहित व्यापक इन्वेंट्री रिपोर्ट",

      // "Finance Reports" already defined above
      "Financial Performance Analysis": "वित्तीय प्रदर्शन विश्लेषण",
      "Comprehensive financial reports including revenue, expenses, P&L, and cash flow analysis": "राजस्व, खर्च, लाभ-हानि और नकद प्रवाह विश्लेषण सहित व्यापक वित्तीय रिपोर्ट",
      "Total Revenue": "कुल राजस्व",
      "Total Expenses": "कुल खर्च",
      "Net Profit": "शुद्ध लाभ",
      "GST Payable": "देय GST",

      // ── Common across all pages ──────────────────────────────────────────
      "Save": "सहेजें",
      // "Cancel" already defined above (L332)
      "Search": "खोजें",
      "Filter": "फ़िल्टर",
      "Export": "निर्यात",
      "Download": "डाउनलोड",
      "Print": "प्रिंट",
      "Add": "जोड़ें",
      // "Edit" already defined above (L234)
      "Delete": "हटाएं",
      "View": "देखें",
      "Submit": "जमा करें",
      "Loading...": "लोड हो रहा है...",
      "No data found.": "कोई डेटा नहीं मिला।",
      "Error loading data.": "डेटा लोड करने में त्रुटि।",
      "Refresh": "ताज़ा करें",
      "Back": "वापस",
      "Next": "अगला",
      "Previous": "पिछला",
      "All": "सभी",
      "None": "कोई नहीं",
      "Yes": "हां",
      "No": "नहीं",
      "OK": "ठीक है",
      "Confirm": "पुष्टि करें",
      "Apply": "लागू करें",
      "Reset": "रीसेट",
      // "Close" already defined above (L232)
      "Open": "खोलें",
      "Upload": "अपलोड करें",
      "Remove": "हटाएं",
      // "Clear" already defined above (L235)
      "Select": "चुनें",
      "Create": "बनाएं",
      "Update": "अपडेट करें",
      "Generate": "बनाएं",
      "Send": "भेजें",
      "Share": "साझा करें",
      "Copy": "कॉपी करें",
      "Paste": "पेस्ट करें",
      "Cut": "काटें",
      "Undo": "पूर्ववत करें",
      "Redo": "पुनः करें"
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
