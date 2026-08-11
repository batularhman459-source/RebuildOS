import React, { useState } from 'react';
import { JournalEntry, UserProfile } from '../types';
import { BookOpen, Trophy, Calendar, Check, ChevronDown, ChevronUp, Search, X, Filter, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playMicroWinTone } from '../lib/sound';

interface JournalTabProps {
  user: UserProfile;
  journalEntries: JournalEntry[];
  onAddJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  onDeleteJournalEntry?: (entryId: string) => void;
}

type TimeFilter = 'ALL' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR';

const MOOD_STYLES: Record<number, { button: string; text: string }> = {
  1: {
    button: 'bg-emerald-950/20 border-emerald-900/30 text-emerald-800',
    text: 'text-emerald-800',
  },
  2: {
    button: 'bg-emerald-950/40 border-emerald-800/50 text-emerald-600',
    text: 'text-emerald-600',
  },
  3: {
    button: 'bg-emerald-900/30 border-emerald-600/50 text-emerald-500',
    text: 'text-emerald-500',
  },
  4: {
    button: 'bg-emerald-500/20 border-emerald-500/80 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.25)]',
    text: 'text-emerald-400',
  },
  5: {
    button: 'bg-emerald-400/35 border-emerald-300 text-emerald-200 font-black shadow-[0_0_18px_rgba(16,185,129,0.5)]',
    text: 'text-emerald-300 font-bold',
  },
};

const ENERGY_STYLES: Record<number, { button: string; text: string }> = {
  1: {
    button: 'bg-cyan-950/20 border-cyan-900/30 text-cyan-800',
    text: 'text-cyan-800',
  },
  2: {
    button: 'bg-cyan-950/40 border-cyan-800/50 text-cyan-600',
    text: 'text-cyan-600',
  },
  3: {
    button: 'bg-cyan-900/30 border-cyan-600/50 text-cyan-500',
    text: 'text-cyan-500',
  },
  4: {
    button: 'bg-cyan-500/20 border-cyan-500/80 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]',
    text: 'text-cyan-400',
  },
  5: {
    button: 'bg-cyan-400/35 border-cyan-300 text-cyan-200 font-black shadow-[0_0_18px_rgba(6,182,212,0.5)]',
    text: 'text-cyan-300 font-bold',
  },
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
      colors: ['#22C55E', '#0088FF', '#F59E0B'],
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
    <div className="space-y-6 pb-24">
      {/* Minimalist Evening Journal Form */}
      <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Evening Reflection</h3>
          </div>
          <span className="text-xs font-mono text-neutral-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
            {todayStr}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
              1. Biggest Win Today
            </label>
            <input
              type="text"
              required
              placeholder="What promise did you keep to yourself today?"
              value={win}
              onChange={(e) => setWin(e.target.value)}
              className="w-full bg-neutral-900/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
              2. Key Lesson Learned
            </label>
            <input
              type="text"
              required
              placeholder="What friction or distraction revealed a system flaw?"
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              className="w-full bg-neutral-900/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
              3. Tomorrow's Single Focus Priority
            </label>
            <input
              type="text"
              required
              placeholder="What is your non-negotiable mission tomorrow?"
              value={tomorrow}
              onChange={(e) => setTomorrow(e.target.value)}
              className="w-full bg-neutral-900/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          {/* Minimalist 1-5 Selector Pills for Mood & Energy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5">
                Mood State
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setMood(val)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                      mood === val
                        ? MOOD_STYLES[val].button
                        : 'bg-neutral-900/60 border-white/5 text-neutral-500 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5">
                Energy Vitality
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setEnergy(val)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                      energy === val
                        ? ENERGY_STYLES[val].button
                        : 'bg-neutral-900/60 border-white/5 text-neutral-500 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] font-mono text-emerald-400/90 font-medium">
              +20 XP upon save
            </span>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Lock In Entry</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* History Section Header & Search/Filter Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
            JOURNAL LOGS ({filteredEntries.length})
          </h3>

          {/* Time Filter Pills */}
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xl text-[11px]">
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
                className={`px-2.5 py-1 rounded-lg font-mono transition-all ${
                  timeFilter === f.id
                    ? 'bg-white/15 text-white font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by date (e.g. 2026-08-05) or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Collapsible Journal Log Items */}
        <div className="space-y-2">
          {filteredEntries.length === 0 ? (
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 text-center text-xs text-neutral-500 font-mono">
              {searchQuery || timeFilter !== 'ALL'
                ? 'No journal entries match your filter or search query.'
                : 'No journal logs recorded yet. Lock in today’s reflection above!'}
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const isOpen = Boolean(openLogIds[entry.id]);

              return (
                <div
                  key={entry.id}
                  className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl transition-all hover:border-white/20 shadow-md overflow-hidden group"
                >
                  {/* Minimal Header Bar */}
                  <div
                    onClick={() => toggleLog(entry.id)}
                    className="px-4 py-3 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {entry.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Compact text badges without large icons */}
                      <span className="text-[11px] font-mono text-neutral-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                        Mood <strong className={MOOD_STYLES[entry.moodScore]?.text || 'text-emerald-400'}>{entry.moodScore}/5</strong>
                        <span className="mx-1.5 text-neutral-600">·</span>
                        Energy <strong className={ENERGY_STYLES[entry.energyScore]?.text || 'text-cyan-400'}>{entry.energyScore}/5</strong>
                      </span>

                      <div className="p-1 rounded-lg bg-white/5 group-hover:bg-white/10 text-neutral-400 group-hover:text-white transition-all">
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Body Details */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3 animate-in fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1.5">
                        <div className="bg-neutral-900/80 border border-white/5 rounded-xl p-3 space-y-1">
                          <strong className="text-emerald-400 font-mono text-[10px] uppercase tracking-wider block">
                            Biggest Win
                          </strong>
                          <p className="text-white text-xs leading-relaxed font-medium">
                            {entry.biggestWin}
                          </p>
                        </div>

                        <div className="bg-neutral-900/80 border border-white/5 rounded-xl p-3 space-y-1">
                          <strong className="text-neutral-400 font-mono text-[10px] uppercase tracking-wider block">
                            Lesson Learned
                          </strong>
                          <p className="text-neutral-300 text-xs leading-relaxed">
                            {entry.lessonLearned}
                          </p>
                        </div>

                        <div className="bg-neutral-900/80 border border-white/5 rounded-xl p-3 space-y-1">
                          <strong className="text-cyan-400 font-mono text-[10px] uppercase tracking-wider block">
                            Tomorrow's Focus
                          </strong>
                          <p className="text-cyan-300 text-xs leading-relaxed font-medium">
                            {entry.tomorrowsFocus}
                          </p>
                        </div>
                      </div>

                      {/* Delete action when open */}
                      {onDeleteJournalEntry && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Delete this journal entry?')) {
                                onDeleteJournalEntry(entry.id);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 transition-all flex items-center gap-1.5 text-xs font-mono font-medium"
                            title="Delete this journal entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Entry</span>
                          </button>
                        </div>
                      )}
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

