"use client";

import React, { useState, useTransition } from "react";
import { ClipboardList, Check, Search, Sparkles, X, PlusCircle } from "lucide-react";
import { verifyDealerCoupon } from "../../actions";

interface Coupon {
  id: string;
  painter: string;
  code: string;
  amount: number;
  status: string;
  date: string;
}

interface Props {
  initialData: Coupon[];
  painters: { id: string; name: string }[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export function CouponsAuditingClient({ initialData, painters }: Props) {
  const [list, setList] = useState<Coupon[]>(initialData);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = list.filter(c => {
    return !search || c.painter.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
  });

  const handleApprove = (c: Coupon) => {
    startTransition(async () => {
      const res = await verifyDealerCoupon(c);
      if (res.success) {
        setList(prev => prev.map(item => {
          if (item.id === c.id) {
            return { ...item, status: "Approved" };
          }
          return item;
        }));
      } else {
        alert(res.error || "Failed to approve coupon");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Painters</span><span className="opacity-40">/</span><span className="text-foreground">Coupons</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><ClipboardList size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Coupon Auditing</h1>
              <p className="text-xs text-muted-foreground">Verify coupon scan logs from contractor painters and award cashback balances</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Coupon Tracker:</span> Identified {list.filter(c => c.status === "Pending").length} scans awaiting dealer validation.
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm text-xs text-foreground">
        <Search size={13} className="text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by painter or coupon code..." className="flex-1 bg-transparent outline-none" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Scan Date</th>
                <th className="px-4 py-3">Coupon Code</th>
                <th className="px-4 py-3">Contractor Painter</th>
                <th className="px-4 py-3 text-right">Points / Cash value</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No coupon scans logged.</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground font-mono">{c.date}</td>
                  <td className="px-4 py-3 font-mono font-bold text-foreground">{c.code}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{c.painter}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-foreground">{fmt(c.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase font-mono ${
                      c.status === "Approved" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      {c.status === "Pending" ? (
                        <button disabled={isPending} onClick={() => handleApprove(c)} className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors">
                          <Check size={11} /> Approve
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-mono">Cleared ✓</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
