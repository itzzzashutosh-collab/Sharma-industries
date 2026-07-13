"use client";

import React, { useState, useTransition } from "react";
import { BookOpen, Search, Sparkles, CheckCircle2, Trophy, Clock, Download, Plus, X } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  category: string;
  duration: string;
  progress: number;
}

export function LearningClient() {
  const [lessons] = useState<Lesson[]>([
    { id: "1", title: "Waterproofing Expert Certification", category: "Product Specialist", duration: "45 mins", progress: 60 },
    { id: "2", title: "Premium Texture (Rustic Royale) Pitching", category: "Sales Playbook", duration: "30 mins", progress: 100 },
    { id: "3", title: "Objection Handling: Competitor Discounts", category: "Objection Playbook", duration: "15 mins", progress: 10 }
  ]);

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStartLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-md mx-auto text-xs text-foreground font-sans">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Salesman Workspace</span><span className="opacity-40">/</span><span className="text-foreground">Academy</span>
        </div>
        <h1 className="text-xl font-black text-foreground">Sales Academy</h1>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 bg-card border border-border rounded-3xl p-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-[9px] font-black text-muted-foreground uppercase">Skill Score</span>
          <p className="text-lg font-black text-foreground font-mono">82% (Intermediate)</p>
        </div>
        <div className="space-y-1 text-right">
          <span className="text-[9px] font-black text-muted-foreground uppercase">Certificates</span>
          <p className="text-lg font-black text-emerald-600 font-mono">3 Earned</p>
        </div>
      </div>

      {/* AI Assistant Coach */}
      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex gap-3 bg-primary/5">
        <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-muted-foreground">
          <p className="font-bold text-foreground">AI Learning Coach</p>
          <p>• Recommended: Complete the remaining 40% of the Waterproofing Expert module to prepare for the monsoon distribution drive next week.</p>
        </div>
      </div>

      {/* Course Catalog list */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><BookOpen size={14} className="text-primary" /> Training Library</h3>
        {lessons.map((less) => (
          <div key={less.id} className="bg-card border border-border rounded-2xl p-4 space-y-3.5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-foreground text-xs">{less.title}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{less.category} | {less.duration}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase font-mono ${
                less.progress === 100 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              }`}>
                {less.progress}% Completed
              </span>
            </div>

            <div className="w-full bg-muted/40 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${less.progress}%` }} />
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => handleStartLesson(less)} className="px-3.5 py-1.5 bg-primary text-white font-bold rounded-xl text-center text-[10px] hover:opacity-90 transition-opacity cursor-pointer">
                {less.progress === 100 ? "Review Material" : "Resume Lesson"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Certifications Room list */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5"><Trophy size={14} className="text-primary" /> Earned Certificates</h3>
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <h4 className="font-bold text-foreground">Advanced Texture Consultant</h4>
            <p className="text-[9px] text-muted-foreground">Issued: June 2026</p>
          </div>
          <button onClick={() => alert("Downloading certificate PDF summary...")} className="p-2 border border-border hover:bg-muted text-primary rounded-xl"><Download size={13} /></button>
        </div>
      </div>

      {/* Lesson View Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in scale-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Lesson: {selectedLesson.title}</h3>
              <button onClick={() => setSelectedLesson(null)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={14} /></button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-2">
                <p className="font-bold text-foreground">Overview & Pitch:</p>
                <p className="text-muted-foreground leading-relaxed">
                  Waterproofing requires sealing cracks down to 2mm with Swatch Crack-Seal. Explain to dealers that offering client warranty certificates directly triggers premium brand choice, locking competitor displacement.
                </p>
              </div>
              <div className="pt-2 flex justify-end">
                <button onClick={() => {
                  alert("Lesson progress saved!");
                  setSelectedLesson(null);
                }} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90">Close Lesson</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
