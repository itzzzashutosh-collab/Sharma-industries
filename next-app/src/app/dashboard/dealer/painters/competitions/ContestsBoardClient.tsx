"use client";

import React, { useState, useTransition, useEffect, useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Trophy, Award, Sparkles, Search, Crown, Medal, TrendingUp, Calendar,
  Users, Gift, CheckCircle2, ShieldCheck, Phone, ArrowUpRight, Flame,
  X, Send, Star, Zap
} from "lucide-react";
import { awardPainterLeaderboardBonus } from "../../actions";

interface LeaderboardItem {
  id: string;
  rank: number;
  name: string;
  phone: string;
  tier: string;
  profile_photo: string;
  liters_consumed: number;
  revenue_generated: number;
  points_earned: number;
  growth_pct: string;
  badge: string;
  kyc_status: string;
}

interface Props {
  initialData: any;
}

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export function ContestsBoardClient({ initialData }: Props) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "quarterly" | "semi_annual" | "yearly">("monthly");
  const [search, setSearch] = useState("");

  const [allData, setAllData] = useState<any>(initialData?.all || {});
  const [selectedAwardPainter, setSelectedAwardPainter] = useState<LeaderboardItem | null>(null);

  const [bonusPoints, setBonusPoints] = useState("1000");
  const [bonusReason, setBonusReason] = useState("Contractor Performance Award");

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get active dataset based on timeframe filter
  const currentList: LeaderboardItem[] = useMemo(() => {
    const list = allData[timeframe] || (Array.isArray(initialData) ? initialData : initialData?.list) || [];
    return list.filter((item: LeaderboardItem) => {
      const s = search.toLowerCase();
      return !search || item.name.toLowerCase().includes(s) || (item.phone || "").includes(s) || (item.tier || "").toLowerCase().includes(s);
    });
  }, [allData, initialData, timeframe, search]);

  // Top 3 Podium
  const rank1 = currentList.find(i => i.rank === 1) || currentList[0];
  const rank2 = currentList.find(i => i.rank === 2) || currentList[1];
  const rank3 = currentList.find(i => i.rank === 3) || currentList[2];

  const handleAwardBonus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAwardPainter || !bonusPoints) return;

    startTransition(async () => {
      const res = await awardPainterLeaderboardBonus(
        selectedAwardPainter.id,
        Number(bonusPoints),
        bonusReason
      );

      if (res.success) {
        alert(`Successfully awarded +${bonusPoints} Bonus Reward Points to ${selectedAwardPainter.name}!`);
        setSelectedAwardPainter(null);
      }
    });
  };

  if (!mounted) {
    return (
      <div className="p-12 text-center text-xs font-bold text-muted-foreground animate-pulse bg-card rounded-2xl border border-border">
        Loading Store Contractor Leaderboard & Confetti Celebrations...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── Top Header Navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Painters</span><span className="opacity-40">/</span><span className="text-foreground">{t("Contractor Leaderboard")}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
              <Trophy size={24} className="text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                Store Contractor Leaderboard & Awards
              </h1>
              <p className="text-xs text-muted-foreground">
                Track top performing painters, liters consumed, store revenue contribution, and award monthly champion bonuses
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Time-Period Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1.5 rounded-2xl border border-border">
          {[
            { id: "weekly", label: "Weekly" },
            { id: "monthly", label: "Monthly (Month ⭐)" },
            { id: "quarterly", label: "Quarterly (Q3)" },
            { id: "semi_annual", label: "6 Months" },
            { id: "yearly", label: "Yearly (Year 🏆)" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                timeframe === t.id
                  ? "bg-amber-500 text-white shadow-md scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CHAMPION CONFETTI SPOTLIGHT BANNER (#1 RANK) ──────────────── */}
      {rank1 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/20 via-card to-amber-500/10 border-2 border-amber-500/40 p-6 rounded-3xl shadow-xl">
          {/* Decorative Sparkle Effects */}
          <div className="absolute top-2 right-4 text-amber-500 opacity-30 animate-pulse pointer-events-none">
            <Sparkles size={120} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={rank1.profile_photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                  alt={rank1.name}
                  className="w-20 h-20 rounded-3xl object-cover border-4 border-amber-500 shadow-xl"
                />
                <div className="absolute -top-3 -right-2 bg-amber-500 text-white p-1.5 rounded-full shadow-lg">
                  <Crown size={18} />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs">
                    🎉 #{rank1.rank} CHAMPION OF THE {timeframe.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded text-[10px] font-bold">
                    {rank1.growth_pct} Growth
                  </span>
                </div>
                <h2 className="text-2xl font-black text-foreground">{rank1.name}</h2>
                <p className="text-xs font-mono text-muted-foreground flex items-center gap-2 mt-0.5">
                  <Phone size={13} className="text-primary" /> {rank1.phone} • {rank1.tier}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-card/80 backdrop-blur border border-amber-500/30 p-4 rounded-2xl">
              <div className="text-center">
                <span className="text-[10px] font-black text-muted-foreground uppercase block">Liters Consumed</span>
                <p className="text-xl font-black text-foreground font-mono">{rank1.liters_consumed} L</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <span className="text-[10px] font-black text-muted-foreground uppercase block">Billing Revenue</span>
                <p className="text-xl font-black text-emerald-600 font-mono">{fmt(rank1.revenue_generated)}</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <button
                onClick={() => setSelectedAwardPainter(rank1)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Award size={15} /> Award Bonus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP 3 PODIUM SHOWCASE ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* RANK 2 - SILVER */}
        {rank2 && (
          <div className="bg-card border border-slate-300 dark:border-slate-700 rounded-3xl p-5 shadow-2xs space-y-4 flex flex-col justify-between order-2 md:order-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                  <Medal size={12} /> #2 Runner Up
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600">{rank2.growth_pct}</span>
              </div>

              <div className="flex items-center gap-3">
                <img src={rank2.profile_photo} alt={rank2.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-400" />
                <div>
                  <h3 className="font-black text-foreground text-sm">{rank2.name}</h3>
                  <p className="text-[11px] font-mono text-muted-foreground">{rank2.phone}</p>
                </div>
              </div>

              <div className="bg-muted/40 p-3 rounded-xl border border-border space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Liters Purchased:</span>
                  <span className="font-mono font-bold text-foreground">{rank2.liters_consumed} L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue Generated:</span>
                  <span className="font-mono font-bold text-emerald-600">{fmt(rank2.revenue_generated)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedAwardPainter(rank2)}
              className="w-full py-2 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-border cursor-pointer"
            >
              <Award size={14} /> Award Bonus Pts
            </button>
          </div>
        )}

        {/* RANK 1 - GOLD */}
        {rank1 && (
          <div className="bg-card border-2 border-amber-500 rounded-3xl p-5 shadow-lg space-y-4 flex flex-col justify-between order-1 md:order-2 scale-105 z-10">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                  <Crown size={12} /> #1 Gold Winner
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600">{rank1.growth_pct}</span>
              </div>

              <div className="flex items-center gap-3">
                <img src={rank1.profile_photo} alt={rank1.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500" />
                <div>
                  <h3 className="font-black text-foreground text-base">{rank1.name}</h3>
                  <p className="text-[11px] font-mono text-muted-foreground">{rank1.phone}</p>
                </div>
              </div>

              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Liters Purchased:</span>
                  <span className="font-mono font-black text-foreground">{rank1.liters_consumed} L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue Generated:</span>
                  <span className="font-mono font-black text-emerald-600">{fmt(rank1.revenue_generated)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedAwardPainter(rank1)}
              className="w-full py-2 bg-amber-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-md cursor-pointer"
            >
              <Award size={14} /> Award Champion Bonus
            </button>
          </div>
        )}

        {/* RANK 3 - BRONZE */}
        {rank3 && (
          <div className="bg-card border border-amber-800/40 rounded-3xl p-5 shadow-2xs space-y-4 flex flex-col justify-between order-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-amber-800/20 text-amber-700 dark:text-amber-300 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                  <Medal size={12} /> #3 Bronze Spot
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600">{rank3.growth_pct}</span>
              </div>

              <div className="flex items-center gap-3">
                <img src={rank3.profile_photo} alt={rank3.name} className="w-12 h-12 rounded-2xl object-cover border border-amber-700" />
                <div>
                  <h3 className="font-black text-foreground text-sm">{rank3.name}</h3>
                  <p className="text-[11px] font-mono text-muted-foreground">{rank3.phone}</p>
                </div>
              </div>

              <div className="bg-muted/40 p-3 rounded-xl border border-border space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Liters Purchased:</span>
                  <span className="font-mono font-bold text-foreground">{rank3.liters_consumed} L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue Generated:</span>
                  <span className="font-mono font-bold text-emerald-600">{fmt(rank3.revenue_generated)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedAwardPainter(rank3)}
              className="w-full py-2 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-border cursor-pointer"
            >
              <Award size={14} /> Award Bonus Pts
            </button>
          </div>
        )}
      </div>

      {/* ── SEARCH & FULL LEADERBOARD TABLE ───────────────────────────────── */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            <h2 className="text-base font-black text-foreground uppercase tracking-wider">
              Complete Store Contractor Rankings ({timeframe.toUpperCase()})
            </h2>
          </div>

          <div className="relative min-w-[240px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search contractor by name or phone..."
              className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-3">{t("Rank")}</th>
                <th className="py-3 px-3">Contractor / Painter</th>
                <th className="py-3 px-3">Tier</th>
                <th className="py-3 px-3 text-right">Liters Consumed</th>
                <th className="py-3 px-3 text-right">Store Revenue (₹)</th>
                <th className="py-3 px-3 text-right">Reward Points</th>
                <th className="py-3 px-3 text-center">Growth</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {currentList.map(item => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-3 font-mono font-black text-foreground">
                    #{item.rank}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <img src={item.profile_photo} alt={item.name} className="w-9 h-9 rounded-xl object-cover border border-border shrink-0" />
                      <div>
                        <span className="font-bold text-foreground block">{item.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{item.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-muted rounded text-[10px] font-bold text-foreground border border-border">
                      {item.tier}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-foreground">
                    {item.liters_consumed} L
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-emerald-600">
                    {fmt(item.revenue_generated)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-amber-500">
                    {item.points_earned} Pts
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">
                    {item.growth_pct}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => setSelectedAwardPainter(item)}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      🎁 Award Bonus
                    </button>
                  </td>
                </tr>
              ))}

              {currentList.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-xs text-muted-foreground">
                    No contractors found for this timeframe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── AWARD LEADERBOARD BONUS MODAL ─────────────────────────────── */}
      {selectedAwardPainter && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-base font-black text-foreground flex items-center gap-2">
                <Gift size={18} className="text-amber-500" /> Award Bonus Loyalty Points
              </h2>
              <button
                onClick={() => setSelectedAwardPainter(null)}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAwardBonus} className="space-y-4 text-xs">
              <div className="bg-muted/40 p-3 rounded-xl border border-border flex items-center gap-3">
                <img src={selectedAwardPainter.profile_photo} alt={selectedAwardPainter.name} className="w-10 h-10 rounded-xl object-cover border border-border" />
                <div>
                  <h4 className="font-black text-foreground">{selectedAwardPainter.name}</h4>
                  <p className="text-[10px] font-mono text-muted-foreground">{selectedAwardPainter.phone}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Bonus Reward Points *</label>
                <input
                  required
                  type="number"
                  value={bonusPoints}
                  onChange={e => setBonusPoints(e.target.value)}
                  placeholder="1000"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Award Reason / Note</label>
                <input
                  type="text"
                  value={bonusReason}
                  onChange={e => setBonusReason(e.target.value)}
                  placeholder="E.g. Contractor of the Month Special Bonus"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSelectedAwardPainter(null)}
                  className="px-4 py-2 border border-border text-foreground font-bold rounded-xl hover:bg-muted text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Award size={15} /> {isPending ? "Awarding Points..." : "Confirm & Credit Bonus Points"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
