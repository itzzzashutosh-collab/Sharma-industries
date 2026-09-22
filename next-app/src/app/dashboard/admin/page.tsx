import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Shield, ClipboardList, Paintbrush, UserCog, CheckSquare, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Operations Portal | Sharma Industries",
  description: "Central Administration Hub for Approvals, Orders, Painters, and Sales Operations",
};

export default function AdminRootPage() {
  const adminCards = [
    {
      title: "CEO Approvals Desk",
      desc: "Authorize pending dealer applications, employee onboarding, and sensitive actions.",
      href: "/dashboard/admin/approvals",
      icon: CheckSquare,
      badge: "CEO Authority",
      color: "text-amber-500 border-amber-500/20 bg-amber-500/5",
    },
    {
      title: "Master Order Book",
      desc: "Live order processing, dispatch status, LR/bilty updates, and invoice generation.",
      href: "/dashboard/admin/orders",
      icon: ClipboardList,
      badge: "Operations",
      color: "text-blue-500 border-blue-500/20 bg-blue-500/5",
    },
    {
      title: "Painters Directory & KYC",
      desc: "Registered applicators, Painters Growth Token points balance, and loyalty redemptions.",
      href: "/dashboard/admin/painters",
      icon: Paintbrush,
      badge: "Community",
      color: "text-pink-500 border-pink-500/20 bg-pink-500/5",
    },
    {
      title: "Sales Team & Quotas",
      desc: "Field executive performance, territory visit tracking, and monthly 200 bags quota benchmarks.",
      href: "/dashboard/admin/sales-team",
      icon: UserCog,
      badge: "Sales Force",
      color: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              <Shield className="w-3.5 h-3.5" />
              Administrative Operations Hub
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            System Administration
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Central portal for operational authorizations, order verification, sales force tracking, and contractor relations.
          </p>
        </div>

        <Link
          href="/dashboard/ceo"
          className="px-4 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:border-primary transition-all"
        >
          ← Return to CEO Center
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary shadow-sm hover:shadow-md transition-all group flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl border ${card.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-semibold text-primary">
                <span>Access Management Portal</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
