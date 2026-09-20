'use client';

import React, { useEffect, useState } from 'react';
import { DIVISIONS, DivisionConfig } from '../data/factoryData';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Award,
  Zap,
  Building2,
  X
} from 'lucide-react';

interface BoardroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSpeechIndex: number;
  onSelectSpeaker: (idx: number) => void;
}

export default function BoardroomModal({
  isOpen,
  onClose,
  activeSpeechIndex,
  onSelectSpeaker
}: BoardroomModalProps) {
  if (!isOpen) return null;

  const currentSpeaker = DIVISIONS[activeSpeechIndex] || DIVISIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                🏛️ AI Executive Boardroom — 7-Division Strategic Standup
              </h2>
              <p className="text-xs text-slate-400">
                Sovereign Hermes Brain • Chaired for CEO Ashutosh Sharma (+91 9079609627)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Division Standup Navigation Pills */}
        <div className="flex overflow-x-auto gap-2 p-3 bg-slate-950/40 border-b border-slate-800 scrollbar-none">
          {DIVISIONS.map((div, idx) => {
            const isActive = idx === activeSpeechIndex;
            return (
              <button
                key={div.id}
                onClick={() => onSelectSpeaker(idx)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: div.themeColor }}
                />
                <span>{div.shortName}</span>
                <span className="text-[10px] opacity-70">({div.lead})</span>
              </button>
            );
          })}
        </div>

        {/* Main Body: Active Speaker Dialogue & Strategic Synthesis */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Speaker Card */}
          <div className="relative p-5 rounded-xl border border-slate-700/60 bg-slate-800/50 shadow-inner">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-md"
                  style={{ backgroundColor: currentSpeaker.themeColor }}
                >
                  {currentSpeaker.lead[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{currentSpeaker.lead}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                      {currentSpeaker.leadTitle}
                    </span>
                  </div>
                  <p className="text-xs text-blue-400 font-medium">{currentSpeaker.name}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400">{currentSpeaker.kpiTitle}</span>
                <div className="text-sm font-bold text-emerald-400">{currentSpeaker.kpiValue}</div>
              </div>
            </div>

            {/* Live Speech Bubble */}
            <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-sm leading-relaxed">
              <span className="text-blue-400 font-semibold">"</span>
              {currentSpeaker.speechScript}
              <span className="text-blue-400 font-semibold">"</span>
            </div>

            {/* Specialist Legends In Support */}
            <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Division Specialists:</span>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {currentSpeaker.specialists.map((sp) => (
                  <span
                    key={sp}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300"
                  >
                    {sp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Plant Financial & Unit Economics Board (CEO Locked Charter) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Factory Base Cost</span>
              <span className="text-base font-bold text-white">₹450.00</span>
              <span className="text-[10px] text-slate-500 block">25kg Swatch Rustic</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Landed Company Cost</span>
              <span className="text-base font-bold text-amber-400">₹635.00</span>
              <span className="text-[10px] text-slate-500 block">Incl. ₹50 Token & 2% CD</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Standard Dealer Rate</span>
              <span className="text-base font-bold text-blue-400">₹690.00</span>
              <span className="text-[10px] text-emerald-400 block">40% Margin vs ₹1,150 MRP</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Net Company Profit</span>
              <span className="text-base font-bold text-emerald-400">₹55.00 / bag</span>
              <span className="text-[10px] text-slate-500 block">Hurdle Target ≥ ₹100</span>
            </div>
          </div>

          {/* Master Hermes Executive Action Plan */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-900/50">
            <div className="flex items-center space-x-2 text-blue-400 mb-2 font-semibold text-xs uppercase tracking-wide">
              <Zap className="w-4 h-4" />
              <span>Hermes AI Brain — Unified Operational Directive</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sabhi 7 divisions aur on-ground factory units (Shahrukh bhai & Om Prakash) fully aligned hain. 
              Swatch Rustic production line continuous hai, Sonu Kumar ka 200 bags/month wholesale quota monitor ho raha hai, 
              aur 7:00 PM Executive Briefing direct Ashutosh Sir ko WhatsApp par deliver hogi.
            </p>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-400">
              Active Speaker {activeSpeechIndex + 1} of 7 • Round-Robin Cycle
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onSelectSpeaker((activeSpeechIndex + 1) % DIVISIONS.length)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
            >
              Next Division Speaker →
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-600/30"
            >
              Confirm & Return to 3D View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
