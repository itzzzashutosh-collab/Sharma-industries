import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "hi";

type Dict = Record<string, string>;

const en: Dict = {
  // brand
  "app.name": "Sharma Industries",
  "app.tagline": "Paint Manufacturing ERP",

  // nav
  "nav.dashboard": "Dashboard",
  "nav.invoicing": "Invoicing",
  "nav.ledger": "Ledger",
  "nav.products": "Products & SKUs",
  "nav.inventory": "Inventory",
  "nav.dealers": "Dealers",
  "nav.purchases": "Purchases",
  "nav.expenses": "Factory Expenses",
  "nav.employees": "Employees",
  "nav.finance": "Finance",
  "nav.group.sales": "Sales",
  "nav.group.operations": "Operations",
  "nav.group.people": "People & Money",

  // common
  "common.search": "Search...",
  "common.add": "Add",
  "common.edit": "Edit",
  "common.delete": "Delete",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.actions": "Actions",
  "common.name": "Name",
  "common.date": "Date",
  "common.amount": "Amount",
  "common.status": "Status",
  "common.total": "Total",
  "common.category": "Category",
  "common.note": "Note",
  "common.phone": "Phone",
  "common.city": "City",
  "common.none": "No records yet",
  "common.confirmDelete": "Are you sure you want to delete this?",
  "common.all": "All",
  "common.viewAll": "View all",
  "common.theme": "Theme",
  "common.language": "Language",

  // dashboard
  "dash.title": "Dashboard",
  "dash.subtitle": "Overview of your manufacturing operations",
  "dash.revenue": "Total Revenue",
  "dash.outstanding": "Outstanding Dues",
  "dash.stockValue": "Stock Value",
  "dash.expenses": "Monthly Expenses",
  "dash.salesTrend": "Sales Trend",
  "dash.expenseBreakdown": "Expense Breakdown",
  "dash.lowStock": "Low Stock Alerts",
  "dash.recentInvoices": "Recent Invoices",
  "dash.topDealers": "Top Dealers",
  "dash.vsLast": "vs last month",

  // invoicing
  "inv.title": "Invoicing",
  "inv.subtitle": "Create and manage dealer invoices",
  "inv.new": "New Invoice",
  "inv.number": "Invoice No.",
  "inv.dealer": "Dealer",
  "inv.items": "Items",
  "inv.addItem": "Add Item",
  "inv.qty": "Qty",
  "inv.rate": "Rate",
  "inv.product": "Product",
  "inv.subtotal": "Subtotal",
  "inv.tax": "GST (18%)",
  "inv.grandTotal": "Grand Total",
  "inv.paid": "Paid",
  "inv.pending": "Pending",
  "inv.partial": "Partial",
  "inv.print": "Print / PDF",
  "inv.preview": "GST Invoice",
  "inv.view": "View & Print",
  "inv.template": "Template",
  "inv.pdfHint": "Use \"Save as PDF\" in the print dialog to download this invoice.",
  "inv.savedLedger": "Invoice saved & recorded in ledger",

  // products
  "prod.title": "Products & SKUs",
  "prod.subtitle": "Manage paint products, variants and pricing",
  "prod.new": "New Product",
  "prod.sku": "SKU",
  "prod.unit": "Unit",
  "prod.price": "Price",
  "prod.stock": "Stock",
  "prod.reorder": "Reorder Level",

  // inventory
  "stock.title": "Inventory / Stock",
  "stock.subtitle": "Track raw material and finished goods",
  "stock.inStock": "In Stock",
  "stock.value": "Value",
  "stock.adjust": "Adjust Stock",
  "stock.healthy": "Healthy",
  "stock.low": "Low",
  "stock.out": "Out of Stock",

  // dealers
  "deal.title": "Dealers",
  "deal.subtitle": "Manage distributors and their accounts",
  "deal.new": "New Dealer",
  "deal.gstin": "GSTIN",
  "deal.balance": "Balance Due",
  "deal.contact": "Contact Person",

  // purchases
  "pur.title": "Purchase History",
  "pur.subtitle": "Raw material and supplier purchases",
  "pur.new": "New Purchase",
  "pur.supplier": "Supplier",

  // expenses
  "exp.title": "Factory Expenses",
  "exp.subtitle": "Operational and factory overheads",
  "exp.new": "New Expense",

  // employees
  "emp.title": "Employees",
  "emp.subtitle": "Workforce and payroll records",
  "emp.new": "New Employee",
  "emp.role": "Role",
  "emp.salary": "Salary",
  "emp.joinDate": "Join Date",
  "emp.active": "Active",
  "emp.inactive": "Inactive",

  // finance
  "fin.title": "Finance Management",
  "fin.subtitle": "Profit, loss and cash flow overview",
  "fin.income": "Income",
  "fin.expense": "Expenses",
  "fin.profit": "Net Profit",
  "fin.cashflow": "Cash Flow",
  "fin.receivables": "Receivables",
  "fin.payables": "Payables",
};

const hi: Dict = {
  "app.name": "शर्मा इंडस्ट्रीज़",
  "app.tagline": "पेंट निर्माण ईआरपी",

  "nav.dashboard": "डैशबोर्ड",
  "nav.invoicing": "बिलिंग",
  "nav.ledger": "बही-खाता",
  "nav.products": "उत्पाद और एसकेयू",
  "nav.inventory": "इन्वेंटरी",
  "nav.dealers": "डीलर",
  "nav.purchases": "खरीद",
  "nav.expenses": "फैक्ट्री खर्च",
  "nav.employees": "कर्मचारी",
  "nav.finance": "वित्त",
  "nav.group.sales": "बिक्री",
  "nav.group.operations": "संचालन",
  "nav.group.people": "लोग और पैसा",

  "common.search": "खोजें...",
  "common.add": "जोड़ें",
  "common.edit": "संपादित करें",
  "common.delete": "हटाएं",
  "common.save": "सहेजें",
  "common.cancel": "रद्द करें",
  "common.actions": "क्रियाएं",
  "common.name": "नाम",
  "common.date": "दिनांक",
  "common.amount": "राशि",
  "common.status": "स्थिति",
  "common.total": "कुल",
  "common.category": "श्रेणी",
  "common.note": "टिप्पणी",
  "common.phone": "फ़ोन",
  "common.city": "शहर",
  "common.none": "अभी कोई रिकॉर्ड नहीं",
  "common.confirmDelete": "क्या आप वाकई इसे हटाना चाहते हैं?",
  "common.all": "सभी",
  "common.viewAll": "सभी देखें",
  "common.theme": "थीम",
  "common.language": "भाषा",

  "dash.title": "डैशबोर्ड",
  "dash.subtitle": "आपके निर्माण संचालन का अवलोकन",
  "dash.revenue": "कुल राजस्व",
  "dash.outstanding": "बकाया राशि",
  "dash.stockValue": "स्टॉक मूल्य",
  "dash.expenses": "मासिक खर्च",
  "dash.salesTrend": "बिक्री रुझान",
  "dash.expenseBreakdown": "खर्च विवरण",
  "dash.lowStock": "कम स्टॉक चेतावनी",
  "dash.recentInvoices": "हाल के बिल",
  "dash.topDealers": "शीर्ष डीलर",
  "dash.vsLast": "पिछले माह की तुलना में",

  "inv.title": "बिलिंग",
  "inv.subtitle": "डीलर बिल बनाएं और प्रबंधित करें",
  "inv.new": "नया बिल",
  "inv.number": "बिल नं.",
  "inv.dealer": "डीलर",
  "inv.items": "वस्तुएं",
  "inv.addItem": "वस्तु जोड़ें",
  "inv.qty": "मात्रा",
  "inv.rate": "दर",
  "inv.product": "उत्पाद",
  "inv.subtotal": "उप-योग",
  "inv.tax": "जीएसटी (18%)",
  "inv.grandTotal": "कुल योग",
  "inv.paid": "भुगतान हो गया",
  "inv.pending": "बकाया",
  "inv.partial": "आंशिक",
  "inv.print": "प्रिंट / पीडीएफ",
  "inv.preview": "जीएसटी चालान",
  "inv.view": "देखें और प्रिंट करें",
  "inv.template": "टेम्पलेट",
  "inv.pdfHint": "इस चालान को डाउनलोड करने के लिए प्रिंट डायलॉग में \"Save as PDF\" चुनें।",
  "inv.savedLedger": "चालान सहेजा गया और लेजर में दर्ज किया गया",

  "prod.title": "उत्पाद और एसकेयू",
  "prod.subtitle": "पेंट उत्पाद, वेरिएंट और मूल्य प्रबंधन",
  "prod.new": "नया उत्पाद",
  "prod.sku": "एसकेयू",
  "prod.unit": "इकाई",
  "prod.price": "मूल्य",
  "prod.stock": "स्टॉक",
  "prod.reorder": "पुनः ऑर्डर स्तर",

  "stock.title": "इन्वेंटरी / स्टॉक",
  "stock.subtitle": "कच्चा माल और तैयार माल ट्रैक करें",
  "stock.inStock": "स्टॉक में",
  "stock.value": "मूल्य",
  "stock.adjust": "स्टॉक समायोजित करें",
  "stock.healthy": "पर्याप्त",
  "stock.low": "कम",
  "stock.out": "स्टॉक खत्म",

  "deal.title": "डीलर",
  "deal.subtitle": "वितरक और उनके खाते प्रबंधित करें",
  "deal.new": "नया डीलर",
  "deal.gstin": "जीएसटीआईएन",
  "deal.balance": "बकाया शेष",
  "deal.contact": "संपर्क व्यक्ति",

  "pur.title": "खरीद इतिहास",
  "pur.subtitle": "कच्चा माल और आपूर्तिकर्ता खरीद",
  "pur.new": "नई खरीद",
  "pur.supplier": "आपूर्तिकर्ता",

  "exp.title": "फैक्ट्री खर्च",
  "exp.subtitle": "परिचालन और फैक्ट्री ओवरहेड",
  "exp.new": "नया खर्च",

  "emp.title": "कर्मचारी",
  "emp.subtitle": "कार्यबल और वेतन रिकॉर्ड",
  "emp.new": "नया कर्मचारी",
  "emp.role": "पद",
  "emp.salary": "वेतन",
  "emp.joinDate": "नियुक्ति तिथि",
  "emp.active": "सक्रिय",
  "emp.inactive": "निष्क्रिय",

  "fin.title": "वित्त प्रबंधन",
  "fin.subtitle": "लाभ, हानि और नकदी प्रवाह अवलोकन",
  "fin.income": "आय",
  "fin.expense": "खर्च",
  "fin.profit": "शुद्ध लाभ",
  "fin.cashflow": "नकदी प्रवाह",
  "fin.receivables": "प्राप्य",
  "fin.payables": "देय",
};

const dicts: Record<Lang, Dict> = { en, hi };

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("si-lang") as Lang | null;
    if (stored === "en" || stored === "hi") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("si-lang", l);
  };

  const t = (key: string) => dicts[lang][key] ?? dicts.en[key] ?? key;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
