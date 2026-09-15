import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, User, RefreshCw, Check, Sparkles, Shield, Clock, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { formatRecoveryDays } from '../lib/recovery';

interface ProfileModalProps {
  user: UserProfile;
  onSaveUser: (updatedUser: Partial<UserProfile>) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  onSaveUser,
  onResetData,
  onClose,
}) => {
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveUser({ name: name.trim() });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const xpPercent = Math.min(100, Math.round((user.xp / (user.xpToNextLevel || 100)) * 100));

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
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0B0B0E] text-white border border-white/10 rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden text-left backdrop-blur-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-inner">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 translate="no" className="text-lg font-bold text-white tracking-tight flex items-center">
                Profile
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Profile"
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/15 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-90 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form & Content */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 custom-scrollbar relative z-10">

          {/* Operator Name Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-sans font-semibold text-zinc-400 uppercase tracking-wider block">
              Your name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 focus:border-white/30 focus:bg-white/[0.07] focus:ring-1 focus:ring-white/20 rounded-2xl px-4 py-3 text-sm text-white font-sans placeholder-zinc-500 focus:outline-none transition-all"
              placeholder="e.g. Alex"
            />
          </div>

          {/* Rank & Stats Card */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
            {/* Header: Level & Title placed underneath */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight block">
                    Lvl {user.level}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-zinc-300 font-sans block">
                    {user.title}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-sans font-semibold text-white block">
                  {user.xp.toLocaleString()} <span className="text-zinc-400 font-normal">/ {user.xpToNextLevel.toLocaleString()} XP</span>
                </span>
              </div>
            </div>

            {/* Level XP Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500 shadow-sm"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>

            {/* Unified 2x2 Statistics Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-white/10">
              {/* Focus Time */}
              <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex flex-col justify-between h-20 transition-colors">
                <div className="flex items-center gap-1.5 text-[10px] font-sans font-semibold text-zinc-400 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  <span>Focus time</span>
                </div>
                <div className="text-base sm:text-lg font-bold font-sans text-white">
                  {Math.floor((user.totalFocusMinutes || 0) / 60)}h {(user.totalFocusMinutes || 0) % 60}m
                </div>
              </div>

              {/* Sessions */}
              <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex flex-col justify-between h-20 transition-colors">
                <div className="flex items-center gap-1.5 text-[10px] font-sans font-semibold text-zinc-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>Sessions</span>
                </div>
                <div className="text-base sm:text-lg font-bold font-sans text-white">
                  {user.totalSessionsCompleted || 0}
                </div>
              </div>

              {/* Avg Recovery */}
              <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex flex-col justify-between h-20 transition-colors">
                <div className="flex items-center gap-1.5 text-[10px] font-sans font-semibold text-zinc-400 uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5 text-orange-500" />
                  <span>Avg. comeback</span>
                </div>
                <div className="text-base sm:text-lg font-bold font-sans text-white">
                  {formatRecoveryDays(user.avgRecoveryDays ?? 1.1)}
                </div>
              </div>

              {/* Daily Streak */}
              <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex flex-col justify-between h-20 transition-colors">
                <div className="flex items-center gap-1.5 text-[10px] font-sans font-semibold text-zinc-400 uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span>Current streak</span>
                </div>
                <div className="text-base sm:text-lg font-bold font-sans text-white">
                  {user.streak || 0}d
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset all data back to defaults?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="text-xs font-sans text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset data</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold font-sans transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};


