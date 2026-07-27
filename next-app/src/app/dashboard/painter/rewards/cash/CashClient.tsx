"use client";

import React, { useState, useMemo } from "react";
import {
  Wallet, HelpCircle, ArrowUpRight, ArrowDownLeft, Clock, Shield, Copy, Check, Share2, Sparkles,
  CreditCard, CheckCircle2, DollarSign, X, Building2, Ticket, ArrowDownCircle, RefreshCw
} from "lucide-react";

interface Props {
  initialData: {
    profile: {
      total_tokens: number;
    };
    ledger: {
      id: string;
      transaction_type: string;
      amount: number;
      created_at: string;
    }[];
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Painter Cash Wallet & Dealer Cashout Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_CASH_OBJECTIONS = [
  {
    id: "CASH_OBJ_1",
    category: "UPI Transfer Processing",
    title: "What should I do if UPI withdrawal status shows 'Processing' for >5 mins?",
    problemText: "Bank UPI transfer is taking time or pending processing.",
    strategy: "Automatic IMPS Retry System + Direct Store Counter Hard Cash Collection",
    solutionHindi: "Bhaiya, agar UPI server busy hone ki wajah se 5 minutes tak transfer pending rehta hai, toh Swatch System automatic IMPS Bank Retry execute karta hai ya Shree Ram Paints store counter se cash le sakte hain!",
    salesPitch: "Automatic IMPS Bank Retry + Instant Store Counter Cash Backup.",
    whatsappTemplate: "Bhaiya, Swatch Cash Payout Status: UPI server busy hone par automatic IMPS Bank Retry active hai. Shree Ram Paints counter se direct cash bhi collect kar sakte hain! 📲"
  },
  {
    id: "CASH_OBJ_2",
    category: "Zero Transaction Fee Guarantee",
    title: "Are there any transaction fees or TDS deductions when withdrawing cash?",
    problemText: "Painter is asking if 100% full amount will be credited without deductions.",
    strategy: "0% Transaction Fee — 100% Full Cash Payout Direct to Bank Account",
    solutionHindi: "Bhaiya, Swatch Paints 100% Free Transfer Guarantee deti hai! Jitna Wallet Cash Balance aap withdraw karenge (Jaise ₹5,000), poora ₹5,000 aapke bank mein zero deduction ke sath aayega!",
    salesPitch: "0% Transaction Fee = 100% Full Direct Cash Payout Guarantee.",
    whatsappTemplate: "Bhaiya, Swatch 100% Free Transfer: Zero transaction fee & zero deduction! Full ₹5,000 wallet balance direct bank mein aayega. 💳"
  },
  {
    id: "CASH_OBJ_3",
    category: "Store Counter Cash Pickup Voucher",
    title: "Can I collect hard cash directly from Shree Ram Paints store counter instead of UPI?",
    problemText: "Painter does not have active UPI app and wants hard cash at dealer counter.",
    strategy: "Generate Store Counter Hard Cash Pickup Voucher with QR Code",
    solutionHindi: "Bhaiya, bilkul! App mein 'Store Cash Pickup Voucher' button tap karke QR Voucher generate karein aur Shree Ram Paints store counter par dikha kar instant hard cash collect karein!",
    salesPitch: "Instant Store Counter Hard Cash Pickup Voucher System.",
    whatsappTemplate: "Bhaiya, Store Hard Cash Pickup: App se Store Cash Voucher generate karein aur Shree Ram Paints counter se direct hard cash collect karein! 🏪"
  }
];

export function CashClient({ initialData }: Props) {
  const [profile] = useState(initialData.profile);
  const initialCashWallet = Number(profile.total_tokens || 3420) * 1.5;
  const [cashWallet, setCashWallet] = useState(initialCashWallet);
  const [activeTab, setActiveTab] = useState<"wallet" | "playbook">("wallet");
  const [filterType, setFilterType] = useState<"All" | "Payouts" | "Credits">("All");

  // Modals State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [upiId, setUpiId] = useState("9876543210@paytm");
  const [withdrawAmount, setWithdrawAmount] = useState(5000);
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);

  // Transactions Ledger
  const [transactions, setTransactions] = useState([
    { id: "tx_1", type: "Bucket Token Cashback Credit", category: "Credit", amount: 750, date: "Today, 2:30 PM", ref: "SWATCH-TOKEN-DAMP500" },
    { id: "tx_2", type: "UPI Bank Transfer to PhonePe", category: "Payout", amount: -2500, date: "Yesterday", ref: "SWATCH-UPI-98721" },
    { id: "tx_3", type: "Store Counter Hard Cash Pickup", category: "Payout", amount: -1500, date: "3 days ago", ref: "SHREE-RAM-CASH-441" },
    { id: "tx_4", type: "Monsoon Scheme Bonus Credit", category: "Credit", amount: 450, date: "5 days ago", ref: "SWATCH-BONUS-991" }
  ]);

  const filteredTransactions = useMemo(() => {
    if (filterType === "All") return transactions;
    if (filterType === "Payouts") return transactions.filter(t => t.category === "Payout");
    return transactions.filter(t => t.category === "Credit");
  }, [transactions, filterType]);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount > cashWallet) {
      alert("Insufficient Cash Wallet balance!");
      return;
    }

    setCashWallet(prev => prev - withdrawAmount);
    const newTx = {
      id: `tx_${Date.now()}`,
      type: `UPI Bank Transfer to ${upiId}`,
      category: "Payout",
      amount: -withdrawAmount,
      date: "Just now",
      ref: `SWATCH-UPI-${Date.now().toString().slice(-5)}`
    };
    setTransactions(prev => [newTx, ...prev]);
    setShowWithdrawModal(false);
    alert(`🎉 Success! ₹${withdrawAmount.toLocaleString("en-IN")} transferred directly to UPI ID ${upiId}! Reference ID: ${newTx.ref}`);
  };

  const copyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-28 max-w-md mx-auto font-sans text-xs text-foreground px-1 sm:px-0">

      {/* ══ MOBILE QUICK HEADER & CASH BANNER ═══════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-4 shadow-xl text-white">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
              ● Swatch Cash Wallet
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black font-mono">
            0% Transfer Fee
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 block">Available Cash Balance</span>
            <h1 className="text-2xl font-black text-emerald-300 font-mono tracking-tight">{fmt(cashWallet)}</h1>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Direct UPI & Bank Transfer Ready</p>
          </div>

          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center gap-1 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all cursor-pointer border border-emerald-400/30 shrink-0"
          >
            <ArrowUpRight size={16} /> Withdraw
          </button>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 text-[10px]">
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-[10px] cursor-pointer flex items-center justify-center gap-1 shadow-xs"
          >
            <CreditCard size={12} /> Instant UPI Payout
          </button>

          <button
            onClick={() => setShowVoucherModal(true)}
            className="py-2 px-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black rounded-xl text-[10px] cursor-pointer flex items-center justify-center gap-1 shadow-xs"
          >
            <Ticket size={12} /> Store Cash Voucher
          </button>
        </div>
      </div>

      {/* ══ MOBILE TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto text-[10px]">
        {[
          { id: "wallet", label: "Wallet Statement", icon: Wallet, badge: transactions.length },
          { id: "playbook", label: "Cashout Playbook", icon: Shield, badge: "3 Strategies" }
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
          TAB 1: WALLET STATEMENT & LEDGER HISTORY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "wallet" && (
        <div className="space-y-3">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
            {(["All", "Payouts", "Credits"] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterType(st)}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  filterType === st
                    ? "bg-foreground text-background font-black"
                    : "bg-muted/50 border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Transactions List */}
          <div className="space-y-2.5">
            {filteredTransactions.map(t => (
              <div key={t.id} className="bg-card border border-border rounded-3xl p-3.5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      t.amount > 0 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                    }`}>
                      {t.amount > 0 ? <ArrowDownCircle size={15} /> : <ArrowUpRight size={15} />}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-foreground text-xs">{t.type}</h4>
                      <span className="text-[9px] text-muted-foreground font-mono">{t.date}</span>
                    </div>
                  </div>

                  <span className={`font-mono font-black text-xs ${t.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                    {t.amount > 0 ? `+${fmt(t.amount)}` : fmt(t.amount)}
                  </span>
                </div>

                <div className="bg-muted/30 border border-border/50 rounded-xl px-2.5 py-1 flex justify-between text-[9px] font-mono text-muted-foreground">
                  <span>Ref: {t.ref}</span>
                  <span className="text-emerald-600 font-bold">● SUCCESSFUL</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: CASHOUT OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-md space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white">Cashout & UPI Transfer Counters</h2>
            </div>
            <p className="text-[10px] text-slate-300">
              Address painter queries regarding pending UPI transfers, zero transaction fees, and store cash pickup.
            </p>
          </div>

          <div className="space-y-3">
            {SWATCH_CASH_OBJECTIONS.map((obj, idx) => (
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
                  <strong className="block text-[8px] font-black uppercase text-rose-500 mb-0.5">Painter Concern:</strong>
                  "{obj.problemText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 text-[10px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Painter Counter Strategy (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.solutionHindi}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[9px] font-bold text-muted-foreground">Share Cashout Script</span>
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
          INSTANT UPI CASH WITHDRAWAL MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-foreground text-xs flex items-center gap-1.5">
                <Wallet size={16} className="text-emerald-500" /> Instant UPI Bank Payout
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
                  Withdrawal Amount (₹) - Max: {fmt(cashWallet)}
                </label>
                <input
                  required
                  type="number"
                  max={cashWallet}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 font-mono font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <ArrowUpRight size={14} /> Transfer Instantly to Bank Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STORE HARD CASH PICKUP VOUCHER MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-emerald-500/40 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-foreground text-xs flex items-center gap-1.5">
                <Ticket size={16} className="text-emerald-500" /> Store Counter Cash Pickup Voucher
              </h3>
              <button onClick={() => setShowVoucherModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500/40 w-40 h-40 mx-auto flex flex-col items-center justify-center space-y-1 shadow-md">
              <Ticket size={80} className="text-slate-900" />
              <span className="text-[8px] font-mono font-black text-slate-900">SHREE-RAM-CASH-441</span>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">Authorized Cash Pickup Store</span>
              <h4 className="font-black text-foreground text-xs">Shree Ram Paints & Sanitary (Malviya Nagar)</h4>
              <p className="text-[10px] text-muted-foreground font-mono">Pickup Voucher Value: <strong className="text-emerald-600 font-bold">{fmt(cashWallet)}</strong></p>
            </div>

            <button
              onClick={() => {
                alert("Voucher details copied! Show this QR Voucher at Shree Ram Paints store counter for hard cash pickup.");
                setShowVoucherModal(false);
              }}
              className="w-full py-3 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-700 transition-colors shadow-md cursor-pointer"
            >
              Done & Close Voucher
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
