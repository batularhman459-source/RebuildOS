import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles, Check, X, Shield, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playMicroWinTone } from '../lib/sound';
import { LiquidMetalButton } from './ui/liquid-metal-button';

interface StreakCelebrationModalProps {
  streak: number;
  longestStreak?: number;
  missionTitle?: string;
  status: 'STARTED' | 'INCREMENTED';
  onClose: () => void;
}

export const StreakCelebrationModal: React.FC<StreakCelebrationModalProps> = ({
  streak,
  longestStreak = streak,
  missionTitle,
  status,
  onClose,
}) => {
  useEffect(() => {
    // Multi-burst celebration confetti
    try {
      playMicroWinTone();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff5722', '#ff9800', '#ffeb3b', '#e472ff', '#00e5ff'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 55,
          origin: { x: 0.1, y: 0.7 },
          colors: ['#ff7043', '#ffa726', '#4ade80'],
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 55,
          origin: { x: 0.9, y: 0.7 },
          colors: ['#ff7043', '#ffa726', '#4ade80'],
        });
      }, 250);

      return () => clearTimeout(timer);
    } catch {}
  }, []);

  const isNewRecord = streak >= longestStreak && streak > 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[360px] bg-[#0B0B0E] border border-white/10 rounded-[32px] p-6 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden text-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close celebration"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/15 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all active:scale-90 cursor-pointer z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Floating Flaming Icon Centerpiece */}
        <div className="relative pt-2 flex flex-col items-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Inner flame shield container */}
            <div className="relative w-20 h-20 rounded-3xl bg-white/10 border border-white/15 flex items-center justify-center shadow-inner">
              <Flame className="w-11 h-11 text-orange-500 fill-orange-500 filter drop-shadow-[0_0_12px_rgba(249,115,22,0.9)] animate-pulse" />
            </div>

            {/* Sparkle badge */}
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg animate-bounce">
              <Sparkles className="w-3.5 h-3.5 fill-current stroke-none" />
            </div>
          </div>

          {/* Subtitle tag */}
          <span className="inline-flex items-center gap-1 mt-4 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <Check className="w-3 h-3 stroke-[3]" />
            First Mission of the Day
          </span>
        </div>

        {/* Streak Counter Heading */}
        <div className="space-y-1.5 relative z-10">
          <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight leading-none flex items-center justify-center gap-2">
            <span>{streak}</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-orange-400 uppercase tracking-widest">
              {streak === 1 ? 'DAY' : 'DAYS'}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {status === 'STARTED' ? 'Daily Streak Ignited!' : 'Streak Extended!'}
          </h3>

          <p className="text-xs text-neutral-300 font-sans max-w-[280px] mx-auto leading-relaxed">
            {missionTitle ? (
              <>Completed <strong className="text-white font-semibold">"{missionTitle}"</strong>. Your daily streak is safe for today.</>
            ) : (
              <>Your daily streak is locked in. Complete more missions today to build deeper momentum.</>
            )}
          </p>
        </div>

        {/* Milestone / All-Time Record Pill */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Streak Protected
          </span>
          <span className="text-white font-bold">
            Best: <span className="text-amber-400">{longestStreak}d</span>
            {isNewRecord && <span className="ml-1 text-[10px] text-orange-400 font-extrabold">(NEW RECORD!)</span>}
          </span>
        </div>

        {/* Action Button */}
        <div className="w-full flex justify-center pt-1 relative z-10">
          <LiquidMetalButton
            size="lg"
            variant="gold"
            width={260}
            height={48}
            onClick={onClose}
            icon={<ArrowRight className="w-4 h-4" />}
            label="Keep Momentum"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

interface StreakProtectedToastProps {
  message?: string;
  onDismiss: () => void;
}

export const StreakProtectedToast: React.FC<StreakProtectedToastProps> = ({
  message = 'Streak Protected! Daily streak already secured for today.',
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3800);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="fixed top-5 inset-x-4 max-w-sm mx-auto z-50 flex items-center justify-between gap-3 px-4 py-3 bg-[#171922]/95 border border-emerald-500/40 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(74,222,128,0.2)] backdrop-blur-2xl text-left"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
          <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
            <span className="text-emerald-400">Streak Protected</span>
          </p>
          <p className="text-[11px] text-neutral-300 truncate">
            {message}
          </p>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};
