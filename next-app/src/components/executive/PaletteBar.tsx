"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/LanguageProvider";
import {
  FileText, Receipt, Factory, Boxes, Users, BarChart2, Settings,
  Sparkles, Grid, X, LogOut, ShieldCheck, ChevronRight
} from "lucide-react";

interface PaletteBarProps {
  role: string;
  userName: string;
}

interface WorkspaceItem {
  name: string;
  hiName: string;
  href: string;
  icon: any;
  color: string; // The paint color code representing this workspace
}

export function PaletteBar({ role, userName }: PaletteBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isHubOpen, setIsHubOpen] = useState(false);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + H opens/closes the Workspace Hub
      if (e.altKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setIsHubOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Workspace items dictionary representing the 15 major business functions
  const ALL_WORKSPACES: WorkspaceItem[] = [
    { name: "Invoices", hiName: "स्मार्ट बिलिंग", href: "/dashboard/ceo/invoices", icon: FileText, color: "#3b82f6" },
    { name: "Quotations", hiName: "कोटेशन प्रबंधन", href: "/dashboard/ceo/quotations", icon: Receipt, color: "#10b981" },
    { name: "Purchase Bills", hiName: "खरीद बिल", href: "/dashboard/purchase", icon: Receipt, color: "#f59e0b" },
    { name: "Products", hiName: "उत्पाद सूची", href: "/dashboard/ceo/products", icon: Boxes, color: "#8b5cf6" },
    { name: "Inventory", hiName: "स्टॉक प्रबंधन", href: "/dashboard/factory/inventory", icon: Boxes, color: "#ec4899" },
    { name: "Production", hiName: "उत्पादन बैच", href: "/dashboard/factory/production", icon: Factory, color: "#06b6d4" },
    { name: "Raw Materials", hiName: "कच्चा माल", href: "/dashboard/factory/inventory", icon: Boxes, color: "#14b8a6" },
    { name: "Dealers", hiName: "डीलर नेटवर्क", href: "/dashboard/ceo/dealers", icon: Users, color: "#f97316" },
    { name: "Painters", hiName: "पेंटर नेटवर्क", href: "/dashboard/admin/painters", icon: Users, color: "#a855f7" },
    { name: "Sales", hiName: "बिक्री विवरण", href: "/dashboard/ceo/sales-intelligence", icon: BarChart2, color: "#eab308" },
    { name: "Finance", hiName: "वित्तीय लेजर", href: "/dashboard/ceo/financial-intelligence", icon: BarChart2, color: "#22c55e" },
    { name: "Employees", hiName: "HR एवं कर्मचारी", href: "/dashboard/employees", icon: Users, color: "#64748b" },
    { name: "Factory", hiName: "कारखाना विवरण", href: "/dashboard/factory", icon: Factory, color: "#6366f1" },
    { name: "Reports", hiName: "रिपोर्ट केंद्र", href: "/dashboard/ceo/reports", icon: FileText, color: "#d946ef" },
    { name: "Settings", hiName: "संगठन सेटिंग्स", href: "/dashboard/ceo/organization", icon: Settings, color: "#ef4444" },
  ];

  // Dynamic primary docks depending on role
  const getDockItems = (): WorkspaceItem[] => {
    if (role === "ceo" || role === "cofounder") {
      return [
        { name: "Overview", hiName: "अवलोकन", href: role === "ceo" ? "/dashboard/ceo" : "/dashboard/cofounder", icon: Grid, color: "#7c3aed" },
        { name: "Invoices", hiName: "बिलिंग", href: "/dashboard/ceo/invoices", icon: FileText, color: "#3b82f6" },
        { name: "Production", hiName: "उत्पादन", href: "/dashboard/factory/production", icon: Factory, color: "#06b6d4" },
        { name: "Dealers", hiName: "डीलर", href: "/dashboard/ceo/dealers", icon: Users, color: "#f97316" },
        { name: "Reports", hiName: "रिपोर्ट", href: "/dashboard/ceo/reports", icon: BarChart2, color: "#d946ef" },
      ];
    } else if (role === "factory") {
      return [
        { name: "Overview", hiName: "अवलोकन", href: "/dashboard/factory", icon: Grid, color: "#6366f1" },
        { name: "Production", hiName: "उत्पादन", href: "/dashboard/factory/production", icon: Factory, color: "#06b6d4" },
        { name: "Inventory", hiName: "स्टॉक", href: "/dashboard/factory/inventory", icon: Boxes, color: "#ec4899" },
      ];
    } else if (role === "dealer") {
      return [
        { name: "POS Bill", hiName: "नया बिल", href: "/dashboard/dealer/pos", icon: FileText, color: "#3b82f6" },
        { name: "P&L", hiName: "लाभ-हानि", href: "/dashboard/dealer/pnl", icon: BarChart2, color: "#22c55e" },
      ];
    } else {
      // Default salesman
      return [
        { name: "Overview", hiName: "अवलोकन", href: "/dashboard/salesman", icon: Grid, color: "#7c3aed" },
        { name: "Orders", hiName: "मेरे ऑर्डर", href: "/dashboard/salesman/orders", icon: FileText, color: "#3b82f6" },
        { name: "Partners", hiName: "ग्राहक", href: "/dashboard/salesman/customers", icon: Users, color: "#f97316" },
      ];
    }
  };

  const dockItems = getDockItems();

  return (
    <>
      {/* ── Floating Paint Palette Bar ──────────────────────────────────── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="pointer-events-auto flex items-center bg-[#09090b]/85 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2.5 gap-2 shadow-[0_24px_50px_rgba(0,0,0,0.7)] hover:border-white/20 transition-colors"
        >
          {/* Workspaces Primary items */}
          <div className="flex items-center gap-1">
            {dockItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard/ceo" && item.href !== "/dashboard/cofounder" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative group p-2 rounded-full transition-colors duration-150 flex items-center justify-center"
                  style={{ color: isActive ? item.color : "rgb(161 161 170)" }}
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        layoutId="active-dock-pill"
                        className="absolute inset-0 rounded-full opacity-10"
                        style={{ backgroundColor: item.color }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                  </AnimatePresence>
                  <Icon size={18} className="relative z-10 hover:scale-110 transition-transform duration-150" />
                  
                  {/* Custom Tooltip */}
                  <span className="absolute bottom-12 scale-0 group-hover:scale-100 px-2 py-1 rounded bg-[#09090b] border border-white/10 text-[10px] text-white font-bold whitespace-nowrap shadow-md transition-all z-50">
                    {language === "hi" ? item.hiName : item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Central Workspace Hub Button (रंग पैलेट) */}
          <button
            onClick={() => setIsHubOpen(!isHubOpen)}
            className={`relative p-2.5 rounded-full flex items-center justify-center transition-all ${
              isHubOpen ? "bg-primary text-white scale-105" : "bg-white/5 hover:bg-white/10 text-white"
            }`}
            aria-label="Workspace Hub"
          >
            <Grid size={18} />
            <span className="absolute bottom-12 scale-0 hover:scale-100 px-2 py-1 rounded bg-[#09090b] border border-white/10 text-[10px] text-white font-bold whitespace-nowrap shadow-md transition-all z-50">
              {language === "hi" ? "वर्कस्पेस हब" : "Workspace Hub"} (Alt+H)
            </span>
          </button>
        </motion.div>
      </div>

      {/* ── Workspace Hub Grid Overlay (रंग पैलेट) ────────────────────── */}
      <AnimatePresence>
        {isHubOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHubOpen(false)}
              className="fixed inset-0 bg-[#09090b]/90 backdrop-blur-xl"
            />

            {/* Hub window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-4xl bg-[#0c0a09]/50 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto shadow-2xl z-10 gap-6"
            >
              {/* Topbar */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      {language === "hi" ? "शर्मा इंडस्ट्रीज वर्कस्पेस" : "Sharma Industries Workspaces"}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {language === "hi" ? "विशिष्ट विनिर्माण मॉड्यूल पर सीधे काम शुरू करें" : "Jump directly into dedicated operational slates"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHubOpen(false)}
                  className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 15 Workspaces Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 flex-1">
                {ALL_WORKSPACES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setIsHubOpen(false);
                        router.push(item.href);
                      }}
                      className="group flex flex-col items-start p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-all text-left"
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
                        style={{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}30` }}
                      >
                        <Icon size={16} style={{ color: item.color }} />
                      </div>
                      <span className="text-xs font-bold text-white leading-none mb-1">
                        {language === "hi" ? item.hiName : item.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold leading-none tracking-wider group-hover:text-white/60 transition-colors">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Footer / User Session */}
              <div className="border-t border-white/5 pt-4 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>
                    Logged in as <strong className="text-white font-semibold">{userName}</strong> ({role.toUpperCase()})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsHubOpen(false);
                    router.push("/login");
                  }}
                  className="flex items-center gap-1.5 hover:text-rose-500 font-bold text-xs transition-colors"
                >
                  <LogOut size={13} /> {t("Log Out")}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
