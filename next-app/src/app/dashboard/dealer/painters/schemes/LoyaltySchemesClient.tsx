"use client";

import React, { useState, useTransition, useEffect, useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Sparkles, Plus, Search, Tag, Calendar, Users, ShieldCheck, FileText,
  AlertCircle, CheckCircle2, X, ArrowRight, TrendingUp, Percent, Award,
  ChevronRight, Gift, Layers
} from "lucide-react";
import { createDealerScheme } from "../../actions";

interface PainterParticipant {
  id: string;
  name: string;
  phone: string;
  progress_liters: number;
  target_liters: number;
  points_earned: number;
}

interface Scheme {
  id: string;
  title: string;
  product_name: string;
  regular_price: number;
  discounted_price: number;
  bonus_points: number;
  target_liters: number;
  start_date: string;
  end_date: string;
  status: string;
  description: string;
  terms: string[];
  participating_painters: PainterParticipant[];
}

interface Props {
  initialData: Scheme[];
}

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export function LoyaltySchemesClient({ initialData }: Props) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [schemes, setSchemes] = useState<Scheme[]>(initialData || []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedTermsScheme, setSelectedTermsScheme] = useState<Scheme | null>(null);
  const [selectedPaintersScheme, setSelectedPaintersScheme] = useState<Scheme | null>(null);
  const [isCreatingModal, setIsCreatingModal] = useState(false);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    if (initialData && initialData.length > 0) {
      setSchemes(initialData);
    }
  }, [initialData]);

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return schemes.filter(s => {
      const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.product_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [schemes, search, statusFilter]);

  // Aggregate metrics
  const totalActive = useMemo(() => schemes.filter(s => s.status === "Active").length, [schemes]);
  const totalParticipants = useMemo(() => {
    const set = new Set();
    schemes.forEach(s => (s.participating_painters || []).forEach(p => set.add(p.id || p.name)));
    return set.size;
  }, [schemes]);

  const totalDiscountSavings = useMemo(() => {
    return schemes.reduce((acc, s) => acc + (Number(s.regular_price) - Number(s.discounted_price)) * 10, 0);
  }, [schemes]);

  // New Scheme Form State
  const [newScheme, setNewScheme] = useState({
    title: "",
    product_name: "Royale Luxury Emulsion 20L",
    regular_price: "4800",
    discounted_price: "4320",
    bonus_points: "200",
    target_liters: "50",
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    description: "",
    terms_input: "Minimum 50 Liters total purchase required before end date.\nValid for store painters with verified Aadhaar & Bank Passbook KYC.\nDiscount applied automatically on POS invoice."
  });

  const handleCreateSchemeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheme.title || !newScheme.product_name) return;

    const termsArray = newScheme.terms_input
      .split("\n")
      .map(t => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await createDealerScheme({
        ...newScheme,
        terms: termsArray
      });

      if (res.success && res.data) {
        setSchemes(prev => [res.data, ...prev]);
        setIsCreatingModal(false);
        setNewScheme({
          title: "",
          product_name: "Royale Luxury Emulsion 20L",
          regular_price: "4800",
          discounted_price: "4320",
          bonus_points: "200",
          target_liters: "50",
          start_date: new Date().toISOString().slice(0, 10),
          end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          description: "",
          terms_input: "Minimum 50 Liters total purchase required before end date.\nValid for store painters with verified Aadhaar & Bank Passbook KYC.\nDiscount applied automatically on POS invoice."
        });
      }
    });
  };

  if (!mounted) {
    return (
      <div className="p-12 text-center text-xs font-bold text-muted-foreground animate-pulse bg-card rounded-2xl border border-border">
        {t("Loading Dealer Loyalty Schemes & Discount Engine...")}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── Top Header Navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <span>{t("Dealer Workspace")}</span><span className="opacity-40">/</span><span>{t("Painters")}</span><span className="opacity-40">/</span><span className="text-foreground">{t("Loyalty & Product Schemes")}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
              <Gift size={22} className="text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                {t("Dealer Loyalty Schemes & Product Discount Hub")}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t("Manage painter product discounts, extra reward bonus points, terms & rules, and enrolled contractor progress")}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCreatingModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-2xs cursor-pointer"
        >
          <Plus size={15} /> {t("+ Launch New Scheme & Discount")}
        </button>
      </div>

      {/* ── Key Metrics Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">{t("Active Dealer Schemes")}</span>
          <p className="text-2xl font-black text-foreground font-mono">{totalActive}</p>
          <p className="text-[11px] text-emerald-600 font-bold">{t("Currently Running Offers")}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">{t("Participating Contractors")}</span>
          <p className="text-2xl font-black text-primary font-mono">{totalParticipants} {t("Painters")}</p>
          <p className="text-[11px] text-muted-foreground">{t("Active Target Achievers")}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">{t("Total Scheme Savings Provided")}</span>
          <p className="text-2xl font-black text-emerald-600 font-mono">{fmt(totalDiscountSavings)}</p>
          <p className="text-[11px] text-muted-foreground">{t("Direct Product Discounts")}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">{t("Extra Bonus Reward Points")}</span>
          <p className="text-2xl font-black text-amber-500 font-mono">14,200 Pts</p>
          <p className="text-[11px] text-muted-foreground">{t("Credited to Painter Wallets")}</p>
        </div>
      </div>

      {/* ── Search & Filter Controls ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search scheme by title or product name (e.g. Royale, Primer)..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold bg-muted/60 p-1 rounded-xl border border-border">
          {[
            { id: "all", label: "All Schemes" },
            { id: "active", label: "🟢 Active" },
            { id: "upcoming", label: "⏳ Upcoming" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                statusFilter === t.id
                  ? "bg-primary text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SCHEMES GRID ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchemes.map(scheme => {
          const discountAmt = Number(scheme.regular_price) - Number(scheme.discounted_price);
          const discountPct = Math.round((discountAmt / (Number(scheme.regular_price) || 1)) * 100);
          const painterCount = (scheme.participating_painters || []).length;
          const isActive = scheme.status === "Active";

          return (
            <div
              key={scheme.id}
              className="bg-card border border-border hover:border-primary/50 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between transition-all group"
            >
              <div className="space-y-3">
                {/* Header Title & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                      {scheme.status} Scheme
                    </span>
                    <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors mt-1.5">
                      {scheme.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {scheme.description}
                </p>

                {/* Target Product & Pricing Offer Box */}
                <div className="bg-muted/40 border border-border rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Tag size={13} className="text-primary shrink-0" /> {scheme.product_name}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1 border-t border-border/40">
                    <div>
                      <span className="text-[10px] text-muted-foreground line-through mr-1 font-mono">
                        {fmt(scheme.regular_price)}
                      </span>
                      <span className="text-base font-black text-emerald-600 font-mono">
                        {fmt(scheme.discounted_price)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 ml-1">
                        ({discountPct}% OFF)
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded text-[10px] font-black">
                        +{scheme.bonus_points} Pts / Unit
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scheme Target & Validity Details */}
                <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Calendar size={13} className="text-primary/70 shrink-0" /> Validity:
                    </span>
                    <span className="font-mono font-bold text-foreground text-[11px]">
                      {scheme.start_date} to {scheme.end_date}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <TargetGoalIcon size={13} className="text-primary/70 shrink-0" /> Target Goal:
                    </span>
                    <span className="font-mono font-bold text-foreground text-[11px]">
                      {scheme.target_liters} Liters Purchase
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Participation Summary */}
              <div className="space-y-2 pt-3 border-t border-border/40">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground pb-1">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Users size={13} className="text-primary" /> {painterCount} Contractors Participating
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedTermsScheme(scheme)}
                    className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors border border-border cursor-pointer"
                  >
                    <FileText size={13} /> Rules & Terms
                  </button>

                  <button
                    onClick={() => setSelectedPaintersScheme(scheme)}
                    className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors border border-primary/20 cursor-pointer"
                  >
                    <Users size={13} /> Painters List
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredSchemes.length === 0 && (
          <div className="col-span-full text-center py-16 border border-dashed border-border rounded-2xl">
            <Gift size={36} className="mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-bold text-foreground">No Matching Dealer Schemes Found</p>
            <p className="text-xs text-muted-foreground mt-1">Click "+ Launch New Scheme & Discount" to create product offers.</p>
          </div>
        )}
      </div>

      {/* ── SCHEME TERMS, RULES & CONDITIONS MODAL ──────────────────────── */}
      {selectedTermsScheme && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-wider">Scheme Rules & Conditions</span>
                <h2 className="text-lg font-black text-foreground">{selectedTermsScheme.title}</h2>
              </div>
              <button
                onClick={() => setSelectedTermsScheme(null)}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase">Targeted Product & Offer</span>
                <p className="font-black text-foreground text-sm">{selectedTermsScheme.product_name}</p>
                <p className="font-mono text-emerald-600 font-bold">
                  Offer Price: {fmt(selectedTermsScheme.discounted_price)} (MRP: {fmt(selectedTermsScheme.regular_price)}) • +{selectedTermsScheme.bonus_points} Bonus Pts
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" /> Terms, Rules & Eligibility Criteria:
                </h4>
                <ul className="space-y-2">
                  {(selectedTermsScheme.terms || []).map((term, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-background p-2.5 rounded-xl border border-border">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-foreground font-semibold">{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTermsScheme(null)}
                className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Terms & Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ENROLLED PAINTERS PARTICIPATION AUDIT MODAL ────────────────── */}
      {selectedPaintersScheme && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-wider">Painter Participation Audit</span>
                <h2 className="text-lg font-black text-foreground">{selectedPaintersScheme.title}</h2>
              </div>
              <button
                onClick={() => setSelectedPaintersScheme(null)}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {(selectedPaintersScheme.participating_painters || []).map((p, idx) => {
                const pct = Math.min(100, Math.round((p.progress_liters / (p.target_liters || 1)) * 100));
                return (
                  <div key={idx} className="bg-background border border-border rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-foreground text-sm">{p.name}</h4>
                        <p className="text-[11px] font-mono text-muted-foreground">{p.phone}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-emerald-600">{p.progress_liters} / {p.target_liters} Liters</span>
                        <span className="block text-[10px] font-bold text-amber-500">+{p.points_earned} Pts Earned</span>
                      </div>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {(selectedPaintersScheme.participating_painters || []).length === 0 && (
                <p className="text-center py-8 text-xs text-muted-foreground">No contractors have enrolled in this scheme yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── + LAUNCH NEW DEALER SCHEME MODAL ─────────────────────────────── */}
      {isCreatingModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <Gift size={20} className="text-amber-500" /> Launch New Dealer Scheme & Product Discount
              </h2>
              <button
                onClick={() => setIsCreatingModal(false)}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSchemeSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Scheme Title *</label>
                <input
                  required
                  type="text"
                  value={newScheme.title}
                  onChange={e => setNewScheme({ ...newScheme, title: e.target.value })}
                  placeholder="E.g. Festival Season Royale Bonanza"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Targeted Product Name *</label>
                <input
                  required
                  type="text"
                  value={newScheme.product_name}
                  onChange={e => setNewScheme({ ...newScheme, product_name: e.target.value })}
                  placeholder="Royale Luxury Emulsion 20L"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Regular Store Price (₹) *</label>
                  <input
                    required
                    type="number"
                    value={newScheme.regular_price}
                    onChange={e => setNewScheme({ ...newScheme, regular_price: e.target.value })}
                    placeholder="4800"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Discounted Scheme Rate (₹) *</label>
                  <input
                    required
                    type="number"
                    value={newScheme.discounted_price}
                    onChange={e => setNewScheme({ ...newScheme, discounted_price: e.target.value })}
                    placeholder="4320"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Extra Bonus Points / Unit</label>
                  <input
                    type="number"
                    value={newScheme.bonus_points}
                    onChange={e => setNewScheme({ ...newScheme, bonus_points: e.target.value })}
                    placeholder="200"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Target Goal (Liters)</label>
                  <input
                    type="number"
                    value={newScheme.target_liters}
                    onChange={e => setNewScheme({ ...newScheme, target_liters: e.target.value })}
                    placeholder="50"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Start Date</label>
                  <input
                    type="date"
                    value={newScheme.start_date}
                    onChange={e => setNewScheme({ ...newScheme, start_date: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">End Date</label>
                  <input
                    type="date"
                    value={newScheme.end_date}
                    onChange={e => setNewScheme({ ...newScheme, end_date: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Scheme Description</label>
                <textarea
                  value={newScheme.description}
                  onChange={e => setNewScheme({ ...newScheme, description: e.target.value })}
                  placeholder="Describe the scheme benefits for store contractors..."
                  rows={2}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs outline-none focus:border-primary text-foreground resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Terms, Rules & Conditions (1 rule per line)</label>
                <textarea
                  value={newScheme.terms_input}
                  onChange={e => setNewScheme({ ...newScheme, terms_input: e.target.value })}
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs outline-none focus:border-primary text-foreground font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 border border-border text-foreground font-bold rounded-xl hover:bg-muted text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 bg-primary text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <CheckCircle2 size={15} /> {isPending ? "Publishing Scheme..." : "Publish Scheme & Discounts"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TargetGoalIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
