'use client';

import React from 'react';
import Image from 'next/image';
import {
  Users,
  Camera,
  Layers,
  Factory,
  Building2,
  Package,
  Boxes,
  Sparkles,
  ArrowRight,
  RefreshCw,
  LogOut
} from 'lucide-react';

interface FactoryHUDProps {
  meetingActive: boolean;
  onToggleMeeting: () => void;
  onSelectCamera: (preset: 'plant' | 'boardroom' | 'cabins' | 'production' | 'warehouse') => void;
  activePreset: 'plant' | 'boardroom' | 'cabins' | 'production' | 'warehouse';
  selectedDivisionId?: string | null;
}

export default function FactoryHUD({
  meetingActive,
  onToggleMeeting,
  onSelectCamera,
  activePreset,
  selectedDivisionId
}: FactoryHUDProps) {
  return (
    <>
      {/* Top Header Glassmorphic Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between p-3.5 bg-slate-900/85 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl">
        {/* Left: Swatch Brand & Title */}
        <div className="flex items-center space-x-4">
          <div className="relative w-28 h-8 flex items-center justify-center bg-white/95 rounded-lg px-2 py-0.5 shadow-md">
            <Image
              src="/logos/swatch_paints_logo_primary.png"
              alt="Swatch Paints"
              width={100}
              height={28}
              className="object-contain"
              priority
            />
          </div>
          <div className="h-7 w-[1px] bg-slate-700 hidden sm:block" />
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>SHARMA INDUSTRIES — 3D FACTORY & 7-DIVISION COMMAND OS</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-semibold hidden md:inline-flex">
                LIVE TWIN
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              RIICO Industrial Area, Bundi Plant • Sovereign Hermes AI Brain Core
            </p>
          </div>
        </div>

        {/* Center: Executive Boardroom Meeting Trigger Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMeeting}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-lg ${
              meetingActive
                ? 'bg-amber-600 hover:bg-amber-500 text-white ring-2 ring-amber-400/50 shadow-amber-600/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white ring-2 ring-blue-400/30 shadow-blue-600/40 animate-pulse'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{meetingActive ? '🔙 Disperse to Cabins' : '🏛️ Call Executive Board Meeting'}</span>
          </button>
        </div>

        {/* Right: Camera Presets */}
        <div className="hidden lg:flex items-center space-x-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
          <button
            onClick={() => onSelectCamera('plant')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              activePreset === 'plant' && !selectedDivisionId
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>Plant Overview</span>
          </button>
          <button
            onClick={() => onSelectCamera('boardroom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              activePreset === 'boardroom'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Boardroom</span>
          </button>
          <button
            onClick={() => onSelectCamera('cabins')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              activePreset === 'cabins'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>7 Cabins</span>
          </button>
          <button
            onClick={() => onSelectCamera('production')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              activePreset === 'production'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Bagging & Lab</span>
          </button>
          <button
            onClick={() => onSelectCamera('warehouse')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              activePreset === 'warehouse'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Warehouse</span>
          </button>
        </div>
      </div>

      {/* Bottom Floating Status Banner — dynamically offsets with sidebar width */}
      <div
        className="absolute bottom-4 z-30 flex items-center justify-between p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl shadow-xl backdrop-blur-md transition-all duration-300"
        style={{ left: selectedDivisionId ? '380px' : '320px', right: '16px' }}
      >
        <div className="flex items-center space-x-3 text-xs text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-white">Hermes AI — 7/7 Divisions Active</span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400 text-[11px]">
            Sales • Ops • Finance • Vision • Branding • Social • HR
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
          🖱️ <span className="text-slate-300 font-semibold">Drag:</span> Rotate |{' '}
          <span className="text-slate-300 font-semibold">Right-Drag:</span> Pan |{' '}
          <span className="text-slate-300 font-semibold">Scroll:</span> Zoom |{' '}
          <span className="text-blue-400 font-semibold">Click:</span> Inspect
        </div>
      </div>
    </>
  );
}
