"use client";

import React, { useState, useTransition } from "react";
import { Store, Tag, Gift, Award, CheckCircle } from "lucide-react";
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
  };
}

export function StoreClient({ initialData }: Props) {
  const [profile, setProfile] = useState(initialData.profile);
  const [catalog] = useState(initialData.catalog);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Rewards</span><span className="opacity-40">/</span><span className="text-foreground">Store</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-foreground">Reward Store</h1>
          <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2.5 py-1 rounded-xl font-black font-mono">
            {profile.total_tokens} Pts Available
          </span>
        </div>
      </div>

      {/* Catalog items */}
      <div className="grid grid-cols-2 gap-4">
        {catalog.map((item) => {
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
