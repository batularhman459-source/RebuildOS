import React from 'react';
import { Home, CalendarDays, Target, Info, AlertCircle, User, Settings } from 'lucide-react';
import { UserProfile } from '../types';
import { StreakBadge } from './StreakBadge';

interface DesktopNavProps {
  activeTab: 'home' | 'journal' | 'coach' | 'about';
  onSelectTab: (tab: 'home' | 'journal' | 'coach' | 'about') => void;
  onOpenResetModal: () => void;
  onOpenProfile: () => void;
  onOpenStreakModal?: () => void;
  user: UserProfile;
}

interface NavItem {
  id: 'home' | 'journal' | 'coach' | 'about';
  label: string;
  icon: React.ElementType;
  shortcut: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Dashboard', icon: Home, shortcut: '1' },
  { id: 'journal', label: 'Journal', icon: CalendarDays, shortcut: '2' },
  { id: 'coach', label: 'Coach', icon: Target, shortcut: '3' },
  { id: 'about', label: 'About', icon: Info, shortcut: '4' },
];

export const DesktopNav: React.FC<DesktopNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenResetModal,
  onOpenProfile,
  onOpenStreakModal,
  user,
}) => {
  return (
    <header className="hidden md:block sticky top-0 z-40 w-full backdrop-blur-2xl bg-zinc-950/70 border-b border-white/10 select-none">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-xl px-1.5 py-1"
          >
            <h1 translate="no" className="text-xl font-black tracking-tight text-white flex items-center">
              Rebuild<span className="text-orange-500 ml-0.5">OS</span>
            </h1>
            <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/15 group-hover:bg-white/20 group-hover:text-white transition-all">
              v1
            </span>
          </button>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav
          aria-label="Desktop Navigation"
          className="flex items-center p-1.5 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-xl shadow-inner"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`desktop-nav-item-${item.id}`}
                type="button"
                onClick={() => onSelectTab(item.id)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                  isActive
                    ? 'bg-white text-zinc-950 shadow-md scale-100 font-bold'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.9]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-3">
          {/* Daily Streak Badge */}
          <StreakBadge
            id="desktop-nav-streak-badge"
            currentStreak={user.streak}
            longestStreak={user.bestStreak}
            size="md"
            showLabel={true}
            onClick={onOpenStreakModal}
            className="cursor-pointer"
          />

          {/* Emergency Reset Trigger */}
          <button
            type="button"
            onClick={onOpenResetModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 hover:border-rose-500/40 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            title="Emergency Reset Protocol"
          >
            <AlertCircle className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            <span>Reset</span>
          </button>

          {/* User Profile Pill / Button */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/30 text-white transition-all cursor-pointer shadow-sm group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            title="Operator Profile & Settings"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 border border-white/20 flex items-center justify-center text-xs font-bold text-white group-hover:scale-105 transition-transform">
              L{user.level}
            </div>
            <div className="text-left">
              <span className="text-xs font-semibold block leading-tight">{user.name || 'Alex'}</span>
            </div>
            <Settings className="w-3.5 h-3.5 text-white/50 group-hover:text-white/90 group-hover:rotate-45 transition-all ml-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
