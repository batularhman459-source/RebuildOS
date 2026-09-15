import React, { useEffect } from 'react';
import { Trophy, Sparkles, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playMicroWinTone } from '../lib/sound';
import { getTierForLevel } from '../lib/progression';
import { motion } from 'motion/react';
import { LiquidMetalButton } from './ui/liquid-metal-button';

interface LevelUpModalProps {
  newLevel: number;
  title: string;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ newLevel, title, onClose }) => {
  const tier = getTierForLevel(newLevel);

  useEffect(() => {
    playMicroWinTone();
    const timer = setTimeout(() => {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#5E1473', '#FF00FF', '#FCCF3A', '#3b82f6'],
        disableForReducedMotion: true,
      });
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm bg-gradient-to-b from-[#141419] via-[#0d0d10] to-[#09090b] border border-amber-500/30 rounded-[32px] p-6 sm:p-7 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.15)] relative overflow-hidden text-center"
      >
        {/* Soft Ambient Radial Lights */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-[#5E1473]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/5 transition-all active:scale-90 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Level Badge */}
        <div className="flex flex-col items-center space-y-4 pt-2 relative z-10">
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#FF00FF] to-[#FCCF3A] p-0.5 shadow-xl shadow-[#FF00FF]/25">
              <div className="w-full h-full bg-[#0a0a0d] rounded-[22px] flex items-center justify-center text-[#FCCF3A] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FF00FF]/15 to-transparent" />
                <Trophy className="w-9 h-9 stroke-[1.75]" />
              </div>
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 bg-[#FCCF3A] text-black rounded-full p-1 border-2 border-black shadow-md">
              <Sparkles className="w-3.5 h-3.5 fill-black" />
            </div>
          </motion.div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-extrabold tracking-[0.2em] text-[#FCCF3A] uppercase bg-[#FCCF3A]/10 px-3.5 py-1 rounded-full border border-[#FCCF3A]/25 inline-flex items-center gap-1.5 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF00FF] animate-pulse" />
              LEVEL {newLevel}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
              {title}
            </h2>
          </div>
        </div>

        {/* Identity Quote / Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-left space-y-1.5 relative z-10 backdrop-blur-md"
        >
          <span className="text-[10px] font-mono font-bold text-[#FCCF3A]/90 uppercase tracking-wider block">
            New standard
          </span>
          <p className="text-xs sm:text-sm text-neutral-200 font-light leading-relaxed whitespace-pre-line">
            {tier.message}
          </p>
        </motion.div>

        {/* Continue Button */}
        <div className="w-full flex justify-center pt-1 relative z-10">
          <LiquidMetalButton
            size="lg"
            variant="gold"
            width={260}
            height={48}
            onClick={onClose}
            icon={<ArrowRight className="w-4 h-4 stroke-[2.5]" />}
            label="Keep Walking"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
