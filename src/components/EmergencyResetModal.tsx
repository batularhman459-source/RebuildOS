import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Check,
  Clock,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LiquidMetalButton } from './ui/liquid-metal-button';

interface EmergencyResetModalProps {
  onClose: () => void;
  onCompleteReset: () => void;
  lastResetTimestamp?: string;
}

export const EmergencyResetModal: React.FC<EmergencyResetModalProps> = ({
  onClose,
  onCompleteReset,
  lastResetTimestamp,
}) => {
  // Step flow: 1 = Interrupt & Reset, 2 = Choose Task, 3 = Short Focus Session, 4 = Recovery Recorded
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<1 | 2 | 3 | 4>(1);

  // Anti-Farming Cooldown Logic (1 hour cooldown for XP/stat rewards)
  const COOLDOWN_MINUTES = 60;
  const lastResetTime = lastResetTimestamp ? new Date(lastResetTimestamp).getTime() : 0;
  const minutesSinceLast = lastResetTime > 0 ? (Date.now() - lastResetTime) / (1000 * 60) : 999;
  const isCooldownActive = minutesSinceLast < COOLDOWN_MINUTES;
  const cooldownRemaining = Math.max(1, Math.ceil(COOLDOWN_MINUTES - minutesSinceLast));

  // Task selection state
  const [taskName, setTaskName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(5);

  // Focus timer state
  const [timerSeconds, setTimerSeconds] = useState(300); // default 5 min (300s)
  const [timerActive, setTimerActive] = useState(false);

  // Clean presets for mobile readability
  const PRESETS = [
    'Clear desk surface',
    'Close distracting tabs',
    'Write 2 sentences',
    'Drink water & stretch',
    'Reply to 1 priority message',
  ];

  const goToStep = (targetStep: 1 | 2 | 3 | 4) => {
    setStep(targetStep);
    setMaxReachedStep((prev) => Math.max(prev, targetStep) as 1 | 2 | 3 | 4);
  };

  // Update timer seconds when durationMinutes changes or when navigating to step 2
  useEffect(() => {
    if (step === 2) {
      setTimerSeconds(durationMinutes * 60);
    }
  }, [durationMinutes, step]);

  // Focus Timer Countdown Engine
  useEffect(() => {
    if (step !== 3 || !timerActive) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          handleFinishTask();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, timerActive]);

  const handleStartSprint = () => {
    const activeTitle = taskName.trim() || 'Clear immediate friction point';
    setTaskName(activeTitle);
    setTimerSeconds(durationMinutes * 60);
    setTimerActive(true);
    goToStep(3);
  };

  const handleFinishTask = () => {
    setTimerActive(false);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#5E1473', '#FF00FF', '#FCCF3A', '#F43F5E'],
    });
    goToStep(4);
  };

  const handleReturnToNormalMode = () => {
    onCompleteReset();
    onClose();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalSeconds = durationMinutes * 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timerSeconds) / totalSeconds) * 100 : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 overscroll-contain"
    >
      <div className="w-full max-w-md bg-gradient-to-b from-rose-950/70 via-[#0d070a] to-[#080406] border border-rose-500/20 rounded-3xl p-5 sm:p-7 space-y-5 relative shadow-[0_25px_60px_rgba(225,29,72,0.2)] overflow-hidden text-left max-h-[90vh] overflow-y-auto">
        {/* Deep Crimson Ambient Radial Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-red-900/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-500/20 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span id="reset-modal-title" className="text-xs font-mono font-bold tracking-wider text-rose-400 uppercase block">
                Emergency Reset
              </span>
              <span className="text-[11px] text-neutral-400 font-sans">
                Reset and get back on track
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Step Navigation Progress Bars */}
        <div className="grid grid-cols-4 gap-2 relative z-10">
          {([1, 2, 3, 4] as const).map((i) => {
            const isActive = i === step;
            const isAccessible = i <= maxReachedStep;

            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (isAccessible) {
                    goToStep(i);
                  }
                }}
                disabled={!isAccessible}
                className={`group relative py-1 flex flex-col items-center rounded-lg transition-all ${
                  isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'
                }`}
                title={
                  isAccessible
                    ? `Go to Step ${i}`
                    : `Complete Step ${i - 1} first`
                }
              >
                <div
                  className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] scale-y-110'
                      : i <= step
                      ? 'bg-rose-600/80'
                      : isAccessible
                      ? 'bg-rose-900/50 hover:bg-rose-700/60'
                      : 'bg-white/10'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* STEP 1: Interrupt Behavior & Principle */}
        {step === 1 && (
          <div className="space-y-5 relative z-10 animate-in fade-in duration-200">
            {/* Core Principle Quote */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-1.5">
              <span className="text-[10px] font-sans uppercase tracking-widest text-rose-400 font-bold block">
                Keep in mind
              </span>
              <p className="text-xs sm:text-sm font-medium text-rose-100 italic leading-relaxed">
                “You don’t need to fix everything. You just need to regain control of the next few minutes.”
              </p>
            </div>

            {/* Reset Instructions */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-400">
                3 quick steps
              </h3>

              <div className="space-y-2 text-xs text-neutral-200">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center font-mono text-[11px] font-bold flex-shrink-0">
                    1
                  </div>
                  <span>Close distracting tabs or put your phone face down.</span>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center font-mono text-[11px] font-bold flex-shrink-0">
                    2
                  </div>
                  <span>Pause for a moment and let go of frustration.</span>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center font-mono text-[11px] font-bold flex-shrink-0">
                    3
                  </div>
                  <span>Pick one small, simple task to break the friction.</span>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center pt-2">
              <LiquidMetalButton
                type="button"
                size="md"
                variant="rose"
                width={240}
                height={42}
                onClick={() => goToStep(2)}
                icon={<ArrowRight className="w-4 h-4" />}
                label="Pick a small task"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Choose One Tiny Task */}
        {step === 2 && (
          <div className="space-y-4 relative z-10 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Pick one small task</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Make it so small you can't talk yourself out of it.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-sans text-neutral-400 uppercase tracking-wider block">
                Suggestions
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTaskName(preset)}
                    className={`text-[11px] font-sans px-3 py-2 rounded-xl border transition-all text-left ${
                      taskName === preset
                        ? 'bg-rose-500/25 border-rose-500/60 text-rose-100 font-semibold shadow-sm'
                        : 'bg-black/40 border-white/10 text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-sans text-neutral-400 uppercase tracking-wider block">
                Or write your own
              </label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder='e.g., "Clear desk", "Write 2 sentences"'
                className="w-full bg-black/50 border border-white/15 focus:border-rose-500/60 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-all"
              />
            </div>

            {/* Duration Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-sans text-neutral-400 uppercase tracking-wider block">
                Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      durationMinutes === mins
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                        : 'bg-black/40 text-neutral-300 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="text-xs font-mono text-neutral-400 hover:text-white px-2 py-1"
              >
                ← Back
              </button>
              <LiquidMetalButton
                type="button"
                size="sm"
                variant="rose"
                width={150}
                height={38}
                onClick={handleStartSprint}
                icon={<ArrowRight className="w-4 h-4" />}
                label="Start timer"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Short Focus Session */}
        {step === 3 && (
          <div className="space-y-5 relative z-10 text-center animate-in fade-in duration-200">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest block font-bold">
                QUICK FOCUS
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white px-2 truncate">
                {taskName || 'Micro Task'}
              </h3>
            </div>

            {/* Timer Display */}
            <div className="relative py-2">
              <div className="w-40 h-40 mx-auto rounded-full bg-black/60 border border-rose-500/30 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-rose-500/20 transition-all duration-1000 pointer-events-none"
                  style={{ height: `${progressPercent}%` }}
                />
                <span className="text-3xl sm:text-4xl font-mono font-black text-white tracking-wider relative z-10">
                  {formatTime(timerSeconds)}
                </span>
                <span className="text-[10px] font-mono text-rose-300 uppercase tracking-wider mt-1 relative z-10">
                  {timerActive ? 'Focusing' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setTimerActive(!timerActive)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold flex items-center gap-2 transition-all"
              >
                {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{timerActive ? 'Pause' : 'Resume'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTimerSeconds(durationMinutes * 60);
                  setTimerActive(false);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
                title="Reset Timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Complete Early Button */}
            <div className="w-full flex justify-center pt-1">
              <LiquidMetalButton
                type="button"
                size="md"
                variant="purple"
                width={250}
                height={42}
                onClick={handleFinishTask}
                icon={<Check className="w-4 h-4" />}
                label="Mark task complete"
              />
            </div>

            <p className="text-[11px] text-neutral-400 font-sans italic">
              “Just this one task. Nothing else right now.”
            </p>
          </div>
        )}

        {/* STEP 4: Record Recovery & Return */}
        {step === 4 && (
          <div className="space-y-5 relative z-10 text-center animate-in fade-in duration-200 py-1">
            <div className="w-14 h-14 rounded-2xl bg-[#5E1473]/30 border border-[#5E1473]/50 text-[#e472ff] flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Reset complete</h3>
              <p className="text-xs text-neutral-300 max-w-xs mx-auto leading-relaxed font-sans">
                You stopped the slide and got back to it. Keep this rhythm.
              </p>
            </div>

            {/* Recovery Summary */}
            <div className="p-3.5 rounded-2xl bg-[#5E1473]/20 border border-[#5E1473]/40 text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#e472ff] flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-[#e472ff]" />
                  Back in control
                </span>
                <span className="text-xs font-mono font-bold text-[#e472ff]">
                  {isCooldownActive ? '+0 XP' : '+25 XP'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 font-sans truncate">
                Task: <strong className="text-white">{taskName || 'Micro Task'}</strong>
              </p>
            </div>

            {/* Cooldown notice displayed only on Step 4 */}
            {isCooldownActive && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-[11px] font-mono text-amber-300 text-left">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold block text-amber-300">Cooldown active</span>
                    <span className="text-[10px] text-amber-200/70 block">Available again in 1 hour</span>
                  </div>
                </div>
                <span className="text-amber-400 font-bold bg-amber-500/15 px-2 py-1 rounded-lg border border-amber-500/30">
                  {cooldownRemaining}m left
                </span>
              </div>
            )}

            <div className="w-full flex justify-center pt-2">
              <LiquidMetalButton
                type="button"
                size="lg"
                variant="purple"
                width={260}
                height={48}
                onClick={handleReturnToNormalMode}
                icon={<ArrowRight className="w-4 h-4" />}
                label="Back to dashboard"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
