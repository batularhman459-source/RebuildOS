import React from 'react';
import { Flame, Sparkles, Award } from 'lucide-react';

export interface StreakBadgeProps {
  currentStreak: number;
  longestStreak?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showBest?: boolean;
  variant?: 'pill' | 'card' | 'minimal' | 'glow';
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  id?: string;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  currentStreak = 0,
  longestStreak,
  size = 'md',
  showLabel = true,
  showBest = false,
  variant = 'pill',
  interactive = true,
  onClick,
  className = '',
  id,
}) => {
  const safeStreak = Math.max(0, currentStreak);
  const isHot = safeStreak >= 7;
  const isIgnited = safeStreak > 0;

  // Size styling maps
  const sizeStyles = {
    sm: {
      container: 'px-2 py-1 text-[11px] gap-1 rounded-xl',
      icon: 'w-3 h-3',
      number: 'text-xs',
    },
    md: {
      container: 'px-3 py-1.5 text-xs gap-1.5 rounded-2xl',
      icon: 'w-3.5 h-3.5',
      number: 'text-xs',
    },
    lg: {
      container: 'px-4 py-2 text-sm gap-2 rounded-2xl',
      icon: 'w-4 h-4',
      number: 'text-sm font-extrabold',
    },
  }[size];

  // Variant styling maps
  const variantStyles = {
    pill: isIgnited
      ? 'border border-orange-500/25 bg-orange-500/10 text-white hover:bg-orange-500/20 backdrop-blur-md shadow-sm'
      : 'border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 backdrop-blur-md',
    glow: isIgnited
      ? 'border border-orange-500/40 bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-orange-500/10 text-white shadow-[0_0_15px_rgba(249,115,22,0.25)] hover:border-orange-400'
      : 'border border-white/10 bg-white/5 text-zinc-400',
    minimal: 'bg-transparent text-white hover:bg-white/5 px-1.5 py-1',
    card: 'border border-white/15 bg-black/40 backdrop-blur-xl p-3 flex-col items-start gap-1 rounded-2xl text-white shadow-inner',
  }[variant];

  const clickableStyles = interactive && onClick
    ? 'cursor-pointer active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 select-none group'
    : '';

  const flameColor = isIgnited
    ? isHot
      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
      : 'text-orange-500 fill-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]'
    : 'text-zinc-500 fill-none';

  if (variant === 'card') {
    return (
      <div
        id={id || 'streak-card-badge'}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
        aria-label={`Current daily streak: ${safeStreak} days. Best streak: ${longestStreak ?? safeStreak} days.`}
        className={`${variantStyles} ${clickableStyles} ${className}`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
            <Flame className={`w-3.5 h-3.5 ${flameColor}`} aria-hidden="true" />
            Streak Engine
          </span>
          {isHot && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30">
              HOT 🔥
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-black tracking-tight text-white tabular-nums">
            {safeStreak}
          </span>
          <span className="text-xs text-zinc-400 font-medium">
            {safeStreak === 1 ? 'day active' : 'days active'}
          </span>
        </div>
        {typeof longestStreak === 'number' && showBest && (
          <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
            <Award className="w-3 h-3 text-amber-400/80" />
            <span>Best: <strong className="text-zinc-200">{longestStreak}d</strong></span>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      id={id || 'streak-badge-btn'}
      type="button"
      disabled={!onClick && !interactive}
      onClick={onClick}
      aria-label={`Daily streak: ${safeStreak} ${safeStreak === 1 ? 'day' : 'days'}${longestStreak ? `, Best: ${longestStreak} days` : ''}`}
      title={onClick ? 'View detailed streak and recovery breakdown' : `Active streak: ${safeStreak} days`}
      className={`inline-flex items-center font-bold tabular-nums ${sizeStyles.container} ${variantStyles} ${clickableStyles} ${className}`}
    >
      <Flame
        className={`${sizeStyles.icon} ${flameColor} transition-transform duration-200 group-hover:scale-110 flex-shrink-0`}
        aria-hidden="true"
      />
      <span className={`font-semibold tracking-tight ${isIgnited ? 'text-orange-200' : 'text-zinc-400'} ${sizeStyles.number}`}>
        {safeStreak}
        {showLabel && (
          <span className="font-normal text-white/70 ml-1 text-[11px]">
            {safeStreak === 1 ? 'day' : 'days'}
          </span>
        )}
      </span>

      {showBest && typeof longestStreak === 'number' && (
        <span className="text-[10px] font-normal text-white/50 pl-1 border-l border-white/10 ml-0.5">
          Best {longestStreak}d
        </span>
      )}
    </button>
  );
};
