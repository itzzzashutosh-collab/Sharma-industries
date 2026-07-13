"use client";

import React, { useState, useTransition } from "react";
import { Store, ShieldAlert, Sparkles, Plus, Image as ImageIcon, Camera, CheckCircle2, ChevronRight, X, Calendar } from "lucide-react";

interface Dealer {
  id: string;
  name: string;
}

interface BrandingItem {
  id: string;
  dealer_name: string;
  item_type: string;
  status: string;
  last_inspected: string;
}

interface Props {
  initialData: {
    dealers: Dealer[];
    branding: BrandingItem[];
  };
}

export function BrandingClient({ initialData }: Props) {
  const [branding, setBranding] = useState<BrandingItem[]>(initialData.branding);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState("");
  const [itemType, setItemType] = useState("Glow Sign Board");
  const [remarks, setRemarks] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealer) {
      alert("Please select a dealer.");
      return;
    }

    startTransition(async () => {
      const dealerObj = initialData.dealers.find(d => d.id === selectedDealer);
      const newItem: BrandingItem = {
        id: `BRAND_${Date.now()}`,
        dealer_name: dealerObj?.name || "Dealer",
        item_type: itemType,
        status: "Requested",
        last_inspected: new Date().toISOString().slice(0, 10)
      };

      setBranding(prev => [newItem, ...prev]);
      setShowRequestModal(false);
      alert(`Marketing branding request for ${itemType} submitted successfully!`);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground font-sans">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Salesman Workspace</span><span className="opacity-40">/</span><span className="text-foreground">Branding</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Shop Branding & Visibility</h1>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 bg-card border border-border rounded-3xl p-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-[9px] font-black text-muted-foreground uppercase">Branded Outlets</span>
          <p className="text-lg font-black text-foreground font-mono">14 shops</p>
        </div>
        <div className="space-y-1 text-right">
          <span className="text-[9px] font-black text-muted-foreground uppercase">Visibility score</span>
          <p className="text-lg font-black text-emerald-600 font-mono">88% (Good)</p>
        </div>
      </div>

      {/* AI Assistant Coach */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex gap-3 bg-primary/5">
        <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-muted-foreground">
          <p className="font-bold text-foreground">AI Branding Advisor</p>
          <p>• Shree Ram Paints' outdoor sign board is over 2 years old and showing sun damage. Suggest a replacement ACP Glow Sign request today.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button onClick={() => setShowRequestModal(true)} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer">
          <Plus size={14} /> Request Branding Materials
        </button>
      </div>

      {/* Active Installations */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Store size={14} className="text-primary" /> Active Signboards & Displays</h3>
        {branding.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">No branding items registered.</p>
        ) : branding.map((item) => (
          <div key={item.id} className="bg-card border border-border rounded-2xl p-4 space-y-3.5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-foreground text-xs">{item.dealer_name}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.item_type}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase font-mono ${
                item.status === "Installed" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              }`}>
                {item.status}
              </span>
            </div>
            <div className="border-t border-border/40 pt-3 flex justify-between items-center text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar size={11} /> Inspected: {item.last_inspected}</span>
              <button onClick={() => alert("Simulating upload of shop photo verification...")} className="flex items-center gap-1 text-primary font-bold hover:underline">
                <Camera size={11} /> Upload Photo
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Request Material Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in scale-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Store size={14} className="text-primary" /> Request Branding Item</h3>
              <button onClick={() => setShowRequestModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <form onSubmit={handleRequestSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Select Dealer</label>
                <select value={selectedDealer} onChange={e => setSelectedDealer(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                  <option value="">-- Choose Dealer --</option>
                  {initialData.dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Branding Material / Type</label>
                <select value={itemType} onChange={e => setItemType(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors">
                  <option value="Glow Sign Board">Glow Sign Board</option>
                  <option value="ACP Sign Board">ACP Sign Board</option>
                  <option value="Color Shade Cards">Color Shade Cards</option>
                  <option value="Product Display Rack">Product Display Rack</option>
                  <option value="Brochures / Catalogues">Brochures / Catalogues</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Remarks / Dimensions</label>
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="E.g. Dimensions 10x4 ft, front facade replacement" rows={3} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-foreground transition-colors resize-none" />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowRequestModal(false)} className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                  {isPending ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
