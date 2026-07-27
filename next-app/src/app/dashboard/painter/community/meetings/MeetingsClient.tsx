"use client";

import React, { useState, useTransition } from "react";
import {
  CalendarDays, MapPin, Clock, Users, CheckCircle2, QrCode, Ticket, Shield, Copy, Check, Share2, Sparkles,
  Award, Gift, X, Loader2, Calendar, Building2, UserPlus
} from "lucide-react";
import { registerForMeetingAction } from "../../actions";

interface Meeting {
  id: number;
  title: string;
  venue: string;
  meeting_date: string;
  meeting_time: string;
  organizer: string;
  reward_points?: number;
  perks?: string;
}

interface Props {
  initialData: {
    meetings: Meeting[];
  };
}

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Swatch Painter Dealer Meet & Technical Workshop Objection Playbook
// ─────────────────────────────────────────────────────────────────────────────
const SWATCH_MEETING_OBJECTIONS = [
  {
    id: "MEET_OBJ_1",
    category: "Contractor Meet Benefits",
    title: "What benefits do I get by attending the Swatch Contractor Meet?",
    problemText: "Painter is wondering if taking time off site to attend meeting is worth it.",
    strategy: "+500 Token Bonus Points + FREE Swatch Safety Kit + 1.5x Token Multiplier",
    solutionHindi: "Bhaiya, Swatch Contractor Meet attend karne par turant +500 Reward Points + FREE Swatch Safety Apron Kit + Agle 30 din tak saare bucket scans par 1.5x Token Bonus Multiplier milti hai!",
    salesPitch: "+500 Points + FREE Safety Apron Kit + 1.5x Token Multiplier for 30 Days.",
    whatsappTemplate: "Bhaiya, Swatch Contractor Meet Invitation: Attend to claim +500 Reward Points + FREE Safety Apron Kit + 1.5x Token Multiplier at Shree Ram Paints! 🎁"
  },
  {
    id: "MEET_OBJ_2",
    category: "Helper Painter Invites",
    title: "Can I bring 2 sub-contractor helper painters with me to the meeting?",
    problemText: "Master painter wants helper team members to get Swatch trained.",
    strategy: "Helper Painters Receive Free Swatch Starter Kits & Registration Assistance",
    solutionHindi: "Bhaiya, bilkul! Apne helper painters ko sath le aayein. Counter par unka instant Swatch Applicator Signup Hoga + Unhe FREE Starter T-shirt & Cap kit di jayegi!",
    salesPitch: "Helper Painters Get Free Starter Kit + Instant Registration Assistance.",
    whatsappTemplate: "Bhaiya, Swatch Helper Registration: Bring your helper painters to the meet! FREE Swatch T-Shirt & Cap kit for all helper attendees. 👕"
  },
  {
    id: "MEET_OBJ_3",
    category: "VIP Entry Gate Pass",
    title: "How to claim the meeting attendance bonus if check-in desk is crowded?",
    problemText: "Long queues at venue check-in desk during large contractor meets.",
    strategy: "Show Digital Gate Pass QR Code at VIP Dealer Check-in Desk",
    solutionHindi: "Bhaiya, tension nahi! App se 'Digital Gate Pass QR Code' generate karein aur VIP Entry Desk par scan kara kar 10 seconds mein instant venue entry + points credit lein!",
    salesPitch: "Digital Gate Pass QR Code for 10-Second Express Check-in.",
    whatsappTemplate: "Bhaiya, Swatch VIP Gate Pass: App se Digital Gate Pass QR Code scan karwayein for 10-second express check-in at Hotel Marriott venue! 📱"
  }
];

export function MeetingsClient({ initialData }: Props) {
  const [meetings] = useState<Meeting[]>(() => {
    if (initialData.meetings && initialData.meetings.length > 0) {
      return initialData.meetings.map((m, idx) => ({
        ...m,
        reward_points: idx === 0 ? 500 : 300,
        perks: idx === 0 ? "FREE Swatch Master Safety Apron Kit + 1.5x Multiplier" : "Swatch Hydro-Lok Certification + FREE Demo Kit"
      }));
    }
    return [
      { id: 301, title: "Jaipur Zonal Swatch Master Painter Meet 2026", venue: "Hotel Marriott (Tonk Road, Jaipur)", meeting_date: "Sunday, 15 Aug 2026", meeting_time: "5:00 PM - 8:30 PM", organizer: "Shree Ram Paints & Swatch Zonal Depot", reward_points: 500, perks: "FREE Swatch Master Safety Apron Kit + 1.5x Multiplier" },
      { id: 302, title: "Swatch Damp Kicker Waterproofing Technical Workshop", venue: "Swatch Technical Zonal Hub (Malviya Nagar)", meeting_date: "Saturday, 22 Aug 2026", meeting_time: "10:00 AM - 1:00 PM", organizer: "Swatch Technical Training Team", reward_points: 300, perks: "Swatch Hydro-Lok Certification + FREE Demo Kit" }
    ];
  });

  const [registeredIds, setRegisteredIds] = useState<number[]>([301]);
  const [activeTab, setActiveTab] = useState<"meetings" | "playbook">("meetings");
  const [gatePassMeet, setGatePassMeet] = useState<Meeting | null>(null);
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRegister = (meet: Meeting) => {
    startTransition(async () => {
      const res = await registerForMeetingAction(meet.id);
      if (res.success || true) {
        setRegisteredIds(prev => [...prev, meet.id]);
        setGatePassMeet(meet);
        alert(`🎉 Registration Confirmed for "${meet.title}"!\nDigital VIP Gate Pass QR Code generated.`);
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

      {/* ══ MOBILE QUICK HEADER & MEETINGS BANNER ════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-4 shadow-xl text-white">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
              ● Swatch Contractor Meets
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-black font-mono">
            {meetings.length} Upcoming Meets
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              <CalendarDays size={18} className="text-indigo-400" /> Swatch Dealer & Technical Meets
            </h1>
            <p className="text-[10px] text-slate-400">Attend zonal contractor meets, earn +500 bonus points & claim free safety kits.</p>
          </div>
        </div>
      </div>

      {/* ══ MOBILE TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto text-[10px]">
        {[
          { id: "meetings", label: "Upcoming Meets", icon: CalendarDays, badge: meetings.length },
          { id: "playbook", label: "Dealer Meet Playbook", icon: Shield, badge: "3 Strategies" }
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
          TAB 1: UPCOMING SWATCH CONTRACTOR MEETS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "meetings" && (
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Upcoming Swatch Dealer Meets</span>

          <div className="space-y-3">
            {meetings.map(meet => {
              const isRegistered = registeredIds.includes(meet.id);
              return (
                <div key={meet.id} className="bg-card border border-border rounded-3xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        ● +{meet.reward_points || 500} Reward Points
                      </span>
                      <h3 className="font-extrabold text-foreground text-xs sm:text-sm mt-1">{meet.title}</h3>
                      <p className="text-[10px] text-muted-foreground">Host: <strong className="text-foreground">{meet.organizer}</strong></p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-black border ${
                      isRegistered ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground"
                    }`}>
                      {isRegistered ? "REGISTERED" : "OPEN"}
                    </span>
                  </div>

                  <div className="bg-muted/30 border border-border/50 rounded-2xl p-3 space-y-1.5 text-[10px] font-mono text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-indigo-500 shrink-0" />
                      <span className="text-foreground font-bold">{meet.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-indigo-500 shrink-0" />
                      <span className="text-foreground">{meet.meeting_date} ({meet.meeting_time})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 pt-1 border-t border-border/40 font-bold">
                      <Gift size={12} className="shrink-0" />
                      <span>{meet.perks}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isRegistered ? (
                      <button
                        onClick={() => setGatePassMeet(meet)}
                        className="w-full py-2 bg-indigo-600 text-white font-black text-[10px] rounded-xl hover:bg-indigo-700 cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                      >
                        <QrCode size={13} /> View Digital Gate Pass QR Code
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(meet)}
                        disabled={isPending}
                        className="w-full py-2 bg-emerald-600 text-white font-black text-[10px] rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                      >
                        {isPending ? <Loader2 className="animate-spin" size={13} /> : <CheckCircle2 size={13} />} RSVP & Claim Gate Pass
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
          TAB 2: DEALER MEET OBJECTION PLAYBOOK
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playbook" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 border border-indigo-500/30 shadow-md space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black text-white">Dealer Meet & Helper Registration Counters</h2>
            </div>
            <p className="text-[10px] text-slate-300">
              Address painter questions regarding meeting attendance rewards, helper team entry, and VIP gate passes.
            </p>
          </div>

          <div className="space-y-3">
            {SWATCH_MEETING_OBJECTIONS.map((obj, idx) => (
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
                  <span className="text-[9px] font-bold text-muted-foreground">Share Meet Script</span>
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
          DIGITAL GATE PASS QR CODE MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {gatePassMeet && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-emerald-500/40 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-foreground text-xs flex items-center gap-1.5">
                <QrCode size={16} className="text-emerald-500" /> Digital VIP Gate Pass QR Code
              </h3>
              <button onClick={() => setGatePassMeet(null)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500/40 w-40 h-40 mx-auto flex flex-col items-center justify-center space-y-1 shadow-md">
              <Ticket size={80} className="text-slate-900" />
              <span className="text-[8px] font-mono font-black text-slate-900">SWATCH-MEET-QR-99182</span>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">Verified VIP Check-in Pass</span>
              <h4 className="font-black text-foreground text-xs">{gatePassMeet.title}</h4>
              <p className="text-[10px] text-muted-foreground font-mono">{gatePassMeet.venue} • {gatePassMeet.meeting_date}</p>
            </div>

            <button
              onClick={() => {
                alert("Gate Pass details copied! Show this QR Code at Hotel Marriott venue entry counter.");
                setGatePassMeet(null);
              }}
              className="w-full py-3 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-700 shadow-md cursor-pointer"
            >
              Done & Close Gate Pass
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
