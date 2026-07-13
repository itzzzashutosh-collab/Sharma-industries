"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "./LanguageProvider";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  ShoppingCart,
  Users,
  ClipboardList,
  Package,
  FlaskConical,
  Warehouse,
  Layers,
  Factory,
  Store,
  Paintbrush,
  UserCog,
  Truck,
  FolderOpen,
  TrendingUp,
  CreditCard,
  BookOpen,
  FileBarChart,
  Banknote,
  PieChart,
  Building2,
  UserCheck,
  CheckSquare,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LineChart,
  Wallet,
  Sparkles,
  BookMarked,
  Landmark,
  Scale,
  FileClock,
  FileSearch,
  Upload,
  User,
  Building,
  SlidersHorizontal,
  Calculator,
  ScrollText,
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
  FileSpreadsheet,
  FileCheck,
  FolderArchive,
  AlertCircle,
  Download,
  Columns,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Role = "ceo" | "cofounder" | "dealer" | "salesman" | "ca" | "factory" | string;

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

// ─── Navigation Config ────────────────────────────────────────────────────────
const CEO_NAV: NavGroup[] = [
  {
    group: "Dashboard",
    items: [
      { name: "Dashboard",      href: "/dashboard/ceo",                  icon: LayoutDashboard },
      { name: "AI Dashboard",   href: "/dashboard/ceo/ai-dashboard",     icon: Sparkles },
    ],
  },
  {
    group: "Business",
    items: [
      { name: "Invoices",       href: "/dashboard/ceo/invoices",          icon: FileText },
      { name: "Quotations",     href: "/dashboard/ceo/quotations",        icon: Receipt },
      { name: "Purchase Bills", href: "/dashboard/purchase",              icon: ShoppingCart },
      { name: "Customers",      href: "/dashboard/ceo/customer-intelligence", icon: Users },
      { name: "Orders",         href: "/dashboard/admin/orders",          icon: ClipboardList },
    ],
  },
  {
    group: "Products",
    items: [
      { name: "Products",                  href: "/dashboard/ceo/products",          icon: Package },
      { name: "Raw materials & inventory", href: "/dashboard/factory/inventory",     icon: Warehouse },
      { name: "Stock Register",            href: "/dashboard/factory/stock-register", icon: BookOpen },
      { name: "Production",                href: "/dashboard/factory/production",    icon: Factory },
    ],
  },
  {
    group: "Sales",
    items: [
      { name: "Dealers",        href: "/dashboard/ceo/dealers",           icon: Store },
      { name: "Painters",       href: "/dashboard/admin/painters",        icon: Paintbrush },
      { name: "Sales Team",     href: "/dashboard/admin/sales-team",      icon: UserCog },
      { name: "Distribution",   href: "/dashboard/ceo/market-intelligence", icon: Truck },
    ],
  },
  {
    group: "Finance",
    items: [
      { name: "Revenue",        href: "/dashboard/ceo/financial-intelligence", icon: TrendingUp },
      { name: "Expenses",       href: "/dashboard/factory/expenses",      icon: CreditCard },
      { name: "Ledger",         href: "/dashboard/ca-portal/sales",       icon: BookOpen },
      { name: "Cash Flow",      href: "/dashboard/ceo/cash-flow",         icon: Banknote },
      { name: "Profit & Loss",  href: "/dashboard/dealer/pnl",            icon: PieChart },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { name: "Competitors",     href: "/dashboard/ceo/competitors",        icon: BarChart2 },
      { name: "AI Spend",        href: "/dashboard/ceo/ai-spend",          icon: Wallet },
    ],
  },
  {
    group: "Company",
    items: [
      { name: "Factory",        href: "/dashboard/factory",               icon: Building2 },
      { name: "Employees",      href: "/dashboard/employees",             icon: UserCheck },
      { name: "Approvals",      href: "/dashboard/ceo/approvals",         icon: CheckSquare },
      { name: "Reports",        href: "/dashboard/ceo/reports",           icon: BarChart2 },
      { name: "Settings",       href: "/dashboard/ceo/organization",      icon: Settings },
    ],
  },
];

const COFOUNDER_NAV: NavGroup[] = [
  {
    group: "Dashboard",
    items: [
      { name: "Dashboard",      href: "/dashboard/cofounder",             icon: LayoutDashboard },
      { name: "AI Dashboard",   href: "/dashboard/ceo/ai-dashboard",     icon: Sparkles },
    ],
  },
  {
    group: "Factory",
    items: [
      { name: "Production",                href: "/dashboard/factory/production",    icon: Factory },
      { name: "Raw materials & inventory", href: "/dashboard/factory/inventory",     icon: Warehouse },
      { name: "Stock Register",            href: "/dashboard/factory/stock-register", icon: BookOpen },
      { name: "Expenses",                  href: "/dashboard/factory/expenses",      icon: CreditCard },
      { name: "Purchase Bills",            href: "/dashboard/purchase",              icon: ShoppingCart },
      { name: "Suppliers",                 href: "/dashboard/ceo/suppliers",         icon: Truck },
    ],
  },
  {
    group: "Business",
    items: [
      { name: "Products",       href: "/dashboard/ceo/products",          icon: Package },
      { name: "Invoices",       href: "/dashboard/ceo/invoices",          icon: FileText },
      { name: "Dealers",        href: "/dashboard/ceo/dealers",           icon: Users },
      { name: "Sales Team",     href: "/dashboard/admin/sales-team",      icon: UserCog },
      { name: "Approvals",      href: "/dashboard/admin/approvals",       icon: CheckSquare },
    ],
  },
  {
    group: "People",
    items: [
      { name: "Employees",      href: "/dashboard/employees",             icon: UserCheck },
      { name: "Painters",       href: "/dashboard/admin/painters",        icon: Paintbrush },
    ],
  },
];

const FACTORY_NAV: NavGroup[] = [
  {
    group: "Dashboard",
    items: [
      { name: "Dashboard",      href: "/dashboard/factory",               icon: LayoutDashboard },
    ],
  },
  {
    group: "Operations",
    items: [
      { name: "Production",                href: "/dashboard/factory/production",    icon: Factory },
      { name: "Raw materials & inventory", href: "/dashboard/factory/inventory",     icon: Warehouse },
      { name: "Stock Register",            href: "/dashboard/factory/stock-register", icon: BookOpen },
      { name: "Expenses",                  href: "/dashboard/factory/expenses",      icon: CreditCard },
    ],
  },
];

const DEALER_NAV: NavGroup[] = [
  {
    group: "Dashboard",
    items: [
      { name: "Dashboard",        href: "/dashboard/dealer",                         icon: LayoutDashboard },
    ],
  },
  {
    group: "Customers",
    items: [
      { name: "Customers",        href: "/dashboard/dealer/customers",               icon: Users },
      { name: "Projects",         href: "/dashboard/dealer/customers/projects",      icon: ClipboardList },
      { name: "House Color Studio", href: "/dashboard/dealer/customers/color-studio", icon: Paintbrush },
    ],
  },
  {
    group: "Sales",
    items: [
      { name: "Invoices",         href: "/dashboard/dealer/sales/invoices",          icon: FileText },
      { name: "Quotations",       href: "/dashboard/dealer/sales/quotations",        icon: Receipt },
      { name: "POS Billing",      href: "/dashboard/dealer/sales/pos",               icon: Calculator },
      { name: "Payments",         href: "/dashboard/dealer/sales/payments",          icon: CreditCard },
    ],
  },
  {
    group: "Purchase",
    items: [
      { name: "Purchase Bills",   href: "/dashboard/dealer/purchase/bills",          icon: ShoppingCart },
      { name: "Suppliers",        href: "/dashboard/dealer/purchase/suppliers",      icon: Truck },
      { name: "Factory Orders",   href: "/dashboard/dealer/purchase/factory-orders", icon: ArrowUpCircle },
    ],
  },
  {
    group: "Products",
    items: [
      { name: "Products",         href: "/dashboard/dealer/products/list",           icon: Package },
      { name: "Inventory",        href: "/dashboard/dealer/products/inventory",      icon: Warehouse },
      { name: "Stock Register",   href: "/dashboard/dealer/products/stock-register", icon: BookOpen },
      { name: "Warehouse",        href: "/dashboard/dealer/products/warehouse",      icon: Layers },
    ],
  },
  {
    group: "Logistics & After-Sales",
    items: [
      { name: "Logistics Tracking", href: "/dashboard/dealer/logistics/orders",      icon: Truck },
      { name: "Dispatches & Returns", href: "/dashboard/dealer/logistics/dispatches", icon: ArrowUpCircle },
      { name: "Complaints & Claims", href: "/dashboard/dealer/logistics/complaints", icon: AlertCircle },
    ],
  },

  {
    group: "Finance",
    items: [
      { name: "Revenue",          href: "/dashboard/dealer/finance/revenue",         icon: TrendingUp },
      { name: "Expenses",         href: "/dashboard/dealer/finance/expenses",        icon: Wallet },
      { name: "Profit & Loss",    href: "/dashboard/dealer/finance/pnl",             icon: LineChart },
      { name: "Cash Flow",        href: "/dashboard/dealer/finance/cash-flow",       icon: ArrowDownCircle },
      { name: "Payment Register", href: "/dashboard/dealer/finance/payments",        icon: BookMarked },
    ],
  },
  {
    group: "Painters",
    items: [
      { name: "Painters",         href: "/dashboard/dealer/painters/list",           icon: UserCheck },
      { name: "Coupons",          href: "/dashboard/dealer/painters/coupons",        icon: CheckSquare },
      { name: "Schemes",          href: "/dashboard/dealer/painters/schemes",        icon: Sparkles },
      { name: "Meetings",         href: "/dashboard/dealer/painters/meetings",       icon: CalendarDays },
      { name: "Competitions",     href: "/dashboard/dealer/painters/competitions",   icon: FileCheck },
      { name: "Portfolio Review", href: "/dashboard/dealer/painters/portfolio",      icon: FileSearch },
    ],
  },
  {
    group: "Reports",
    items: [
      { name: "Sales Reports",    href: "/dashboard/dealer/reports/sales",           icon: FileSpreadsheet },
      { name: "Inventory Reports", href: "/dashboard/dealer/reports/inventory",       icon: FileSpreadsheet },
      { name: "Finance Reports",  href: "/dashboard/dealer/reports/finance",         icon: FileBarChart },
    ],
  },
  {
    group: "Settings",
    items: [
      { name: "Shop Profile",     href: "/dashboard/dealer/settings/shop",           icon: Building },
      { name: "Business Settings", href: "/dashboard/dealer/settings/business",      icon: SlidersHorizontal },
      { name: "Application Settings", href: "/dashboard/dealer/settings/app",        icon: Settings },
    ],
  },
];

const SALESMAN_NAV: NavGroup[] = [
  {
    group: "Dashboard",
    items: [
      { name: "Dashboard",      href: "/dashboard/salesman",              icon: LayoutDashboard },
    ],
  },
  {
    group: "Work",
    items: [
      { name: "Field Visits",   href: "/dashboard/salesman/visits",       icon: CalendarDays },
      { name: "My Orders",      href: "/dashboard/salesman/orders",       icon: ClipboardList },
      { name: "Collections",    href: "/dashboard/salesman/collections",  icon: Wallet },
      { name: "Painter Network", href: "/dashboard/salesman/painters",     icon: Paintbrush },
      { name: "Customers",      href: "/dashboard/salesman/customers",    icon: Users },
      { name: "Add Customer",   href: "/dashboard/salesman/onboard",      icon: UserCheck },
    ],
  },
];

const CA_NAV: NavGroup[] = [
  {
    group: "Dashboard",
    items: [
      { name: "Dashboard",        href: "/dashboard/ca-portal",                    icon: LayoutDashboard },
    ],
  },
  {
    group: "Accounting",
    items: [
      { name: "Ledger",           href: "/dashboard/ca-portal/accounting/ledger",  icon: BookMarked },
      { name: "Cash Book",        href: "/dashboard/ca-portal/accounting/cash-book", icon: Banknote },
      { name: "Bank Book",        href: "/dashboard/ca-portal/accounting/bank-book", icon: Landmark },
      { name: "Journal",          href: "/dashboard/ca-portal/accounting/journal", icon: ScrollText },
      { name: "Receipts",         href: "/dashboard/ca-portal/accounting/receipts", icon: ArrowDownCircle },
      { name: "Payments",         href: "/dashboard/ca-portal/accounting/payments", icon: ArrowUpCircle },
      { name: "Day Book",         href: "/dashboard/ca-portal/accounting/day-book", icon: CalendarDays },
    ],
  },
  {
    group: "GST & Tax",
    items: [
      { name: "GST Dashboard",    href: "/dashboard/ca-portal/gst/dashboard",      icon: Calculator },
      { name: "Purchase Register",href: "/dashboard/ca-portal/gst/purchase-register", icon: ShoppingCart },
      { name: "Sales Register",   href: "/dashboard/ca-portal/gst/sales-register", icon: FileSpreadsheet },
      { name: "Input GST",        href: "/dashboard/ca-portal/gst/input-gst",      icon: ArrowDownCircle },
      { name: "Output GST",       href: "/dashboard/ca-portal/gst/output-gst",     icon: ArrowUpCircle },
      { name: "GST Reconciliation",href: "/dashboard/ca-portal/gst/reconciliation",icon: Scale },
      { name: "HSN Summary",      href: "/dashboard/ca-portal/gst/hsn-summary",    icon: BookMarked },
      { name: "GST Filing Center",href: "/dashboard/ca-portal/gst/filing-center",   icon: FileCheck },
      { name: "Tax Reports",      href: "/dashboard/ca-portal/gst/tax-reports",    icon: FileBarChart },
    ],
  },
  {
    group: "Audit",
    items: [
      { name: "Audit Dashboard",  href: "/dashboard/ca-portal/audit/dashboard",     icon: LayoutDashboard },
      { name: "Purchase Bills",   href: "/dashboard/ca-portal/audit/purchase-bills", icon: ShoppingCart },
      { name: "Sales Invoices",   href: "/dashboard/ca-portal/audit/sales-invoices", icon: FileText },
      { name: "Expense Register", href: "/dashboard/ca-portal/audit/expense-register", icon: CreditCard },
      { name: "Payment Register", href: "/dashboard/ca-portal/audit/payment-register", icon: Receipt },
      { name: "Stock Register",   href: "/dashboard/ca-portal/audit/stock-register", icon: Warehouse },
      { name: "Bank Statements",  href: "/dashboard/ca-portal/audit/bank-statements", icon: BookOpen },
      { name: "Audit Trail",      href: "/dashboard/ca-portal/audit/audit-trail",  icon: FileClock },
    ],
  },
  {
    group: "Reports",
    items: [
      { name: "Profit & Loss",    href: "/dashboard/ca-portal/reports/pnl",         icon: TrendingUp },
      { name: "Balance Sheet",    href: "/dashboard/ca-portal/reports/balance-sheet", icon: Scale },
      { name: "Trial Balance",    href: "/dashboard/ca-portal/reports/trial-balance", icon: BarChart2 },
      { name: "Cash Flow",        href: "/dashboard/ca-portal/reports/cash-flow",    icon: LineChart },
      { name: "Financial Reports",href: "/dashboard/ca-portal/reports/financial",    icon: FileBarChart },
      { name: "Outstanding Reports", href: "/dashboard/ca-portal/reports/outstanding", icon: AlertCircle },
      { name: "Financial Comparison", href: "/dashboard/ca-portal/reports/comparison", icon: Columns },
      { name: "Download Center",  href: "/dashboard/ca-portal/reports/downloads",    icon: Download },
    ],
  },
  {
    group: "Documents",
    items: [
      { name: "Company Documents",href: "/dashboard/ca-portal/documents/company",   icon: FolderOpen },
      { name: "GST Files",        href: "/dashboard/ca-portal/documents/gst-files", icon: FileCheck },
      { name: "Audit Files",      href: "/dashboard/ca-portal/documents/audit-files", icon: FolderArchive },
      { name: "Statements",       href: "/dashboard/ca-portal/documents/statements", icon: FileSearch },
    ],
  },
  {
    group: "Settings",
    items: [
      { name: "Profile",          href: "/dashboard/ca-portal/settings/profile",    icon: User },
      { name: "Firm Details",     href: "/dashboard/ca-portal/settings/firm",       icon: Building },
      { name: "App Settings",     href: "/dashboard/ca-portal/settings/app",        icon: SlidersHorizontal },
    ],
  },
];

const PAINTER_NAV: NavGroup[] = [
  {
    group: "Dashboard",
    items: [
      { name: "Dashboard",        href: "/dashboard/painter",                         icon: LayoutDashboard },
    ],
  },
  {
    group: "Profile",
    items: [
      { name: "My Profile",       href: "/dashboard/painter/profile",                 icon: User },
      { name: "My Portfolio",     href: "/dashboard/painter/portfolio",               icon: FileSearch },
      { name: "Achievements",     href: "/dashboard/painter/achievements",             icon: Sparkles },
    ],
  },
  {
    group: "Rewards",
    items: [
      { name: "Coupon Wallet",    href: "/dashboard/painter/rewards/coupons",         icon: CheckSquare },
      { name: "Reward Points",    href: "/dashboard/painter/rewards/points",          icon: TrendingUp },
      { name: "Cash Wallet",      href: "/dashboard/painter/rewards/cash",            icon: Wallet },
      { name: "Referral Program",  href: "/dashboard/painter/rewards/referrals",       icon: UserCog },
      { name: "Reward Store",     href: "/dashboard/painter/rewards/store",           icon: Store },
    ],
  },
  {
    group: "Work",
    items: [
      { name: "Projects",         href: "/dashboard/painter/work/projects",           icon: ClipboardList },
      { name: "AI Paint Assistant", href: "/dashboard/painter/work/ai-assistant",       icon: Paintbrush },
      { name: "House Color Studio", href: "/dashboard/painter/work/color-studio",       icon: Paintbrush },
      { name: "Material Calculator", href: "/dashboard/painter/work/calculator",        icon: Calculator },
    ],
  },
  {
    group: "Community",
    items: [
      { name: "Meetings",         href: "/dashboard/painter/community/meetings",       icon: CalendarDays },
      { name: "Schemes",          href: "/dashboard/painter/community/schemes",        icon: Sparkles },
      { name: "Competitions",     href: "/dashboard/painter/community/competitions",   icon: FileCheck },
      { name: "Leaderboard",      href: "/dashboard/painter/community/leaderboard",    icon: BarChart2 },
      { name: "Learning Center",  href: "/dashboard/painter/community/learning",       icon: BookOpen },
    ],
  },
  {
    group: "Account",
    items: [
      { name: "Notifications",    href: "/dashboard/painter/account/notifications",   icon: AlertCircle },
      { name: "Support",          href: "/dashboard/painter/account/support",         icon: UserCog },
      { name: "Settings",         href: "/dashboard/painter/account/settings",        icon: Settings },
    ],
  },
];

const NAV_MAP: Record<string, NavGroup[]> = {
  ceo:         CEO_NAV,
  cofounder:   COFOUNDER_NAV,
  factory:     FACTORY_NAV,
  dealer:      DEALER_NAV,
  salesman:    SALESMAN_NAV,
  ca:          CA_NAV,
  "ca-portal": CA_NAV,
  painter:     PAINTER_NAV,
};


// ─── Component ────────────────────────────────────────────────────────────────
interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  const groups = NAV_MAP[role] ?? CEO_NAV;

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Keyboard shortcut: [ toggles sidebar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "[") && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const active = document.activeElement?.tagName;
        if (active !== "INPUT" && active !== "TEXTAREA") {
          setIsCollapsed(prev => !prev);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isActive = (href: string) => {
    if (!mounted) return false;
    const basePaths = ["/dashboard/ceo", "/dashboard/cofounder"];
    if (basePaths.includes(href)) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-5 left-4 z-50 p-2 rounded-xl bg-background/90 backdrop-blur-sm border border-border shadow-sm text-foreground"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        suppressHydrationWarning
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className={`
          fixed lg:relative top-0 left-0 z-40 h-full shrink-0
          flex flex-col bg-background border-r border-border
          overflow-hidden
          ${isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
          transition-transform lg:transition-none duration-250
        `}
      >
        {/* Navigation — starts from top, no wasted header space */}
        <nav className="flex-1 overflow-y-auto pt-4 pb-2 px-2 space-y-1">
          {groups.map((group, gi) => (
            <div key={gi} className="mb-3">
              {/* Group label */}
              {!isCollapsed && group.group !== "Dashboard" && (
                <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.12em] px-3 mb-1 mt-2">
                  {t(group.group)}
                </p>
              )}
              {isCollapsed && group.group !== "Dashboard" && gi > 0 && (
                <div className="h-px bg-border/60 my-2 mx-2" />
              )}

              {/* Items */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href + item.name}
                      href={item.href}
                      title={isCollapsed ? t(item.name) : undefined}
                      className={`
                        relative flex items-center rounded-lg transition-all duration-150 group
                        ${isCollapsed
                          ? "justify-center w-10 h-10 mx-auto"
                          : "gap-2.5 px-3 py-2"
                        }
                        ${active
                          ? "bg-primary/8 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }
                      `}
                    >
                      {/* Active indicator strip */}
                      {active && !isCollapsed && (
                        <motion.div
                          layoutId={`nav-active-${role}`}
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-primary"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      {active && isCollapsed && (
                        <span className="absolute inset-0 rounded-lg bg-primary/10" />
                      )}

                      <Icon
                        size={15}
                        className={`shrink-0 relative z-10 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                      />
                      {!isCollapsed && (
                        <span className="text-[12px] font-semibold truncate relative z-10">
                          {t(item.name)}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: status + collapse toggle */}
        <div className="border-t border-border shrink-0">
          {!isCollapsed ? (
            <div className="px-3 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-medium">{t("System Online")}</span>
              </div>
              <button
                onClick={() => setIsCollapsed(true)}
                title="Collapse sidebar ([ key)"
                className="hidden lg:flex p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft size={13} />
              </button>
            </div>
          ) : (
            <div className="py-3 flex flex-col items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <button
                onClick={() => setIsCollapsed(false)}
                title="Expand sidebar ([ key)"
                className="hidden lg:flex p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
