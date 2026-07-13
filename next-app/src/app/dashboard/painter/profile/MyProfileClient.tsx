"use client";

import React, { useState } from "react";
import { User, Award, Shield, CheckCircle2, Phone, MapPin, Briefcase, Calendar, Star } from "lucide-react";

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

export function MyProfileClient({ initialData }: Props) {
  const [profile] = useState(initialData.profile);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Profile</span><span className="opacity-40">/</span><span className="text-foreground">My Identity</span>
        </div>
        <h1 className="text-xl font-black text-foreground">My Digital Profile</h1>
      </div>

      {/* Main Profile Info Card */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="text-lg font-black text-primary">{profile.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-sm font-black text-foreground flex items-center gap-1.5">
              {profile.name} <CheckCircle2 size={13} className="text-primary fill-primary/10" />
            </h2>
            <p className="text-[10px] text-muted-foreground font-mono">ID: {profile.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="border-t border-border/40 pt-4 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <Phone size={13} className="text-muted-foreground" />
            <span className="font-mono text-foreground font-semibold">{profile.phone}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin size={13} className="text-muted-foreground" />
            <span className="text-foreground">{profile.locality || "Primary City Area"}</span>
          </div>
          {profile.address && (
            <div className="flex items-center gap-2.5">
              <MapPin size={13} className="text-muted-foreground" />
              <span className="text-muted-foreground">{profile.address}</span>
            </div>
          )}
          {profile.aadhar_no && (
            <div className="flex items-center gap-2.5 border-t border-border/40 pt-2 font-mono">
              <Shield size={13} className="text-muted-foreground" />
              <span className="text-muted-foreground">Aadhar: XXXX-XXXX-{profile.aadhar_no.slice(-4)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Level Card */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-3.5 shadow-sm">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Award size={14} className="text-primary" /> Membership Milestone</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between font-bold">
            <span className="text-foreground">Level Progress (Gold Level)</span>
            <span className="text-primary font-mono">75%</span>
          </div>
          <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden border border-border/40">
            <div className="bg-primary h-full rounded-full" style={{ width: "75%" }} />
          </div>
          <p className="text-[10px] text-muted-foreground">Earn 150 more token points to unlock Platinum Level status benefits!</p>
        </div>
      </div>
    </div>
  );
}
