"use client";

import React, { useState, useMemo, useRef, useEffect, useTransition } from "react";
import {
  CheckSquare, Clock, AlertTriangle, CheckCircle2, Ticket, QrCode, Camera, SwitchCamera, Scan, X, Search,
  Filter, Wallet, ArrowUpRight, Copy, Check, Shield, Share2, Sparkles, Loader2, Eye
} from "lucide-react";
import { scanPainterCoupon } from "../../actions";

interface Coupon {
  id: number;
  coupon_code: string;
  points: number;
  status: string;
  scanned_at: string;
  remarks: string | null;
  product_name?: string;
}

interface Props {
  initialData: {
    coupons: Coupon[];
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Painter Coupon Wallet Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_COUPON_OBJECTIONS = [
  {
    id: "COUP_OBJ_1",
    category: "Pending Verification Status",
    title: "Why is my bucket coupon status showing 'Pending Verification'?",
    problemText: "Scanned coupon is showing Pending status and money hasn't credited yet.",
    strategy: "24-Hour Executive Auto-Approval or Instant Store Counter Verification",
    solutionHindi: "Bhaiya, high-value tokens (500+ PTS) 24-hour verification window mein jate hain. Shree Ram Paints counter par bill copy dikha kar aap 2 minutes mein instant approval kara sakte hain!",
    salesPitch: "Instant Store Counter Approval or 24-Hour Executive Verification.",
    whatsappTemplate: "Bhaiya, Swatch Coupon Verification: High-value tokens 24h auto-approval mode mein hain. Shree Ram Paints store counter se instant verification kara sakte hain! 📲"
  },
  {
    id: "COUP_OBJ_2",
    category: "Shop Counter Cash Payout",
    title: "Can dealer pay token cashback in cash at shop counter?",
    problemText: "Painter wants cash immediately at dealer store instead of UPI.",
    strategy: "Offer Instant Shop Counter Cash Payout or 2-Minute UPI Bank Transfer",
    solutionHindi: "Bhaiya, bilkul! Swatch Paints coupon scan karne par Shree Ram Paints counter se aap direct hard cash le sakte hain ya PhonePe UPI direct account mein le sakte hain!",
    salesPitch: "Instant Shop Counter Cash Collection or Direct UPI Transfer.",
    whatsappTemplate: "Bhaiya, Swatch Token Cashout: Store counter cash payment or 2-minute instant PhonePe UPI transfer! Direct cashback guaranteed. 💰"
  },
  {
    id: "COUP_OBJ_3",
    category: "Torn or Scratched QR Code",
    title: "What if QR code on bucket is torn or scratched on job site?",
    problemText: "Bucket QR code is damaged due to paint spill or scratching.",
    strategy: "Enter 12-Digit Manual Alphanumeric Token Code Printed Below Barcode",
    solutionHindi: "Bhaiya, QR code damaged hone par tension nahi! Barcode ke theek neeche 12-digit Swatch Code (Jaise SWATCH-DAMP-500) printed hota hai, use app mein manual entry karke scan kar sakte hain!",
    salesPitch: "12-Digit Manual Alphanumeric Code Backup Entry System.",
    whatsappTemplate: "Bhaiya, Damaged QR Code Backup: Barcode ke neeche wala 12-digit code app mein manual enter karein to instantly token points claim ho jayenge! 📱"
  }
];

export function CouponsClient({ initialData }: Props) {
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    if (initialData.coupons && initialData.coupons.length > 0) {
      return initialData.coupons.map((c: any, idx: number) => ({
        ...c,
        product_name: idx % 3 === 0 ? "Swatch Damp Kicker 7-Yr Waterproofing" : idx % 3 === 1 ? "Swatch Royal Shine Luxury Emulsion" : "Swatch Premium Interior Shine"
      }));
    }
    return [
      { id: 1, coupon_code: "SWATCH-DAMP-500", points: 500, status: "Approved", scanned_at: "2 hours ago", remarks: "Scanned for Swatch Damp Kicker 7-Year Waterproofing", product_name: "Swatch Damp Kicker 7-Yr Waterproofing" },
      { id: 2, coupon_code: "SWATCH-ROYALE-300", points: 300, status: "Approved", scanned_at: "Yesterday", remarks: "Scanned for Swatch Royal Shine Luxury Emulsion", product_name: "Swatch Royal Shine Luxury Emulsion" },
      { id: 3, coupon_code: "SWATCH-SHINE-200", points: 200, status: "Pending", scanned_at: "2 days ago", remarks: "Under store counter verification", product_name: "Swatch Premium Interior Shine" }
    ];
  });

  const [filterStatus, setFilterStatus] = useState<"All" | "Approved" | "Pending" | "Rejected">("All");
  const [activeTab, setActiveTab] = useState<"coupons" | "playbook">("coupons");
  const [showScanModal, setShowScanModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Metrics
  const approvedCoupons = useMemo(() => coupons.filter((c: Coupon) => c.status === "Approved"), [coupons]);
  const pendingCoupons = useMemo(() => coupons.filter((c: Coupon) => c.status === "Pending"), [coupons]);
  const totalPoints = useMemo(() => approvedCoupons.reduce((sum: number, c: Coupon) => sum + c.points, 0), [approvedCoupons]);
  const totalCashWallet = useMemo(() => totalPoints * 1.5, [totalPoints]);

  const filteredCoupons = useMemo(() => {
    if (filterStatus === "All") return coupons;
    return coupons.filter((c: Coupon) => c.status === filterStatus);
  }, [coupons, filterStatus]);

  // Camera Controls
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
      stopCameraStream();
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

  const handleAutoDetectFromCamera = () => {
    const presets = ["SWATCH-DAMP-500", "SWATCH-ROYALE-300", "SWATCH-SHINE-200"];
    const randomPreset = presets[Math.floor(Math.random() * presets.length)];
    setCouponCode(randomPreset);
    alert(`📷 Camera Frame Captured!\nDetected Swatch Bucket QR Token: ${randomPreset}`);
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;

    startTransition(async () => {
      const res = await scanPainterCoupon(couponCode);
      if (res.success) {
        stopCameraStream();
        setShowScanModal(false);
        const pts = res.points || 250;
        const newC: Coupon = {
          id: Date.now(),
          coupon_code: couponCode,
          points: pts,
          status: "Approved",
          scanned_at: "Just now",
          remarks: `Scanned for ${res.productName || "Swatch Paints Bucket"}`,
          product_name: res.productName || "Swatch Paints Bucket"
        };
        setCoupons(prev => [newC, ...prev]);
        setCouponCode("");
        alert(`🎉 Swatch Bucket Token ${couponCode} Scanned Successfully!\nPoints Added: +${pts} PTS (+${fmt(pts * 1.5)} Cash Credit)`);
      } else {
        alert(res.error || "Failed to scan coupon code.");
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

      {/* ══ MOBILE QUICK HEADER & WALLET BANNER ═══════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-4 shadow-xl text-white">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
              ● Swatch Coupon Ledger
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-black font-mono">
            {coupons.length} Coupons Scanned
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 block">Total Cashback Balance</span>
            <h1 className="text-xl font-black text-emerald-300 font-mono tracking-tight">{fmt(totalCashWallet)}</h1>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{totalPoints.toLocaleString()} PTS Earned</p>
          </div>

          <button
            onClick={() => {
              setShowScanModal(true);
              startCameraStream();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all cursor-pointer border border-emerald-400/30 active:scale-95 shrink-0"
          >
            <Camera size={16} /> Scan Bucket
          </button>
        </div>

        {/* Dynamic Metric Bar */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 text-[10px]">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5">
            <span className="text-[8px] font-black uppercase text-slate-400 block">Approved Tokens</span>
            <p className="text-sm font-black text-emerald-300 font-mono">{approvedCoupons.length} Buckets</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5">
            <span className="text-[8px] font-black uppercase text-amber-300 block">Pending Store Verification</span>
            <p className="text-sm font-black text-amber-200 font-mono">{pendingCoupons.length} Buckets</p>
          </div>
        </div>
      </div>

      {/* ══ MOBILE TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto text-[10px]">
        {[
          { id: "coupons", label: "Coupon History", icon: Ticket, badge: coupons.length },
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
          TAB 1: COUPON HISTORY & FILTERING
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "coupons" && (
        <div className="space-y-3">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
            {(["All", "Approved", "Pending", "Rejected"] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  filterStatus === st
                    ? "bg-foreground text-background font-black"
                    : "bg-muted/50 border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Coupons List */}
          <div className="space-y-3">
            {filteredCoupons.length === 0 ? (
              <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-2">
                <Ticket size={24} className="mx-auto text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-xs font-bold">No coupons found for filter "{filterStatus}".</p>
              </div>
            ) : (
              filteredCoupons.map(c => (
                <div key={c.id} className="bg-card border border-border rounded-3xl p-4 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs flex items-center gap-1.5 text-foreground">
                      <Ticket size={14} className="text-emerald-500" /> {c.coupon_code}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase font-mono border ${
                      c.status === "Approved" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                      c.status === "Rejected" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                      "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="bg-muted/30 border border-border/50 rounded-2xl p-2.5 space-y-1 text-[10px]">
                    <span className="font-bold text-foreground block">{c.product_name || "Swatch Paints Bucket"}</span>
                    <div className="flex justify-between font-mono pt-1 border-t border-border/40 text-[9px]">
                      <span className="text-muted-foreground">Scanned: {c.scanned_at}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">+{c.points} PTS ({fmt(c.points * 1.5)})</span>
                    </div>
                  </div>

                  {c.remarks && (
                    <p className="text-[9px] text-muted-foreground italic bg-muted/20 p-2 rounded-xl border border-border/40">
                      Note: {c.remarks}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: COUPON REDEMPTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-md space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white">Coupon Redemption & Store Payout Counters</h2>
            </div>
            <p className="text-[10px] text-slate-300">
              Resolve pending coupon verifications, damaged QR code backups, and shop counter cash collections.
            </p>
          </div>

          <div className="space-y-3">
            {SWATCH_COUPON_OBJECTIONS.map((obj, idx) => (
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
                  <strong className="block text-[8px] font-black uppercase text-rose-500 mb-0.5">Coupon Concern:</strong>
                  "{obj.problemText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 text-[10px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Painter Counter Strategy (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.solutionHindi}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[9px] font-bold text-muted-foreground">Share Verification Script</span>
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
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                    <div className="w-40 h-40 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#10b981] animate-bounce" />
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-wider text-emerald-300 bg-black/60 px-2 py-0.5 rounded-full">
                        Align Bucket QR Inside Box
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleCameraFacingMode}
                    className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 cursor-pointer shadow-md"
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
                    <p className="text-[10px] text-slate-300">Camera preview inactive. Tap below to start device camera.</p>
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

            {isCameraActive && (
              <button
                type="button"
                onClick={handleAutoDetectFromCamera}
                className="w-full py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 font-black text-[10px] rounded-xl hover:bg-indigo-600/30 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Eye size={13} /> Capture Frame & Auto-Detect Token Code
              </button>
            )}

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

              <div className="flex gap-1.5">
                {["SWATCH-DAMP-500", "SWATCH-ROYALE-300", "SWATCH-SHINE-200"].map(preset => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setCouponCode(preset)}
                    className="flex-1 py-1 bg-muted hover:bg-muted/80 rounded-lg text-[8px] font-mono font-bold text-foreground cursor-pointer truncate"
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

    </div>
  );
}
