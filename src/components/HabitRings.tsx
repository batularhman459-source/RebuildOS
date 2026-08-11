import React, { useState } from 'react';
import { HabitRing } from '../types';
import { Plus, Check, Droplets, Activity, BookOpen, Wind, Zap, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playMicroWinTone } from '../lib/sound';

interface HabitRingsProps {
  habits: HabitRing[];
  onIncrementHabit: (habitId: string) => void;
  onAddHabit?: (habit: Omit<HabitRing, 'id' | 'current'>) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Droplets,
  Activity,
  BookOpen,
  Wind,
  Zap,
};

export const HabitRings: React.FC<HabitRingsProps> = ({ habits, onIncrementHabit, onAddHabit }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState(4);
  const [unit, setUnit] = useState('times');
  const [color, setColor] = useState('#22C55E');

  const handleLog = (habit: HabitRing) => {
    onIncrementHabit(habit.id);
    playMicroWinTone();

    if (habit.current + 1 >= habit.target) {
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { y: 0.7 },
        colors: [habit.color, '#00e599', '#38bdf8'],
      });
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !onAddHabit) return;

    onAddHabit({
      name: name.trim(),
      target: Number(target) || 1,
      unit: unit.trim() || 'times',
      icon: 'Activity',
      color,
    });

    setName('');
    setShowAddModal(false);
  };

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
          CAPSULE HABIT RINGS
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#00e599] font-medium hidden sm:inline">
            Tap card to log
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#0c241a] border border-emerald-500/30 text-[#00e599] text-xs font-bold font-mono hover:bg-[#123827] transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Capsule Cards Row */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none -mx-1 px-1">
        {habits.map((habit) => {
          const percentage = Math.min(100, Math.round((habit.current / habit.target) * 100));
          const isCompleted = habit.current >= habit.target;

          // Radial SVG parameters
          const radius = 18;
          const strokeWidth = 3;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (percentage / 100) * circumference;

          return (
            <div
              key={habit.id}
              onClick={() => handleLog(habit)}
              className={`min-w-[170px] bg-black/60 backdrop-blur-2xl border rounded-[22px] p-3.5 flex items-center gap-3.5 transition-all cursor-pointer hover:border-white/25 active:scale-98 relative group shadow-[0_8px_30px_rgb(0,0,0,0.5)] ${
                isCompleted ? 'border-emerald-500/40 bg-emerald-950/30' : 'border-white/10'
              }`}
            >
              {/* Ring Container with Plus or Check centered */}
              <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center">
                <svg className="w-11 h-11 transform -rotate-90">
                  <circle
                    cx="22"
                    cy="22"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-[#222222]"
                    fill="transparent"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r={radius}
                    stroke={habit.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-300"
                  />
                </svg>

                {/* Plus or Check Icon centered */}
                <div
                  className="absolute inset-0 flex items-center justify-center font-bold"
                  style={{ color: isCompleted ? '#00e599' : habit.color }}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-[#00e599]" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* Habit Details */}
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                  {habit.name}
                </h4>
                <p className="text-xs font-mono text-neutral-400 mt-0.5 truncate">
                  <strong className="text-white">{habit.current}</strong>/{habit.target} {habit.unit}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl">
          <div className="bg-[#121212]/80 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white">Add Capsule Habit</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-neutral-400 uppercase block mb-1">
                  Habit Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cold Shower, Meditate..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-mono text-neutral-400 uppercase block mb-1">
                    Daily Target
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={target}
                    onChange={(e) => setTarget(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-neutral-400 uppercase block mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    placeholder="glasses, mins, pages"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-400 uppercase block mb-1">
                  Ring Color
                </label>
                <div className="flex items-center gap-2">
                  {['#22C55E', '#3B82F6', '#EAB308', '#A855F7', '#EC4899'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        color === c ? 'border-white scale-110' : 'border-transparent opacity-60'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-md"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

