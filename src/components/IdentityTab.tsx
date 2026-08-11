import React, { useState } from 'react';
import { IdentityStat } from '../types';
import { Shield, Info } from 'lucide-react';

interface IdentityTabProps {
  identityStats: IdentityStat[];
}

interface StatStyleConfig {
  gradient: string;
  glow: string;
  textColor: string;
  badgeBg: string;
}

const STAT_STYLES: Record<string, StatStyleConfig> = {
  Discipline: {
    gradient: 'from-pink-600 via-rose-500 to-pink-400',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]',
    textColor: 'text-pink-400',
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  },
  Focus: {
    gradient: 'from-amber-600 via-yellow-500 to-amber-300',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.35)]',
    textColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  Consistency: {
    gradient: 'from-emerald-600 via-emerald-400 to-teal-300',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    textColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  'Self-Trust': {
    gradient: 'from-blue-600 via-cyan-400 to-sky-300',
    glow: 'shadow-[0_0_15px_rgba(56,189,248,0.35)]',
    textColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  Confidence: {
    gradient: 'from-blue-600 via-cyan-400 to-sky-300',
    glow: 'shadow-[0_0_15px_rgba(56,189,248,0.35)]',
    textColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  Resilience: {
    gradient: 'from-purple-600 via-violet-500 to-fuchsia-400',
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.35)]',
    textColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  Health: {
    gradient: 'from-rose-600 via-red-500 to-orange-400',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]',
    textColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  Purpose: {
    gradient: 'from-indigo-600 via-indigo-400 to-blue-300',
    glow: 'shadow-[0_0_15px_rgba(99,102,241,0.35)]',
    textColor: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  'Self Respect': {
    gradient: 'from-teal-600 via-cyan-400 to-emerald-300',
    glow: 'shadow-[0_0_15px_rgba(20,184,166,0.35)]',
    textColor: 'text-teal-400',
    badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  },
};

export const IdentityTab: React.FC<IdentityTabProps> = ({
  identityStats,
}) => {
  const [openInfoIds, setOpenInfoIds] = useState<Record<string, boolean>>({});

  const toggleInfo = (id: string) => {
    setOpenInfoIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Overview Banner */}
      <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-black text-white">Identity OS</h2>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Your identity is defined by the baseline actions you execute repeatedly. Complete daily missions to earn XP directly towards each attribute.
        </p>
      </div>

      {/* 8 Identity Stats Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-center">
          <h3 className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase text-center">
            8 CORE IDENTITY ATTRIBUTES
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {identityStats.map((stat) => {
            const statXp = stat.xp ?? stat.score * stat.score;
            const displayName = stat.name === 'Confidence' ? 'Self-Trust' : stat.name;
            const style = STAT_STYLES[displayName] || STAT_STYLES[stat.name] || {
              gradient: 'from-emerald-600 via-teal-400 to-cyan-300',
              glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
              textColor: 'text-emerald-400',
              badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            };
            const isOpen = Boolean(openInfoIds[stat.id]);

            return (
              <div
                key={stat.id}
                className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 space-y-3 transition-all hover:border-white/20 relative shadow-xl group overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold ${style.textColor} transition-colors`}>
                      {displayName}
                    </h4>
                    <button
                      type="button"
                      onClick={() => toggleInfo(stat.id)}
                      className={`p-1 rounded-lg border transition-all ${
                        isOpen
                          ? 'bg-white/15 text-white border-white/25'
                          : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border-white/10'
                      }`}
                      title="View description & XP details"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <span className="text-base font-black text-white font-mono">{stat.score}</span>
                    <span className="text-xs font-mono text-neutral-500">/100</span>
                  </div>
                </div>

                {/* Progress Bar styled like home page capsule indicators */}
                <div className="w-full h-2.5 bg-[#18181b] rounded-full overflow-hidden border border-white/10 shadow-inner p-0.5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${style.gradient} ${style.glow} transition-all duration-700 ease-out`}
                    style={{ width: `${Math.max(4, Math.min(100, stat.score))}%` }}
                  />
                </div>

                {/* Info dropdown section toggled by info button */}
                {isOpen && (
                  <div className="pt-2 border-t border-white/10 space-y-2 text-xs animate-in fade-in">
                    <p className="text-neutral-300 text-[11px] leading-relaxed">
                      {stat.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-neutral-400 font-mono">Accumulated XP:</span>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded-md border ${style.badgeBg}`}>
                        {statXp.toLocaleString()} XP
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
