"use client";

import { useState, useEffect } from "react";
import { Store, Building2, Building, Paintbrush, FileText, Users, MapPin, TrendingUp } from "lucide-react";
import { CRMStatsCard } from "@/components/crm/CRMStatsCard";
import Link from "next/link";

interface Stats {
  [key: string]: number;
}

export default function CRMHubClient() {
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/crm/stats')
      .then(res => res.json())
      .then(json => {
        if (json.success) setStats(json.stats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    {
      key: 'india-dealers',
      label: 'Pan-India Dealers',
      subtitle: 'Paint retailers, hardware & building material shops',
      icon: Store,
      color: '#3b82f6',
      href: '/dashboard/crm/dealers',
    },
    {
      key: 'india-architects',
      label: 'Architects',
      subtitle: 'Commercial, residential & luxury specialists',
      icon: Building2,
      color: '#8b5cf6',
      href: '/dashboard/crm/architects',
    },
    {
      key: 'india-builders',
      label: 'Builders & Developers',
      subtitle: 'Tier-1 to regional construction companies',
      icon: Building,
      color: '#f59e0b',
      href: '/dashboard/crm/builders',
    },
    {
      key: 'india-designers',
      label: 'Interior Designers',
      subtitle: 'Turnkey execution & design studios',
      icon: Paintbrush,
      color: '#ec4899',
      href: '/dashboard/crm/designers',
    },
    {
      key: 'india-tenders',
      label: 'Government Tenders',
      subtitle: 'Paint & coating procurement tenders',
      icon: FileText,
      color: '#10b981',
      href: '/dashboard/crm/tenders',
    },
    {
      key: 'rajasthan-dealers',
      label: 'Rajasthan Dealers',
      subtitle: 'Home territory — district-wise mapping',
      icon: MapPin,
      color: '#f97316',
      href: '/dashboard/crm/dealers?tab=rajasthan',
    },
    {
      key: 'verified-dealers',
      label: 'Verified Dealers',
      subtitle: 'Pre-qualified, field-verified dealer network',
      icon: Users,
      color: '#06b6d4',
      href: '/dashboard/crm/dealers?tab=verified',
    },
    {
      key: 'rajasthan-builders',
      label: 'Rajasthan Builders',
      subtitle: 'Local Rajasthan construction companies',
      icon: TrendingUp,
      color: '#84cc16',
      href: '/dashboard/crm/builders?tab=rajasthan',
    },
  ];

  const totalRecords = Object.values(stats).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Market Intelligence Hub</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pan-India dealer, architect, builder & designer database — {loading ? '...' : <strong>{totalRecords.toLocaleString('en-IN')}</strong>} total records
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <CRMStatsCard
            key={cat.key}
            icon={cat.icon}
            label={cat.label}
            count={loading ? -1 : (stats[cat.key] || 0)}
            color={cat.color}
            href={cat.href}
            subtitle={cat.subtitle}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-border bg-muted/10 p-6">
        <h2 className="text-sm font-black text-foreground mb-4 uppercase tracking-wider">Quick Navigation</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.slice(0, 5).map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.key}
                href={cat.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-background hover:shadow-md hover:border-primary/20 transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}12` }}>
                  <Icon size={18} style={{ color: cat.color }} />
                </div>
                <span className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
