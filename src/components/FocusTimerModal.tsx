import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playMicroWinTone } from '../lib/sound';

interface FocusTimerModalProps {
  missionTitle: string;
  durationMinutes: number;
  xpReward?: number;
  onClose: () => void;
  onComplete: (success: boolean, feedback?: { finishState: string; distractionReason?: string }) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  missionTitle,
  durationMinutes,
  xpReward = 50,
  onClose,
  onComplete,
}) => {
  const totalSeconds = durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [finishState, setFinishState] = useState<'FINISHED' | 'PARTIAL' | 'DISTRACTED'>('FINISHED');
  const [distractionReason, setDistractionReason] = useState('');

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
      particleCount: 60,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#0088FF', '#22C55E', '#F59E0B'],
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

  const progressPercent = Math.min(
    100,
    Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100)
  );

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(finishState === 'FINISHED' || finishState === 'PARTIAL', {
      finishState,
      distractionReason: distractionReason.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div className="w-full max-w-lg bg-[#0A0A0A] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-6 text-center relative shadow-2xl overflow-hidden">
        {/* Glowing background effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {!showFeedback ? (
          <>
            {/* Mission Badge & Header */}
            <div className="space-y-1 relative z-10">
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                FOCUS PROTOCOL ACTIVE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{missionTitle}</h2>
            </div>

            {/* Radial Clock Display */}
            <div className="relative w-56 h-56 mx-auto flex items-center justify-center my-4">
              <svg className="w-56 h-56 transform -rotate-90">
                <circle
                  cx="112"
                  cy="112"
                  r="96"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-neutral-900"
                  fill="transparent"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="96"
                  stroke="#0088FF"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 96}
                  strokeDashoffset={2 * Math.PI * 96 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-linear shadow-lg"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center space-y-1">
                <span className="text-5xl font-black tracking-tight text-white font-mono">
                  {formatTime(secondsRemaining)}
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  {progressPercent}% COMPLETE
                </span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-center gap-4 relative z-10 pt-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-3 rounded-2xl border transition-all ${
                  soundEnabled
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
                title="Toggle Ambient Cue"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="w-16 h-16 rounded-3xl bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-all transform active:scale-95"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? (
                  <Play className="w-7 h-7 fill-black ml-1" />
                ) : (
                  <Pause className="w-7 h-7 fill-black" />
                )}
              </button>

              <button
                onClick={handleStopEarly}
                className="p-3 rounded-2xl bg-neutral-900 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-neutral-800 hover:border-red-500/30 transition-all"
                title="End Focus Block"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            </div>
          </>
        ) : (
          /* Post-Session Feedback Form */
          <form onSubmit={handleFinalSubmit} className="space-y-5 text-left relative z-10">
            <div className="text-center space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                FOCUS BLOCK AUDIT
              </span>
              <h2 className="text-xl font-bold text-white">Did you complete your primary objective?</h2>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFinishState('FINISHED')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  finishState === 'FINISHED'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Fully Completed</span>
              </button>

              <button
                type="button"
                onClick={() => setFinishState('PARTIAL')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  finishState === 'PARTIAL'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <RefreshCw className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Partial Win</span>
              </button>

              <button
                type="button"
                onClick={() => setFinishState('DISTRACTED')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  finishState === 'DISTRACTED'
                    ? 'bg-red-500/20 border-red-500 text-red-400 font-bold'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Got Distracted</span>
              </button>
            </div>

            {finishState === 'PARTIAL' && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 space-y-1 font-mono">
                <span className="font-bold uppercase block text-[10px] text-amber-400">⚡ Partial Win Selected</span>
                <p className="font-sans text-[11px] text-neutral-300 leading-snug">
                  You'll claim 50% XP now (+{Math.floor((xpReward + 25) / 2)} XP). The mission stays active with remaining duration and XP halved for final completion.
                </p>
              </div>
            )}

            {finishState !== 'FINISHED' && (
              <div>
                <label className="text-xs font-mono text-neutral-400 uppercase block mb-1">
                  Why did you stop early or get distracted?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Checked phone, opened social media, low energy..."
                  value={distractionReason}
                  onChange={(e) => setDistractionReason(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-md"
              >
                Log Session & Claim XP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
