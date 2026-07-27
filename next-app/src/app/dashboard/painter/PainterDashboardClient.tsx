"use client";

import React, { useState, useMemo, useRef, useEffect, useTransition } from "react";
import {
  Sparkles, Wallet, Award, CheckCircle2, Clock, Calendar, ArrowRight, Scan, PlusCircle, HelpCircle, X, AlertCircle,
  QrCode, Shield, Copy, Check, Share2, Phone, TrendingUp, Building2, Zap, ArrowDownCircle, ArrowUpRight, Calculator,
  Paintbrush, CheckSquare, Gift, DollarSign, Loader2, UserCheck, Camera, SwitchCamera, Video, Eye
} from "lucide-react";
import { scanPainterCoupon } from "./actions";

interface Props {
  initialData: {
    profile: {
      name: string;
      phone: string;
      locality: string | null;
    };
    metrics: {
      cashWallet: number;
      rewardPoints: number;
      pendingCoupons: number;
      approvedCoupons: number;
      currentRank: string;
      referralEarnings: number;
      completedProjects: number;
    };
    activities: { id: string; type: string; desc: string; time: string }[];
    upcomingMeeting: { name: string; date: string; time: string; venue: string } | null;
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Paints Contractor & Homeowner Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_PAINTER_OBJECTIONS = [
  {
    id: "PAINTER_OBJ_1",
    category: "Product Comparison vs Asian Paints",
    title: "Why should I choose Swatch Emulsion over Asian Paints Royale?",
    problemText: "Ghar ke owner keh rahe hain ki unko sirf Asian Paints Royale hi lagwana hai. Swatch Paints kyun lein?",
    strategy: "Highlight 1.3x Superior Coverage + ₹1,200 Savings per 20L Bucket + 2x Applicator Token Points",
    solutionHindi: "Sir, Swatch Royal Shine Emulsion mein 1.3x extra coverage aur Superior Washability milti hai. Per 20L bucket owner ko ₹1,200 ki direct bachat milti hai aur aapko 2x Swatch Contractor Token Cashback milta hai!",
    salesPitch: "1.3x Higher Coverage + ₹1,200 Bucket Savings for Owner + 2x Cashback Tokens for Painter.",
    whatsappTemplate: "Namaste Sir! Swatch Royal Shine Emulsion advantage: Same Premium Finish + 1.3x Extra Coverage + ₹1,200 per bucket direct savings! Free sample application for your wall today? 🎨"
  },
  {
    id: "PAINTER_OBJ_2",
    category: "Zero Odor & Family Safety",
    title: "Painter sahab, paint ka smell bahut tez hoga kya? Children & pets home at site.",
    problemText: "Ghar mein chhote bachhe hain, kya paint ki badboo se koi dikkat hogi?",
    strategy: "Pitch Swatch Eco-Safe Low VOC Zero Odor Technology",
    solutionHindi: "Ma'am/Sir, Swatch Paints 100% Zero-VOC and Odorless formulation ke sath aata hai. Painting ke baad same day aap room mein bina kisi smell ya suffocating chemical ke reh sakte hain!",
    salesPitch: "100% Eco-Safe Zero Odor Formula = 100% Safe for Children, Elders & Household Pets.",
    whatsappTemplate: "Sir/Ma'am, Swatch Paints Eco-Safe Guarantee: Zero-VOC, Odorless & Non-Toxic formula! Safe for kids & pets. Complete home painting without bad smell! 🌿"
  },
  {
    id: "PAINTER_OBJ_3",
    category: "Token Redemption Payout Time",
    title: "How quickly will token scanner cash transfer to my UPI account?",
    problemText: "Bucket ke andar ka Swatch token scan karne par mera paisa bank mein kitne time mein aayega?",
    strategy: "Instant 2-Minute Direct UPI Bank Payout Guarantee",
    solutionHindi: "Bhaiya, Swatch Paints QR scanner scan hote hi 2 minutes ke andar direct aapke PhonePe / Google Pay / Paytm UPI account mein instant cash credit karta hai. Direct bank account transfer!",
    salesPitch: "Instant 2-Minute Direct UPI Payout upon QR Coupon Scan.",
    whatsappTemplate: "Bhaiya, Swatch Paints Contractor Scanner App: Bucket QR scan karte hi 2 minutes mein direct PhonePe/GPay UPI Cash Transfer! Zero delay guarantee. 📲"
  },
  {
    id: "PAINTER_OBJ_4",
    category: "Dampness & Wall Seepage",
    title: "Can Swatch Damp Kicker stop wall seepage permanently?",
    problemText: "Deewar par seelan (dampness) aur faphoondi bahut ziada hai, kya Swatch Damp Kicker ise rokeyga?",
    strategy: "7-Year Hydro-Lok Waterproofing Warranty + Free Swatch Tech Demo",
    solutionHindi: "Sir, Swatch Damp Kicker 7-Year Waterproof Hydro-Lok Warranty ke sath aata enters. Humari Swatch Technical Team free site inspection karke moisture reading check karti hai aur 100% dry wall guarantee deti hai!",
    salesPitch: "7-Year Waterproof Hydro-Lok Warranty + FREE Swatch Technical Site Inspection.",
    whatsappTemplate: "Sir, Swatch Damp Kicker Waterproofing: 7-Year Seepage Guarantee! Moisture inspection test + sample waterproofing demonstration at your house. Book inspection today! 🛡️"
  },
  {
    id: "PAINTER_OBJ_5",
    category: "Contractor Bulk Pricing",
    title: "Is Swatch Paints price reasonable for full 3BHK contractor billing?",
    problemText: "Pura 3BHK house painting contract hai, kya Swatch Paints mein contractor discount milega?",
    strategy: "Pitch Direct Dealer Bulk Pricing + FREE Metallic Designer Stencil Pack",
    solutionHindi: "Sir, 100L+ Swatch Paints purchase par dealer counter se direct 15% Contractor Bulk Rebate + FREE Metallic Designer Stencil Pack milti hai. Quality best aur budget 100% locked!",
    salesPitch: "15% Contractor Bulk Rebate + Free Metallic Designer Stencil Pack.",
    whatsappTemplate: "Sir, Swatch Paints 3BHK Contractor Offer: 15% Special Bulk Rebate + FREE Metallic Designer Stencil for Feature Wall! Best quality within budget. 🏆"
  }
];

export function PainterDashboardClient({ initialData }: Props) {
  const [profile, setProfile] = useState(initialData.profile);
  const [metrics, setMetrics] = useState(initialData.metrics);
  const [activities, setActivities] = useState(initialData.activities);
  const [activeTab, setActiveTab] = useState<"overview" | "playbook" | "tokens" | "calculator" | "meetings">("overview");

  // QR Scan Modal & Camera State
  const [showScanModal, setShowScanModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Withdraw Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [upiId, setUpiId] = useState("9876543210@paytm");
  const [withdrawAmount, setWithdrawAmount] = useState(5000);
  const [isPending, startTransition] = useTransition();

  // Copy state
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);

  // Calculator State
  const [calcSqFt, setCalcSqFt] = useState<number>(1200); // default 3BHK walls
  const calcBuckets = useMemo(() => Math.ceil(calcSqFt / 280), [calcSqFt]);
  const calcEstEarnings = useMemo(() => calcBuckets * 250, [calcBuckets]);

  // Offline Queue
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("swatch_offline_coupons") || "[]");
      } catch {
        return [];
      }
    }
    return [];
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Camera Media Stream Controls
  // ─────────────────────────────────────────────────────────────────────────────
  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCameraStream = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Live camera video stream is not supported in this browser.");
      }

      stopCameraStream(); // Stop existing track before re-requesting

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("Camera access error:", err);
      setCameraError(err.message || "Camera permission denied or camera not found.");
      setIsCameraActive(false);
    }
  };

  const toggleCameraFacingMode = () => {
    setFacingMode(prev => (prev === "environment" ? "user" : "environment"));
  };

  useEffect(() => {
    if (isCameraActive) {
      startCameraStream();
    }
  }, [facingMode]);

  useEffect(() => {
    if (!showScanModal) {
      stopCameraStream();
    }
  }, [showScanModal]);

  // Simulate Frame Capture & Detection
  const handleAutoDetectFromCamera = () => {
    const presets = ["SWATCH-DAMP-500", "SWATCH-ROYALE-300", "SWATCH-SHINE-200"];
    const randomPreset = presets[Math.floor(Math.random() * presets.length)];
    setCouponCode(randomPreset);
    alert(`📷 Camera Frame Captured!\nDetected QR Code Token: ${randomPreset}`);
  };

  // Scan Submission
  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;

    if (isOffline) {
      const newQueue = [...offlineQueue, couponCode];
      setOfflineQueue(newQueue);
      if (typeof window !== "undefined") {
        localStorage.setItem("swatch_offline_coupons", JSON.stringify(newQueue));
      }
      alert(`[Offline Mode] Swatch Coupon ${couponCode} queued locally. It will sync automatically when online.`);
      stopCameraStream();
      setShowScanModal(false);
      setCouponCode("");
      return;
    }

    startTransition(async () => {
      const res = await scanPainterCoupon(couponCode);
      if (res.success) {
        alert(`🎉 Swatch Token ${couponCode} Scanned Successfully!\nPoints Added: +${res.points || 250} Swatch Points.\nCash Wallet Updated!`);
        stopCameraStream();
        setShowScanModal(false);
        setCouponCode("");
        setMetrics(m => ({
          ...m,
          rewardPoints: m.rewardPoints + (res.points || 250),
          cashWallet: m.cashWallet + ((res.points || 250) * 1.5),
          approvedCoupons: m.approvedCoupons + 1
        }));
      } else {
        alert(res.error || "Failed to scan Swatch coupon code.");
      }
    });
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount > metrics.cashWallet) {
      alert("Insufficient Cash Wallet balance!");
      return;
    }
    setMetrics(m => ({ ...m, cashWallet: m.cashWallet - withdrawAmount }));
    setShowWithdrawModal(false);
    alert(`🎉 Success! ₹${withdrawAmount.toLocaleString("en-IN")} transferred directly to UPI ID ${upiId}! Transaction ID: SWATCH-UPI-${Date.now().toString().slice(-6)}`);
  };

  const copyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-28 max-w-md mx-auto font-sans text-xs text-foreground px-1 sm:px-0">

      {/* ══ MOBILE QUICK HEADER & BRAND BANNER ═══════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-4 shadow-xl text-white">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
              ● Swatch Applicator Hub
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-black">
              {metrics.currentRank || "Gold Partner"}
            </span>
          </div>

          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase border transition-colors cursor-pointer ${
              isOffline ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
            }`}
          >
            {isOffline ? "Offline" : "Online"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              <Paintbrush size={18} className="text-indigo-400" /> {profile.name || "Rajesh Kumar"}
            </h1>
            <p className="text-[10px] text-slate-400">Mobile: <strong className="font-mono text-white">{profile.phone}</strong> • Swatch Certified Applicator</p>
          </div>

          <button
            onClick={() => {
              setShowScanModal(true);
              startCameraStream();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all cursor-pointer border border-emerald-400/30 active:scale-95"
          >
            <Camera size={16} /> Scan Bucket
          </button>
        </div>

        {/* Dynamic Cash Wallet Card */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase text-slate-400 block">UPI Cash Wallet</span>
            <p className="text-base font-black text-emerald-300 font-mono mt-0.5">{fmt(metrics.cashWallet)}</p>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="mt-1 text-[9px] font-black text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Withdraw Cash <ArrowUpRight size={10} />
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase text-indigo-300 block">Swatch Token Points</span>
            <p className="text-base font-black text-indigo-200 font-mono mt-0.5">{metrics.rewardPoints.toLocaleString()} PTS</p>
            <span className="text-[9px] text-slate-400 mt-1">{metrics.approvedCoupons} Buckets Scanned</span>
          </div>
        </div>
      </div>

      {/* ══ MOBILE TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto text-[10px]">
        {[
          { id: "overview", label: "Overview", icon: Zap },
          { id: "playbook", label: "Client Playbook", icon: Shield, badge: "5 Counters" },
          { id: "tokens", label: "Coupons", icon: QrCode, badge: metrics.approvedCoupons },
          { id: "calculator", label: "Paint Estimator", icon: Calculator },
          { id: "meetings", label: "Dealer Meets", icon: Calendar }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
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
          TAB 1: OVERVIEW & QUICK QR SCANNER
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-3">
          {/* Action Trigger Card */}
          <div
            onClick={() => {
              setShowScanModal(true);
              startCameraStream();
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-4 shadow-lg border border-emerald-400/30 flex items-center justify-between cursor-pointer active:scale-98 transition-all"
          >
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-200 block">Live Camera Bucket Scanner</span>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Camera size={16} /> Open Live Camera & Scan QR
              </h3>
              <p className="text-[10px] text-emerald-100">Get +250 points & instant UPI wallet cash credit.</p>
            </div>
            <div className="bg-white/20 p-2.5 rounded-2xl shrink-0">
              <Scan size={22} className="text-white animate-pulse" />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-card border border-border rounded-2xl p-3 text-center">
              <span className="text-[9px] font-black uppercase text-muted-foreground block">Completed</span>
              <p className="text-sm font-black text-foreground font-mono mt-0.5">{metrics.completedProjects} Sites</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-3 text-center">
              <span className="text-[9px] font-black uppercase text-muted-foreground block">Pending QR</span>
              <p className="text-sm font-black text-amber-500 font-mono mt-0.5">{metrics.pendingCoupons} Bucket</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-3 text-center">
              <span className="text-[9px] font-black uppercase text-muted-foreground block">Referrals</span>
              <p className="text-sm font-black text-indigo-500 font-mono mt-0.5">{fmt(metrics.referralEarnings)}</p>
            </div>
          </div>

          {/* Recent Activity Stream */}
          <div className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
            <h3 className="font-extrabold text-foreground text-xs flex items-center gap-1.5">
              <Clock size={14} className="text-indigo-500" /> Recent Token Activity
            </h3>

            <div className="space-y-2">
              {activities.map(act => (
                <div key={act.id} className="bg-muted/30 border border-border/50 rounded-2xl p-2.5 flex items-center justify-between text-[10px]">
                  <div>
                    <span className="font-bold text-foreground block">{act.type}</span>
                    <span className="text-muted-foreground text-[9px]">{act.desc}</span>
                  </div>
                  <span className="text-muted-foreground font-mono text-[8px]">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: SWATCH CONTRACTOR & HOMEOWNER OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-md space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white">Homeowner & Client Objection Counters</h2>
            </div>
            <p className="text-[10px] text-slate-300">
              Win more site contracts by solving client concerns about odor, price comparison, seepage, and token payouts.
            </p>
          </div>

          <div className="space-y-3">
            {SWATCH_PAINTER_OBJECTIONS.map((obj, idx) => (
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
                  <strong className="block text-[8px] font-black uppercase text-rose-500 mb-0.5">Homeowner Objection:</strong>
                  "{obj.problemText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 text-[10px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Painter Counter Strategy (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.solutionHindi}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[9px] font-bold text-muted-foreground">Share Client Pitch</span>
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
                        <Copy size={11} /> Copy Pitch
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
          TAB 3: COUPONS & CASH WALLET
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "tokens" && (
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider block">Wallet Balance</span>
                <h2 className="text-base font-black text-foreground font-mono">{fmt(metrics.cashWallet)}</h2>
              </div>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="px-3 py-2 bg-emerald-600 text-white font-black text-[10px] rounded-xl hover:bg-emerald-700 shadow-xs cursor-pointer"
              >
                Withdraw Cash
              </button>
            </div>

            <div className="bg-muted/30 border border-border/50 rounded-2xl p-3 space-y-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Approved Bucket QR Tokens:</span>
                <span className="font-bold text-foreground font-mono">{metrics.approvedCoupons} Buckets</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending Verification:</span>
                <span className="font-bold text-amber-500 font-mono">{metrics.pendingCoupons} Buckets</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Applicator Reward Points:</span>
                <span className="font-bold text-indigo-500 font-mono">{metrics.rewardPoints} PTS</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-4 space-y-2">
            <h3 className="font-extrabold text-foreground text-xs">Scan New Swatch Bucket QR Token</h3>
            <button
              onClick={() => {
                setShowScanModal(true);
                startCameraStream();
              }}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Camera size={16} /> Open Live Camera & Scan Bucket
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4: PAINT MATERIAL & BUCKET ESTIMATOR
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "calculator" && (
        <div className="bg-card border border-border rounded-3xl p-4 space-y-4 shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider">Site Material Calculator</span>
            <h2 className="text-xs font-black text-foreground flex items-center gap-1.5">
              <Calculator size={15} className="text-indigo-500" /> Swatch 3BHK Paint Bucket Estimator
            </h2>
          </div>

          <div className="space-y-3 text-[10px]">
            <div>
              <label className="font-bold text-muted-foreground uppercase block mb-1">
                Total Wall Painting Area (Sq. Ft.): <strong className="text-foreground font-mono">{calcSqFt} sq ft</strong>
              </label>
              <input
                type="range"
                min={400}
                max={5000}
                step={100}
                value={calcSqFt}
                onChange={e => setCalcSqFt(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div className="bg-muted/30 border border-border/50 rounded-2xl p-3 space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Required 20L Buckets:</span>
                <span className="font-bold text-foreground text-xs">{calcBuckets} Buckets</span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-2">
                <span className="text-muted-foreground">Est. Swatch Token Cash Reward:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{fmt(calcEstEarnings)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 5: UPCOMING APPLICATOR MEETS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "meetings" && (
        <div className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider">Dealer Meets</span>
            <h2 className="text-xs font-black text-foreground flex items-center gap-1.5">
              <Calendar size={15} className="text-indigo-500" /> Swatch Applicator Meetup
            </h2>
          </div>

          {initialData.upcomingMeeting ? (
            <div className="bg-muted/30 border border-border/50 rounded-2xl p-3 space-y-2 text-[10px]">
              <h3 className="font-extrabold text-foreground">{initialData.upcomingMeeting.name}</h3>
              <p className="text-muted-foreground">Date: <strong className="text-foreground">{initialData.upcomingMeeting.date} ({initialData.upcomingMeeting.time})</strong></p>
              <p className="text-muted-foreground">Venue: <strong className="text-foreground">{initialData.upcomingMeeting.venue}</strong></p>
              <button
                onClick={() => alert(`Navigating to ${initialData.upcomingMeeting?.venue}...`)}
                className="w-full py-2 bg-indigo-600 text-white font-black rounded-xl text-[10px] cursor-pointer"
              >
                Get Venue Directions
              </button>
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground">No upcoming meetings scheduled this week.</p>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          LIVE CAMERA QR BUCKET SCANNER MODAL (MOBILE CAMERA ACCESS)
      ══════════════════════════════════════════════════════════════════════ */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-foreground text-xs flex items-center gap-1.5">
                <Camera size={16} className="text-emerald-500" /> Live Camera QR Bucket Scanner
              </h3>
              <button
                onClick={() => {
                  stopCameraStream();
                  setShowScanModal(false);
                }}
                className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* LIVE CAMERA VIEWFINDER STREAM */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-emerald-500/40 shadow-inner flex items-center justify-center min-h-[200px]">
              {isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-52 object-cover"
                  />
                  {/* Viewfinder Target & Laser Line */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                    <div className="w-40 h-40 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      {/* Laser Bar */}
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#10b981] animate-bounce" />
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-wider text-emerald-300 bg-black/60 px-2 py-0.5 rounded-full">
                        Align Bucket QR Inside Box
                      </span>
                    </div>
                  </div>

                  {/* Switch Camera Button */}
                  <button
                    type="button"
                    onClick={toggleCameraFacingMode}
                    className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 cursor-pointer shadow-md"
                    title="Switch Camera (Rear/Front)"
                  >
                    <SwitchCamera size={14} />
                  </button>
                </>
              ) : (
                <div className="p-6 text-center space-y-3 text-white">
                  <Camera size={32} className="mx-auto text-indigo-400 animate-pulse" />
                  {cameraError ? (
                    <div className="space-y-1">
                      <p className="text-[10px] text-rose-400 font-bold">Camera Access Error:</p>
                      <p className="text-[9px] text-slate-300 max-w-[200px] mx-auto">{cameraError}</p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-300">Camera preview inactive. Tap below to start your device camera.</p>
                  )}
                  <button
                    type="button"
                    onClick={startCameraStream}
                    className="px-4 py-2 bg-emerald-600 text-white font-black text-[10px] rounded-xl hover:bg-emerald-700 shadow-md cursor-pointer"
                  >
                    Turn On Device Camera
                  </button>
                </div>
              )}
            </div>

            {/* Auto Detect Capture Trigger */}
            {isCameraActive && (
              <button
                type="button"
                onClick={handleAutoDetectFromCamera}
                className="w-full py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 font-black text-[10px] rounded-xl hover:bg-indigo-600/30 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Eye size={13} /> Capture Frame & Auto-Detect Token Code
              </button>
            )}

            {/* MANUAL CODE & PRESETS FALLBACK */}
            <form onSubmit={handleScanSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">
                  Scanned / Manual Token Code
                </label>
                <input
                  required
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SWATCH-DAMP-500"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 font-mono font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2">
                {["SWATCH-DAMP-500", "SWATCH-ROYALE-300", "SWATCH-SHINE-200"].map(preset => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setCouponCode(preset)}
                    className="flex-1 py-1 bg-muted hover:bg-muted/80 rounded-lg text-[8px] font-mono font-bold text-foreground cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                {isPending ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />} Confirm Token Payout
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          UPI CASH WITHDRAWAL MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-foreground text-xs flex items-center gap-1.5">
                <Wallet size={16} className="text-emerald-500" /> Withdraw Cash to UPI
              </h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">
                  UPI ID (PhonePe / GPay / Paytm)
                </label>
                <input
                  required
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 font-mono font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">
                  Withdrawal Amount (₹) - Max: {fmt(metrics.cashWallet)}
                </label>
                <input
                  required
                  type="number"
                  max={metrics.cashWallet}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 font-mono font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowUpRight size={14} /> Transfer Instantly to Bank Account
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
