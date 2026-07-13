"use client";

import React, { useState, useTransition } from "react";
import { Store, Tag, Gift, Award, CheckCircle, Search, Wallet, Clock, Sparkles } from "lucide-react";
import { redeemCatalogReward } from "../../actions";

interface CatalogItem {
  id: string;
  name: string;
  points: number;
  category: string;
}

interface Props {
  initialData: {
    profile: {
      total_tokens: number;
    };
    catalog: CatalogItem[];
    ledger: { id: string; transaction_type: string; amount: number; created_at: string }[];
  };
}

export function StoreClient({ initialData }: Props) {
  const [profile, setProfile] = useState(initialData.profile);
  const [catalog] = useState(initialData.catalog);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isPending, startTransition] = useTransition();

  const handleRedeem = (item: CatalogItem) => {
    if (profile.total_tokens < item.points) {
      alert("Insufficient points in reward points wallet.");
      return;
    }

    if (!confirm(`Are you sure you want to redeem 1x ${item.name} for ${item.points} points?`)) {
      return;
    }

    startTransition(async () => {
      const res = await redeemCatalogReward(item.id, item.points);
      if (res.success) {
        alert("Redemption order placed! Standard dispatch delivery takes 3-5 business days.");
        setProfile(p => ({ ...p, total_tokens: p.total_tokens - item.points }));
      } else {
        alert(res.error || "Failed to redeem reward");
      }
    });
  };

  const categories = ["All", "Merchandise", "Tools", "Safety", "Training"];
  const filteredCatalog = selectedCategory === "All" 
    ? catalog 
    : catalog.filter(item => item.category === selectedCategory);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Rewards</span><span className="opacity-40">/</span><span className="text-foreground">Marketplace</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Redemption Marketplace</h1>
      </div>

      {/* Wallet Balance Info */}
      <div className="bg-card border border-border rounded-3xl p-4 flex justify-between items-center shadow-sm">
        <div className="space-y-1">
          <span className="text-[9px] font-black text-muted-foreground uppercase">Points Balance</span>
          <p className="text-lg font-black text-foreground font-mono">{profile.total_tokens} Pts</p>
        </div>
        <div className="space-y-1 text-right">
          <span className="text-[9px] font-black text-muted-foreground uppercase">Cash Equivalent</span>
          <p className="text-lg font-black text-emerald-600 font-mono">₹{(profile.total_tokens * 1.5).toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Store Advisor:</span> You qualify for the Gold Partner premium training vouchers this week!
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3.5 py-1.5 rounded-full font-bold text-[10px] border transition-all cursor-pointer ${
            selectedCategory === cat 
              ? "bg-primary border-primary text-white" 
              : "bg-card border-border text-muted-foreground hover:bg-muted/10"
          }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Catalog items */}
      <div className="grid grid-cols-2 gap-4">
        {filteredCatalog.map((item) => {
          const canAfford = profile.total_tokens >= item.points;
          return (
            <div key={item.id} className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-sm">
              <div className="space-y-1.5">
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black border border-primary/20 bg-primary/10 text-primary uppercase">{item.category}</span>
                <h3 className="font-bold text-foreground line-clamp-2">{item.name}</h3>
              </div>
              <div className="space-y-2">
                <p className="font-mono font-bold text-foreground text-xs">{item.points} Pts</p>
                <button onClick={() => handleRedeem(item)} disabled={!canAfford || isPending} className={`w-full py-2 font-bold rounded-xl text-center text-[10px] transition-all cursor-pointer ${
                  canAfford ? "bg-primary text-white hover:opacity-90" : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}>
                  {canAfford ? "Redeem Item" : "Insufficient Points"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
