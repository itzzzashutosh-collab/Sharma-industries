"use client";

import React, { useState } from "react";
import { CheckSquare, Clock, AlertTriangle, CheckCircle, Ticket } from "lucide-react";

interface Coupon {
  id: number;
  coupon_code: string;
  points: number;
  status: string;
  scanned_at: string;
  remarks: string | null;
}

interface Props {
  initialData: {
    coupons: Coupon[];
  };
}

export function CouponsClient({ initialData }: Props) {
  const [coupons] = useState(initialData.coupons);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Rewards</span><span className="opacity-40">/</span><span className="text-foreground">Coupons</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Coupon Wallet</h1>
      </div>

      {/* Coupons List */}
      <div className="space-y-4">
        {coupons.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No coupons scanned yet.</p>
        ) : coupons.map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-xs flex items-center gap-1.5">
                <Ticket size={13} className="text-primary" /> {c.coupon_code}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase font-mono border ${
                c.status === "Approved" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                c.status === "Rejected" ? "bg-red-500/10 text-red-600 border-red-500/20" :
                "bg-amber-500/10 text-amber-600 border-amber-500/20"
              }`}>
                {c.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] border-t border-border/40 pt-2 font-mono">
              <span className="text-muted-foreground">Points Value</span>
              <span className="font-bold text-foreground">{c.points} Pts</span>
            </div>

            {c.remarks && (
              <p className="text-[9px] text-muted-foreground italic bg-muted/40 p-2 rounded-lg">
                Note: {c.remarks}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
