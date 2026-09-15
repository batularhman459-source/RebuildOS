import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, Sparkles, X, ArrowRight, ShieldCheck, Clock, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RecoveryBonusInfo } from '../types';
import { playMicroWinTone } from '../lib/sound';
import { LiquidMetalButton } from './ui/liquid-metal-button';

interface ComebackCelebrationModalProps {
  recoveryBonus: RecoveryBonusInfo;
  missionTitle?: string;
  avgRecoveryDays?: number;
  onClose: () => void;
}

export const ComebackCelebrationModal: React.FC<ComebackCelebrationModalProps> = ({
  recoveryBonus,
  missionTitle,
  avgRecoveryDays = 1.1,
  onClose,
}) => {
  useEffect(() => {
    try {
      playMicroWinTone();
      // Celebration bursts for snapping back
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#a855f7', '#ec4899', '#f59e0b', '#38bdf8', '#4ade80'],
      });
    } catch {}
  }, []);

  const isSnapBack = recoveryBonus.category === 'SNAP_BACK';
  const isSlowBounce = recoveryBonus.category === 'SLOW_BOUNCE';
  const hasXpBonus = recoveryBonus.bonusXp > 0;

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
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[380px] bg-gradient-to-b from-[#1d152b] via-[#14101e] to-[#0c0a13] border border-purple-500/40 rounded-[32px] p-6 sm:p-7 space-y-5 shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(168,85,247,0.2),inset_0_1px_1.5px_rgba(255,255,255,0.3)] relative overflow-hidden text-center"
      >
        {/* Soft Ambient Radial Glow */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-50"
          style={{
            background: 'radial-gradient(circle, #c084fc 0%, #ec4899 45%, #f59e0b 80%, transparent 100%)',
          }}
        />

        {/* Top Rim Specular Highlight */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-purple-300/70 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close comeback modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/15 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all active:scale-90 cursor-pointer z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Centerpiece Icon */}
        <div className="relative pt-2 flex flex-col items-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.06, 1] }}
              transition={{
                rotate: { repeat: Infinity, duration: 10, ease: 'linear' },
                scale: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' },
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#9333ea] via-[#ec4899] to-[#f59e0b] blur-lg opacity-75"
            />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-b from-[#2a173d] to-[#140b1e] border-2 border-purple-400/60 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_0_25px_rgba(168,85,247,0.7)]">
              {isSnapBack ? (
                <Zap className="w-10 h-10 text-amber-300 fill-amber-300 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.9)] animate-pulse" />
              ) : isSlowBounce ? (
                <ShieldCheck className="w-10 h-10 text-[#e472ff] filter drop-shadow-[0_0_10px_rgba(228,114,255,0.9)]" />
              ) : (
                <Sparkles className="w-10 h-10 text-cyan-300 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.9)]" />
              )}
            </div>

            {/* Sparkle Tag */}
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple-400 text-black flex items-center justify-center shadow-lg animate-bounce">
              <Sparkles className="w-3.5 h-3.5 fill-current stroke-none" />
            </div>
          </div>

          {/* Badge Label */}
          <span className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm">
            <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
            {recoveryBonus.badgeLabel}
          </span>
        </div>

        {/* Heading & Resilient Framing */}
        <div className="space-y-1.5 relative z-10">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
            {recoveryBonus.title}
          </h3>

          <p className="text-xs sm:text-[13px] text-neutral-200 font-sans max-w-[300px] mx-auto leading-relaxed">
            {recoveryBonus.message}
          </p>
        </div>

        {/* Bonus XP Breakdown Pill */}
        {hasXpBonus ? (
          <div className="bg-black/50 border border-purple-500/30 rounded-2xl p-3.5 space-y-1 text-left relative z-10 shadow-inner">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400">Time away:</span>
              <span className="text-white font-bold">{recoveryBonus.recoveryGapDays} {recoveryBonus.recoveryGapDays === 1 ? 'day missed' : 'days missed'}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400">Comeback bonus:</span>
              <span className="text-amber-400 font-bold">+{recoveryBonus.bonusXp} XP ({(recoveryBonus.multiplier * 100).toFixed(0)}%)</span>
            </div>
            <div className="pt-1 mt-1 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-purple-300">Total XP earned:</span>
              <span className="text-emerald-400 text-sm">+{recoveryBonus.totalXp} XP</span>
            </div>
          </div>
        ) : (
          <div className="bg-black/50 border border-white/10 rounded-2xl p-3 flex items-center justify-between text-xs font-mono relative z-10 shadow-inner">
            <span className="text-neutral-400">Streak restarted:</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              Day 1 started
            </span>
          </div>
        )}

        {/* Profile Stat Benchmark: Lap Time Gamification */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 flex items-center justify-between text-xs font-mono relative z-10">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Average comeback time:
          </span>
          <span className="text-white font-bold">
            <span className="text-cyan-300">{avgRecoveryDays} Days</span>
          </span>
        </div>

        {/* Action Button */}
        <div className="w-full flex justify-center pt-1 relative z-10">
          <LiquidMetalButton
            size="lg"
            variant="purple"
            width={260}
            height={48}
            onClick={onClose}
            icon={<ArrowRight className="w-4 h-4 stroke-[2.5]" />}
            label="Claim bonus XP"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
