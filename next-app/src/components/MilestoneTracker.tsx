"use client";

import { Wallet, Lock, Unlock, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface MilestoneTrackerProps {
  level: number;
  current: number;
  target: number;
  unit: string;
  bonusAmount: string;
}

export function MilestoneTracker({
  level,
  current,
  target,
  unit,
  bonusAmount,
}: MilestoneTrackerProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const isUnlocked = current >= target;
  const progressPercentage = Math.min((current / target) * 100, 100);

  // Animate the progress bar on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-500 ${
        isUnlocked
          ? "bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-teal-500/20 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
          : "bg-slate-900/50  border-slate-800"
      }`}
    >
      {/* Background Decor */}
      {isUnlocked && (
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
          <Trophy size={160} />
        </div>
      )}

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Progress Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${
                isUnlocked
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-violet-500/20 text-violet-400"
              }`}
            >
              L{level}
            </span>
            <h3 className="text-lg font-semibold text-white">
              {isUnlocked ? "Bonus Unlocked! 🎉" : "Dealer Gamification Target"}
            </h3>
          </div>

          <p className="text-sm text-slate-400 mb-4">
            {current.toLocaleString()} / {target.toLocaleString()} {unit}
          </p>

          {/* Progress Bar */}
          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                isUnlocked
                  ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                  : "bg-gradient-to-r from-violet-500 to-fuchsia-500"
              }`}
              style={{ width: `${animatedProgress}%` }}
            >
              {/* Shimmer effect inside progress bar */}
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>

        {/* Right Side: Bonus Wallet */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <div
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${
              isUnlocked
                ? "bg-emerald-500/10 border-emerald-500/20 shadow-lg shadow-emerald-500/10"
                : "bg-slate-950 border-slate-800"
            }`}
          >
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                isUnlocked
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {isUnlocked ? <Unlock size={24} /> : <Lock size={24} />}
            </div>
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-0.5">
                {isUnlocked ? "Reward Earned" : "Upcoming Bonus"}
              </p>
              <div className="flex items-center gap-2">
                <Wallet
                  size={16}
                  className={isUnlocked ? "text-emerald-400" : "text-slate-500"}
                />
                <span
                  className={`text-xl font-bold ${
                    isUnlocked ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {bonusAmount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
