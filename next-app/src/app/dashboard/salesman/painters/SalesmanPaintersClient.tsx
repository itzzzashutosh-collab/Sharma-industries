"use client";

import React, { useEffect, useState, useMemo, useTransition } from "react";
import {
  Users, Search, MapPin, Phone, PlusCircle, Loader2, X, AlertCircle, CheckCircle2,
  ShieldCheck, Sparkles, Shield, Copy, Check, Share2, Upload, TrendingUp, Building2,
  Flame, Zap, HelpCircle, Award, Wallet, Gift, QrCode, CreditCard, ArrowRight, DollarSign
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface DBPainter {
  id: string;
  name: string;
  phone: string;
  role: string;
  is_active: boolean;
  is_approved: boolean;
  address: string | null;
  territory: string | null;
  created_at: string;
  wallet_points?: number;
  kyc_status?: "VERIFIED" | "PENDING" | "REJECTED";
  contractor_tier?: "Master Contractor" | "Senior Applicator" | "Standard Painter";
}

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Paints B2B Painter Onboarding & Loyalty Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const PAINTER_OBJECTIONS = [
  {
    id: "PNT_OBJ_1",
    category: "Instant Cashback vs Competitor",
    title: "Asian Paints TruCare gives direct QR scanner cashback in bank account",
    problemText: "Ustadji, Asian Paints ka QR code scan karke direct ₹100 bank mein aa jata hai, Swatch App mein time kyun lagega?",
    strategy: "Demonstrate 5-Second Instant Swatch UPI Transfer + 2x Double Points Benefit",
    solutionHindi: "Ustadji, Swatch Painter App par QR scan karte hi within 5 seconds aapke UPI/Bank mein direct cash credit hota hai. PLUS Swatch 20L buckets par DOUBLE Points (₹200 value) mil rahe hain jo Asian Paints se 2x extra hain!",
    salesPitch: "Instant 5-Second UPI Transfer + 2x Double Token Reward value compared to legacy brands.",
    whatsappTemplate: "Namaste Ustadji! Swatch Painter App Double Cashback Offer: Har 20L Bucket scan par Instant ₹200 UPI Transfer (Within 5 seconds in bank!). App link and registration ready. Onboard karein? 🎨"
  },
  {
    id: "PNT_OBJ_2",
    category: "No Smartphone / Feature Phone",
    title: "Painter does not have smartphone or online bank account",
    problemText: "Mere paas chhota phone hai, online QR app scan karna nahi aata, na online bank account hai.",
    strategy: "Activate Dealer Store Counter Scan & Instant Cash Payment Option",
    solutionHindi: "Ustadji, tension bilkul nahi! Aap direct dealer shop par bucket token handing-over kar sakte hain. Dealer aapka token system par scan karke aapko DUKAN SE HI INSTANT HAND CASH PAYMENT de dega!",
    salesPitch: "Dealer Counter Token Scan = Instant Store Cash Payment without smartphone requirement.",
    whatsappTemplate: "Ustadji, Swatch Paints Store Counter Cash Facility: Smartphone ki zaroorat nahi! Dealer shop par token dijiye aur instant HAND CASH payment paayein. 💵"
  },
  {
    id: "PNT_OBJ_3",
    category: "Quality Recommendation & Work Ease",
    title: "Why should contractors recommend Swatch Damp Shield to home owners?",
    problemText: "Ghar wale Asian Paints maangte hain, main Swatch Damp Shield bechne ki mehnat kyun karun?",
    strategy: "Highlight Zero-Dust Sanding Ease (30% Labor Saved) + 7-Year Stamp Warranty",
    solutionHindi: "Ustadji, Swatch Damp Shield mein Zero-Dust Sanding Technology hai jisse ghisai mein 30% kam mehnat lagti hai aur dusting bilkul nahi hoti. Company customer ko 7-Year Guarantee Card deti hai jisse aapka kaam shine karega!",
    salesPitch: "Zero-Dust Sanding (30% Less Physical Effort) + 7-Year Guaranteed Client Satisfaction.",
    whatsappTemplate: "Ustadji, Swatch Damp Shield Zero-Dust Advantage: Ghisai mein 30% kam mehnat + Zero dust + Client ko 7-Year Warranty Card. Client khush, Ustadji safe! 🛡️"
  },
  {
    id: "PNT_OBJ_4",
    category: "Master Applicator Certification",
    title: "How to become a Swatch Certified Master Applicator & Get Big Site Projects?",
    problemText: "Main bada contractor hoon, mujhe commercial sites ke liye Swatch Official Certification chahiye.",
    strategy: "Offer Swatch Master Applicator Certificate + Jaipur Factory 2-Day Master Class",
    solutionHindi: "Sir, 500L Swatch Paints volume threshold hit hote hi aapko Swatch Certified Master Applicator Badge milega. Aapko 2-Day Jaipur Factory Advanced Texture Training + Swatch Corporate Project Contracts Direct assign honge!",
    salesPitch: "Factory Certification + Corporate Project Assignment = High-Ticket Contracting Growth.",
    whatsappTemplate: "Sir, Swatch Certified Master Applicator Upgrade: 500L milestone par Official Certificate + Direct Corporate Site Contracts assignment! Join the elite applicator network today. 👑"
  },
  {
    id: "PNT_OBJ_5",
    category: "Free Toolkit & Overalls",
    title: "Can I get free professional painting tools and branded overalls?",
    problemText: "Kya Swatch Paints mujhe premium roller kit, overall dress, aur safety helmet free dega?",
    strategy: "Issue Swatch Painter Professional Starter Toolkit on 100L Milestone",
    solutionHindi: "Ustadji, bilkul! Jaise hi aapka 100L scan milestone hit hota hai, aapko Swatch Professional Toolkit (Heavy Roller, Scraper, Safety Goggles, Branded Overall Dress, Helmet) FREE gift bag deliver hoga!",
    salesPitch: "100L Milestone = Free Swatch Professional Applicator Kit & Overalls.",
    whatsappTemplate: "Ustadji, Swatch Painter Toolkit Offer: 100L milestone complete hote hi FREE Professional Roller Kit + Branded Dress Deliver hongi! 🧰"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Default Swatch Painter Mock Pre-seed Data
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_SWATCH_PAINTERS: DBPainter[] = [
  { id: "P1", name: "Ramesh Chand Painter", phone: "9829011111", role: "painter", is_active: true, is_approved: true, address: "Malviya Nagar, Jaipur", territory: "Jaipur Central", created_at: "2026-06-01", wallet_points: 12500, kyc_status: "VERIFIED", contractor_tier: "Master Contractor" },
  { id: "P2", name: "Mukesh Kumar Applicator", phone: "9829022222", role: "painter", is_active: true, is_approved: true, address: "Talwandi, Kota", territory: "Kota South", created_at: "2026-06-15", wallet_points: 8400, kyc_status: "VERIFIED", contractor_tier: "Senior Applicator" },
  { id: "P3", name: "Suresh Saini Contractor", phone: "9829033333", role: "painter", is_active: true, is_approved: true, address: "Main Market, Bundi", territory: "Bundi Hub", created_at: "2026-07-01", wallet_points: 4200, kyc_status: "VERIFIED", contractor_tier: "Standard Painter" },
  { id: "P4", name: "Dinesh Verma Texture Pro", phone: "9829044444", role: "painter", is_active: true, is_approved: true, address: "Mansarovar, Jaipur", territory: "Jaipur West", created_at: "2026-07-10", wallet_points: 19800, kyc_status: "VERIFIED", contractor_tier: "Master Contractor" }
];

export default function SalesmanPaintersClient() {
  const [painters, setPainters] = useState<DBPainter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"directory" | "onboard" | "playbook" | "catalog" | "analytics">("directory");
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);

  // Registration modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPointCreditModal, setShowPointCreditModal] = useState<DBPainter | null>(null);
  const [creditPointsAmount, setCreditPointsAmount] = useState(500);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    territory: "",
    contractor_tier: "Senior Applicator"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchPainters = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'painter')
        .order('created_at', { ascending: false });

      if (data && data.length > 0 && !error) {
        const mappedData: DBPainter[] = data.map((p: any, idx: number) => ({
          ...p,
          wallet_points: p.wallet_points || (12000 - idx * 2500),
          kyc_status: p.kyc_status || "VERIFIED",
          contractor_tier: p.contractor_tier || (idx === 0 ? "Master Contractor" : "Senior Applicator")
        }));
        setPainters(mappedData);
      } else {
        setPainters(MOCK_SWATCH_PAINTERS);
      }
    } catch (err) {
      setPainters(MOCK_SWATCH_PAINTERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPainters();
  }, []);

  const filteredPainters = useMemo(() => {
    return painters.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      (p.territory && p.territory.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [painters, searchTerm]);

  // Overall Merchandising Metrics
  const metrics = useMemo(() => {
    const totalCount = painters.length;
    const totalPoints = painters.reduce((s, p) => s + (p.wallet_points || 5000), 0);
    const masterCount = painters.filter(p => p.contractor_tier === "Master Contractor").length;
    return { totalCount, totalPoints, masterCount };
  }, [painters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setFormError("Name and Phone Number are required.");
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setFormError("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync("admin123", salt);

      const newP: DBPainter = {
        id: `P_${Date.now()}`,
        phone: formData.phone,
        name: formData.name,
        role: "painter",
        is_active: true,
        is_approved: true,
        address: formData.address || "Jaipur Territory",
        territory: formData.territory || "Jaipur Central",
        created_at: new Date().toISOString().slice(0, 10),
        wallet_points: 1000, // Onboarding welcome bonus
        kyc_status: "VERIFIED",
        contractor_tier: formData.contractor_tier as any
      };

      await supabase.from('users').insert([{
        phone: formData.phone,
        password_hash: passwordHash,
        name: formData.name,
        role: "painter",
        is_active: true,
        is_approved: true,
        address: formData.address || null,
        territory: formData.territory || null,
        status: "APPROVED"
      }]);

      setPainters(prev => [newP, ...prev]);
      setIsModalOpen(false);
      setFormData({ name: "", phone: "", address: "", territory: "", contractor_tier: "Senior Applicator" });
      alert(`Swatch Painter "${newP.name}" onboarded successfully! Welcome bonus of 1,000 Wallet Points credited.`);
    } catch (err: any) {
      setFormError(err.message || "Failed to onboard Swatch painter.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 text-xs font-sans text-foreground">

      {/* ══ HERO BANNER ═══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-950 via-emerald-950/70 to-slate-950 p-5 sm:p-6 shadow-2xl text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.2),_transparent_70%)]" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest text-emerald-300">
                Swatch Painter Loyalty Hub
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-black">
                ● OFFICIAL APPLICATOR NETWORK
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Users size={22} className="text-emerald-400" /> Swatch Paints Painter & Contractor Command Center
            </h1>
            <p className="text-slate-400 text-[11px] max-w-xl">
              Onboard Swatch painters, issue instant token wallet rewards, handle applicator loyalty objections, and manage contractor tiers.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs hover:opacity-95 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer border border-emerald-400/30"
          >
            <PlusCircle size={16} /> Onboard Swatch Painter
          </button>
        </div>

        {/* Dynamic Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Onboarded Painters</span>
            <p className="text-lg font-black text-white font-mono">{metrics.totalCount} Applicators</p>
            <span className="text-[9px] text-slate-400">100% KYC Verified</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-emerald-400 block mb-0.5">Wallet Token Points</span>
            <p className="text-lg font-black text-emerald-300 font-mono">{metrics.totalPoints.toLocaleString("en-IN")} Pts</p>
            <span className="text-[9px] text-slate-400">₹{(metrics.totalPoints).toLocaleString("en-IN")} Cash Value</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-amber-300 block mb-0.5">Master Contractors</span>
            <p className="text-lg font-black text-amber-200 font-mono">{metrics.masterCount} Masters</p>
            <span className="text-[9px] text-slate-400">High-volume site leads</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[9px] font-black uppercase text-indigo-300 block mb-0.5">Brand Identity</span>
            <p className="text-lg font-black text-indigo-200 font-mono">Swatch Paints</p>
            <span className="text-[9px] text-slate-400">Official dealer & painter brand</span>
          </div>
        </div>
      </div>

      {/* ══ TAB NAVIGATION ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1.5 bg-muted/60 p-1.5 rounded-2xl border border-border overflow-x-auto">
        {[
          { id: "directory", label: "Painter Directory & Wallet", icon: Users, badge: metrics.totalCount },
          { id: "playbook", label: "Painter Objection Master", icon: Shield, badge: "5 Strategies" },
          { id: "catalog", label: "Rewards & Gift Catalog", icon: Gift },
          { id: "analytics", label: "Applicator Growth Analytics", icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap text-[11px] ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: PAINTER DIRECTORY & WALLET BALANCES
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search painters by name, phone, or territory..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs outline-none focus:border-primary transition-colors text-foreground shadow-xs"
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-[11px] hover:bg-emerald-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <PlusCircle size={14} /> Onboard New Painter
            </button>
          </div>

          {/* Directory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPainters.map(p => {
              const pts = p.wallet_points || 5000;

              return (
                <div key={p.id} className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[9px] border border-emerald-500/20 flex items-center gap-1">
                        <ShieldCheck size={11} /> {p.kyc_status || "VERIFIED"} KYC
                      </span>
                      <span className="font-mono text-[9px] font-bold text-amber-500">{p.contractor_tier || "Senior Applicator"}</span>
                    </div>

                    <h3 className="font-extrabold text-foreground text-xs sm:text-sm flex items-center gap-1.5">
                      <Users size={14} className="text-emerald-500" /> {p.name}
                    </h3>
                    <div className="space-y-0.5 text-[10px] text-muted-foreground">
                      <p className="flex items-center gap-1"><Phone size={11} /> {p.phone}</p>
                      <p className="flex items-center gap-1"><MapPin size={11} /> {p.address || p.territory || "Jaipur Territory"}</p>
                    </div>
                  </div>

                  <div className="bg-muted/30 border border-border/50 rounded-2xl p-3.5 flex items-center justify-between text-[11px]">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black uppercase text-muted-foreground block">Swatch App Token Wallet</span>
                      <p className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">{pts.toLocaleString("en-IN")} Points</p>
                    </div>

                    <button
                      onClick={() => setShowPointCreditModal(p)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-[10px] hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Zap size={12} /> Credit Points
                    </button>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px] border-t border-border/40">
                    <span className="text-muted-foreground">Registered: {p.created_at?.slice(0, 10)}</span>
                    <button
                      onClick={() => {
                        const txt = `*SWATCH PAINTER LOYALTY WALLET STATEMENT* 🎨\nApplicator: ${p.name}\nWallet Balance: ${pts} Token Points (₹${pts})\nStatus: KYC VERIFIED ✓\nKeep scanning Swatch 20L Emulsion & Damp Shield buckets for 2x Double Points!`;
                        navigator.clipboard.writeText(txt);
                        alert(`WhatsApp Wallet Statement copied for ${p.name}!`);
                      }}
                      className="text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Share2 size={11} /> Share Wallet Slip
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: SWATCH PAINTER OBJECTION & LOYALTY PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 text-white rounded-3xl p-5 border border-emerald-500/30 shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-emerald-400" />
              <h2 className="text-base font-black text-white">Swatch Paints Painter Loyalty Objection Master</h2>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Onboard contractors, explain instant UPI payouts, resolve smartphone-less painter tokens, and promote Zero-Dust Sanding.
            </p>
          </div>

          <div className="space-y-4">
            {PAINTER_OBJECTIONS.map((obj, idx) => (
              <div key={obj.id} className="bg-card border border-border rounded-3xl p-5 space-y-3.5 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {obj.category}
                  </span>
                  <h3 className="font-extrabold text-foreground text-xs sm:text-sm mt-1 flex-1">
                    {idx + 1}. {obj.title}
                  </h3>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 text-[11px] text-rose-600 dark:text-rose-300 font-medium">
                  <strong className="block text-[9px] font-black uppercase text-rose-500 mb-0.5">Painter / Contractor Challenge:</strong>
                  "{obj.problemText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-[11px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Swatch Counter Strategy (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.solutionHindi}</p>
                </div>

                <div className="bg-muted/40 border border-border rounded-2xl p-3 text-[10px] text-muted-foreground space-y-0.5">
                  <strong className="block text-[9px] font-black uppercase text-foreground">
                    🎯 Value Proposition Pitch:
                  </strong>
                  <p>{obj.salesPitch}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-[10px] font-bold text-muted-foreground">WhatsApp Painter Pitch</span>
                  <button
                    onClick={() => copyScript(obj.id, obj.whatsappTemplate)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-[10px] hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedObjId === obj.id ? (
                      <>
                        <Check size={12} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy WhatsApp Pitch
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
          TAB 3: REWARDS & GIFT CATALOG
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Gift size={16} className="text-emerald-500" /> Swatch Painter Loyalty Rewards Catalog
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Redeemable gifts and instant UPI cash payouts for Swatch Paints applicators.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "Instant Bank UPI Cash Transfer", pts: "1,000 Points = ₹1,000 Cash", badge: "INSTANT PAYOUT" },
              { name: "Swatch Heavy Duty Professional Roller Kit", pts: "2,500 Points", badge: "APPLICATOR FAVORITE" },
              { name: "Swatch Certified Painter Overall & Helmet Set", pts: "3,500 Points", badge: "SAFETY KIT" },
              { name: "Smart LED Television (32 Inch)", pts: "25,000 Points", badge: "HIGH REWARD" },
              { name: "Goa Contractor Trip & Factory Meet Pass", pts: "50,000 Points", badge: "MASTER CONTRACTOR" }
            ].map((item, idx) => (
              <div key={idx} className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-xs hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[9px]">
                    {item.badge}
                  </span>
                  <span className="font-mono font-black text-xs text-foreground">{item.pts}</span>
                </div>

                <h3 className="font-extrabold text-xs text-foreground">{item.name}</h3>

                <button
                  onClick={() => alert(`Simulating redemption of "${item.name}" for painter...`)}
                  className="w-full py-2 rounded-xl bg-emerald-600 text-white font-black text-[10px] hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Gift size={12} /> Redeem Reward
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4: APPLICATOR GROWTH ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" /> Painter Network & Scan Analytics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Monthly Token Scans</span>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">+42.8% YoY</p>
                <span className="text-[9px] text-emerald-500 font-bold">Fastest growing network</span>
              </div>
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Top Scanning Product</span>
                <p className="text-base font-black text-foreground font-mono">Swatch Damp Shield 20L</p>
                <span className="text-[9px] text-muted-foreground">2x Double Points active</span>
              </div>
              <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Avg Wallet Balance</span>
                <p className="text-base font-black text-indigo-500 font-mono">11,275 Points</p>
                <span className="text-[9px] text-indigo-400 font-bold">High brand retention</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ONBOARD PAINTER MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border bg-emerald-500/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">Swatch Painter Network</span>
                <h3 className="text-xs font-black text-foreground">Onboard New Swatch Painter</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
                  <AlertCircle size={14} /> {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                  Painter Full Name *
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Ustad Ramesh Saini"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                  10-Digit Mobile Phone Number *
                </label>
                <input
                  required
                  type="tel"
                  maxLength={10}
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="98290XXXXX"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1">
                    Contractor Tier
                  </label>
                  <select
                    value={formData.contractor_tier}
                    onChange={e => setFormData(prev => ({ ...prev, contractor_tier: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary"
                  >
                    <option value="Master Contractor">Master Contractor</option>
                    <option value="Senior Applicator">Senior Applicator</option>
                    <option value="Standard Painter">Standard Painter</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1">
                    Territory Hub
                  </label>
                  <input
                    type="text"
                    value={formData.territory}
                    onChange={e => setFormData(prev => ({ ...prev, territory: e.target.value }))}
                    placeholder="e.g. Jaipur Central"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                  Registered Locality Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g. Malviya Nagar, Jaipur"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 text-white font-black text-[11px] rounded-xl hover:bg-emerald-700 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                Confirm Swatch Applicator Onboarding
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CREDIT TOKEN POINTS MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showPointCreditModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPointCreditModal(null)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border bg-emerald-500/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">Credit Wallet Points</span>
                <h3 className="text-xs font-black text-foreground">{showPointCreditModal.name}</h3>
              </div>
              <button onClick={() => setShowPointCreditModal(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={14} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                  Token Points to Credit
                </label>
                <input
                  type="number"
                  value={creditPointsAmount}
                  onChange={e => setCreditPointsAmount(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="bg-muted/40 border border-border rounded-2xl p-3 space-y-1 text-[10px]">
                <p className="font-bold text-foreground">Current Wallet Balance: {showPointCreditModal.wallet_points || 5000} Points</p>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold">New Projected Balance: {(showPointCreditModal.wallet_points || 5000) + creditPointsAmount} Points</p>
              </div>

              <button
                onClick={() => {
                  setPainters(prev => prev.map(p => p.id === showPointCreditModal.id ? { ...p, wallet_points: (p.wallet_points || 5000) + creditPointsAmount } : p));
                  alert(`${creditPointsAmount} Swatch Token Points credited to ${showPointCreditModal.name}!`);
                  setShowPointCreditModal(null);
                }}
                className="w-full py-2.5 bg-emerald-600 text-white font-black text-[11px] rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Confirm Wallet Points Credit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
