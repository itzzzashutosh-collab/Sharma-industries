"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "./LanguageProvider";
import {
  LayoutDashboard,
  LineChart,
  Users,
  CheckSquare,
  ShoppingCart,
  Store,
  Wallet,
  Receipt,
  Menu,
  X,
  UserSquare2,
  Boxes,
  BookOpen,
  Wrench,
  FileText,
  Settings,
  Factory,
  Package,
  Box,
  Crosshair,
  Scale,
  UserPlus,
} from "lucide-react";

type Role = "ceo" | "dealer" | "salesman" | "ca";

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  // Define navigation items based on role
  const navLinks = {
    ceo: [
      { name: "Command Center", href: "/dashboard/ceo", icon: LayoutDashboard },
      { name: "Smart Invoicing", href: "/dashboard/ceo/invoices", icon: FileText },
      { name: "Company Quotations", href: "/dashboard/ceo/quotations", icon: FileText },
      { name: "Order Book & Dispatch", href: "/dashboard/admin/orders", icon: Package },
      { name: "Company Products", href: "/dashboard/ceo/products", icon: Package },
      { name: "Purchase History", href: "/dashboard/purchase", icon: ShoppingCart },
      { name: "Suppliers Registry", href: "/dashboard/ceo/suppliers", icon: Users },
      { name: "Inventory", href: "/dashboard/factory/inventory", icon: Boxes },
      { name: "Batch Management", href: "/dashboard/factory/production", icon: Wrench },
      { name: "Factory Expenses", href: "/dashboard/factory/expenses", icon: Receipt },
      { name: "Factory Cash Flow", href: "/dashboard/ceo/cash-flow", icon: LineChart },
      { name: "Team & HR", href: "/dashboard/employees", icon: Users },
      { name: "Salesmen Management", href: "/dashboard/admin/sales-team", icon: Users },
      { name: "Traceability & Token Engine", href: "/dashboard/admin/approvals", icon: CheckSquare },
      { name: "Painters Directory", href: "/dashboard/admin/painters", icon: Users },
      { name: "Market Intelligence", href: "/dashboard/ceo/market-intelligence", icon: LineChart },
      { name: "Competitors", href: "/dashboard/ceo/competitors", icon: Crosshair },
      { name: "All Dealers", href: "/dashboard/ceo/dealers", icon: Users },
      { name: "Company Settings", href: "/dashboard/ceo/settings", icon: Settings },
    ],
    ca: [
      { name: "Command Center", href: "/dashboard/ca-portal", icon: LayoutDashboard },
      { name: "Sales Ledger", href: "/dashboard/ca-portal/sales", icon: FileText },
    ],
    dealer: [
      { name: "New POS Bill", href: "/dashboard/dealer/pos", icon: ShoppingCart },
      { name: "Storefront", href: "/dashboard/dealer/store", icon: Store },
      { name: "My P&L", href: "/dashboard/dealer/pnl", icon: LineChart },
      { name: "Expense Tracker", href: "/dashboard/dealer/expenses", icon: Wallet },
    ],
    salesman: [
      { name: "Dashboard", href: "/dashboard/salesman", icon: LayoutDashboard },
      { name: "My Orders", href: "/dashboard/salesman/orders", icon: Receipt },
      { name: "Partners", href: "/dashboard/salesman/customers", icon: UserSquare2 },
    ],
  };

  const links = navLinks[role] || navLinks.salesman;

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md border border-border/50 text-foreground shadow-md hover:bg-background transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-full w-64 shrink-0 flex flex-col transition-transform duration-300 ease-in-out border-r border-border/40 lg:border-r-0 shadow-2xl lg:shadow-none bg-gradient-to-b from-[#f5e6fd] via-[#e8f0fe] to-[#fdfbfb] dark:from-[#1c1c1e] dark:to-[#1c1c1e] lg:bg-transparent lg:bg-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top spacer so nav doesn't start at absolute top on mobile */}
        <div className="h-16 lg:h-4" />

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)} // Close on mobile after click
                className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-colors duration-200 ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                }`}
              >
                <Icon
                  size={18}
                  className="shrink-0"
                />
                {t(link.name)}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-sidebar-foreground/50">{t("System Online")}</span>
          </div>
          <LanguageToggle />
        </div>
        <div className="px-5 py-3 text-[11px] text-sidebar-foreground/30">
          © {new Date().getFullYear()} Sharma Industries
        </div>
      </aside>
    </>
  );
}
