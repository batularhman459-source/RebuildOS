import React, { useState } from 'react';
import { IdentityStat } from '../types';
import { Info, Sparkles, Fingerprint, ArrowRight } from 'lucide-react';

interface IdentitySnapshotProps {
  identityStats: IdentityStat[];
  onNavigateToIdentity?: () => void;
}

interface StatConfig {
  name: string;
  defaultScore: number;
  gradient: string;
  glow: string;
  textColor: string;
}

const STAT_CONFIGS: Record<string, StatConfig> = {
  Discipline: {
    name: 'Discipline',
    defaultScore: 82,
    gradient: 'from-pink-600 via-rose-500 to-pink-400',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]',
    textColor: 'text-pink-400',
  },
  Focus: {
    name: 'Focus',
    defaultScore: 67,
    gradient: 'from-amber-600 via-yellow-500 to-amber-300',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    textColor: 'text-amber-400',
  },
  Consistency: {
    name: 'Consistency',
    defaultScore: 85,
    gradient: 'from-emerald-600 via-emerald-400 to-teal-300',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    textColor: 'text-emerald-400',
  },
  'Self-Trust': {
    name: 'Self-Trust',
    defaultScore: 74,
    gradient: 'from-blue-600 via-cyan-400 to-sky-300',
    glow: 'shadow-[0_0_15px_rgba(56,189,248,0.4)]',
    textColor: 'text-cyan-400',
  },
  Resilience: {
    name: 'Resilience',
    defaultScore: 88,
    gradient: 'from-purple-600 via-violet-500 to-fuchsia-400',
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]',
    textColor: 'text-purple-400',
  },
};

const DEFAULT_ITEMS = [
  { name: 'Discipline', score: 82 },
  { name: 'Focus', score: 67 },
  { name: 'Consistency', score: 85 },
  { name: 'Self-Trust', score: 74 },
  { name: 'Resilience', score: 88 },
];

export const IdentitySnapshot: React.FC<IdentitySnapshotProps> = ({
  identityStats,
  onNavigateToIdentity,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  // Map requested 5 core stats from props or default items
  const displayItems = DEFAULT_ITEMS.map((item) => {
    const existing = identityStats.find(
      (s) => s.name.toLowerCase() === item.name.toLowerCase() || (item.name === 'Self-Trust' && s.name.toLowerCase() === 'confidence')
    );
    const score = existing ? existing.score : item.score;
    const xp = existing?.xp ?? score * score;
    const weeklyChange = existing?.weeklyChange ?? 0;

    const config = STAT_CONFIGS[item.name] || {
      name: item.name,
      defaultScore: item.score,
      gradient: 'from-emerald-600 to-teal-400',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      textColor: 'text-emerald-400',
    };

    return {
      id: existing?.id,
      name: item.name,
      score,
      xp,
      weeklyChange,
      config,
    };
  });

  return (
    <section className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 sm:p-5 space-y-4 shadow-2xl relative overflow-hidden">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Fingerprint className="w-4 h-4" />
          </div>
          <div
            className={`flex items-center gap-1.5 ${onNavigateToIdentity ? 'cursor-pointer group' : ''}`}
            onClick={onNavigateToIdentity}
          >
            <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors">
              Identity Snapshot
            </h3>
            {onNavigateToIdentity && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToIdentity();
                }}
                className="p-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-neutral-400 hover:text-cyan-400 border border-white/5 transition-all flex items-center justify-center"
                title="View Identity OS"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-all active:scale-95"
          title="Identity OS info"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Info Box */}
      {showInfo && (
        <div className="p-3 bg-neutral-900/90 border border-white/10 rounded-xl space-y-1 text-xs text-neutral-300 animate-in fade-in">
          <p className="font-semibold text-white flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Stat XP & Non-Linear Growth
          </p>
          <p className="text-neutral-400 leading-relaxed text-[11px]">
            Every action yields hidden Stat XP. Growth follows <code className="text-cyan-400 font-mono">Score = √XP</code>. Early levels rise quickly; higher levels require sustained discipline.
          </p>
        </div>
      )}

      {/* 5 Vertical Capsule Pill Bars Container */}
      <div className="grid grid-cols-5 gap-1 min-[360px]:gap-2 sm:gap-3 pt-1">
        {displayItems.map((item) => {
          return (
            <div
              key={item.name}
              className="flex flex-col items-center group min-w-0 w-full"
            >
              {/* Numeric Score Header */}
              <span className="text-[11px] sm:text-xs font-mono font-bold text-neutral-200 group-hover:text-white transition-colors mb-2">
                {item.score}
              </span>

              {/* Capsule Outer Track */}
              <div className="w-full max-w-[38px] min-[360px]:max-w-[44px] sm:max-w-[48px] h-32 sm:h-36 bg-[#18181b] border border-white/10 rounded-full p-1.5 flex flex-col justify-end relative shadow-inner group-hover:border-white/25 transition-all">
                {/* Inner Filled Rounded Pill */}
                <div
                  className={`w-full rounded-full bg-gradient-to-t ${item.config.gradient} ${item.config.glow} transition-all duration-700 ease-out`}
                  style={{ height: `${Math.max(12, Math.min(100, item.score))}%` }}
                />
              </div>

              {/* Attribute Title Label */}
              <span
                className={`text-[9.5px] min-[360px]:text-[10.5px] sm:text-xs font-bold ${item.config.textColor} text-center leading-tight tracking-tight mt-2.5 w-full whitespace-nowrap overflow-visible`}
              >
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
