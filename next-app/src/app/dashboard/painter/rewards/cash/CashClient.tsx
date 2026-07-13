"use client";

import React, { useState } from "react";
import { Wallet, HelpCircle, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";

interface Props {
  initialData: {
    profile: {
      total_tokens: number;
    };
    ledger: {
      id: string;
      transaction_type: string;
      amount: number;
      created_at: string;
    }[];
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export function CashClient({ initialData }: Props) {
  const [profile] = useState(initialData.profile);
  const [ledger] = useState(initialData.ledger);
  const cashWallet = Number(profile.total_tokens || 0) * 1.5; // ₹1.5 conversion rate

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Rewards</span><span className="opacity-40">/</span><span className="text-foreground">Cash Wallet</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Cash Wallet</h1>
      </div>

      {/* Cash Wallet Card */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-muted-foreground uppercase">Available Cash Balance</span>
            <p className="text-2xl font-black text-foreground font-mono mt-1">{fmt(cashWallet)}</p>
          </div>
          <Wallet size={26} className="text-emerald-500" />
        </div>

        <div className="border-t border-border/40 pt-4 flex gap-2 justify-end">
          <button onClick={() => alert("Bank transfer request submitted to dealer approval.")} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer">
            Transfer to Bank
          </button>
        </div>
      </div>

      {/* Cash Ledger */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Wallet History</h3>
        {ledger.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">No recent wallet transactions.</p>
        ) : ledger.map((item) => (
          <div key={item.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg"><ArrowUpRight size={13} /></div>
              <div>
                <p className="font-bold text-foreground">{item.transaction_type}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{new Date(item.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <span className="font-mono font-bold text-emerald-600">+{fmt(item.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
