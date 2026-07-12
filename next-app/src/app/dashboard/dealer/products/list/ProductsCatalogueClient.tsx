"use client";

import React, { useState } from "react";
import { ClipboardList, Download, Search, Sparkles, Star } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  sku_number: string;
  mrp: number;
}

interface Props {
  initialData: Product[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export function ProductsCatalogueClient({ initialData }: Props) {
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  const filtered = initialData.filter(p => {
    return !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Products</span><span className="opacity-40">/</span><span className="text-foreground">Catalogue</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><ClipboardList size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Company Product Catalogue</h1>
              <p className="text-xs text-muted-foreground">Synced catalogue from CEO Workspace • Read-only pricing rules & HSN definitions</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Product Guide:</span> Catalogue includes {initialData.length} items. Keep favorites marked for faster POS search checkouts.
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm text-xs text-foreground">
        <Search size={13} className="text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter products by brand, category or name..." className="flex-1 bg-transparent outline-none" />
      </div>

      {/* Catalogue Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6 col-span-full">No products found.</p>
        ) : filtered.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-2xl p-5 space-y-3 relative group">
            <button onClick={() => toggleFavorite(p.id)} className="absolute top-4 right-4 p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-amber-500 transition-colors">
              <Star size={14} className={favorites.includes(p.id) ? "fill-amber-500 text-amber-500" : ""} />
            </button>
            <div>
              <span className="px-2 py-0.5 rounded text-[8px] font-black border border-primary/20 bg-primary/10 text-primary uppercase">{p.category}</span>
              <h3 className="text-xs font-black text-foreground mt-2">{p.name}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">SKU: {p.sku_number}</p>
            </div>
            <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
              <span className="text-[10px] text-muted-foreground">Suggested MRP</span>
              <span className="text-xs font-black text-foreground font-mono">{fmt(p.mrp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
