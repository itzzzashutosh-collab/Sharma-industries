"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Users, Plus, Search, Phone, MapPin, Calendar, CreditCard, Landmark,
  ShieldCheck, AlertCircle, FileText, ExternalLink, X, Eye, CheckCircle2,
  Sparkles, Award, Image as ImageIcon, UserCheck, CalendarDays, Gift
} from "lucide-react";
import Link from "next/link";

interface Painter {
  id: string;
  name: string;
  phone: string;
  dob?: string;
  address?: string;
  pincode?: string;
  profile_photo?: string;
  aadhaar_no?: string;
  aadhaar_front?: string;
  aadhaar_back?: string;
  pan_no?: string;
  pan_photo?: string;
  bank_name?: string;
  bank_account_no?: string;
  bank_ifsc?: string;
  bank_branch?: string;
  bank_passbook_photo?: string;
  points_balance?: number;
  kyc_status?: string;
  tier?: string;
}

interface Meeting {
  id: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  status: string;
  attendees?: any[];
}

interface Props {
  initialData: Painter[];
  initialMeetings?: Meeting[];
}

export function PaintersPortfolioClient({ initialData, initialMeetings = [] }: Props) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPainter, setSelectedPainter] = useState<Painter | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const list = useMemo(() => (initialData && initialData.length > 0 ? initialData : []), [initialData]);

  const filtered = useMemo(() => {
    return list.filter(p => {
      const s = search.toLowerCase();
      const matchesSearch = !search || p.name.toLowerCase().includes(s) || (p.phone || "").includes(s) || (p.address || "").toLowerCase().includes(s);
      const matchesStatus = statusFilter === "all" || (statusFilter === "verified" && p.kyc_status === "Verified") || (statusFilter === "pending" && p.kyc_status !== "Verified");
      return matchesSearch && matchesStatus;
    });
  }, [list, search, statusFilter]);

  // Meetings invited for selected painter
  const invitedMeetings = useMemo(() => {
    if (!selectedPainter) return [];
    return initialMeetings.filter(m =>
      (m.attendees || []).some(a => a.id === selectedPainter.id || a.phone === selectedPainter.phone || a.name?.toLowerCase() === selectedPainter.name?.toLowerCase())
    );
  }, [selectedPainter, initialMeetings]);

  if (!mounted) {
    return (
      <div className="p-12 text-center text-xs font-bold text-muted-foreground animate-pulse bg-card rounded-2xl border border-border">
        Loading Store Painters Directory...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── Top Header Navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Painters</span><span className="opacity-40">/</span><span className="text-foreground">Painters Directory</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <Users size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                Registered Painters & Contractors Hub
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage painter KYC document verification (Aadhaar, PAN, Bank Passbook), coupon points balance, and onboarding
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/dealer/painters/register"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-2xs cursor-pointer"
        >
          <Plus size={15} /> + Onboard New Painter & KYC
        </Link>
      </div>

      {/* ── Key Metrics Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Registered Painters</span>
          <p className="text-2xl font-black text-foreground font-mono">{list.length}</p>
          <p className="text-[11px] text-muted-foreground">Store Loyalty Scheme Members</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">KYC Verified Painters</span>
          <p className="text-2xl font-black text-emerald-600 font-mono">
            {list.filter(p => p.kyc_status === "Verified").length}
          </p>
          <p className="text-[11px] text-emerald-700 font-bold">Aadhaar & Bank Details Approved</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Scanned Points Balance</span>
          <p className="text-2xl font-black text-amber-500 font-mono">
            {list.reduce((s, p) => s + Number(p.points_balance || 0), 0).toLocaleString("en-IN")} Pts
          </p>
          <p className="text-[11px] text-muted-foreground">Store Reward Scheme Points</p>
        </div>
      </div>

      {/* ── Search & Filter Bar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search painter by name, mobile phone, or address..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold bg-muted/60 p-1 rounded-xl border border-border">
          {[
            { id: "all", label: "All Painters" },
            { id: "verified", label: "✅ KYC Verified" },
            { id: "pending", label: "⏳ Pending KYC" },
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

      {/* ── PAINTERS GRID ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(painter => {
          const isVerified = painter.kyc_status === "Verified";

          return (
            <div
              key={painter.id}
              onClick={() => setSelectedPainter(painter)}
              className="bg-card border border-border hover:border-primary/50 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-4 group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={painter.profile_photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                  alt={painter.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-border shrink-0 shadow-2xs"
                />
                <div className="overflow-hidden">
                  <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors truncate">
                    {painter.name}
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                    <Phone size={12} className="text-primary/70" /> {painter.phone}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${
                      isVerified
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                      {isVerified ? "KYC Verified" : "Pending KYC"}
                    </span>
                    <span className="px-2 py-0.5 bg-muted rounded text-[10px] font-bold text-foreground border border-border">
                      {painter.tier || "Painter"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 space-y-1.5 text-xs text-muted-foreground">
                {painter.address && (
                  <p className="flex items-start gap-1.5">
                    <MapPin size={13} className="shrink-0 mt-0.5 text-primary/60" />
                    <span className="line-clamp-1">{painter.address} {painter.pincode ? `(${painter.pincode})` : ""}</span>
                  </p>
                )}
                {painter.bank_name && (
                  <p className="flex items-center gap-1.5 text-[11px]">
                    <Landmark size={13} className="text-emerald-500 shrink-0" />
                    <span>{painter.bank_name} • A/C: ****{painter.bank_account_no?.slice(-4) || "—"}</span>
                  </p>
                )}
              </div>

              <div className="bg-muted/40 p-3 rounded-xl border border-border/40 flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground">Loyalty Points Balance</span>
                <span className="font-mono font-black text-amber-500 text-sm">
                  {Number(painter.points_balance || 0).toLocaleString("en-IN")} Pts
                </span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 border border-dashed border-border rounded-2xl">
            <Users size={36} className="mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-bold text-foreground">No Registered Painters Found</p>
            <p className="text-xs text-muted-foreground mt-1">Click "+ Onboard New Painter & KYC" to register store painters.</p>
          </div>
        )}
      </div>

      {/* ── PAINTER COMPLETE KYC, DOCUMENTS & MEETINGS MODAL ────────────────── */}
      {selectedPainter && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPainter.profile_photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                  alt={selectedPainter.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-border shadow-2xs"
                />
                <div>
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                    {selectedPainter.name}
                  </h2>
                  <p className="text-xs font-mono text-muted-foreground">{selectedPainter.phone} • DOB: {selectedPainter.dob || "1990-01-01"}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPainter(null)}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* ── INVITED MEETINGS SECTION IN PAINTER PROFILE ───────────────── */}
            <div className="space-y-3 bg-muted/30 border border-border rounded-2xl p-4">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" /> Invited Dealer Meetups & Technical Workshops ({invitedMeetings.length})
              </h3>

              {invitedMeetings.length > 0 ? (
                <div className="space-y-2">
                  {invitedMeetings.map(m => (
                    <div key={m.id} className="bg-background border border-border rounded-xl p-3 flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-black text-foreground">{m.title}</h4>
                        <p className="text-[11px] text-muted-foreground">{m.venue} • {m.date} ({m.time})</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded text-[10px] font-black uppercase">
                        Invited by Dealer
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">This painter has not been invited to any dealer meetups yet. Go to <Link href="/dashboard/dealer/painters/meetings" className="text-primary underline font-bold">Meetings Hub</Link> to send direct invitations.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* KYC DOCUMENTS */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" /> Verified Identity KYC Documents
                </h3>

                {/* Aadhaar Card Photos */}
                <div className="bg-background border border-border rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase block">Aadhaar Card (Front & Back)</span>
                  <p className="font-mono font-bold text-foreground">No: {selectedPainter.aadhaar_no || "4812-9910-2041"}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <span className="text-[9px] text-muted-foreground block mb-1">Aadhaar Front</span>
                      <img src={selectedPainter.aadhaar_front || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"} alt="Aadhaar Front" className="w-full h-24 rounded-xl object-cover border border-border" />
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground block mb-1">Aadhaar Back</span>
                      <img src={selectedPainter.aadhaar_back || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"} alt="Aadhaar Back" className="w-full h-24 rounded-xl object-cover border border-border" />
                    </div>
                  </div>
                </div>

                {/* PAN Card Photo */}
                <div className="bg-background border border-border rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase block">PAN Card Photo</span>
                  <p className="font-mono font-bold text-foreground uppercase">PAN: {selectedPainter.pan_no || "ABCDE1234F"}</p>
                  <img src={selectedPainter.pan_photo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"} alt="PAN Photo" className="w-full h-28 rounded-xl object-cover border border-border mt-1" />
                </div>
              </div>

              {/* BANK PASSBOOK & ADDRESS DETAILS */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Landmark size={16} className="text-primary" /> Bank Passbook & Account Profile
                </h3>

                <div className="bg-background border border-border rounded-2xl p-4 space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase block">Bank Name & Branch</span>
                    <p className="font-bold text-foreground">{selectedPainter.bank_name || "State Bank of India"} ({selectedPainter.bank_branch || "Main Branch"})</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase block">Account Number</span>
                      <p className="font-mono font-bold text-foreground">{selectedPainter.bank_account_no || "308192847102"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase block">IFSC Code</span>
                      <p className="font-mono font-bold text-foreground uppercase">{selectedPainter.bank_ifsc || "SBIN0001234"}</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <span className="text-[9px] text-muted-foreground block mb-1">Bank Passbook / Cancelled Cheque Photo</span>
                    <img src={selectedPainter.bank_passbook_photo || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80"} alt="Bank Passbook Photo" className="w-full h-32 rounded-xl object-cover border border-border" />
                  </div>
                </div>

                <div className="bg-background border border-border rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase block">Residential Address & Pincode</span>
                  <p className="font-bold text-foreground">{selectedPainter.address || "Civil Lines, Alwar, Rajasthan"}</p>
                  <p className="font-mono text-muted-foreground">Pincode: {selectedPainter.pincode || "301001"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
