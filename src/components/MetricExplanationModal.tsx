import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Shield, Clock, ShieldCheck, ChevronDown, Calendar } from 'lucide-react';
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
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(true);
  const [isFormulaOpen, setIsFormulaOpen] = useState<boolean>(false);

  const getScoreForTab = (tab: MetricType) => {
    switch (tab) {
      case 'execution':
        return executionRate;
      case 'recovery':
        return user?.recoveryRate ?? recoveryRate;
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
        className="w-full max-w-lg bg-[#0B0B0E] border border-white/10 rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden text-left max-h-[90vh] flex flex-col text-white backdrop-blur-2xl"
      >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between relative z-10 flex-shrink-0 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-white/10 border-white/15 text-white">
              {activeTab === 'execution' && <Flame className="w-5 h-5 text-white" />}
              {activeTab === 'recovery' && <Shield className="w-5 h-5 text-white" />}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-sm sm:text-base font-bold font-sans tracking-wide text-white">
                {activeTab === 'execution' ? 'Execution' : 'Recovery'}
              </span>
              <span className="text-xs sm:text-sm font-semibold font-sans text-zinc-400">
                {currentScore}% • {rating.label}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/15 text-zinc-400 hover:text-white border border-white/10 transition-all active:scale-90 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-black/60 border border-white/10 rounded-2xl relative z-10 flex-shrink-0 text-xs font-sans font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('execution')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'execution'
                ? 'bg-white text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="truncate">Execution</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recovery')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'recovery'
                ? 'bg-white text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
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
                {/* Score & Summary Card */}
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-white" />
                      <h3 className="text-base font-bold font-sans text-white">
                        Execution Rate
                      </h3>
                    </div>
                    <span className="text-2xl font-bold font-sans text-white">
                      {executionRate}%
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Execution tracks how often you follow through on what you planned today. Completing missions builds momentum.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-black/50 border border-white/10 rounded-xl p-3">
                      <span className="text-[10px] text-zinc-400 font-sans uppercase tracking-wider block">Status</span>
                      <span className="text-sm font-semibold font-sans text-white mt-0.5 block">{rating.label}</span>
                    </div>
                    <div className="bg-black/50 border border-white/10 rounded-xl p-3">
                      <span className="text-[10px] text-zinc-400 font-sans uppercase tracking-wider block">Current Streak</span>
                      <span className="text-sm font-semibold font-sans text-white mt-0.5 block">{currentStreak} days</span>
                    </div>
                  </div>
                </div>

                {/* Mathematical Formula Box (Collapsible) */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setIsFormulaOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between text-[11px] font-sans font-semibold text-zinc-400 px-2 py-1.5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer select-none group"
                  >
                    <span className="uppercase tracking-wider text-zinc-300 group-hover:text-white">
                      How it's calculated
                    </span>
                    <motion.div
                      animate={{ rotate: isFormulaOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isFormulaOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-2 font-sans">
                          <div className="flex items-center justify-center gap-3 py-2 text-xs sm:text-sm text-white">
                            <span className="text-white font-bold">Execution</span>
                            <span className="text-zinc-500">=</span>
                            <div className="flex flex-col items-center">
                              <span className="text-zinc-200 border-b border-zinc-700 pb-0.5 px-2 font-medium">Completed XP</span>
                              <span className="text-zinc-400 pt-0.5 px-2">Planned XP</span>
                            </div>
                            <span className="text-zinc-500">× 100</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === 'recovery' && (() => {
              const currentScore = user?.recoveryRate ?? recoveryRate;
              const ratingLabel = getRecoveryRatingLabel(currentScore);
              const avgDays = user?.avgRecoveryDays ?? 1.1;
              const fastestDays = user?.fastestRecoveryDays ?? 1;
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
                  {/* Minimalist Summary Card */}
                  <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-white" />
                        <h3 className="text-base font-bold font-sans text-white">
                          Recovery Rate
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold font-sans text-white">
                          {currentScore}%
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-zinc-200">
                          {ratingLabel}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      Recovery tracks how quickly you return after missing a day. Slipping happens—stepping back in immediately is what counts.
                    </p>

                    {/* 3 Core Metric Cards */}
                    <div className="grid grid-cols-3 gap-2 pt-1 font-sans">
                      <div className="bg-black/50 border border-white/10 rounded-xl p-3 text-center">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Score</span>
                        <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">{currentScore}%</span>
                      </div>
                      <div className="bg-black/50 border border-white/10 rounded-xl p-3 text-center">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Avg. return</span>
                        <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">{formatRecoveryDays(avgDays)}</span>
                      </div>
                      <div className="bg-black/50 border border-white/10 rounded-xl p-3 text-center">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Fastest</span>
                        <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">{formatRecoveryDays(fastestDays)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resilience Speed Bonus Framework */}
                  <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 space-y-2.5 font-sans">
                    <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block">
                      Comeback bonuses
                    </span>
                    <div className="space-y-1.5">
                      <div className="bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">Snap-Back</span>
                          <span className="text-zinc-400 text-[11px]">1 day missed</span>
                        </div>
                        <span className="font-semibold text-white bg-white/10 border border-white/15 px-2 py-0.5 rounded-lg text-xs">
                          +50% XP
                        </span>
                      </div>
                      <div className="bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">Slow Bounce</span>
                          <span className="text-zinc-400 text-[11px]">2–3 days missed</span>
                        </div>
                        <span className="font-medium text-zinc-300 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded-lg text-xs">
                          +30% XP
                        </span>
                      </div>
                      <div className="bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">Fresh Start</span>
                          <span className="text-zinc-400 text-[11px]">4+ days missed</span>
                        </div>
                        <span className="text-zinc-400 text-xs">
                          Standard XP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recovery History Accordion */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsHistoryOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between text-[11px] font-sans font-semibold text-zinc-400 px-2 py-1.5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer select-none group"
                    >
                      <span className="flex items-center gap-1.5 uppercase tracking-wider text-zinc-300 group-hover:text-white">
                        <Clock className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                        <span>Recent comebacks</span>
                      </span>
                      <motion.div
                        animate={{ rotate: isHistoryOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isHistoryOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden space-y-1.5 font-sans"
                        >
                          {events.map((ev, idx) => {
                            const isSnap = ev.daysInactive === 1;
                            const isSlow = ev.daysInactive >= 2 && ev.daysInactive <= 3;
                            
                            let formattedDate = ev.date;
                            if (ev.date) {
                              try {
                                const d = new Date(ev.date + 'T00:00:00');
                                formattedDate = d.toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                });
                              } catch {
                                formattedDate = ev.date;
                              }
                            }

                            return (
                              <div
                                key={ev.id || idx}
                                className="bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  <ShieldCheck className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="text-white font-medium">
                                        {formatRecoveryDays(ev.daysInactive)}
                                      </span>
                                      <span
                                        className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                                          isSnap
                                            ? 'bg-white/10 border-white/20 text-white'
                                            : isSlow
                                            ? 'bg-white/[0.06] border-white/10 text-zinc-300'
                                            : 'bg-white/[0.03] border-white/10 text-zinc-400'
                                        }`}
                                      >
                                        {isSnap ? '⚡ Snap-Back' : isSlow ? 'Slow Bounce' : 'Restart'}
                                      </span>
                                    </div>
                                    {formattedDate && (
                                      <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                                        <Calendar className="w-2.5 h-2.5 text-zinc-500" />
                                        {formattedDate}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="font-semibold text-white text-xs bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-lg">
                                  +{ev.points} pts
                                </span>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Minimalist Principle */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 text-center">
                    <p className="text-xs text-zinc-400 font-sans italic leading-relaxed">
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
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold font-sans text-xs tracking-wider uppercase transition-all shadow-sm active:scale-98 cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
