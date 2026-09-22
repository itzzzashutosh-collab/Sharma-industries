"use client";

import { type LucideIcon } from "lucide-react";

interface CRMStatsCardProps {
  icon: LucideIcon;
  label: string;
  count: number;
  color: string;
  href?: string;
  subtitle?: string;
}

export function CRMStatsCard({ icon: Icon, label, count, color, href, subtitle }: CRMStatsCardProps) {
  const Wrapper = href ? 'a' : 'div';

  return (
    <Wrapper
      {...(href ? { href } : {})}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-background p-5 transition-all duration-200 ${
        href ? 'hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5 cursor-pointer' : ''
      }`}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"
        style={{ background: `linear-gradient(135deg, ${color}, transparent)` }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-black text-foreground tracking-tight">
            {count >= 0 ? count.toLocaleString('en-IN') : '—'}
          </p>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
    </Wrapper>
  );
}
