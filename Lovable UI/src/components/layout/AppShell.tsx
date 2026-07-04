import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Package,
  Warehouse,
  Users,
  ShoppingCart,
  Receipt,
  UserCog,
  Wallet,
  Sun,
  Moon,
  Languages,
  Menu,
  X,
} from "lucide-react";

import { Logo } from "@/components/erp/Logo";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavItem = { to: string; icon: typeof LayoutDashboard; key: string };
type NavGroup = { titleKey: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    titleKey: "nav.group.sales",
    items: [
      { to: "/", icon: LayoutDashboard, key: "nav.dashboard" },
      { to: "/invoicing", icon: FileText, key: "nav.invoicing" },
      { to: "/dealers", icon: Users, key: "nav.dealers" },
      { to: "/ledger", icon: BookOpen, key: "nav.ledger" },
    ],
  },
  {
    titleKey: "nav.group.operations",
    items: [
      { to: "/products", icon: Package, key: "nav.products" },
      { to: "/inventory", icon: Warehouse, key: "nav.inventory" },
      { to: "/purchases", icon: ShoppingCart, key: "nav.purchases" },
    ],
  },
  {
    titleKey: "nav.group.people",
    items: [
      { to: "/expenses", icon: Receipt, key: "nav.expenses" },
      { to: "/employees", icon: UserCog, key: "nav.employees" },
      { to: "/finance", icon: Wallet, key: "nav.finance" },
    ],
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-center px-5 py-6">
        <Logo variant="light" className="h-12" />
      </div>


      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {groups.map((group) => (
          <div key={group.titleKey}>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              {t(group.titleKey)}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active =
                  item.to === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    <span>{t(item.key)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-5 py-4 text-[11px] text-sidebar-foreground/40">
        © {new Date().getFullYear()} Sharma Industries
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-sidebar">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-2 justify-self-start">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          <div className="justify-self-center">
            <Logo className="h-9 lg:h-10" />
          </div>


          <div className="flex items-center gap-2 justify-self-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="gap-2"
              aria-label={t("common.language")}
            >
              <Languages className="h-4 w-4" />
              <span className="font-semibold">
                {lang === "en" ? "EN" : "हिं"}
              </span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label={t("common.theme")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
