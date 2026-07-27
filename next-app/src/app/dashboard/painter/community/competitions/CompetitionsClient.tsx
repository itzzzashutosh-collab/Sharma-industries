"use client";

import React, { useState, useTransition } from "react";
import {
  Sparkles, Trophy, Calendar, Award, Shield, Copy, Check, Share2, Upload, Gift, Flame, CheckCircle2,
  X, Camera, Loader2, Star, ThumbsUp
} from "lucide-react";

interface Competition {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  reward_pool: string | null;
  days_left?: number;
  my_entry_status?: string;
}

interface Props {
  initialData: {
    competitions: Competition[];
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Painter Competitions & Championship Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_COMPETITION_OBJECTIONS = [
  {
    id: "CMP_OBJ_1",
    category: "Jury Judging Criteria",
    title: "How is the winner judged in Swatch Master Applicator Championship?",
    problemText: "Painter is asking if contest judging is fair and transparent.",
    strategy: "50% Swatch Technical Jury Evaluation + 50% Verified Bucket QR Scans",
    solutionHindi: "Bhaiya, Swatch Championship mein 50% marks Texture Precision & Finish Quality par Swatch Technical Jury deti hai and 50% marks Verified Bucket QR Scans par milte hain. 100% Fair Judging!",
    salesPitch: "50% Technical Jury Evaluation + 50% Verified Bucket QR Scans.",
    whatsappTemplate: "Bhaiya, Swatch Championship Judging: 50% Texture Finish Precision + 50% Verified QR Scans! Submit your feature wall photo & win ₹1,00,000 Cash + Gold Trophy! 🏆"
  },
  {
    id: "CMP_OBJ_2",
    category: "Site Work Validity Window",
    title: "Can I submit photos of site work done last month?",
    problemText: "Painter wants to know if older site photos are eligible for entry.",
    strategy: "Work Completed within Active Contest Window with Verified Swatch QR Scans",
    solutionHindi: "Bhaiya, Swatch Paints bucket QR scan timestamp ke according active contest period ka koi bhi finished site photo upload kar sakte hain. Recent sites 100% eligible hain!",
    salesPitch: "Verified QR Scan Timestamp Validation for Recent Finished Sites.",
    whatsappTemplate: "Bhaiya, Swatch Contest Eligibility: Active scheme window mein finish hue kisi bhi Swatch site ka photo upload karein for instant entry! 📱"
  },
  {
    id: "CMP_OBJ_3",
    category: "Grand Award Ceremony",
    title: "Where do winners collect their cash prize & gold trophy?",
    problemText: "Painter wants to know how prize money is disbursed.",
    strategy: "Grand Award Ceremony at Zonal Swatch Dealer Banquet + Direct Wallet Transfer",
    solutionHindi: "Bhaiya, Winners ko Shree Ram Paints & Swatch Zonal Banquet mein Gold Trophy handover ki jayegi + Cash Prize direct Swatch Cash Wallet mein instantly credit hoga!",
    salesPitch: "Zonal Dealer Banquet Award Presentation + Direct Wallet Cash Payout.",
    whatsappTemplate: "Bhaiya, Swatch Award Banquet: Cash Prize direct wallet mein + Gold Trophy presentation at Hotel Marriott Zonal Banquet! 🥇"
  }
];

export function CompetitionsClient({ initialData }: Props) {
  const [competitions] = useState<Competition[]>(() => {
    if (initialData.competitions && initialData.competitions.length > 0) {
      return initialData.competitions.map((c, idx) => ({
        ...c,
        days_left: idx === 0 ? 10 : 18,
        my_entry_status: idx === 0 ? "Submitted & Verified" : "Not Submitted"
      }));
    }
    return [
      { id: "cmp_1", name: "Swatch Jaipur Master Texture & Stencil Championship 2026", description: "Upload high-res finished site photos of Swatch Metallic Stencils to win cash prize & Gold Trophy.", start_date: "2026-07-01", end_date: "2026-08-15", reward_pool: "₹1,00,000 Cash + Gold Trophy", days_left: 10, my_entry_status: "Submitted & Verified" },
      { id: "cmp_2", name: "Swatch Damp Kicker 100% Zero-Seepage Challenge", description: "Submit before/after waterproofing photos of heavy seepage sites using Swatch Damp Kicker.", start_date: "2026-07-10", end_date: "2026-08-30", reward_pool: "₹50,000 Cash + Airless Spray Machine", days_left: 18, my_entry_status: "Not Submitted" }
    ];
  });

  const [activeTab, setActiveTab] = useState<"contests" | "playbook">("contests");
  const [selectedContest, setSelectedContest] = useState<Competition | null>(null);
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Entry Form
  const [siteTitle, setSiteTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [swatchSeries, setSwatchSeries] = useState("Swatch Royal Shine Luxury Emulsion");

  const handleEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteTitle || !selectedContest) return;

    startTransition(async () => {
      setTimeout(() => {
        alert(`🎉 Entry "${siteTitle}" submitted successfully for ${selectedContest.name}!\nYour entry has been sent to Swatch Technical Jury.`);
        setSelectedContest(null);
        setSiteTitle("");
        setClientName("");
      }, 500);
    });
  };

  const copyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-28 max-w-md mx-auto font-sans text-xs text-foreground px-1 sm:px-0">

      {/* ══ MOBILE QUICK HEADER & COMPETITIONS BANNER ════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-4 shadow-xl text-white">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-wider border border-amber-500/30">
              ● Swatch Championships
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-black font-mono">
            {competitions.length} Live Events
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              <Trophy size={18} className="text-amber-400" /> Swatch Master Applicator Contests
            </h1>
            <p className="text-[10px] text-slate-400">Submit completed Swatch site photos, win cash prize pools & Gold Trophies.</p>
          </div>
        </div>
      </div>

      {/* ══ MOBILE TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto text-[10px]">
        {[
          { id: "contests", label: "Active Contests", icon: Trophy, badge: competitions.length },
          { id: "playbook", label: "Contest Playbook", icon: Shield, badge: "3 Strategies" }
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
          TAB 1: ACTIVE APPLICATOR CONTESTS DIRECTORY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "contests" && (
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Live Swatch Championships</span>

          <div className="space-y-3">
            {competitions.map(c => {
              const isSubmitted = c.my_entry_status === "Submitted & Verified";
              return (
                <div key={c.id} className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        🏆 {c.reward_pool || "₹1,00,000 Cash Pool"}
                      </span>
                      <h3 className="font-extrabold text-foreground text-xs sm:text-sm mt-1">{c.name}</h3>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-black text-[9px] border border-indigo-500/20">
                      {c.days_left || 10} Days Left
                    </span>
                  </div>

                  <p className="text-[10px] text-muted-foreground bg-muted/30 p-2.5 rounded-2xl border border-border/50 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="flex items-center justify-between font-mono text-[9px] text-muted-foreground pt-1 border-t border-border/40">
                    <span>Duration: {c.start_date} to {c.end_date}</span>
                    <span className={isSubmitted ? "text-emerald-600 font-bold" : "text-amber-500 font-bold"}>
                      ● {c.my_entry_status || "Not Submitted"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {isSubmitted ? (
                      <button
                        onClick={() => {
                          const voteTxt = `*SWATCH MASTER APPLICATOR CHAMPIONSHIP ENTRY* 🏆\nApplicator: Rajesh Kumar\nContest: ${c.name}\nView Finished Site Entry & Vote: https://swatchpaints.com/c/entry-9912\n\nSupport my entry on Swatch Paints Portal!`;
                          navigator.clipboard.writeText(voteTxt);
                          alert(`Contest entry vote link for ${c.name} copied for WhatsApp sharing!`);
                        }}
                        className="w-full py-2 bg-indigo-600 text-white font-black text-[10px] rounded-xl hover:bg-indigo-700 cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Share2 size={12} /> Share Entry & Collect Votes on WhatsApp
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedContest(c)}
                        className="w-full py-2 bg-emerald-600 text-white font-black text-[10px] rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Upload size={12} /> Submit Site Photo Entry Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: CONTEST JUDGING OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-md space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white">Championship Judging & Award Ceremony Counters</h2>
            </div>
            <p className="text-[10px] text-slate-300">
              Address painter questions regarding contest judging transparency, recent site eligibility, and award banquets.
            </p>
          </div>

          <div className="space-y-3">
            {SWATCH_COMPETITION_OBJECTIONS.map((obj, idx) => (
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
                  <span className="text-[9px] font-bold text-muted-foreground">Share Contest Script</span>
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
          ENTRY SUBMISSION MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedContest && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-foreground text-xs flex items-center gap-1.5">
                <Upload size={16} className="text-emerald-500" /> Submit Site Photo Entry
              </h3>
              <button onClick={() => setSelectedContest(null)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEntrySubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">
                  Site Project Title *
                </label>
                <input
                  required
                  type="text"
                  value={siteTitle}
                  onChange={e => setSiteTitle(e.target.value)}
                  placeholder="e.g. Royal Villa Stencil Accent Wall"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">
                  Client Name & Location
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="e.g. Vikram Sharma (Malviya Nagar)"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">
                  Swatch Paint Series Applied
                </label>
                <select
                  value={swatchSeries}
                  onChange={e => setSwatchSeries(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none font-bold"
                >
                  <option value="Swatch Royal Shine Luxury Emulsion">Swatch Royal Shine Luxury Emulsion</option>
                  <option value="Swatch Rustic Royale Stencils">Swatch Rustic Royale Stencils</option>
                  <option value="Swatch Damp Kicker 7-Yr Waterproofing">Swatch Damp Kicker 7-Yr Waterproofing</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-border/80 rounded-2xl p-4 text-center space-y-1 bg-muted/20">
                <Camera size={24} className="mx-auto text-indigo-500" />
                <span className="text-[10px] font-bold text-foreground block">Tap to Select Finished Site Photo</span>
                <span className="text-[8px] text-muted-foreground block">High resolution image recommended</span>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                {isPending ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />} Submit Entry to Swatch Technical Jury
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
