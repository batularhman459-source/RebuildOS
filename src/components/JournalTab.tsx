import React, { useState } from 'react';
import { JournalEntry, UserProfile } from '../types';
import { BookOpen, Trophy, Calendar, Check, ChevronDown, ChevronUp, Search, X, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playMicroWinTone } from '../lib/sound';

interface JournalTabProps {
  user: UserProfile;
  journalEntries: JournalEntry[];
  onAddJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  onDeleteJournalEntry?: (entryId: string) => void;
}

type TimeFilter = 'ALL' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR';

// Selected score background: orange accent
const getSelectedScoreBg = (_val: number) => {
  return 'bg-[#f97316] text-white shadow-xs';
};

export const JournalTab: React.FC<JournalTabProps> = ({
  user,
  journalEntries,
  onAddJournalEntry,
  onDeleteJournalEntry,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const existingToday = journalEntries.find((j) => j.date === todayStr);

  const [win, setWin] = useState(existingToday?.biggestWin || '');
  const [lesson, setLesson] = useState(existingToday?.lessonLearned || '');
  const [tomorrow, setTomorrow] = useState(existingToday?.tomorrowsFocus || '');
  const [mood, setMood] = useState(existingToday?.moodScore || 5);
  const [energy, setEnergy] = useState(existingToday?.energyScore || 4);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [openLogIds, setOpenLogIds] = useState<Record<string, boolean>>({});

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('ALL');

  const toggleLog = (id: string) => {
    setOpenLogIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!win.trim() || !lesson.trim() || !tomorrow.trim()) return;

    onAddJournalEntry({
      date: todayStr,
      biggestWin: win.trim(),
      lessonLearned: lesson.trim(),
      tomorrowsFocus: tomorrow.trim(),
      moodScore: mood,
      energyScore: energy,
    });

    playMicroWinTone();
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#ffffff', '#e4e4e7', '#a1a1aa'],
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Filtered entries
  const filteredEntries = journalEntries.filter((entry) => {
    // Text / date search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchDate = entry.date.toLowerCase().includes(q);
      const matchWin = entry.biggestWin.toLowerCase().includes(q);
      const matchLesson = entry.lessonLearned.toLowerCase().includes(q);
      const matchFocus = entry.tomorrowsFocus.toLowerCase().includes(q);
      if (!matchDate && !matchWin && !matchLesson && !matchFocus) {
        return false;
      }
    }

    // Time filter
    if (timeFilter === 'ALL') return true;

    const now = new Date();
    const entryDate = new Date(entry.date + 'T00:00:00');
    if (isNaN(entryDate.getTime())) return true;

    if (timeFilter === 'THIS_WEEK') {
      const startOfWeek = new Date(now);
      const day = now.getDay();
      const diffToMon = (day === 0 ? -6 : 1) - day;
      startOfWeek.setDate(now.getDate() + diffToMon);
      startOfWeek.setHours(0, 0, 0, 0);
      return entryDate >= startOfWeek;
    }

    if (timeFilter === 'THIS_MONTH') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return entryDate >= startOfMonth;
    }

    if (timeFilter === 'THIS_YEAR') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return entryDate >= startOfYear;
    }

    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 text-left">
      {/* Top Reflection Form Card */}
      <div className="bg-zinc-950/80 border border-white/10 rounded-2xl sm:rounded-[28px] p-5 sm:p-7 backdrop-blur-xl relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
        {/* Specular Top Rim */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight font-sans">
                Daily Reflection
              </h3>
              <p className="text-[11px] text-zinc-400 font-normal">
                Capture today's execution and insights
              </p>
            </div>
          </div>
          <span className="text-xs font-sans font-medium text-zinc-300 bg-white/5 px-3 py-1 rounded-xl border border-white/10">
            {todayStr}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 relative z-10">
          <div className="space-y-1.5">
            <label htmlFor="journal-win" className="text-xs font-sans font-medium text-zinc-400 uppercase tracking-wider block">
              1. What went well today?
            </label>
            <textarea
              id="journal-win"
              rows={2}
              required
              placeholder="A promise you kept, a task you finished, or an urge you resisted..."
              value={win}
              onChange={(e) => setWin(e.target.value)}
              className="w-full bg-black/60 border border-white/10 focus:border-white/30 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 font-sans transition-all outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="journal-lesson" className="text-xs font-sans font-medium text-zinc-400 uppercase tracking-wider block">
              2. What did you learn?
            </label>
            <textarea
              id="journal-lesson"
              rows={2}
              required
              placeholder="Where did you waste time, lose focus, or feel resistance?"
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              className="w-full bg-black/60 border border-white/10 focus:border-white/30 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 font-sans transition-all outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="journal-tomorrow" className="text-xs font-sans font-medium text-zinc-400 uppercase tracking-wider block">
              3. Tomorrow's priority
            </label>
            <textarea
              id="journal-tomorrow"
              rows={2}
              required
              placeholder="The single most important thing you need to get done tomorrow..."
              value={tomorrow}
              onChange={(e) => setTomorrow(e.target.value)}
              className="w-full bg-black/60 border border-white/10 focus:border-white/30 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 font-sans transition-all outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Minimalist Segmented Selectors for Mood & Energy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <span id="mood-state-label" className="text-xs font-sans font-medium text-zinc-400 uppercase tracking-wider block">
                Mood (1–5)
              </span>
              <div role="radiogroup" aria-labelledby="mood-state-label" className="flex items-center gap-1.5 bg-black/60 border border-white/10 p-1 rounded-xl">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    type="button"
                    key={val}
                    role="radio"
                    aria-checked={mood === val}
                    aria-label={`Mood level ${val} of 5`}
                    onClick={() => setMood(val)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                      mood === val
                        ? getSelectedScoreBg(val)
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span id="energy-state-label" className="text-xs font-sans font-medium text-zinc-400 uppercase tracking-wider block">
                Energy (1–5)
              </span>
              <div role="radiogroup" aria-labelledby="energy-state-label" className="flex items-center gap-1.5 bg-black/60 border border-white/10 p-1 rounded-xl">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    type="button"
                    key={val}
                    role="radio"
                    aria-checked={energy === val}
                    aria-label={`Energy level ${val} of 5`}
                    onClick={() => setEnergy(val)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                      energy === val
                        ? getSelectedScoreBg(val)
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-xs font-sans text-zinc-400 font-medium">
              +20 XP Reward
            </span>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold font-sans transition-all active:scale-95 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Save reflection</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* History Section & Search/Filter Toolbar */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs font-sans font-medium tracking-wider text-zinc-400 uppercase">
            Past reflections ({filteredEntries.length})
          </h3>

          {/* Time Filter Pills */}
          <div className="inline-flex items-center p-1 rounded-xl bg-zinc-950/80 border border-white/10 shadow-xs">
            {(
              [
                { id: 'ALL', label: 'All' },
                { id: 'THIS_WEEK', label: 'This Week' },
                { id: 'THIS_MONTH', label: 'This Month' },
                { id: 'THIS_YEAR', label: 'This Year' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTimeFilter(f.id)}
                className={`px-3 py-1 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                  timeFilter === f.id
                    ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-white font-medium'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/10 focus:border-white/30 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-zinc-500 transition-all font-sans outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Journal Log Entries List */}
        <div className="space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-6 text-center text-xs text-zinc-500 font-sans">
              {searchQuery || timeFilter !== 'ALL'
                ? 'No entries match your search.'
                : "No reflections yet. Write down today's reflection above."}
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const isOpen = Boolean(openLogIds[entry.id]);

              return (
                <div
                  key={entry.id}
                  className="relative overflow-hidden rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-white/20 transition-all text-white shadow-xs backdrop-blur-xl group"
                >
                  {/* Top Specular Rim */}
                  <div className="absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-10" />

                  {/* Header Bar */}
                  <div
                    onClick={() => toggleLog(entry.id)}
                    className="px-4.5 py-3.5 flex items-center justify-between cursor-pointer select-none relative z-10"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 shadow-xs">
                        <Calendar className="w-3.5 h-3.5 stroke-[2]" />
                      </div>
                      <span className="text-xs font-sans font-semibold text-white group-hover:text-zinc-200 transition-colors">
                        {entry.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-sans text-zinc-400 bg-black/40 border border-white/10 px-2.5 py-1 rounded-lg">
                        Mood <strong className="text-white font-semibold">{entry.moodScore}/5</strong>
                        <span className="mx-1.5 text-zinc-600">·</span>
                        Energy <strong className="text-white font-semibold">{entry.energyScore}/5</strong>
                      </span>

                      {onDeleteJournalEntry && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this reflection?')) {
                              onDeleteJournalEntry(entry.id);
                            }
                          }}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                          title="Delete reflection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-white/10 text-zinc-400 group-hover:text-white flex items-center justify-center transition-all">
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Body Details */}
                  {isOpen && (
                    <div className="px-4.5 pb-4 pt-1 border-t border-white/10 space-y-3 animate-in fade-in relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1.5">
                        <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 space-y-1">
                          <strong className="text-zinc-400 font-sans text-[10px] uppercase tracking-wider block font-medium">
                            What went well
                          </strong>
                          <p className="text-zinc-200 text-xs leading-relaxed font-sans font-normal">
                            {entry.biggestWin}
                          </p>
                        </div>

                        <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 space-y-1">
                          <strong className="text-zinc-400 font-sans text-[10px] uppercase tracking-wider block font-medium">
                            What you learned
                          </strong>
                          <p className="text-zinc-300 text-xs leading-relaxed font-sans font-normal">
                            {entry.lessonLearned}
                          </p>
                        </div>

                        <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 space-y-1">
                          <strong className="text-zinc-400 font-sans text-[10px] uppercase tracking-wider block font-medium">
                            Tomorrow's priority
                          </strong>
                          <p className="text-zinc-200 text-xs leading-relaxed font-sans font-normal">
                            {entry.tomorrowsFocus}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

