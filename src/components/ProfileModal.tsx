import React, { useState } from 'react';
import { UserProfile } from '../types';
import { PROGRESSION_TIERS, getCumulativeXpForLevel } from '../lib/progression';
import { X, User, Trophy, RefreshCw, Check, Zap, ShieldCheck, Crown } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Identity OS Profile</h2>
              <p className="text-[11px] font-mono text-neutral-400">Operator Standards & Progression</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form & Content */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 custom-scrollbar">

          {/* Subscription Status Card */}
          <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Subscription Membership
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                user.subscriptionStatus === 'active'
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
              }`}>
                {user.subscriptionStatus === 'active' ? 'ACTIVE' : '3-DAY TRIAL'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-white font-mono font-semibold">
                {user.subscriptionStatus === 'active'
                  ? `Plan: ${user.subscriptionPlan === 'annual' ? 'Annual Founder (€59.99/yr)' : 'Monthly (€7.99/mo)'}`
                  : '3-Day Free Trial Period Active'}
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                {user.subscriptionStatus === 'active' ? 'Auto-renews' : '3 Days Free'}
              </span>
            </div>
          </div>

          {/* Operator Name Input */}
          <div>
            <label className="text-xs font-mono text-neutral-400 uppercase block mb-1">
              Operator Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-semibold"
            />
          </div>

          {/* Current Operator Status Card */}
          <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                CURRENT STATUS
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ACTIVE OPERATOR
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-black text-white tracking-tight">
                  Lvl {user.level}
                </span>
                <span className="text-sm font-bold text-cyan-400 ml-2">
                  {user.title}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-neutral-300 block">
                  {user.xp} / {user.xpToNextLevel} XP
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  XP to Next: 100 + ({user.level} × 20)
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100))}%` }}
              />
            </div>

            {/* Overall Statistics Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 space-y-0.5">
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Total Focus Time</span>
                <span className="text-sm font-bold font-mono text-cyan-400">
                  {Math.floor((user.totalFocusMinutes || 0) / 60)}h {(user.totalFocusMinutes || 0) % 60}m
                </span>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 space-y-0.5">
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Sessions Completed</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {user.totalSessionsCompleted || 0}
                </span>
              </div>
            </div>
          </div>

          {/* RebuildOS Progression Ladder */}
          <div className="bg-neutral-900/90 border border-white/5 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400 uppercase font-semibold flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                🏆 Progression Titles
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                Uncapped Progression
              </span>
            </div>

            <div className="space-y-1.5 pt-1 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
              {PROGRESSION_TIERS.map((tier) => {
                const isCurrent = user.level >= tier.minLevel && (tier.minLevel === 100 || user.level < (PROGRESSION_TIERS.find(t => t.minLevel > tier.minLevel)?.minLevel || 999));
                const isUnlocked = user.level >= tier.minLevel;

                return (
                  <div
                    key={tier.minLevel}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-bold shadow-sm'
                        : isUnlocked
                        ? 'bg-neutral-900 text-neutral-300 border border-white/5'
                        : 'bg-neutral-950 text-neutral-600 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-12 text-[11px] font-bold text-neutral-400">
                        Lvl {tier.minLevel}
                      </span>
                      <span className={`font-semibold ${isCurrent ? 'text-cyan-300' : isUnlocked ? 'text-white' : 'text-neutral-500'}`}>
                        {tier.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-neutral-500">
                        {getCumulativeXpForLevel(tier.minLevel).toLocaleString()} XP
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] uppercase font-bold text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/20">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset RebuildOS back to initial default demo data?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1 text-left"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset State Data</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

