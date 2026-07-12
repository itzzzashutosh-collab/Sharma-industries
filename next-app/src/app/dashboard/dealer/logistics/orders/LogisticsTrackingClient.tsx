"use client";

import React, { useState } from "react";
import { ClipboardList, Truck, Search, Sparkles, Navigation } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  date: string;
  total_amount: number;
  status: string;
}

interface Props {
  initialData: Order[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export function LogisticsTrackingClient({ initialData }: Props) {
  const [search, setSearch] = useState("");

  const filtered = initialData.filter(o => {
    return !search || o.customer_name.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Logistics</span><span className="opacity-40">/</span><span className="text-foreground">Orders</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Truck size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Order Logistics Tracking</h1>
              <p className="text-xs text-muted-foreground">Monitor the lifecycles, transit status, and delivery milestones of pending orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Logistics Advisor:</span> Syncing {initialData.length} total orders across factory dispatch streams.
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm text-xs text-foreground">
        <Search size={13} className="text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter orders by customer or reference code..." className="flex-1 bg-transparent outline-none" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Order Date</th>
                <th className="px-4 py-3">Recipient Customer</th>
                <th className="px-4 py-3 text-right">Consignment Value</th>
                <th className="px-4 py-3 text-center">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No orders logged.</td></tr>
              ) : filtered.map((o) => (
                <tr key={o.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-foreground">{o.id}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{o.date}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{o.customer_name}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-foreground">{fmt(o.total_amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase font-mono ${
                      o.status === "delivered" || o.status === "Delivered" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }`}>
                      {o.status || "Pending"}
                    </span>
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
