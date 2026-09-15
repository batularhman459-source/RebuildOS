import React, { useMemo, useState } from 'react';
import { UserProfile, Mission } from '../types';
import { Zap, Target, Shield, User } from 'lucide-react';
import { ChangelogModal } from './ChangelogModal';
import { MetricExplanationModal, MetricType } from './MetricExplanationModal';
import { StreakModal } from './StreakModal';
import { StreakBadge } from './StreakBadge';
import { TactileDial } from './TactileDial';
import { getMetricRatingLabel } from '../lib/progression';
import { AnimatePresence } from 'motion/react';

interface HeaderProps {
  user: UserProfile;
  missions?: Mission[];
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
  missions = [],
  missionRate = 0,
  restartsCount = 2,
  onOpenProfile,
}) => {
  const [showChangelog, setShowChangelog] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [metricModal, setMetricModal] = useState<MetricType | null>(null);
  const safeXpToNext = user.xpToNextLevel > 0 ? user.xpToNextLevel : 100;
  const safeXp = typeof user.xp === 'number' ? user.xp : 0;
  const xpPercentage = Math.min(100, Math.max(0, Math.round((safeXp / safeXpToNext) * 100)));

  const executionRating = getMetricRatingLabel(missionRate);
  const recoveryRating = getMetricRatingLabel(user.recoveryRate);

  const safeExecutionRate = Math.max(0, Math.min(100, missionRate));
  const safeRecoveryRate = Math.max(0, Math.min(100, user.recoveryRate));

  // Determine time of day greeting
  const now = new Date();
  const hour = now.getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  return (
    <header className="space-y-3.5">
      {/* Top Logo & Controls Row (Mobile Only, Desktop uses DesktopNav) */}
      <div className="md:hidden flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Open profile"
            className="flex items-center gap-1 text-left group focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1 transition-opacity hover:opacity-90 cursor-pointer"
            title="Open profile"
          >
            <h1 translate="no" className="text-xl font-black tracking-tight text-white flex items-center">
              Rebuild<span className="text-orange-500 ml-0.5">OS</span>
            </h1>
          </button>

          <button
            type="button"
            onClick={() => setShowChangelog(true)}
            aria-label="What's new"
            className="text-[9px] font-sans font-bold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/15 hover:bg-white/20 hover:text-white transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-white/30"
            title="What's new"
          >
            v1
          </button>
        </div>

        {/* Right Action Controls: Streak Badge */}
        <div className="flex items-center gap-2">
          <StreakBadge
            id="mobile-header-streak-badge"
            currentStreak={user.streak}
            longestStreak={user.bestStreak}
            size="md"
            showLabel={false}
            onClick={() => setShowStreakModal(true)}
          />
        </div>
      </div>

      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}

      {/* Main Level & Momentum Card - Crafted in Frosted Titanium Glass */}
      <div className="relative overflow-hidden rounded-[32px] sm:rounded-[36px] p-6 sm:p-7 bg-gradient-to-b from-white/[0.16] via-white/[0.08] to-white/[0.03] backdrop-blur-3xl border border-white/20 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),0_24px_50px_rgba(0,0,0,0.4)] space-y-4 transition-all text-white">
        {/* Top Rim Specular Highlight */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Level & Title Row */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl border border-white/20 bg-white/10 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 font-sans shadow-inner backdrop-blur-md">
              L{user.level}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight leading-tight">
                {user.title}
              </h2>
              <p className="text-xs text-white/60 capitalize mt-0.5">
                Good {timeOfDay}, {user.name}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-white">
              {user.xp} <span className="text-[11px] text-white/60 font-normal">/ {user.xpToNextLevel} XP</span>
            </span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden border border-white/10 relative z-10 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-white/75 to-white rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(255,255,255,0.6)]"
            style={{ width: `${Math.max(0, Math.min(100, xpPercentage))}%` }}
          />
        </div>

        {/* Execution & Recovery Physical Tactile Dial Gauges */}
        <div className="pt-2 relative z-10 grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* Dial 1: Execution */}
          <TactileDial
            value={safeExecutionRate}
            label="Execution"
            sublabel={executionRating.label}
            glowColor="#F97316"
            glowSecondary="#FB923C"
            size="md"
            onClick={() => setMetricModal('execution')}
          />

          {/* Dial 2: Recovery */}
          <TactileDial
            value={safeRecoveryRate}
            label="Recovery"
            sublabel={recoveryRating.label}
            glowColor="#F97316"
            glowSecondary="#FB923C"
            size="md"
            onClick={() => setMetricModal('recovery')}
          />
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

        {showStreakModal && (
          <StreakModal
            user={user}
            missions={missions}
            missionRate={missionRate}
            onClose={() => setShowStreakModal(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
};


