"use client";

import React, { useState } from "react";
import {
  User, Award, Shield, CheckCircle2, Phone, MapPin, Briefcase, Calendar, Star, QrCode, Share2,
  Copy, Check, CreditCard, Building2, Sparkles, ShieldCheck, HelpCircle, ArrowRight, Zap, CheckSquare
} from "lucide-react";

interface Props {
  initialData: {
    profile: {
      id: string;
      name: string;
      phone: string;
      locality: string | null;
      address: string | null;
      aadhar_no: string | null;
      total_tokens: number;
      total_redeemed: number;
      status: string;
    };
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Painter Trust & Dealer Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_PROFILE_OBJECTIONS = [
  {
    id: "PROF_OBJ_1",
    category: "Applicator Authenticity",
    title: "How do I verify if you are a genuine Swatch Paints trained applicator?",
    problemText: "Homeowner is asking if you have official training certification from Swatch Paints.",
    strategy: "Show Official Swatch QR Digital Applicator Card + Executive Verification",
    solutionHindi: "Sir/Ma'am, mera Swatch Paints Certified Applicator ID Card dekhye. QR scan karke Swatch Company portal par mere completed 12+ sites aur 7-Year Waterproofing certification verify ho sakti hai!",
    salesPitch: "QR-Verified Swatch Certified Applicator Status + 7-Year Waterproofing Training.",
    whatsappTemplate: "Namaste Sir! I am a Certified Swatch Paints Applicator (ID: SWATCH-APP-9876). View my digital credentials & 7-Year Waterproofing certification here. Happy to inspect your site today! 🎨"
  },
  {
    id: "PROF_OBJ_2",
    category: "Product Warranty Support",
    title: "Will Swatch Paints support 7-Year Warranty if you apply the paint?",
    problemText: "Owner wants to know if company warranty remains valid when applied by contractor.",
    strategy: "Confirm 100% Swatch Factory Hydro-Lok Warranty with Certified Applicators",
    solutionHindi: "Sir, Swatch Paints 7-Year Hydro-Lok Warranty tabhi valid hoti hai jab Swatch Certified Applicator site execute karta hai. Swatch Technical Officer site audit karke official warranty certificate issue karega!",
    salesPitch: "100% Factory Warranty Valid with Certified Applicator Execution.",
    whatsappTemplate: "Sir, Swatch Paints 7-Year Warranty Guarantee: Certified Applicator application ensures 100% official company warranty certificate for your house wall! 🛡️"
  },
  {
    id: "PROF_OBJ_3",
    category: "Dealer Token Payouts",
    title: "Can I collect token cashback directly from dealer shop counter?",
    problemText: "Can painter redeem bucket QR token directly at Shree Ram Paints store?",
    strategy: "Offer Instant Shop Counter Cash Payout or Direct UPI Transfer",
    solutionHindi: "Bhaiya, Swatch Paints bucket token scan hote hi 2 minutes mein aapke PhonePe UPI mein transfer hota hai, ya fir aap Shree Ram Paints counter se direct cash collect kar sakte hain!",
    salesPitch: "Instant Shop Counter Cash Collection or 2-Minute UPI Payout.",
    whatsappTemplate: "Bhaiya, Swatch Paints Token Payout: Store counter cash payment or 2-minute instant PhonePe UPI credit! Zero delay guarantee. 📲"
  },
  {
    id: "PROF_OBJ_4",
    category: "Tier Upgrade Perks",
    title: "How to upgrade from Silver Applicator to Gold & Platinum Tier?",
    problemText: "What are the requirements for unlocking +15% extra token cashback?",
    strategy: "Scan 15 Buckets/Month to Unlock Gold Tier (+15% Bonus Cashback + Free Apron Pack)",
    solutionHindi: "Bhaiya, 1 month mein 15 Swatch Paint buckets scan karne par aap Gold Applicator Tier par upgrade ho jaate hain jisse har token par +15% Extra Bonus Cash + FREE Safety Apron Kit milti hai!",
    salesPitch: "Scan 15 Buckets/Month = Gold Tier Upgrade + 15% Extra Cash Bonus + Safety Kit.",
    whatsappTemplate: "Great news! Swatch Applicator Gold Tier Unlock: 15 buckets scan = +15% Extra Cash Bonus on every token + FREE Master Safety Apron Kit! 🏆"
  }
];

export function MyProfileClient({ initialData }: Props) {
  const [profile] = useState(initialData.profile);
  const [activeTab, setActiveTab] = useState<"card" | "playbook" | "kyc" | "tier">("card");
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);

  // Bank / UPI Details
  const [kycDetails, setKycDetails] = useState({
    upiId: "9876543210@paytm",
    bankName: "State Bank of India (SBI)",
    accountNo: "XXXX-XXXX-4821",
    ifsc: "SBIN0001429",
    panNo: "ABCDE1234F",
    aadhaarNo: profile.aadhar_no || "XXXX-XXXX-8812",
    kycStatus: "VERIFIED (KYC-COMPLETE)",
    preferredDealer: "Shree Ram Paints & Sanitary (Malviya Nagar, Jaipur)"
  });

  const copyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-28 max-w-md mx-auto font-sans text-xs text-foreground px-1 sm:px-0">

      {/* ══ MOBILE QUICK HEADER BANNER ═══════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-4 shadow-xl text-white">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
              ● Swatch Digital Identity
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-black">
              Gold Applicator Tier
            </span>
          </div>

          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase border border-emerald-500/30 font-mono">
            {kycDetails.kycStatus.includes("VERIFIED") ? "KYC VERIFIED" : "PENDING KYC"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-black text-white text-lg shadow-md shrink-0 border border-white/20">
            {profile.name ? profile.name.charAt(0).toUpperCase() : "R"}
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              {profile.name} <CheckCircle2 size={15} className="text-emerald-400 fill-emerald-400/20" />
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Swatch ID: SWATCH-APP-9876 • Mobile: {profile.phone}</p>
          </div>
        </div>
      </div>

      {/* ══ MOBILE TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto text-[10px]">
        {[
          { id: "card", label: "Digital ID Card", icon: User },
          { id: "playbook", label: "Client Trust Playbook", icon: Shield, badge: "4 Strategies" },
          { id: "kyc", label: "UPI & Bank KYC", icon: CreditCard },
          { id: "tier", label: "Milestones & Perks", icon: Award }
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
          TAB 1: DIGITAL SWATCH APPLICATOR MEMBERSHIP CARD
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "card" && (
        <div className="space-y-3">
          {/* DIGITAL APPLICATOR BADGE CARD */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-indigo-500/40 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 p-5 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center font-black text-indigo-300">
                  S
                </div>
                <div>
                  <span className="text-[10px] font-black text-white uppercase tracking-wider block">SWATCH PAINTS</span>
                  <span className="text-[8px] text-slate-400 block font-mono">Official Applicator Network</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest border border-emerald-500/30">
                VERIFIED APPLICATOR
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-400 flex items-center justify-center font-black text-white text-xl shadow-lg border-2 border-white/20">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "R"}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-white flex items-center gap-1">
                  {profile.name} <CheckCircle2 size={14} className="text-emerald-400 fill-emerald-400/20" />
                </h3>
                <p className="text-[10px] text-slate-300 font-mono">ID: SWATCH-APP-9876</p>
                <p className="text-[9px] text-indigo-300 font-bold">Gold Partner Applicator (3.5% Bonus)</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1.5 text-[10px]">
              <div className="flex justify-between text-slate-300">
                <span>Territory Locality:</span>
                <strong className="text-white">{profile.locality || "Jaipur Central & Urban"}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Associated Store:</span>
                <strong className="text-white">Shree Ram Paints & Sanitary</strong>
              </div>
              <div className="flex justify-between text-slate-300 border-t border-white/10 pt-1.5">
                <span>Certified Specialties:</span>
                <strong className="text-emerald-300 font-mono">Waterproofing & Royal Emulsions</strong>
              </div>
            </div>

            <button
              onClick={() => {
                const cardTxt = `*SWATCH PAINTS CERTIFIED APPLICATOR CARD* 🎨\nApplicator Name: ${profile.name}\nSwatch ID: SWATCH-APP-9876\nStatus: Certified Gold Applicator\nTerritory: ${profile.locality || "Jaipur"}\nSpecialties: 7-Year Waterproofing & Royal Shine Emulsions\n\nCall for site inspection & 100% genuine Swatch warranty installation!`;
                navigator.clipboard.writeText(cardTxt);
                alert("Digital Applicator Card details copied for WhatsApp sharing!");
              }}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-[10px] rounded-xl hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
            >
              <Share2 size={13} /> Share Digital ID Card on WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: CLIENT TRUST & OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-md space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white">Dealer & Client Trust Playbook</h2>
            </div>
            <p className="text-[10px] text-slate-300">
              Build instant credibility with homeowners and dealer counters using official Swatch training credentials.
            </p>
          </div>

          <div className="space-y-3">
            {SWATCH_PROFILE_OBJECTIONS.map((obj, idx) => (
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
                  <strong className="block text-[8px] font-black uppercase text-rose-500 mb-0.5">Homeowner Query:</strong>
                  "{obj.problemText}"
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 text-[10px] text-emerald-700 dark:text-emerald-300 space-y-1">
                  <strong className="block text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    💡 Painter Counter Strategy (Hindi):
                  </strong>
                  <p className="leading-relaxed font-medium">{obj.solutionHindi}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[9px] font-bold text-muted-foreground">Share Trust Script</span>
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
          TAB 3: UPI & BANK KYC DETAILS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "kyc" && (
        <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="space-y-1 border-b border-border pb-3">
            <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider">Payout Account Verification</span>
            <h2 className="text-xs font-black text-foreground flex items-center gap-1.5">
              <CreditCard size={16} className="text-emerald-500" /> UPI & Bank KYC Details
            </h2>
          </div>

          <div className="space-y-3 text-[10px]">
            <div>
              <label className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Direct Payout UPI ID</label>
              <input
                type="text"
                value={kycDetails.upiId}
                onChange={e => setKycDetails(prev => ({ ...prev, upiId: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 font-mono font-bold text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={kycDetails.bankName}
                  onChange={e => setKycDetails(prev => ({ ...prev, bankName: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 font-bold text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Account No.</label>
                <input
                  type="text"
                  value={kycDetails.accountNo}
                  onChange={e => setKycDetails(prev => ({ ...prev, accountNo: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 font-mono text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Associated Swatch Paints Dealer Counter</label>
              <input
                type="text"
                value={kycDetails.preferredDealer}
                onChange={e => setKycDetails(prev => ({ ...prev, preferredDealer: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 font-bold text-foreground outline-none focus:border-primary"
              />
            </div>

            <button
              onClick={() => alert("Bank Account & UPI Payout settings saved successfully!")}
              className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl text-xs hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
            >
              Save Bank & UPI Payout Settings
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4: APPLICATOR MILESTONES & PERKS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "tier" && (
        <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider">Applicator Level</span>
            <h2 className="text-xs font-black text-foreground flex items-center gap-1.5">
              <Award size={16} className="text-indigo-500" /> Gold Applicator Tier Perks
            </h2>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between font-bold text-[10px]">
              <span className="text-foreground">Gold Level Progress (15 / 20 Buckets)</span>
              <span className="text-primary font-mono">75%</span>
            </div>
            <div className="w-full bg-muted/40 h-2.5 rounded-full overflow-hidden border border-border/40">
              <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full" style={{ width: "75%" }} />
            </div>
            <p className="text-[9px] text-muted-foreground">Scan 5 more buckets this month to unlock Platinum Applicator status!</p>
          </div>

          <div className="space-y-2 text-[10px]">
            <span className="font-black uppercase text-muted-foreground block text-[9px]">Gold Tier Benefits:</span>
            {[
              "1.5x Swatch Token Points conversion rate (1 PTS = ₹1.5 Cash)",
              "+15% Annual Bonus Rebate on 100+ bucket scans",
              "FREE Swatch Safety Apron & Painter Kit delivered to shop",
              "Priority 2-Minute Direct Bank UPI Token Transfer"
            ].map((b, i) => (
              <div key={i} className="flex items-start gap-2 bg-muted/30 p-2.5 rounded-xl">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-medium text-foreground">{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
