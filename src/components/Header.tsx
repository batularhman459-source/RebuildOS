import React, { useMemo, useState } from 'react';
import { UserProfile } from '../types';
import { Flame, Zap, Target, Shield, User } from 'lucide-react';
import { ChangelogModal } from './ChangelogModal';
import { MetricExplanationModal, MetricType } from './MetricExplanationModal';
import { getMetricRatingLabel } from '../lib/progression';
import { AnimatePresence } from 'motion/react';

interface HeaderProps {
  user: UserProfile;
  missionRate?: number;
  restartsCount?: number;
  onOpenProfile: () => void;
}

const MORNING_SENTENCES = [
  "Win the first hour.",
  "Start before your mind starts negotiating.",
  "One good decision changes the day.",
  "Don't rush. Just begin.",
  "Build momentum before distractions find you.",
  "Today's actions become tomorrow's identity.",
  "Start with intention, not your phone.",
  "The morning belongs to whoever protects it.",
  "Progress starts with showing up.",
  "You don't need motivation to begin.",
  "One task. One step. That's enough.",
  "Give your future self something to thank you for.",
  "Protect your attention early.",
  "Small wins create big days.",
  "Make today count before the world interrupts.",
  "Discipline begins with the next decision.",
  "Show up before excuses wake up.",
  "Keep your promise to yourself.",
  "Begin with purpose.",
  "Let's build something you'll be proud of."
];

const AFTERNOON_SENTENCES = [
  "One focused session can still change today.",
  "There's still plenty of time to move forward.",
  "Momentum is built one action at a time.",
  "Reset your focus and keep going.",
  "Your day isn't decided yet.",
  "Start with five minutes if you have to.",
  "The next task matters more than the last mistake.",
  "Keep moving, even if it's slowly.",
  "You don't need a perfect afternoon.",
  "Progress doesn't care what time it is.",
  "Finish one thing before starting another.",
  "One decision can change the rest of today.",
  "Protect what's left of your attention.",
  "Don't wait for a better mood.",
  "Keep the promises you made this morning.",
  "Small actions still count.",
  "Stay with the process.",
  "This moment is enough to restart.",
  "Keep building.",
  "Your future remembers what you do now."
];

const EVENING_SENTENCES = [
  "Finish strong. Reflect. Reset.",
  "Every day teaches something.",
  "Progress isn't perfection.",
  "What did today teach you?",
  "End today with intention.",
  "A calm finish creates a better tomorrow.",
  "One reflection is worth more than one regret.",
  "Leave tomorrow with a clean mind.",
  "Appreciate how far you've come.",
  "The day is over. The journey isn't.",
  "Rest is part of progress.",
  "Another day of becoming.",
  "Every honest effort counts.",
  "Close today with gratitude.",
  "Learn. Recover. Continue.",
  "Your consistency matters more than today's result.",
  "Tomorrow begins with how you end today.",
  "Reflect before you rest.",
  "Show yourself some honesty tonight.",
  "See you tomorrow. We'll keep building."
];

export const Header: React.FC<HeaderProps> = ({
  user,
  missionRate = 0,
  restartsCount = 2,
  onOpenProfile,
}) => {
  const [showChangelog, setShowChangelog] = useState(false);
  const [metricModal, setMetricModal] = useState<MetricType | null>(null);
  const xpPercentage = Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100));

  const executionRating = getMetricRatingLabel(missionRate);
  const recoveryRating = getMetricRatingLabel(user.recoveryRate);

  // Determine time of day greeting & tagline
  const now = new Date();
  const hour = now.getHours();

  let timeOfDay = 'morning';
  let sentenceList = MORNING_SENTENCES;

  if (hour >= 12 && hour < 18) {
    timeOfDay = 'afternoon';
    sentenceList = AFTERNOON_SENTENCES;
  } else if (hour >= 18 || hour < 5) {
    timeOfDay = 'evening';
    sentenceList = EVENING_SENTENCES;
  }

  // Pick sentence deterministically based on date and hour, or stable random choice per session
  const timeTagline = useMemo(() => {
    const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate() + hour;
    return sentenceList[seed % sentenceList.length];
  }, [timeOfDay, hour]);

  return (
    <header className="space-y-4">
      {/* Top Logo & Streak Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1 text-left group focus:outline-none hover:opacity-90 transition-opacity"
            title="Open Identity OS Profile"
          >
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center">
              Rebuild<span className="bg-gradient-to-r from-[#a855f7] via-[#3b82f6] to-[#00e599] bg-clip-text text-transparent ml-0.5">OS</span>
            </h1>
          </button>

          <button
            onClick={() => setShowChangelog(true)}
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#0c241a] text-[#00e599] border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer"
            title="View System Changelog"
          >
            v1
          </button>
        </div>

        {/* Right Action Controls: Streak Pill */}
        <div className="flex items-center gap-2">
          {/* Streak Pill */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/30 bg-white/[0.06] backdrop-blur-md text-[#f59e0b] text-xs font-bold font-mono shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
            <span>{user.streak}</span>
          </div>
        </div>
      </div>

      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}

      {/* Greeting Title & Dynamic Tagline */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white capitalize">
          Good {timeOfDay}, {user.name}
        </h2>
        <p className="text-sm font-light text-neutral-400 mt-1">
          "{timeTagline}"
        </p>
      </div>

      {/* Main Level & Momentum Card */}
      <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[28px] p-5 space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent">
        {/* Top Title Row */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            {/* Circle Level Badge */}
            <div className="w-12 h-12 rounded-full border-2 border-[#00e599] bg-[#0c241a]/90 backdrop-blur-md text-[#00e599] font-black text-sm flex items-center justify-center flex-shrink-0 font-mono shadow-md shadow-emerald-500/20">
              L{user.level}
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                {user.title}
              </h3>
              <p className="text-xs font-light text-[#00e599] tracking-wide mt-0.5">
                Level {user.level}
              </p>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-1.5 relative z-10">
          <div className="flex justify-between text-xs font-light text-neutral-400">
            <span>XP Progress</span>
            <strong className="text-white font-normal">
              {user.xp} / {user.xpToNextLevel} XP ({xpPercentage}%)
            </strong>
          </div>
          <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#a855f7] via-[#3b82f6] to-[#00e599] rounded-full transition-all duration-500 ease-out shadow-sm shadow-cyan-500/30"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>

        {/* 2 Compact Pill Metrics with Dynamic Percentage Outline Borders */}
        <div className="pt-2 relative z-10">
          <div className="grid grid-cols-2 max-w-[300px] mx-auto gap-2.5 sm:gap-3.5 items-center">
            {/* Pill 1: Execution */}
            <button
              type="button"
              onClick={() => setMetricModal('execution')}
              className="relative group text-center focus:outline-none cursor-pointer bg-[#0a0d12]/95 rounded-xl p-2 sm:p-2.5 transition-all group-hover:scale-[1.03] active:scale-95 shadow-[0_0_12px_rgba(0,229,153,0.15)] overflow-hidden"
            >
              {/* Dynamic Percentage Outline Border */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                <rect
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="10"
                  fill="none"
                  stroke="rgba(0, 229, 153, 0.15)"
                  strokeWidth="2"
                />
                <rect
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="10"
                  fill="none"
                  stroke="#00e599"
                  strokeWidth="2"
                  pathLength="100"
                  strokeDasharray={`${missionRate} 100`}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold text-[#00e599] tracking-wider uppercase">
                  <Flame className="w-3 h-3 text-[#00e599] fill-[#00e599]/20 flex-shrink-0" />
                  <span>Execution</span>
                </div>
                <div className="mt-0.5 flex items-baseline justify-center">
                  <span className="text-sm sm:text-base font-black font-mono text-white tracking-wide">
                    {missionRate}%
                  </span>
                </div>
              </div>
            </button>

            {/* Pill 2: Recovery */}
            <button
              type="button"
              onClick={() => setMetricModal('recovery')}
              className="relative group text-center focus:outline-none cursor-pointer bg-[#0a0d12]/95 rounded-xl p-2 sm:p-2.5 transition-all group-hover:scale-[1.03] active:scale-95 shadow-[0_0_12px_rgba(52,211,153,0.15)] overflow-hidden"
            >
              {/* Dynamic Percentage Outline Border */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                <rect
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="10"
                  fill="none"
                  stroke="rgba(52, 211, 153, 0.15)"
                  strokeWidth="2"
                />
                <rect
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="10"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2"
                  pathLength="100"
                  strokeDasharray={`${user.recoveryRate} 100`}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold text-emerald-400 tracking-wider uppercase">
                  <Shield className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span>Recovery</span>
                </div>
                <div className="mt-0.5 flex items-baseline justify-center">
                  <span className="text-sm sm:text-base font-black font-mono text-white tracking-wide">
                    {user.recoveryRate}%
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {metricModal && (
          <MetricExplanationModal
            type={metricModal}
            user={user}
            executionRate={missionRate}
            recoveryRate={user.recoveryRate}
            restartsCount={restartsCount || 2}
            longestStreak={user.bestStreak}
            currentStreak={user.streak}
            onClose={() => setMetricModal(null)}
          />
        )}
      </AnimatePresence>
    </header>
  );
};


