import React, { useState } from 'react';
import { HeatmapDay, UserProfile } from '../types';
import {
  Flame,
  Clock,
  BarChart2,
  Settings,
  CalendarCheck,
  Plus,
  Check,
  Sparkles,
  X,
} from 'lucide-react';

interface HeatmapGridProps {
  heatmap: HeatmapDay[];
  user: UserProfile;
  totalFocusMinutes: number;
  missionCompletionRate: number;
  onNewMission?: () => void;
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({
  heatmap,
  user,
  totalFocusMinutes,
  missionCompletionRate,
  onNewMission,
}) => {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayDateNum = now.getDate();
  const todayStr = now.toISOString().split('T')[0];

  // State for currently selected date (defaults to today)
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  const selectedDateObj = new Date(selectedDateStr + 'T12:00:00');
  const displayMonthName = selectedDateObj.toLocaleDateString('en-US', { month: 'long' });
  const displayDayNum = selectedDateObj.getDate();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  // Generate current month days list
  const currentMonthDays: (HeatmapDay & { dayNum: number; isToday: boolean; isSelected: boolean })[] = [];
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
      isSelected: dateStr === selectedDateStr,
    });
  }

  // Calculate current week days (7 days centered or surrounding today/selected date)
  const getWeeklyDays = () => {
    const target = new Date(selectedDateStr + 'T12:00:00');
    const dayOfWeek = target.getDay(); // 0 is Sun, 1 is Mon...
    const offset = dayOfWeek;

    const startOfWeek = new Date(target);
    startOfWeek.setDate(target.getDate() - offset);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const existing = heatmap.find((item) => item.date === dateStr);
      weekDays.push({
        date: dateStr,
        dayNum: d.getDate(),
        dayNameInitial: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count: existing ? existing.count : 0,
        xpEarned: existing ? existing.xpEarned : 0,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDateStr,
      });
    }
    return weekDays;
  };

  const weekDays = getWeeklyDays();
  const selectedDayData = heatmap.find((d) => d.date === selectedDateStr) || {
    date: selectedDateStr,
    count: 0,
    xpEarned: 0,
  };

  const formatFocusTime = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
  };

  // Helper for activity indicator dot styling
  const getDotStyle = (count: number, isSelected: boolean) => {
    if (count === 0) {
      return isSelected ? 'bg-[#3B82F6]/70' : 'bg-white/10';
    }
    if (count === 1) {
      return 'bg-[#3B82F6]/50 shadow-sm scale-110';
    }
    if (count === 2) {
      return 'bg-[#3B82F6]/75 shadow-sm scale-125';
    }
    if (count === 3) {
      return 'bg-[#3B82F6] shadow-sm scale-125';
    }
    // Peak 4+
    return 'bg-[#60A5FA] shadow-sm scale-125 ring-1 ring-[#93C5FD]/40';
  };

  // Quick modal / interactive states for calendar actions
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderText, setReminderText] = useState('');
  const [reminders, setReminders] = useState<{ id: string; date: string; text: string }[]>([
    { id: '1', date: todayStr, text: 'Complete afternoon deep focus cycle' },
  ]);
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderText.trim()) return;
    setReminders((prev) => [
      ...prev,
      { id: Date.now().toString(), date: selectedDateStr, text: reminderText.trim() },
    ]);
    setReminderText('');
    setShowReminderModal(false);
    setNotificationToast('Reminder set for ' + selectedDateStr);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  const handleNewEventClick = () => {
    if (onNewMission) {
      onNewMission();
    } else {
      setShowReminderModal(true);
    }
  };

  return (
    <section className="space-y-4 pt-1">
      {/* 3 Frosted Titanium Performance Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Streak Momentum */}
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] p-6 bg-gradient-to-b from-white/[0.15] via-white/[0.08] to-white/[0.03] backdrop-blur-3xl border border-white/20 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_20px_45px_rgba(0,0,0,0.4)] transition-all hover:border-white/30 group text-white">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl border border-white/15 flex items-center justify-center bg-white/10 text-white shadow-inner backdrop-blur-md">
                <Flame className="w-5 h-5 text-orange-500 stroke-[1.9]" />
              </div>
              <span className="text-[15px] font-semibold text-white tracking-tight">
                Current streak
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <div className="text-xs font-normal text-white/60 mb-1">Current</div>
                <div className="text-3xl sm:text-4xl font-light text-white tracking-tight flex items-baseline font-sans">
                  {user.streak}
                  <span className="text-xs sm:text-sm font-normal text-white/60 ml-1.5 font-sans">
                    {user.streak === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs font-normal text-white/60 mb-1">Longest streak</div>
                <div className="text-3xl sm:text-4xl font-light text-white tracking-tight flex items-baseline font-sans">
                  {user.bestStreak}
                  <span className="text-xs sm:text-sm font-normal text-white/60 ml-1.5 font-sans">
                    {user.bestStreak === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Focus Endurance */}
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] p-6 bg-gradient-to-b from-white/[0.15] via-white/[0.08] to-white/[0.03] backdrop-blur-3xl border border-white/20 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_20px_45px_rgba(0,0,0,0.4)] transition-all hover:border-white/30 group text-white">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl border border-white/15 flex items-center justify-center bg-white/10 text-white shadow-inner backdrop-blur-md">
                <Clock className="w-5 h-5 text-orange-500 stroke-[1.9]" />
              </div>
              <span className="text-[15px] font-semibold text-white tracking-tight">
                Total focus
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <div className="text-xs font-normal text-white/60 mb-1">Focus time</div>
                <div className="text-3xl sm:text-4xl font-light text-white tracking-tight flex items-baseline font-sans">
                  {formatFocusTime(totalFocusMinutes)}
                </div>
              </div>
              <div>
                <div className="text-xs font-normal text-white/60 mb-1">Today's goal</div>
                <div className="text-3xl sm:text-4xl font-light text-white tracking-tight flex items-baseline font-sans">
                  {Math.min(100, Math.round((totalFocusMinutes / 60) * 100))}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Protocol Efficiency */}
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] p-6 bg-gradient-to-b from-white/[0.15] via-white/[0.08] to-white/[0.03] backdrop-blur-3xl border border-white/20 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_20px_45px_rgba(0,0,0,0.4)] transition-all hover:border-white/30 group text-white">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl border border-white/15 flex items-center justify-center bg-white/10 text-white shadow-inner backdrop-blur-md">
                <BarChart2 className="w-5 h-5 text-orange-500 stroke-[1.9]" />
              </div>
              <span className="text-[15px] font-semibold text-white tracking-tight">
                Execution rate
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <div className="text-xs font-normal text-white/60 mb-1">Completion rate</div>
                <div className="text-3xl sm:text-4xl font-light text-white tracking-tight flex items-baseline font-sans">
                  {missionCompletionRate}
                  <span className="text-xs sm:text-sm font-normal text-white/60 ml-1 font-sans">%</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-normal text-white/60 mb-1">Level</div>
                <div className="text-3xl sm:text-4xl font-light text-white tracking-tight flex items-baseline font-sans">
                  Lv.{user.level}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Calendar Widget - Crafted to match reference image */}
      <div className="relative overflow-hidden rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 bg-gradient-to-b from-white/[0.18] via-white/[0.09] to-white/[0.04] backdrop-blur-3xl border border-white/25 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),0_25px_60px_-12px_rgba(0,0,0,0.5)] transition-all text-white">
        {/* Specular Top Rim Highlight */}
        <div className="absolute top-0 inset-x-10 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-10" />

        <div className="relative z-10 space-y-6 sm:space-y-8">
          {/* Top Bar: [ Weekly ] Monthly on left & Settings squircle button on right */}
          <div className="flex items-center justify-between">
            {/* Segmented Control Pill */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('weekly')}
                className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  viewMode === 'weekly'
                    ? 'bg-white text-zinc-900 shadow-md'
                    : 'text-white/60 hover:text-white font-medium'
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setViewMode('monthly')}
                className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  viewMode === 'monthly'
                    ? 'bg-white text-zinc-900 shadow-md'
                    : 'text-white/60 hover:text-white font-medium'
                }`}
              >
                Monthly
              </button>
            </div>

            {/* Top Right: Settings / Options Squircle Icon */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSettingsPopover(!showSettingsPopover)}
                className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                title="Calendar Settings & Options"
              >
                <Settings className="w-4.5 h-4.5 stroke-[1.8]" />
              </button>

              {/* Quick Settings Popover */}
              {showSettingsPopover && (
                <div className="absolute right-0 top-12 z-30 w-52 rounded-2xl bg-zinc-900/90 backdrop-blur-2xl border border-white/20 p-2 shadow-2xl space-y-1 text-xs text-white animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                    Calendar View
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDateStr(todayStr);
                      setShowSettingsPopover(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 flex items-center justify-between text-white transition-colors cursor-pointer"
                  >
                    <span>Jump to Today</span>
                    <Sparkles className="w-3.5 h-3.5 text-white/60" />
                  </button>
                  <button
                    onClick={() => {
                      setViewMode(viewMode === 'weekly' ? 'monthly' : 'weekly');
                      setShowSettingsPopover(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 flex items-center justify-between text-white transition-colors cursor-pointer"
                  >
                    <span>Switch to {viewMode === 'weekly' ? 'Monthly' : 'Weekly'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hero Month & Day Numbers Header */}
          <div className="flex items-baseline justify-between pt-1 select-none">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-white/95 font-sans">
              {displayMonthName}
            </h2>
            <span className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-white/95 font-sans">
              {displayDayNum}
            </span>
          </div>

          {/* Calendar Views */}
          {viewMode === 'weekly' ? (
            /* Weekly View: Single Letter S M T W T F S with Dates & Activity Dots */
            <div className="space-y-2 pt-1 select-none">
              {/* Day Initials Row: S M T W T F S */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm font-normal text-white/50 pb-1">
                {weekDays.map((d, idx) => (
                  <span key={`init-${idx}`}>{d.dayNameInitial.charAt(0)}</span>
                ))}
              </div>

              {/* Dates Row with Clean Floating Style & White Pill for Selected Day */}
              <div className="grid grid-cols-7 gap-1 text-center items-center">
                {weekDays.map((d) => {
                  const isSelected = d.isSelected;
                  return (
                    <div
                      key={d.date}
                      onClick={() => setSelectedDateStr(d.date)}
                      className="flex flex-col items-center justify-center cursor-pointer group py-1"
                    >
                      {/* Date Item */}
                      {isSelected ? (
                        <div className="w-9 h-8 sm:w-11 sm:h-10 rounded-xl sm:rounded-2xl bg-white text-zinc-900 font-bold flex items-center justify-center text-sm sm:text-base shadow-[0_0_24px_rgba(255,255,255,0.6)] transition-all scale-105">
                          {d.dayNum}
                        </div>
                      ) : (
                        <div className="w-9 h-8 sm:w-11 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-sm sm:text-base font-normal text-white/80 hover:text-white hover:bg-white/5 transition-all">
                          {d.dayNum}
                        </div>
                      )}

                      {/* Clean Activity Dot */}
                      <div
                        className={`w-1.5 h-1.5 rounded-full mt-2 transition-all ${
                          isSelected
                            ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] scale-110'
                            : d.count > 0
                            ? 'bg-orange-500/90 shadow-[0_0_6px_rgba(249,115,22,0.5)]'
                            : 'bg-white/20'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Monthly View: Full Grid Matching the Same Clean Aesthetic */
            <div className="space-y-3 pt-1 select-none">
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-normal text-white/50">
                <span>S</span>
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({
                  length: firstDayOfMonth,
                }).map((_, i) => (
                  <div key={`offset-m-${i}`} className="h-9 sm:h-11" />
                ))}

                {currentMonthDays.map((d) => {
                  const isSelected = d.isSelected;
                  return (
                    <div
                      key={d.date}
                      onClick={() => setSelectedDateStr(d.date)}
                      className="flex flex-col items-center justify-center cursor-pointer py-1 group"
                    >
                      {isSelected ? (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white text-zinc-900 font-bold flex items-center justify-center text-xs sm:text-sm shadow-[0_0_20px_rgba(255,255,255,0.6)] scale-105">
                          {d.dayNum}
                        </div>
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-xs sm:text-sm font-normal text-white/80 hover:text-white hover:bg-white/5 transition-all">
                          {d.dayNum}
                        </div>
                      )}
                      <div
                        className={`w-1 h-1 rounded-full mt-1.5 transition-all ${
                          isSelected
                            ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]'
                            : d.count > 0
                            ? 'bg-orange-500/90 shadow-[0_0_5px_rgba(249,115,22,0.5)]'
                            : 'bg-transparent'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Action Row: "Add Reminder" on left, "+ New Mission" on right */}
          <div className="pt-2 sm:pt-3 flex items-center justify-between border-t border-white/10">
            {/* Add Reminder Link */}
            <button
              type="button"
              onClick={() => setShowReminderModal(true)}
              className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white/80 hover:text-white transition-colors cursor-pointer group"
            >
              <CalendarCheck className="w-4 h-4 text-white/70 group-hover:text-white stroke-[1.8] transition-colors" />
              <span>Add reminder</span>
            </button>

            {/* + New Mission Button */}
            <button
              type="button"
              onClick={handleNewEventClick}
              className="bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-full backdrop-blur-md shadow-[0_4px_14px_rgba(249,115,22,0.4)] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New mission</span>
            </button>
          </div>

          {/* Reminders / Selected Date summary list if reminders exist */}
          {reminders.filter((r) => r.date === selectedDateStr).length > 0 && (
            <div className="space-y-1.5 pt-1">
              {reminders
                .filter((r) => r.date === selectedDateStr)
                .map((rem) => (
                  <div
                    key={rem.id}
                    className="px-3 py-2 rounded-xl bg-black/20 border border-white/10 backdrop-blur-md flex items-center justify-between text-xs text-white/90"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                      <span>{rem.text}</span>
                    </div>
                    <span className="text-[10px] text-white/50">Reminder</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-[32px] p-6 bg-gradient-to-b from-zinc-800/90 to-zinc-900/95 border border-white/20 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Add reminder</h3>
                  <p className="text-xs text-white/60">For {selectedDateStr}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReminderModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Note
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g., Go for a 20-minute walk, read 10 pages..."
                  value={reminderText}
                  onChange={(e) => setReminderText(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/15 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!reminderText.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-white text-zinc-900 hover:bg-white/90 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                >
                  Save reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notificationToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white text-zinc-900 font-medium text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{notificationToast}</span>
        </div>
      )}
    </section>
  );
};

