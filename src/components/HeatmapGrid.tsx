import React, { useState } from 'react';
import { HeatmapDay, UserProfile } from '../types';
import { Calendar, Flame, Clock, TrendingUp, BarChart2 } from 'lucide-react';

interface HeatmapGridProps {
  heatmap: HeatmapDay[];
  user: UserProfile;
  totalFocusMinutes: number;
  missionCompletionRate: number;
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({
  heatmap,
  user,
  totalFocusMinutes,
  missionCompletionRate,
}) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayStr = now.toISOString().split('T')[0];

  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const currentMonthDays: (HeatmapDay & { dayNum: number; isToday: boolean })[] = [];
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dObj = new Date(currentYear, currentMonth, dayNum);
    const yyyy = dObj.getFullYear();
    const mm = String(dObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dObj.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const existing = heatmap.find((d) => d.date === dateStr);
    currentMonthDays.push({
      date: dateStr,
      count: existing ? existing.count : 0,
      xpEarned: existing ? existing.xpEarned : 0,
      dayNum,
      isToday: dateStr === todayStr,
    });
  }

  const formatFocusTime = (mins: number) => {
    if (mins < 60) return `${mins} Mins`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours} Hours`;
  };

  // Helper to color heatmap tiles based on count
  const getTileColor = (count: number) => {
    if (count === 0) return 'bg-[#141414] border-white/5 text-neutral-500 hover:border-neutral-700';
    if (count === 1) return 'bg-blue-950/80 border-blue-900/50 text-blue-200';
    if (count === 2) return 'bg-blue-800/80 border-blue-600 text-blue-100';
    if (count === 3) return 'bg-blue-600 border-blue-400 text-white';
    return 'bg-[#38bdf8] border-cyan-300 text-black font-extrabold shadow-sm shadow-cyan-500/50';
  };

  return (
    <section className="space-y-4 pt-2">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
            MOMENTUM & ACTIVITY HEATMAP
          </h3>
        </div>
      </div>

      {/* 4 Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3.5 space-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Flame className="w-4 h-4" />
            <span className="text-[11px] font-light text-neutral-400 uppercase tracking-wide">
              Current Streak
            </span>
          </div>
          <div className="text-xl font-black text-white">{user.streak} Days</div>
        </div>

        <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3.5 space-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[11px] font-light text-neutral-400 uppercase tracking-wide">
              Longest Streak
            </span>
          </div>
          <div className="text-xl font-black text-white">{user.bestStreak} Days</div>
        </div>

        <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3.5 space-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <BarChart2 className="w-4 h-4" />
            <span className="text-[11px] font-light text-neutral-400 uppercase tracking-wide">
              Success Rate
            </span>
          </div>
          <div className="text-xl font-black text-white">{missionCompletionRate}%</div>
        </div>

        <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3.5 space-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-1.5 text-purple-400">
            <Clock className="w-4 h-4" />
            <span className="text-[11px] font-light text-neutral-400 uppercase tracking-wide">
              Total Focus Time
            </span>
          </div>
          <div className="text-xl font-black text-white">{formatFocusTime(totalFocusMinutes)}</div>
        </div>
      </div>

      {/* Current Month Heatmap Card */}
      <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3 relative shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-sky-300 bg-clip-text text-transparent">
            Daily Intensity & XP Progression
          </span>
          {hoveredDay ? (
            <span className="text-cyan-400 font-bold">
              {hoveredDay.date}: +{hoveredDay.xpEarned} XP ({hoveredDay.count} activities)
            </span>
          ) : (
            <span className="text-neutral-500">Hover day for details</span>
          )}
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono font-bold text-neutral-500 uppercase pb-1">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Monthly Calendar Tiles Grid */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {/* Empty offset padding cells for month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`offset-${i}`} className="h-8 sm:h-10" />
          ))}

          {/* Month Days */}
          {currentMonthDays.map((day) => (
            <div
              key={day.date}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`h-8 sm:h-10 rounded-xl border flex flex-col items-center justify-center transition-all duration-150 cursor-pointer hover:scale-105 relative ${getTileColor(
                day.count
              )} ${day.isToday ? 'ring-2 ring-cyan-400 border-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.5)]' : ''}`}
              title={`${day.date}: ${day.count} activities (+${day.xpEarned} XP)`}
            >
              <span className="text-xs font-mono font-bold">{day.dayNum}</span>
              {day.xpEarned > 0 && (
                <span className="text-[8px] font-mono opacity-80 leading-none mt-0.5">
                  +{day.xpEarned}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-neutral-500 pt-2 border-t border-white/5">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-[#141414] border border-white/5" />
            <div className="w-3 h-3 rounded bg-blue-950/80 border border-blue-900/50" />
            <div className="w-3 h-3 rounded bg-blue-800 border border-blue-600" />
            <div className="w-3 h-3 rounded bg-blue-600 border border-blue-400" />
            <div className="w-3 h-3 rounded bg-[#38bdf8] border border-cyan-300" />
          </div>
          <span>More</span>
        </div>
      </div>
    </section>
  );
};
