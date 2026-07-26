"use client";

import React, { useState, useTransition, useEffect, useMemo } from "react";
import {
  CalendarDays, Plus, Search, MapPin, Clock, Users, Gift, Coffee,
  Sparkles, CheckCircle2, X, ArrowRight, ShieldCheck, FileText,
  Award, Building2, UserCheck, CheckSquare, Layers, Send, UserPlus
} from "lucide-react";
import { createDealerMeeting, invitePainterToMeeting } from "../../actions";

interface Attendee {
  id: string;
  name: string;
  phone: string;
  status: string;
  gift_claimed: boolean;
  rsvp_date?: string;
}

interface Meeting {
  id: string;
  title: string;
  type: string;
  venue: string;
  date: string;
  time: string;
  status: string;
  agenda: string;
  refreshment_allowance: string;
  gift_kit: string;
  budget: number;
  expected_attendees: number;
  attendees: Attendee[];
}

interface Painter {
  id: string;
  name: string;
  phone: string;
  tier?: string;
  kyc_status?: string;
  profile_photo?: string;
}

interface Props {
  initialData: Meeting[];
  initialPainters: Painter[];
}

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export function MeetingsLogClient({ initialData, initialPainters }: Props) {
  const [mounted, setMounted] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>(initialData || []);
  const [painters, setPainters] = useState<Painter[]>(initialPainters || []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedAgendaMeeting, setSelectedAgendaMeeting] = useState<Meeting | null>(null);
  const [selectedAttendeesMeeting, setSelectedAttendeesMeeting] = useState<Meeting | null>(null);
  const [selectedInviteMeeting, setSelectedInviteMeeting] = useState<Meeting | null>(null);
  const [isCreatingModal, setIsCreatingModal] = useState(false);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    if (initialData && initialData.length > 0) setMeetings(initialData);
    if (initialPainters && initialPainters.length > 0) setPainters(initialPainters);
  }, [initialData, initialPainters]);

  // Filtered Meetups
  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      const s = search.toLowerCase();
      const matchSearch = !search || m.title.toLowerCase().includes(s) || m.venue.toLowerCase().includes(s) || (m.type || "").toLowerCase().includes(s);
      const matchStatus = statusFilter === "all" || m.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [meetings, search, statusFilter]);

  // Metrics calculation
  const totalScheduled = useMemo(() => meetings.filter(m => m.status === "Scheduled").length, [meetings]);
  const totalAttendeesCount = useMemo(() => {
    return meetings.reduce((acc, m) => acc + (m.attendees || []).length, 0);
  }, [meetings]);

  const totalBudgetSpent = useMemo(() => {
    return meetings.reduce((acc, m) => acc + Number(m.budget || 0), 0);
  }, [meetings]);

  // Form State
  const [form, setForm] = useState({
    title: "",
    type: "Contractor Technical Training",
    venue: "Sharma Paints Main Showroom Hall, Bundi Road, Alwar",
    date: new Date().toISOString().slice(0, 10),
    time: "10:30 AM – 02:00 PM",
    budget: "15000",
    expected_attendees: "35",
    agenda: "Live demonstration of Royale PU Exterior Waterproofing application, Airless spray gun calibration, and reward points cash-out.",
    refreshment_allowance: "High-Tea & Deluxe Lunch Box",
    gift_kit: "Sharma Industries Branded T-Shirt & Tool Kit"
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.venue) return;

    startTransition(async () => {
      const res = await createDealerMeeting(form);
      if (res.success && res.data) {
        setMeetings(prev => [res.data, ...prev]);
        setIsCreatingModal(false);
        setForm({
          title: "",
          type: "Contractor Technical Training",
          venue: "Sharma Paints Main Showroom Hall, Bundi Road, Alwar",
          date: new Date().toISOString().slice(0, 10),
          time: "10:30 AM – 02:00 PM",
          budget: "15000",
          expected_attendees: "35",
          agenda: "Live demonstration of Royale PU Exterior Waterproofing application, Airless spray gun calibration, and reward points cash-out.",
          refreshment_allowance: "High-Tea & Deluxe Lunch Box",
          gift_kit: "Sharma Industries Branded T-Shirt & Tool Kit"
        });
      }
    });
  };

  const handleInvitePainter = (meeting: Meeting, painter: Painter) => {
    startTransition(async () => {
      const res = await invitePainterToMeeting(meeting.id, painter);
      if (res.success) {
        const newAtt: Attendee = res.attendee || {
          id: painter.id,
          name: painter.name,
          phone: painter.phone,
          status: "Invited by Dealer",
          gift_claimed: false,
          rsvp_date: new Date().toISOString().slice(0, 10)
        };

        setMeetings(prev =>
          prev.map(m => {
            if (m.id === meeting.id) {
              const exists = (m.attendees || []).some(a => a.id === painter.id || a.phone === painter.phone);
              if (exists) return m;
              return { ...m, attendees: [...(m.attendees || []), newAtt] };
            }
            return m;
          })
        );
      }
    });
  };

  if (!mounted) {
    return (
      <div className="p-12 text-center text-xs font-bold text-muted-foreground animate-pulse bg-card rounded-2xl border border-border">
        Loading Sharma Industries Contractor Meetups Engine...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── Brand Banner Header ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-card via-card to-primary/10 border border-border p-6 rounded-3xl shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
              <span>Sharma Industries Official</span><span className="opacity-40">/</span><span>Painter & Contractor Engagement</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary text-white rounded-2xl shadow-md">
                <CalendarDays size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                  Painter & Contractor Meetups Manager
                </h1>
                <p className="text-xs text-muted-foreground">
                  Schedule technical workshops, product launches, send direct painter invites, and view RSVP attendance
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCreatingModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white text-xs font-black hover:bg-primary/90 transition-all shadow-md cursor-pointer"
          >
            <Plus size={16} /> + Schedule Painter Meetup
          </button>
        </div>
      </div>

      {/* ── Key Performance Metrics ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Scheduled Upcoming Meets</span>
          <p className="text-2xl font-black text-foreground font-mono">{totalScheduled}</p>
          <p className="text-[11px] text-emerald-600 font-bold">Store Workshops Planned</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Confirmed RSVP Painters</span>
          <p className="text-2xl font-black text-primary font-mono">{totalAttendeesCount} Contractors</p>
          <p className="text-[11px] text-muted-foreground">Attending Store Events</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Refreshment & Event Budget</span>
          <p className="text-2xl font-black text-amber-500 font-mono">{fmt(totalBudgetSpent)}</p>
          <p className="text-[11px] text-muted-foreground">High-Tea & Lunch Packages</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Branded Gift Kits Claimed</span>
          <p className="text-2xl font-black text-emerald-600 font-mono">42 Kits</p>
          <p className="text-[11px] text-muted-foreground">T-Shirts & Spray Nozzle Sets</p>
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
            placeholder="Search meetup by title, venue, or category..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold bg-muted/60 p-1 rounded-xl border border-border">
          {[
            { id: "all", label: "All Meetings" },
            { id: "scheduled", label: "🟢 Scheduled" },
            { id: "completed", label: "✅ Completed" },
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

      {/* ── MEETINGS GRID ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMeetings.map(m => {
          const isScheduled = m.status === "Scheduled";
          const attendeeCount = (m.attendees || []).length;

          return (
            <div
              key={m.id}
              className="bg-card border border-border hover:border-primary/50 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between transition-all group"
            >
              <div className="space-y-3">
                {/* Status & Type Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${
                        isScheduled
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}>
                        {m.status}
                      </span>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold">
                        {m.type}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors mt-2">
                      {m.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedInviteMeeting(m)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 text-xs font-black flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    <Send size={12} /> Invite Painters
                  </button>
                </div>

                {/* Date, Time & Venue */}
                <div className="bg-muted/40 border border-border rounded-xl p-3.5 space-y-2 text-xs">
                  <p className="flex items-center gap-2 font-bold text-foreground">
                    <CalendarDays size={14} className="text-primary shrink-0" />
                    <span>{m.date} ({m.time})</span>
                  </p>
                  <p className="flex items-start gap-2 text-muted-foreground">
                    <MapPin size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{m.venue}</span>
                  </p>
                </div>

                {/* Refreshments & Gift Allowance */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-background border border-border rounded-xl p-2.5 space-y-0.5">
                    <span className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1">
                      <Coffee size={11} className="text-amber-500" /> Refreshments
                    </span>
                    <p className="font-bold text-foreground truncate">{m.refreshment_allowance}</p>
                  </div>
                  <div className="bg-background border border-border rounded-xl p-2.5 space-y-0.5">
                    <span className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1">
                      <Gift size={11} className="text-primary" /> Gift Kit
                    </span>
                    <p className="font-bold text-foreground truncate">{m.gift_kit}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Roster Summary */}
              <div className="space-y-2 pt-3 border-t border-border/40">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Users size={13} className="text-primary" /> {attendeeCount} / {m.expected_attendees} Expected Contractors
                  </span>
                  <span className="font-mono text-emerald-600">Budget: {fmt(m.budget)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedAgendaMeeting(m)}
                    className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors border border-border cursor-pointer"
                  >
                    <FileText size={13} /> Technical Agenda
                  </button>

                  <button
                    onClick={() => setSelectedAttendeesMeeting(m)}
                    className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors border border-primary/20 cursor-pointer"
                  >
                    <Users size={13} /> Attendee Roster
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredMeetings.length === 0 && (
          <div className="col-span-full text-center py-16 border border-dashed border-border rounded-2xl">
            <CalendarDays size={36} className="mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-bold text-foreground">No Painter Meetups Found</p>
            <p className="text-xs text-muted-foreground mt-1">Click "+ Schedule Painter Meetup" to organize contractor events.</p>
          </div>
        )}
      </div>

      {/* ── DIRECT PAINTER INVITATIONS MODAL ──────────────────────────── */}
      {selectedInviteMeeting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                  <Send size={12} /> Direct Dealer Painter Inviter
                </span>
                <h2 className="text-lg font-black text-foreground">{selectedInviteMeeting.title}</h2>
              </div>
              <button
                onClick={() => setSelectedInviteMeeting(null)}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Select registered painters below to send a direct meetup invitation. Invited events automatically reflect in the painter's store profile!
              </p>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {painters.map(p => {
                  const alreadyInvited = (selectedInviteMeeting.attendees || []).some(a => a.id === p.id || a.phone === p.phone);

                  return (
                    <div
                      key={p.id}
                      className="bg-background border border-border rounded-2xl p-3.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.profile_photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-border"
                        />
                        <div>
                          <h4 className="font-black text-foreground">{p.name}</h4>
                          <p className="text-[11px] font-mono text-muted-foreground">{p.phone} • {p.tier || "Painter"}</p>
                        </div>
                      </div>

                      <button
                        disabled={alreadyInvited || isPending}
                        onClick={() => handleInvitePainter(selectedInviteMeeting, p)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          alreadyInvited
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 cursor-default"
                            : "bg-primary text-white hover:bg-primary/90 cursor-pointer shadow-2xs"
                        }`}
                      >
                        {alreadyInvited ? (
                          <>
                            <CheckCircle2 size={13} /> Invited
                          </>
                        ) : (
                          <>
                            <Send size={13} /> Send Invitation
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}

                {painters.length === 0 && (
                  <p className="text-center py-6 text-xs text-muted-foreground">No store painters registered yet.</p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedInviteMeeting(null)}
                className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Done Inviting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TECHNICAL AGENDA MODAL ─────────────────────────────────────── */}
      {selectedAgendaMeeting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-wider">Meetup Agenda & Venue Details</span>
                <h2 className="text-lg font-black text-foreground">{selectedAgendaMeeting.title}</h2>
              </div>
              <button
                onClick={() => setSelectedAgendaMeeting(null)}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase">Venue & Timing</span>
                <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <MapPin size={14} className="text-emerald-500" /> {selectedAgendaMeeting.venue}
                </p>
                <p className="font-mono text-muted-foreground">{selectedAgendaMeeting.date} ({selectedAgendaMeeting.time})</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-foreground uppercase tracking-wider text-[11px]">Technical Topic Agenda:</h4>
                <p className="bg-background p-3 rounded-xl border border-border text-foreground leading-relaxed">
                  {selectedAgendaMeeting.agenda}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAgendaMeeting(null)}
                className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Agenda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAINTER ATTENDEE ROSTER MODAL ──────────────────────────────── */}
      {selectedAttendeesMeeting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-wider">Painter RSVP & Attendance Roster</span>
                <h2 className="text-lg font-black text-foreground">{selectedAttendeesMeeting.title}</h2>
              </div>
              <button
                onClick={() => setSelectedAttendeesMeeting(null)}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {(selectedAttendeesMeeting.attendees || []).map((att, idx) => (
                <div key={idx} className="bg-background border border-border rounded-2xl p-4 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-black text-foreground text-sm">{att.name}</h4>
                    <p className="text-[11px] font-mono text-muted-foreground">{att.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase ${
                      att.status === "Present"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                      {att.status}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                      att.gift_claimed
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}>
                      {att.gift_claimed ? "🎁 Gift Claimed" : "⏳ Gift Pending"}
                    </span>
                  </div>
                </div>
              ))}

              {(selectedAttendeesMeeting.attendees || []).length === 0 && (
                <p className="text-center py-8 text-xs text-muted-foreground">No contractors have RSVP'd for this meetup yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── + SCHEDULE PAINTER MEETUP MODAL ─────────────────────────────── */}
      {isCreatingModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <CalendarDays size={20} className="text-primary" /> Schedule New Painter Meetup
              </h2>
              <button
                onClick={() => setIsCreatingModal(false)}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Meetup Title *</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="E.g. Sunday Contractor Technical Meetup"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Event Category</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                  >
                    <option value="Contractor Technical Training">Contractor Technical Training</option>
                    <option value="New Product Launch Meet">New Product Launch Meet</option>
                    <option value="Annual Loyalty Award Ceremony">Annual Loyalty Award Ceremony</option>
                    <option value="Tea & Snacks Discussion">Tea & Snacks Discussion</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Expected Attendees</label>
                  <input
                    type="number"
                    value={form.expected_attendees}
                    onChange={e => setForm({ ...form, expected_attendees: e.target.value })}
                    placeholder="35"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Venue / Location Address *</label>
                <input
                  required
                  type="text"
                  value={form.venue}
                  onChange={e => setForm({ ...form, venue: e.target.value })}
                  placeholder="Sharma Paints Showroom Hall, Alwar"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Timing Slot</label>
                  <input
                    type="text"
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                    placeholder="10:30 AM – 02:00 PM"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Refreshments Package</label>
                  <input
                    type="text"
                    value={form.refreshment_allowance}
                    onChange={e => setForm({ ...form, refreshment_allowance: e.target.value })}
                    placeholder="High-Tea & Lunch Box"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase">Gift Kit / Branded Goodies</label>
                  <input
                    type="text"
                    value={form.gift_kit}
                    onChange={e => setForm({ ...form, gift_kit: e.target.value })}
                    placeholder="Branded T-Shirt & Tool Kit"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase">Technical Agenda & Event Topics</label>
                <textarea
                  value={form.agenda}
                  onChange={e => setForm({ ...form, agenda: e.target.value })}
                  placeholder="Details of product demos, technical sessions..."
                  rows={2}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs outline-none focus:border-primary text-foreground resize-none"
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
                  <CheckCircle2 size={15} /> {isPending ? "Scheduling Meetup..." : "Schedule Meetup"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
