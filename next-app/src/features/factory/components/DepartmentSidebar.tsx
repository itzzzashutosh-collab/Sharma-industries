'use client';

import React from 'react';
import { DIVISIONS, DivisionConfig } from '../data/factoryData';
import {
  Users,
  TrendingUp,
  Cpu,
  BarChart3,
  Zap,
  Award,
  Briefcase,
  Activity,
  ArrowLeft,
  ChevronRight,
  Target,
  Sparkles,
  CheckCircle2,
  Clock,
  MessageSquareQuote,
  Flame,
  Radio,
  Eye
} from 'lucide-react';

interface DepartmentSidebarProps {
  selectedDivisionId: string | null;
  onSelectDivision: (div: DivisionConfig | null) => void;
  meetingActive: boolean;
  activeSpeechIndex: number;
}

const divIcons: Record<string, React.ReactNode> = {
  sales: <TrendingUp className="w-4 h-4" />,
  ops: <Cpu className="w-4 h-4" />,
  finance: <BarChart3 className="w-4 h-4" />,
  vision: <Zap className="w-4 h-4" />,
  branding: <Award className="w-4 h-4" />,
  social: <Activity className="w-4 h-4" />,
  hr: <Briefcase className="w-4 h-4" />
};

export default function DepartmentSidebar({
  selectedDivisionId,
  onSelectDivision,
  meetingActive,
  activeSpeechIndex
}: DepartmentSidebarProps) {
  const activeSpeaker = meetingActive ? DIVISIONS[activeSpeechIndex % DIVISIONS.length] : null;
  const selectedDiv = DIVISIONS.find((d) => d.id === selectedDivisionId) || null;
  const totalLegendsCount = DIVISIONS.reduce((acc, d) => acc + (d.totalLegendsCount || d.specialists.length + 1), 0);

  return (
    <div
      className="absolute left-4 top-20 bottom-20 z-30 flex flex-col gap-2 transition-all duration-300"
      style={{ width: selectedDiv ? '360px' : '300px' }}
    >
      {/* View 1: Detailed Dossier for Selected Division */}
      {selectedDiv ? (
        <div
          className="flex-1 flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden animate-in slide-in-from-left-4 duration-200"
          style={{ borderColor: selectedDiv.themeColor + '66' }}
        >
          {/* Header Bar */}
          <div
            className="px-4 py-3 border-b flex items-center justify-between"
            style={{
              backgroundColor: `${selectedDiv.themeColor}12`,
              borderColor: `${selectedDiv.themeColor}33`
            }}
          >
            <button
              onClick={() => onSelectDivision(null)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Divisions</span>
            </button>

            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${selectedDiv.themeColor}25`,
                  color: selectedDiv.themeColor
                }}
              >
                {meetingActive ? 'In Boardroom' : 'Live at Desk'}
              </span>
            </div>
          </div>

          {/* Scrollable Dossier Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'none' }}>
            {/* Division Title Card */}
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ backgroundColor: selectedDiv.themeColor }}
              >
                <span className="text-white">{divIcons[selectedDiv.id]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white tracking-wide">{selectedDiv.name}</h2>
                </div>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">{selectedDiv.lead}</p>
                <p className="text-[11px] text-slate-400">{selectedDiv.leadTitle}</p>
              </div>
            </div>

            {/* ⚡ WHAT THEY ARE DOING RIGHT NOW (LIVE ACTIVITY) */}
            <div
              className="rounded-xl p-3.5 space-y-2 border relative overflow-hidden shadow-inner"
              style={{
                backgroundColor: `${selectedDiv.themeColor}12`,
                borderColor: `${selectedDiv.themeColor}44`
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-widest"
                    style={{ color: selectedDiv.themeColor }}
                  >
                    Current Live Activity (अभी क्या कर रहे हैं)
                  </span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-900/80 text-emerald-400 border border-emerald-500/30">
                  {selectedDiv.currentTaskProgress}% DONE
                </span>
              </div>

              {/* Hindi vernacular context */}
              <div className="text-xs font-semibold text-white bg-slate-950/70 p-2 rounded-lg border border-slate-800 leading-relaxed">
                {selectedDiv.currentTaskHindi}
              </div>

              {/* English operational description */}
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {selectedDiv.currentTask}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${selectedDiv.currentTaskProgress}%`,
                    backgroundColor: selectedDiv.themeColor
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <span>Status: <span className="text-slate-200 font-medium">{selectedDiv.taskStatus}</span></span>
                <span className="text-emerald-400 font-mono">Bundi Plant Verified</span>
              </div>
            </div>

            {/* 3 Key Operational KPIs */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Operational Telemetry
              </span>
              <div className="grid grid-cols-3 gap-2">
                {selectedDiv.kpis.map((k, i) => (
                  <div
                    key={i}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 text-center shadow"
                  >
                    <div className="text-[9px] text-slate-400 truncate">{k.label}</div>
                    <div className="text-xs font-extrabold text-white mt-0.5" style={{ color: selectedDiv.themeColor }}>
                      {k.value}
                    </div>
                    <div className="text-[8px] text-slate-500 mt-0.5 truncate">{k.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialist Legends & Current Focus */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Specialist Legends Active
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {selectedDiv.specialistDetails.length} Legends
                </span>
              </div>
              <div className="space-y-1.5">
                {selectedDiv.specialistDetails.map((sp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{sp.name}</span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                        style={{
                          backgroundColor: `${selectedDiv.themeColor}20`,
                          color: selectedDiv.themeColor
                        }}
                      >
                        {sp.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{sp.focus}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Live Activity Log */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Today's Action Log
              </span>
              <div className="space-y-1.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
                {selectedDiv.recentActivity.map((act, i) => (
                  <div key={i} className="flex items-start gap-2 text-[10px] text-slate-300">
                    <Clock className="w-3 h-3 text-slate-500 mt-0.5 flex-shrink-0" />
                    <span className="leading-tight">{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Boardroom Report */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>Executive Statement to Hermes & Ashutosh Sir</span>
              </div>
              <p className="text-[11px] text-slate-200 italic leading-relaxed">
                "{selectedDiv.speechScript}"
              </p>
            </div>
          </div>

          {/* Quick Navigation Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
            <button
              onClick={() => {
                const curIdx = DIVISIONS.findIndex((d) => d.id === selectedDiv.id);
                const prevDiv = DIVISIONS[(curIdx - 1 + DIVISIONS.length) % DIVISIONS.length];
                onSelectDivision(prevDiv);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              ← Prev
            </button>
            <span className="text-[10px] text-slate-500 font-mono">
              {DIVISIONS.findIndex((d) => d.id === selectedDiv.id) + 1} of 7
            </span>
            <button
              onClick={() => {
                const curIdx = DIVISIONS.findIndex((d) => d.id === selectedDiv.id);
                const nextDiv = DIVISIONS[(curIdx + 1) % DIVISIONS.length];
                onSelectDivision(nextDiv);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Next →
            </button>
          </div>
        </div>
      ) : (
        /* View 2: All 7 Divisions Overview List */
        <>
          {/* Header */}
          <div className="bg-slate-900/92 border border-slate-700/60 rounded-xl backdrop-blur-xl px-3 py-2.5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] font-bold text-white tracking-widest uppercase">
                  7 Divisions • {totalLegendsCount} Legends
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">
                {totalLegendsCount}/{totalLegendsCount} ONLINE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
              {meetingActive
                ? `🏛️ Board Standup Active — ${activeSpeaker?.shortName ?? ''} Speaking`
                : 'Click any division to inspect cabin, desk & all active legends'}
            </p>
          </div>

          {/* Division Cards List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5" style={{ scrollbarWidth: 'none' }}>
            {DIVISIONS.map((div) => {
              const isSpeaking = meetingActive && activeSpeaker?.id === div.id;

              return (
                <div
                  key={div.id}
                  className="rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden shadow-lg hover:scale-[1.01]"
                  style={{
                    borderColor: isSpeaking ? div.themeColor : 'rgba(51,65,85,0.5)',
                    background: isSpeaking
                      ? `linear-gradient(135deg, ${div.themeColor}20, rgba(15,23,42,0.96))`
                      : 'rgba(15,23,42,0.88)'
                  }}
                  onClick={() => onSelectDivision(div)}
                >
                  <div className="p-2.5 space-y-1.5">
                    {/* Top Row: Icon + Name + KPI */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow"
                        style={{ backgroundColor: div.themeColor }}
                      >
                        <span className="text-white">{divIcons[div.id]}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">{div.shortName}</span>
                          {isSpeaking && (
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-pulse"
                              style={{ backgroundColor: div.themeColor + '30', color: div.themeColor }}
                            >
                              ● SPEAKING
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400 truncate">{div.lead}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700/60 text-slate-300 font-mono">
                            {div.totalLegendsCount} Legends
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-[10px] font-bold" style={{ color: div.themeColor }}>
                          {div.kpiValue}
                        </div>
                        <div className="text-[8px] text-slate-500 leading-tight">{div.kpiTitle}</div>
                      </div>

                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    </div>

                    {/* Current Live Task Snippet */}
                    <div className="bg-slate-950/60 rounded-lg px-2 py-1.5 border border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                        <span className="text-[10px] text-slate-300 truncate">
                          {div.currentTaskHindi}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-semibold text-slate-500 flex-shrink-0">
                        {div.currentTaskProgress}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Banner */}
          <div className="bg-slate-900/85 border border-slate-700/50 rounded-xl px-3 py-2 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <span className="text-[10px] text-slate-300 font-semibold">
                  Hermes AI Brain Core
                </span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">RIICO Bundi Plant</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
