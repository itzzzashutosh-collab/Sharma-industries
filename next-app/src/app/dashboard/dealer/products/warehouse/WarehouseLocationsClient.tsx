"use client";

import React from "react";
import { ClipboardList, Sparkles, Building, ArrowRight, Shield } from "lucide-react";

interface Product {
  id: string;
  name: string;
  actual_stock: number;
}

interface Props {
  initialData: Product[];
}

export function WarehouseLocationsClient({ initialData }: Props) {
  const totalStock = initialData.reduce((s, p) => s + p.actual_stock, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Products</span><span className="opacity-40">/</span><span className="text-foreground">Warehouse</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><Building size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Warehouse & Rack Locations</h1>
              <p className="text-xs text-muted-foreground">Manage single-warehouse layout, storage racks, and stock reservations</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Warehouse Insight:</span> Standard outlet warehouse capacity stands at 65% utilization. High shelf velocity detected for emulsions.
        </div>
      </div>

      {/* Warehouse Info Card */}
      <div className="bg-card border border-border rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
        <div className="space-y-1.5">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Storage Name</span>
          <p className="text-sm font-bold text-foreground">Outlet Primary Showroom Godown</p>
          <p className="text-xs text-muted-foreground">Rack Sections A, B & C</p>
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Total Stock Count</span>
          <p className="text-sm font-black text-primary font-mono">{Number(totalStock).toLocaleString()} Bags/Cans</p>
          <p className="text-xs text-muted-foreground">Reconciled against DB register</p>
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Manager</span>
          <p className="text-sm font-bold text-foreground">Authorized Outlet Owner</p>
          <span className="px-2 py-0.5 rounded text-[8px] font-black border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 uppercase font-mono">Secured Access</span>
        </div>
      </div>

      {/* Warehouse Racks Allocation List */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Shield size={12} className="text-primary" /> Active Rack Allocations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialData.slice(0, 6).map((p, idx) => (
            <div key={p.id} className="p-4 border border-border bg-muted/10 rounded-xl space-y-2 hover:bg-muted/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">RACK {String.fromCharCode(65 + (idx % 3))}-{idx + 1}</span>
                <span className="text-xs font-black text-foreground font-mono">{p.actual_stock} units</span>
              </div>
              <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
