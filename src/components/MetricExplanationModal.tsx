import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Shield, RefreshCw, CheckCircle2, RotateCcw, Clock, Award, ShieldCheck, Sparkles } from 'lucide-react';
import { getMetricRatingLabel } from '../lib/progression';
import { UserProfile } from '../types';
import { formatRecoveryDays, getRecoveryRatingLabel, INITIAL_RECOVERY_EVENTS } from '../lib/recovery';

export type MetricType = 'execution' | 'recovery';

interface MetricExplanationModalProps {
  type: MetricType;
  user?: UserProfile;
  onClose: () => void;
  executionRate?: number;
  recoveryRate?: number;
  restartsCount?: number;
  longestStreak?: number;
  currentStreak?: number;
}

export const MetricExplanationModal: React.FC<MetricExplanationModalProps> = ({
  type: initialType,
  user,
  onClose,
  executionRate = 92,
  recoveryRate = 88,
  restartsCount = 2,
  longestStreak = 15,
  currentStreak = 8,
}) => {
  const [activeTab, setActiveTab] = useState<MetricType>(initialType === 'recovery' ? 'recovery' : 'execution');

  const getScoreForTab = (tab: MetricType) => {
    switch (tab) {
      case 'execution':
        return executionRate;
      case 'recovery':
        return recoveryRate;
      default:
        return executionRate;
    }
  };

  const currentScore = getScoreForTab(activeTab);
  const rating = getMetricRatingLabel(currentScore);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-gradient-to-b from-[#14141a] via-[#0d0d12] to-[#08080b] border border-white/10 rounded-[30px] p-5 sm:p-6 space-y-5 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(0,229,153,0.08)] relative overflow-hidden text-left max-h-[90vh] flex flex-col"
      >
        {/* Soft Ambient Glow */}
        <div
          className={`absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-36 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
            activeTab === 'execution'
              ? 'bg-[#00e599]/15'
              : 'bg-emerald-400/15'
          }`}
        />

        {/* Modal Header Bar */}
        <div className="flex items-center justify-between relative z-10 flex-shrink-0 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                activeTab === 'execution'
                  ? 'bg-[#00e599]/15 border-[#00e599]/30 text-[#00e599]'
                  : 'bg-emerald-400/15 border-emerald-400/30 text-emerald-400'
              }`}
            >
              {activeTab === 'execution' && <Flame className="w-5 h-5 fill-[#00e599]/20" />}
              {activeTab === 'recovery' && <Shield className="w-5 h-5" />}
            </div>

            <div className="flex items-baseline gap-2">
              <span className={`text-sm sm:text-base font-extrabold uppercase tracking-wide ${rating.colorClass}`}>
                {rating.label}
              </span>
              <span className="text-sm sm:text-base font-black font-mono text-white">
                {currentScore}%
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/5 transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-white/[0.04] border border-white/5 rounded-2xl relative z-10 flex-shrink-0 text-xs font-mono font-bold">
          <button
            onClick={() => setActiveTab('execution')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'execution'
                ? 'bg-[#00e599]/20 text-[#00e599] border border-[#00e599]/30 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="truncate">Execution</span>
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'recovery'
                ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="truncate">Recovery</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto pr-1 space-y-4 custom-scrollbar relative z-10 flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'execution' && (
              <motion.div
                key="execution"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-left"
              >
                {/* Title & Overview */}
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    🔥 Execution Score
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
                    Execution measures how consistently you turn intentions into action.
                  </p>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">
                    It's not about how many tasks you do—it's about how many of your planned tasks you complete.
                  </p>
                </div>

                {/* Mathematical Formula Box */}
                <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 space-y-2 font-mono">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                    FORMULA
                  </span>
                  <div className="flex items-center justify-center gap-3 py-2 text-xs sm:text-sm text-white">
                    <span className="text-[#00e599] font-bold">Execution</span>
                    <span className="text-neutral-500">=</span>
                    <div className="flex flex-col items-center">
                      <span className="text-emerald-300 border-b border-neutral-700 pb-0.5 px-2">Completed XP</span>
                      <span className="text-neutral-400 pt-0.5 px-2">Planned XP</span>
                    </div>
                    <span className="text-neutral-500">× 100</span>
                  </div>
                </div>




              </motion.div>
            )}

            {activeTab === 'recovery' && (() => {
              const currentScore = user?.recoveryRate ?? recoveryRate;
              const ratingLabel = getRecoveryRatingLabel(currentScore);
              const avgDays = user?.avgRecoveryDays ?? 1.2;
              const fastestDays = user?.fastestRecoveryDays ?? 0;
              const events = user?.recoveryEvents && user.recoveryEvents.length > 0
                ? user.recoveryEvents.slice(-5)
                : INITIAL_RECOVERY_EVENTS.slice(-5);

              return (
                <motion.div
                  key="recovery"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 text-left"
                >
                  {/* Title & Tooltip Philosophy */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      🛡️ Recovery Score
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-300/90 font-light leading-relaxed bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl">
                      "Recovery measures how quickly you return after falling off. One bad day doesn't define you. Your response does."
                    </p>
                  </div>

                  {/* 3 Core Metric Cards */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-neutral-900/90 border border-emerald-500/30 rounded-2xl p-2.5 flex flex-col items-center justify-center space-y-0.5">
                      <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase">RECOVERY</span>
                      <div className="text-base sm:text-lg font-black font-mono text-emerald-400">
                        {currentScore}%
                      </div>
                      <span className="text-[10px] font-mono text-emerald-300/90">{ratingLabel}</span>
                    </div>

                    <div className="bg-neutral-900/90 border border-cyan-500/30 rounded-2xl p-2.5 flex flex-col items-center justify-center space-y-0.5">
                      <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase">AVG. RECOVERY</span>
                      <div className="text-base sm:text-lg font-black font-mono text-cyan-300">
                        {formatRecoveryDays(avgDays)}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">5-event avg</span>
                    </div>

                    <div className="bg-neutral-900/90 border border-purple-500/30 rounded-2xl p-2.5 flex flex-col items-center justify-center space-y-0.5">
                      <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase">FASTEST</span>
                      <div className="text-base sm:text-lg font-black font-mono text-purple-300">
                        {formatRecoveryDays(fastestDays)}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">Personal best</span>
                    </div>
                  </div>

                  {/* Secondary Context Bar: Times Restarted & Longest Streak */}
                  <div className="bg-black/60 border border-white/10 rounded-2xl p-3 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-neutral-300">Times Restarted:</span>
                      <strong className="text-amber-400 font-bold">{restartsCount}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-neutral-300">Best Streak:</span>
                      <strong className="text-emerald-400 font-bold">{longestStreak}d</strong>
                    </div>
                  </div>

                  {/* RECOVERY HISTORY List (5-Event Rolling Window) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 px-1 font-bold">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider text-neutral-300">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>RECOVERY HISTORY</span>
                      </span>
                      <span className="text-[10px] text-neutral-500 font-normal">Last 5 events</span>
                    </div>

                    <div className="space-y-1.5 font-mono">
                      {events.map((ev, idx) => (
                        <div
                          key={ev.id || idx}
                          className="bg-neutral-900/90 border border-white/5 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span className="text-white font-medium">
                              {formatRecoveryDays(ev.daysInactive)}
                            </span>
                          </div>
                          <span className="font-bold text-emerald-400 text-xs bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
                            {ev.points} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RebuildOS Mantra */}
                  <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-transparent border border-amber-500/20 rounded-2xl p-3 text-center">
                    <p className="text-xs text-amber-200/90 font-medium italic">
                      "Your past proves what happened. Your recent actions prove who you're becoming."
                    </p>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>

        {/* Action Close Button */}
        <div className="pt-2 relative z-10 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs tracking-wider uppercase transition-all active:scale-98"
          >
            Close & Keep Building
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
