"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCircle2, AlertCircle, Clock, Package, UserCheck, FileText, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface AppNotification {
  id: string;
  type: "warning" | "info" | "success" | "error";
  title: string;
  desc: string;
  href?: string;
  time: string;
}

const TYPE_CONFIG = {
  warning: { icon: AlertCircle,  color: "text-amber-500",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
  error:   { icon: AlertCircle,  color: "text-rose-500",    bg: "bg-rose-500/10",    border: "border-rose-500/20" },
  success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  info:    { icon: Clock,        color: "text-primary",     bg: "bg-primary/10",     border: "border-primary/20" },
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);


  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load dismissed from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("dismissed_notifications");
      if (raw) setDismissed(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  // Fetch live notifications from multiple sources
  const fetchNotifications = async () => {
    setLoading(true);
    const items: AppNotification[] = [];

    try {
      // 1. Unpaid invoices
      const invRes = await fetch("/api/invoices");
      const invData = await invRes.json();
      if (invData.success && invData.data) {
        const unpaid = invData.data.filter((i: any) => i.balance_due > 0);
        const totalDue = unpaid.reduce((s: number, i: any) => s + i.balance_due, 0);
        if (unpaid.length > 0) {
          items.push({
            id: "unpaid-invoices",
            type: "warning",
            title: `${unpaid.length} Unpaid Invoice${unpaid.length > 1 ? "s" : ""}`,
            desc: `₹${totalDue.toLocaleString("en-IN")} total outstanding balance`,
            href: "/dashboard/ceo/invoices",
            time: "Now",
          });
        }
      }
    } catch {}

    try {
      // 2. Pending dealer approvals
      const approvalRes = await fetch("/api/admin/approve");
      const approvalData = await approvalRes.json();
      if (approvalData.success && approvalData.data) {
        const pending = approvalData.data.filter((d: any) => d.approval_status === "PENDING");
        if (pending.length > 0) {
          items.push({
            id: "pending-approvals",
            type: "info",
            title: `${pending.length} Dealer Approval${pending.length > 1 ? "s" : ""} Pending`,
            desc: "New dealer registrations waiting for your review",
            href: "/dashboard/ceo/approvals",
            time: "Today",
          });
        }
      }
    } catch {}

    try {
      // 3. Products / inventory check
      const prodRes = await fetch("/api/products");
      const prodData = await prodRes.json();
      if (prodData.success && prodData.data) {
        const lowStock = prodData.data.filter((p: any) =>
          p.stock !== undefined && p.stock !== null && Number(p.stock) < 50
        );
        if (lowStock.length > 0) {
          items.push({
            id: "low-stock",
            type: "error",
            title: `${lowStock.length} Product${lowStock.length > 1 ? "s" : ""} Low Stock`,
            desc: `${lowStock.slice(0, 2).map((p: any) => p.product_name).join(", ")}${lowStock.length > 2 ? " & more" : ""} running low`,
            href: "/dashboard/ceo/products",
            time: "Today",
          });
        }
      }
    } catch {}

    // 4. Static system notifications (always relevant)
    items.push({
      id: "gst-reminder",
      type: "info",
      title: "GST Filing Reminder",
      desc: "Monthly GST return due in 4 days. Review your CA portal.",
      href: "/dashboard/ca-portal",
      time: "4 days",
    });

    setNotifications(items);
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open && notifications.length === 0) fetchNotifications();
  };

  const dismiss = (id: string) => {
    const next = new Set(dismissed).add(id);
    setDismissed(next);
    localStorage.setItem("dismissed_notifications", JSON.stringify([...next]));
  };

  const dismissAll = () => {
    const next = new Set(notifications.map(n => n.id));
    setDismissed(next);
    localStorage.setItem("dismissed_notifications", JSON.stringify([...next]));
  };

  const visible = notifications.filter(n => !dismissed.has(n.id));
  const count = visible.length;

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg border border-border bg-muted/40 shrink-0" />
    );
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative w-8 h-8 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={15} />
        {count > 0 && (
          <motion.span
            suppressHydrationWarning
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-background text-[8px] font-black text-white flex items-center justify-center"
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Bell size={13} className="text-primary" />
                <span className="text-xs font-black text-foreground uppercase tracking-wider">Notifications</span>
                {count > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{count}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {count > 0 && (
                  <button
                    onClick={dismissAll}
                    className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={fetchNotifications}
                  className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="space-y-2 p-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl">
                      <div className="w-8 h-8 rounded-xl bg-muted/60 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-muted/60 rounded animate-pulse w-3/4" />
                        <div className="h-2.5 bg-muted/40 rounded animate-pulse w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <CheckCircle2 size={28} className="text-emerald-500/40 mb-2" />
                  <p className="text-xs font-bold text-foreground">All caught up!</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">No pending notifications</p>
                </div>
              ) : (
                <AnimatePresence>
                  {visible.map((n, idx) => {
                    const cfg = TYPE_CONFIG[n.type];
                    const Icon = cfg.icon;
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10, height: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="flex items-start gap-3 px-3 py-3 hover:bg-muted/40 transition-colors border-b border-border/40 last:border-0 group"
                      >
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg} ${cfg.border}`}>
                          <Icon size={14} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground leading-snug truncate">{n.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{n.desc}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-muted-foreground/60 font-medium">{n.time}</span>
                            {n.href && (
                              <Link
                                href={n.href}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-0.5 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors"
                              >
                                View <ChevronRight size={9} />
                              </Link>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => dismiss(n.id)}
                          className="p-1 text-muted-foreground/40 hover:text-muted-foreground rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border bg-muted/20">
              <Link
                href="/dashboard/ceo/approvals"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                View all activity <ChevronRight size={9} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
