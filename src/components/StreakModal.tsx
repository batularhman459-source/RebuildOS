import React from 'react';
import { motion } from 'motion/react';
import { Flame, Check, X } from 'lucide-react';
import { UserProfile, Mission } from '../types';

interface StreakModalProps {
  user: UserProfile;
  missions?: Mission[];
  missionRate?: number;
  onClose: () => void;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const StreakModal: React.FC<StreakModalProps> = ({
  user,
  missions = [],
  missionRate = 0,
  onClose,
}) => {
  const currentStreak = user.streak || 0;
  const bestStreak = user.bestStreak || currentStreak;

  // Calculate day completion status for the current week (Monday-Sunday)
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  const completedMissions = missions.filter((m) => m.completed || m.state === 'COMPLETED').length;
  const isStreakKeptToday = completedMissions >= 1;

  // Determine which days in the week row are completed based on streak and day of week
  const weekDays = DAYS_OF_WEEK.map((dayName, index) => {
    const isPast = index < currentDayIndex;
    const isToday = index === currentDayIndex;
    const isFuture = index > currentDayIndex;

    // A day is marked completed if it's in the past (covered by streak) or today with at least 1 mission completed
    const isCompleted = (isPast && currentStreak >= (currentDayIndex - index)) || (isToday && (completedMissions >= 1 || currentStreak > 0));
    const isCurrentActive = isToday && !isCompleted;

    return {
      day: dayName,
      isCompleted,
      isCurrentActive,
      isFuture,
      isToday,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[340px] sm:max-w-[360px] bg-[#0B0B0E] border border-white/10 rounded-[32px] p-6 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden text-left"
      >
        {/* Top Streak Header Row */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            {/* Flame Icon */}
            <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0">
              <div className="relative w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-inner">
                <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-mono font-bold tracking-[0.14em] text-neutral-400 uppercase">
                STREAK
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight leading-none">
                  {currentStreak}
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-neutral-300 uppercase tracking-wider">
                  DAYS
                </span>
              </div>
            </div>
          </div>

          {/* Close Action Button */}
          <button
            onClick={onClose}
            aria-label="Close Streak Modal"
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/15 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all active:scale-90 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Middle 7-Day Week Status Row */}
        <div className="relative z-10 pt-1">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekDays.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                {/* Circle Badge */}
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center">
                  {item.isCompleted ? (
                    // Solid Green Completed Circle with Checkmark
                    <div className="w-full h-full rounded-full bg-emerald-500 border border-emerald-400/50 flex items-center justify-center shadow-sm">
                      <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-zinc-950 stroke-[3.5]" />
                    </div>
                  ) : item.isCurrentActive ? (
                    // Active in-progress Ring
                    <div className="w-full h-full rounded-full border-2 border-emerald-500 bg-emerald-500/15 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                  ) : (
                    // Incomplete / Future Dim Circle
                    <div className="w-full h-full rounded-full bg-white/[0.05] border border-white/5" />
                  )}
                </div>

                {/* Day Label */}
                <span
                  className={`text-[11px] font-mono font-medium ${
                    item.isToday
                      ? 'text-white font-bold'
                      : item.isCompleted
                      ? 'text-neutral-300'
                      : 'text-neutral-500'
                  }`}
                >
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Daily Progress Section: 1 Mission required to keep streak */}
        <div className="relative z-10 space-y-2.5 pt-1">
          <div className="text-[11px] font-mono font-bold tracking-[0.14em] text-neutral-400 uppercase whitespace-nowrap">
            Today's streak target
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-xl sm:text-2xl font-black text-white">
                {completedMissions}
              </span>
              <span className="text-sm font-semibold text-neutral-500">
                / 1 mission needed
              </span>
            </div>

            <div className="text-xs sm:text-sm font-mono font-bold">
              {isStreakKeptToday ? (
                <span className="text-emerald-400">Done for today</span>
              ) : (
                <span className="text-amber-400">Not yet complete</span>
              )}
            </div>
          </div>

          {/* Solid Progress Bar */}
          <div className="w-full h-3 sm:h-3.5 bg-neutral-950/80 rounded-full border border-white/15 overflow-hidden p-0.5 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: isStreakKeptToday ? '100%' : '6%' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full bg-emerald-500"
            />
          </div>
        </div>

        {/* Subtle Bottom Footer Info */}
        <div className="relative z-10 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span>Longest streak: <strong className="text-white font-bold">{bestStreak}d</strong></span>
          <span className="text-neutral-400">
            Resets at midnight
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};
