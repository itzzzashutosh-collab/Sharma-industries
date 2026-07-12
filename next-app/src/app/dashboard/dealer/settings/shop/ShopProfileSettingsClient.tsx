"use client";
import React, { useState } from "react";
import { ClipboardList, Download, Search, Sparkles } from "lucide-react";

export function ShopProfileSettingsClient({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState("");
  const filtered = (initialData || []).filter(item => {
    return !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>settings</span><span className="opacity-40">/</span><span className="text-foreground">Shop Profile Settings</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><ClipboardList size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">Shop Profile Settings</h1>
              <p className="text-xs text-muted-foreground">Live dealer registry tracking log</p>
            </div>
          </div>
          <button onClick={() => alert("Exporting data...")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Insight:</span> Dynamic overview of active shop profile settings configurations.
        </div>
      </div>

      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
        <Search size={13} className="text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter search results..." className="flex-1 bg-transparent text-xs text-foreground outline-none" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 text-xs text-muted-foreground">
        {filtered.length === 0 ? (
          <p className="text-center py-6">No matching records found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.slice(0, 5).map((item, idx) => (
              <div key={idx} className="p-3 border border-border/40 hover:bg-muted/10 rounded-xl flex items-center justify-between text-foreground font-semibold">
                <span>{item.name || item.title || item.invoice_no || item.id || "Record Entry"}</span>
                <span className="text-muted-foreground font-mono text-[10px]">{item.date || item.bill_date || item.created_at || "Active"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
