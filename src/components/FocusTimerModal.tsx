import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  X,
  Sparkles,
  Zap,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playMicroWinTone } from '../lib/sound';

interface FocusTimerModalProps {
  missionId?: string;
  missionTitle: string;
  durationMinutes: number;
  xpReward?: number;
  targetAttribute?: string;
  onClose: () => void;
  onComplete: (
    success: boolean,
    feedback?: {
      finishState: 'FINISHED' | 'PARTIAL' | 'DISTRACTED';
      distractionReason?: string;
      actualMinutesSpent?: number;
      missionId?: string;
    }
  ) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  missionId,
  missionTitle,
  durationMinutes: initialDuration,
  xpReward = 50,
  targetAttribute = 'Focus',
  onClose,
  onComplete,
}) => {
  const defaultDuration = initialDuration > 0 ? initialDuration : 25;
  const [totalSeconds, setTotalSeconds] = useState(defaultDuration * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(defaultDuration * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [finishState, setFinishState] = useState<'FINISHED' | 'PARTIAL' | 'DISTRACTED'>('FINISHED');
  const [distractionReason, setDistractionReason] = useState('');

  // Adjust time dynamically
  const handleAdjustMinutes = (minutesDelta: number) => {
    const newSeconds = Math.max(60, secondsRemaining + minutesDelta * 60);
    setSecondsRemaining(newSeconds);
    setTotalSeconds((prev) => Math.max(newSeconds, prev + minutesDelta * 60));
  };

  const handleResetTimer = () => {
    setSecondsRemaining(totalSeconds);
    setIsPaused(true);
  };

  // Keyboard shortcut listener (Space to play/pause, R to reset, Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showFeedback) return;
      if (e.code === 'Space' && (e.target === document.body || (e.target as HTMLElement)?.tagName !== 'INPUT')) {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        if ((e.target as HTMLElement)?.tagName !== 'INPUT') {
          e.preventDefault();
          handleResetTimer();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFeedback, totalSeconds, onClose]);

  // Main countdown timer loop
  useEffect(() => {
    if (isPaused || showFeedback) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimerEnded();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, showFeedback]);

  const handleTimerEnded = () => {
    playMicroWinTone();
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#F59E0B', '#10B981', '#38BDF8', '#ffffff'],
    });
    setFinishState('FINISHED');
    setShowFeedback(true);
  };

  const handleStopEarly = () => {
    setIsPaused(true);
    setFinishState('PARTIAL');
    setShowFeedback(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate actual elapsed minutes spent
  const elapsedSeconds = Math.max(0, totalSeconds - secondsRemaining);
  const calculatedMinutesSpent = Math.max(1, Math.round(elapsedSeconds / 60));
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;

  const handleFinalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const actualMinutes = finishState === 'FINISHED' ? Math.round(totalSeconds / 60) : calculatedMinutesSpent;

    onComplete(finishState === 'FINISHED' || finishState === 'PARTIAL', {
      finishState,
      distractionReason: distractionReason.trim() || undefined,
      actualMinutesSpent: actualMinutes,
      missionId,
    });
  };

  // SVG Circular dial metrics
  const radius = 96;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-timer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl overscroll-contain animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg flex flex-col items-center">
        {!showFeedback ? (
          <div className="w-full bg-black rounded-[28px] sm:rounded-[34px] border border-white/15 p-5 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col items-center text-center relative overflow-hidden backdrop-blur-2xl">
            {/* Top Specular Rim Highlight */}
            <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

            {/* Header Bar */}
            <div className="w-full flex items-center justify-between pb-2 relative z-10">
              <div className="flex items-center gap-2.5 min-w-0 text-left">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Clock className="w-4 h-4 text-zinc-300" />
                </div>
                <div className="min-w-0">
                  <h3 id="focus-timer-title" className="text-sm sm:text-base font-semibold text-white tracking-tight leading-tight truncate font-sans">
                    {missionTitle || 'Focus Session'}
                  </h3>
                </div>
              </div>

              {/* Header Close Action */}
              <div className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                  title="Close timer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Precision Dial Chronometer */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-4 flex items-center justify-center z-10 select-none">
              {/* SVG Radial Arc Dial */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
                <defs>
                  <linearGradient id="timerArcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="50%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                  <filter id="timerGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" opacity="0.35" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Dial Outer Track */}
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="8"
                  fill="transparent"
                />

                {/* Glowing Progress Arc */}
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  stroke="url(#timerArcGradient)"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  filter="url(#timerGlow)"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              {/* Center Digital Display & Play/Pause State */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {/* Main Time Digits using calendar font style */}
                <div className="text-5xl sm:text-6xl font-bold tracking-tight text-white font-sans tabular-nums leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                  {formatTime(secondsRemaining)}
                </div>

                {/* Inline Quick Play / Pause Button */}
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="mt-4 w-12 h-12 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 transition-all flex items-center justify-center shadow-[0_4px_20px_rgba(255,255,255,0.2)] cursor-pointer"
                  title={isPaused ? 'Resume [Space]' : 'Pause [Space]'}
                >
                  {isPaused ? (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  ) : (
                    <Pause className="w-5 h-5 fill-current" />
                  )}
                </button>
              </div>
            </div>

            {/* Time Adjusters */}
            <div className="flex items-center justify-center gap-2 py-1 relative z-10">
              <button
                type="button"
                onClick={() => handleAdjustMinutes(-5)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-sans font-medium transition-colors cursor-pointer active:scale-95"
                title="Subtract 5 minutes"
              >
                -5m
              </button>
              <button
                type="button"
                onClick={() => handleAdjustMinutes(-1)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-sans font-medium transition-colors cursor-pointer active:scale-95"
                title="Subtract 1 minute"
              >
                -1m
              </button>
              <button
                type="button"
                onClick={() => handleAdjustMinutes(1)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-sans font-medium transition-colors cursor-pointer active:scale-95"
                title="Add 1 minute"
              >
                +1m
              </button>
              <button
                type="button"
                onClick={() => handleAdjustMinutes(5)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-sans font-medium transition-colors cursor-pointer active:scale-95"
                title="Add 5 minutes"
              >
                +5m
              </button>
            </div>

            {/* Bottom Footer Actions */}
            <div className="w-full flex items-center justify-between gap-3 pt-4 border-t border-white/10 mt-4 relative z-10">
              <button
                type="button"
                onClick={handleResetTimer}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                title="Reset countdown [R]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleStopEarly}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5 text-[#f97316]" />
                <span>Finish & Log</span>
              </button>
            </div>
          </div>
        ) : (
          /* Post-Session Audit & XP Claim Sheet */
          <div className="w-full bg-black rounded-[28px] sm:rounded-[34px] border border-white/15 p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.95)] space-y-4 text-left relative overflow-hidden backdrop-blur-2xl">
            {/* Top Specular Rim */}
            <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

            <div className="space-y-1 text-center pb-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f97316]/15 border border-[#f97316]/30 text-[#fb923c] text-[11px] font-sans font-medium">
                <Sparkles className="w-3 h-3" />
                <span>SESSION COMPLETED</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-sans">
                Log Your Focus Session
              </h2>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto font-sans">
                {missionTitle} • <strong className="text-white font-medium">{calculatedMinutesSpent} min</strong> focused
              </p>
            </div>

            {/* Outcome Selection Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFinishState('FINISHED')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  finishState === 'FINISHED'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-semibold shadow-xs'
                    : 'bg-zinc-950/80 border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-sans font-medium">Done</span>
                <span className="text-[10px] font-sans font-semibold text-emerald-400">+{xpReward} XP</span>
              </button>

              <button
                type="button"
                onClick={() => setFinishState('PARTIAL')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  finishState === 'PARTIAL'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-semibold shadow-xs'
                    : 'bg-zinc-950/80 border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-sans font-medium">Partial</span>
                <span className="text-[10px] font-sans font-semibold text-amber-400">+{Math.floor(xpReward / 2)} XP</span>
              </button>

              <button
                type="button"
                onClick={() => setFinishState('DISTRACTED')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  finishState === 'DISTRACTED'
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-200 font-semibold shadow-xs'
                    : 'bg-zinc-950/80 border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-sans font-medium">Distracted</span>
                <span className="text-[10px] font-sans font-semibold text-zinc-500">+0 XP</span>
              </button>
            </div>

            {/* Distraction Reason (if partial or distracted) */}
            {finishState !== 'FINISHED' && (
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-sans font-medium text-zinc-400 block">
                  What pulled you away? (Optional)
                </label>
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {['Phone / Notifications', 'Interruption', 'Fatigue / Lost Steam', 'Task Switch'].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setDistractionReason(reason)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-sans border transition-colors cursor-pointer ${
                        distractionReason === reason
                          ? 'bg-white/20 border-white/30 text-white font-medium'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Additional note..."
                  value={distractionReason}
                  onChange={(e) => setDistractionReason(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 focus:border-white/30 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors font-sans"
                />
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer font-sans"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => handleFinalSubmit()}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 font-sans"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Save session & Claim XP</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
