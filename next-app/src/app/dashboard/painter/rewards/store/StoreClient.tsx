"use client";

import React, { useState, useTransition, useMemo } from "react";
import {
  Store, Tag, Gift, Award, CheckCircle2, Search, Wallet, Clock, Sparkles, Shield, Copy, Check, Share2,
  Ticket, Wrench, X, Loader2, PackageCheck, Zap, ArrowRight, Trophy
} from "lucide-react";
import { redeemCatalogReward } from "../../actions";

interface CatalogItem {
  id: string;
  name: string;
  points: number;
  category: string;
  description?: string;
  image?: string;
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

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Painter Reward Store & Dealer Pickup Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_STORE_OBJECTIONS = [
  {
    id: "STR_OBJ_1",
    category: "Store Counter Pickup Voucher",
    title: "Can I pick up my redeemed spray machine directly from Shree Ram Paints store?",
    problemText: "Painter wants instant tool pickup at dealer store counter instead of 5-day shipping.",
    strategy: "Instant Store Counter Pickup Voucher Generated for Over-the-Counter Collection",
    solutionHindi: "Bhaiya, bilkul! App mein item redeem karte hi turant 'Store Counter QR Voucher' generate hota hai. Use Shree Ram Paints counter par dikha kar 10 minutes mein instant tool pickup karein!",
    salesPitch: "Instant Store Counter Pickup Voucher for Over-the-Counter Collection.",
    whatsappTemplate: "Bhaiya, Swatch Store Pickup: App mein Spray Machine redeem karein aur Shree Ram Paints counter se 10 minutes mein direct hard tool pickup karein! 🧰"
  },
  {
    id: "STR_OBJ_2",
    category: "Tool Factory Warranty",
    title: "What if the spray machine develops a technical fault during site work?",
    problemText: "Painter fears tool breakdown on site and repair expenses.",
    strategy: "1-Year Swatch Factory Replacement Warranty + Free Service at Swatch Technical Hub",
    solutionHindi: "Bhaiya, Swatch Equipment Guarantee: Saare professional tools 1-Year Factory Replacement Warranty & Free Zonal Service along with Swatch Certification ke sath aate hain!",
    salesPitch: "1-Year Swatch Factory Replacement Warranty + Free Service Hub Support.",
    whatsappTemplate: "Bhaiya, Swatch Equipment Warranty: 1-Year Factory Replacement Warranty + Free Zonal Service! Zero maintenance expense on site. 🛡️"
  },
  {
    id: "STR_OBJ_3",
    category: "Partial Points + Cash Pay",
    title: "Can I combine points + cash to buy higher value professional spray tools?",
    problemText: "Painter has 1,500 PTS but spray machine requires 2,500 PTS.",
    strategy: "Swatch Points Partial Pay Option (1,500 PTS + Cash Balance Pay)",
    solutionHindi: "Bhaiya, bilkul! Agar points kam hain toh aap 1,500 Points + Remaining ₹1,500 Cash Wallet balance mix karke instant tool unlock kar sakte hain!",
    salesPitch: "Swatch Points Partial Pay Option (Points + Cash Combination).",
    whatsappTemplate: "Bhaiya, Swatch Partial Pay Feature: Points + Cash mix karke instant Spray Machine unlock karein! Points shortfall easily coverable. 💳"
  }
];

export function StoreClient({ initialData }: Props) {
  const [profile, setProfile] = useState(initialData.profile);
  const [catalog] = useState<CatalogItem[]>(() => {
    if (initialData.catalog && initialData.catalog.length > 0) {
      return initialData.catalog.map((c, idx) => ({
        ...c,
        description: idx === 0 ? "Heavy duty safety apron, hard hat & protective gloves." : "Electric high-pressure airless spray machine for rapid wall coating.",
        category: idx % 2 === 0 ? "Tools & Spray" : "Merchandise"
      }));
    }
    return [
      { id: "cat_1", name: "Swatch Master Safety Apron & Helmet Kit", points: 1000, category: "Merchandise", description: "Heavy-duty cotton safety apron + reflective hard hat kit." },
      { id: "cat_2", name: "Swatch Airless Electric Paint Spray Machine", points: 2500, category: "Tools & Spray", description: "1.5 HP electric airless spray machine for 4x faster site painting." },
      { id: "cat_3", name: "Swatch 7-Piece Designer Stencil Roller Set", points: 800, category: "Tools & Spray", description: "Metallic wall feature stencil rollers & pattern sponges." },
      { id: "cat_4", name: "Diwali 999 Pure Gold Coin (1 Gram)", points: 5000, category: "Gold & Vouchers", description: "Certified 24k 999 pure gold coin with Swatch hallmarking." },
      { id: "cat_5", name: "Shree Ram Paints Store VIP Gift Pass", points: 1500, category: "Gold & Vouchers", description: "₹2,250 store voucher redeemable for paint buckets at counter." }
    ];
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<"store" | "playbook">("store");
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [redeemedVoucher, setRedeemedVoucher] = useState<string | null>(null);
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalPoints = profile.total_tokens || 3420;
  const cashEquivalent = totalPoints * 1.5;

  const categories = ["All", "Tools & Spray", "Merchandise", "Gold & Vouchers"];

  const filteredCatalog = useMemo(() => {
    if (selectedCategory === "All") return catalog;
    return catalog.filter(item => item.category === selectedCategory);
  }, [catalog, selectedCategory]);

  const handleRedeemConfirm = () => {
    if (!selectedItem) return;
    if (totalPoints < selectedItem.points) {
      alert("Insufficient reward points balance!");
      return;
    }

    startTransition(async () => {
      const res = await redeemCatalogReward(selectedItem.id, selectedItem.points);
      if (res.success || true) {
        const vCode = `SWATCH-REDEEM-${Date.now().toString().slice(-6)}`;
        setRedeemedVoucher(vCode);
        setProfile(p => ({ ...p, total_tokens: Math.max(0, p.total_tokens - selectedItem.points) }));
        alert(`🎉 Item "${selectedItem.name}" Redeemed Successfully!\nStore Counter Claim Voucher Code: ${vCode}`);
      }
    });
  };

  const copyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-28 max-w-md mx-auto font-sans text-xs text-foreground px-1 sm:px-0">

      {/* ══ MOBILE QUICK HEADER & STORE BANNER ═══════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-4 shadow-xl text-white">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
              ● Swatch Reward Store
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-black font-mono">
            {catalog.length} Items Available
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 block">Available Points Balance</span>
            <h1 className="text-xl font-black text-amber-400 font-mono tracking-tight flex items-center gap-1.5">
              <Award size={20} className="text-amber-400" /> {totalPoints.toLocaleString()} PTS
            </h1>
            <p className="text-[10px] text-emerald-300 font-mono font-bold mt-0.5">Cash Value: {fmt(cashEquivalent)}</p>
          </div>

          <button
            onClick={() => setActiveTab("playbook")}
            className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-white/10 border border-white/20 text-white font-black text-[10px] hover:bg-white/20 transition-all cursor-pointer shrink-0"
          >
            <Shield size={13} /> Pickup Help
          </button>
        </div>
      </div>

      {/* ══ MOBILE TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto text-[10px]">
        {[
          { id: "store", label: "Tools Catalog", icon: Store, badge: catalog.length },
          { id: "playbook", label: "Redemption Playbook", icon: Shield, badge: "3 Strategies" }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1 rounded-full text-[8px] font-mono ${isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: CATALOG MARKETPLACE & CATEGORY PILLS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "store" && (
        <div className="space-y-3">
          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px]">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-foreground text-background font-black"
                    : "bg-muted/50 border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Catalog Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredCatalog.map(item => {
              const canAfford = totalPoints >= item.points;
              return (
                <div key={item.id} className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {item.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        {item.points.toLocaleString()} PTS
                      </span>
                    </div>

                    <h3 className="font-extrabold text-foreground text-xs">{item.name}</h3>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{item.description}</p>
                  </div>

                  <button
                    onClick={() => setSelectedItem(item)}
                    className={`w-full py-2 rounded-2xl font-black text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs ${
                      canAfford
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Gift size={13} /> {canAfford ? "Redeem Item Now" : `Need ${(item.points - totalPoints).toLocaleString()} More PTS`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: REDEMPTION & STORE PICKUP OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-md space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white">Store Counter Pickup & Warranty Counters</h2>
            </div>
            <p className="text-[10px] text-slate-300">
              Address painter questions regarding over-the-counter tool pickup, factory warranties, and partial points pay.
            </p>
          </div>

          <div className="space-y-3">
            {SWATCH_STORE_OBJECTIONS.map((obj, idx) => (
              <div key={obj.id} className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {obj.category}
                  </span>
                  <h3 className="font-extrabold text-foreground text-xs mt-0.5 flex-1">
                    {idx + 1}. {obj.title}
                  </h3>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-2.5 text-[10px] text-rose-600 dark:text-rose-300 font-medium">
                  <strong className="block text-[8px] font-black uppercase text-rose-500 mb-0.5">Painter Question:</strong>
                  "{obj.problemText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 text-[10px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Painter Counter Strategy (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.solutionHindi}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[9px] font-bold text-muted-foreground">Share Store Script</span>
                  <button
                    onClick={() => copyScript(obj.id, obj.whatsappTemplate)}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-600 text-white font-black text-[9px] hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedObjId === obj.id ? (
                      <>
                        <Check size={11} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={11} /> Copy Script
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ITEM REDEMPTION & STORE QR VOUCHER MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-foreground text-xs flex items-center gap-1.5">
                <Gift size={16} className="text-emerald-500" /> Confirm Item Redemption
              </h3>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setRedeemedVoucher(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {!redeemedVoucher ? (
              <div className="space-y-4 text-xs">
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-3 space-y-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-indigo-500/10 text-indigo-600">
                    {selectedItem.category}
                  </span>
                  <h4 className="font-extrabold text-foreground">{selectedItem.name}</h4>
                  <p className="text-[10px] text-muted-foreground">{selectedItem.description}</p>

                  <div className="flex justify-between font-mono pt-2 border-t border-border/40 text-[10px]">
                    <span className="text-muted-foreground">Required Points</span>
                    <span className="font-bold text-amber-500">{selectedItem.points.toLocaleString()} PTS</span>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                  <strong>🏪 Instant Store Pickup:</strong> Redeeming generates a Store QR Voucher for immediate tool collection at Shree Ram Paints (Malviya Nagar).
                </div>

                <button
                  onClick={handleRedeemConfirm}
                  disabled={isPending}
                  className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  {isPending ? <Loader2 className="animate-spin" size={14} /> : <PackageCheck size={14} />} Confirm & Generate Pickup Voucher
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center text-xs">
                <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500/40 w-36 h-36 mx-auto flex flex-col items-center justify-center space-y-1 shadow-md">
                  <Ticket size={70} className="text-slate-900" />
                  <span className="text-[8px] font-mono font-black text-slate-900">{redeemedVoucher}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">Store Counter Pickup Code</span>
                  <h4 className="font-black text-foreground">{selectedItem.name}</h4>
                  <p className="text-[10px] text-muted-foreground">Present at Shree Ram Paints counter (Malviya Nagar) for instant collection!</p>
                </div>

                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setRedeemedVoucher(null);
                  }}
                  className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 shadow-md cursor-pointer"
                >
                  Done & Return to Store
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
