'use client';

import React from 'react';
import { DivisionConfig } from '../data/factoryData';
import { X, Phone, User, CheckCircle, Shield, Award, ArrowRight } from 'lucide-react';

interface EntityDetailDrawerProps {
  entity: { type: 'division' | 'pillar'; data: any } | null;
  onClose: () => void;
  onOpenMeeting: () => void;
}

export default function EntityDetailDrawer({
  entity,
  onClose,
  onOpenMeeting
}: EntityDetailDrawerProps) {
  if (!entity) return null;

  const isDivision = entity.type === 'division';
  const div: DivisionConfig | null = isDivision ? entity.data : null;
  const pillar = !isDivision ? entity.data : null;

  return (
    <div className="fixed right-4 top-20 bottom-20 z-40 w-96 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
            style={{ backgroundColor: div ? div.themeColor : '#0284c7' }}
          >
            {div ? div.shortName[0] : '🏭'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{div ? div.name : pillar.name}</h3>
            <p className="text-xs text-slate-400">{div ? div.leadTitle : pillar.subtitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {div && (
          <>
            {/* Lead Card */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Division Commander
              </span>
              <div className="text-base font-bold text-white mt-0.5">{div.lead}</div>
              <div className="text-xs text-blue-400 font-medium">{div.role}</div>
            </div>

            {/* Mandate & Active Focus */}
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                Active Mandate & Directives
              </span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{div.activeFocus}</p>
            </div>

            {/* KPI Banner */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">{div.kpiTitle}</span>
                <span className="text-base font-bold text-emerald-400">{div.kpiValue}</span>
              </div>
              <div className="px-2 py-1 rounded bg-emerald-950/50 border border-emerald-800/50 text-[10px] text-emerald-300 font-semibold">
                LOCKED
              </div>
            </div>

            {/* Specialist Legends */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-300 block">Subordinate Legends:</span>
              <div className="space-y-1.5">
                {div.specialists.map((sp) => (
                  <div
                    key={sp}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-700/30 text-xs text-slate-300"
                  >
                    <span>{sp}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {pillar && (
          <>
            {/* Personnel Card */}
            {pillar.personnel && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  Designated Plant Leader
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{pillar.personnel.name}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-400" /> {pillar.personnel.phone}
                  </span>
                </div>
                <div className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg">
                  {pillar.personnel.status}
                </div>
              </div>
            )}

            {pillar.distributor && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">
                  B2B Trade Network
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{pillar.distributor.name}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-blue-400" /> {pillar.distributor.phone}
                  </span>
                </div>
                <div className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg">
                  {pillar.distributor.status}
                </div>
              </div>
            )}

            {pillar.status && (
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                  Operational Status
                </span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{pillar.status}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <button
          onClick={onOpenMeeting}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
        >
          <span>Summon to AI Boardroom</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
