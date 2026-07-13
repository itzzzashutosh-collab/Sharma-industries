"use client";

import React, { useState, useTransition } from "react";
import { CalendarDays, MapPin, Clock, Users, CheckCircle2 } from "lucide-react";
import { registerForMeetingAction } from "../../actions";

interface Meeting {
  id: number;
  title: string;
  venue: string;
  meeting_date: string;
  meeting_time: string;
  organizer: string;
}

interface Props {
  initialData: {
    meetings: Meeting[];
  };
}

export function MeetingsClient({ initialData }: Props) {
  const [meetings] = useState(initialData.meetings);
  const [registeredIds, setRegisteredIds] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleRegister = (id: number) => {
    startTransition(async () => {
      const res = await registerForMeetingAction(id);
      if (res.success) {
        alert("Registered successfully! Check-in QR code generated.");
        setRegisteredIds(prev => [...prev, id]);
      } else {
        alert(res.error || "Failed to register");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Painter Workspace</span><span className="opacity-40">/</span><span>Community</span><span className="opacity-40">/</span><span className="text-foreground">Meetings</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Dealer Workshops & Meets</h1>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {meetings.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">No upcoming meetings scheduled.</p>
        ) : meetings.map((meet) => {
          const isRegistered = registeredIds.includes(meet.id);
          return (
            <div key={meet.id} className="bg-card border border-border rounded-2xl p-4 space-y-3.5 shadow-sm">
              <div className="space-y-1">
                <h3 className="font-black text-foreground text-xs">{meet.title}</h3>
                <p className="text-[10px] text-muted-foreground">Organized by {meet.organizer}</p>
              </div>

              <div className="border-t border-border/40 pt-3 space-y-2 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin size={11} className="text-primary" />
                  <span className="text-foreground">{meet.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={11} className="text-primary" />
                  <span className="text-foreground font-mono">{meet.meeting_date} at {meet.meeting_time}</span>
                </div>
              </div>

              <div className="border-t border-border/40 pt-3 flex items-center justify-end">
                {isRegistered ? (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 font-bold uppercase tracking-wider text-[9px]">
                    <CheckCircle2 size={11} /> Registered
                  </span>
                ) : (
                  <button onClick={() => handleRegister(meet.id)} disabled={isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer">
                    Register Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
