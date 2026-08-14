"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, FileText, User, Package, Shield, BarChart, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface SearchItem {
  id: string;
  category: "Invoices" | "Dealers" | "Products" | "Painters" | "Customers" | "Reports" | "Orders";
  title: string;
  subtitle: string;
  url: string;
}

const SEARCH_DATABASE: SearchItem[] = [
  // Invoices
  { id: "inv-1", category: "Invoices", title: "INV-2025-001", subtitle: "Ravi Traders - ₹4,50,000 - Paid", url: "/dashboard/ceo/invoices" },
  { id: "inv-2", category: "Invoices", title: "INV-2025-002", subtitle: "Karan Paints - ₹2,10,000 - Overdue", url: "/dashboard/ceo/invoices" },
  { id: "inv-3", category: "Invoices", title: "INV-2025-003", subtitle: "Jaipur Distributors - ₹12,40,000 - Partial", url: "/dashboard/ceo/invoices" },
  // Dealers
  { id: "dlr-1", category: "Dealers", title: "Ravi Traders", subtitle: "Jaipur - Revenue YTD: ₹45L", url: "/dashboard/ceo/dealers" },
  { id: "dlr-2", category: "Dealers", title: "Karan Paints", subtitle: "Kota - Revenue YTD: ₹22L", url: "/dashboard/ceo/dealers" },
  { id: "dlr-3", category: "Dealers", title: "Apex Distributors", subtitle: "Jodhpur - Revenue YTD: ₹89L", url: "/dashboard/ceo/dealers" },
  // Products
  { id: "prd-1", category: "Products", title: "Rustic Royale Superfine", subtitle: "Mfg Cost: ₹1200 | Stock: 340 Buckets", url: "/dashboard/ceo/products" },
  { id: "prd-2", category: "Products", title: "WeatherGuard Matte", subtitle: "Mfg Cost: ₹900 | Stock: 180 Buckets", url: "/dashboard/ceo/products" },
  { id: "prd-3", category: "Products", title: "Wall Putty Premium", subtitle: "Mfg Cost: ₹400 | Stock: 1,200 Bags", url: "/dashboard/ceo/products" },
  // Painters
  { id: "ptr-1", category: "Painters", title: "Rajesh Kumar", subtitle: "Gold loyalty level - 2,450 points", url: "/dashboard/admin/painters" },
  { id: "ptr-2", category: "Painters", title: "Vikram Singh", subtitle: "Silver loyalty level - 1,120 points", url: "/dashboard/admin/painters" },
  { id: "ptr-3", category: "Painters", title: "Amit Sharma", subtitle: "Platinum loyalty level - 5,600 points", url: "/dashboard/admin/painters" },
  // Reports
  { id: "rep-1", category: "Reports", title: "Monthly P&L Statement", subtitle: "Q2 Finance breakdown", url: "/dashboard/ceo/reports" },
  { id: "rep-2", category: "Reports", title: "Dealer Performance Index", subtitle: "Regional ranking & targets", url: "/dashboard/ceo/reports" },
  { id: "rep-3", category: "Reports", title: "Factory Yield Analysis", subtitle: "Raw material efficiency metrics", url: "/dashboard/ceo/reports" },
];

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { t } = useLanguage();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle modal on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const filtered = query
    ? SEARCH_DATABASE.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelect = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  const getIcon = (cat: string) => {
    switch (cat) {
      case "Invoices": return <FileText size={15} className="text-blue-500" />;
      case "Dealers": return <User size={15} className="text-violet-500" />;
      case "Products": return <Package size={15} className="text-emerald-500" />;
      case "Painters": return <User size={15} className="text-amber-500" />;
      case "Reports": return <BarChart size={15} className="text-cyan-500" />;
      default: return <Shield size={15} className="text-muted-foreground" />;
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:border-border/80 transition-all duration-200"
        aria-label="Search"
      >
        <Search size={13} />
        <span className="hidden md:inline">{t("Search everything")}...</span>
        <kbd className="hidden sm:inline-flex h-4 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[9px] font-medium opacity-80">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>

      {/* Modal Backdrop & Body */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl z-10 flex flex-col"
            >
              {/* Input section */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
                <Search size={16} className="text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={t("Search everything") + " (Ctrl+K)..."}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Results section */}
              <div className="max-h-[350px] overflow-y-auto p-2 space-y-1">
                {query === "" ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    Type to search invoices, dealers, products, painters, reports...
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No results found for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  filtered.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.url)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/80 text-left border border-transparent hover:border-border/40 transition-all duration-150 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                          {getIcon(item.category)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground leading-none mb-1">{item.title}</p>
                          <p className="text-[11px] text-muted-foreground leading-none">{item.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{t(item.category)}</span>
                        <ArrowRight size={12} className="text-primary" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
