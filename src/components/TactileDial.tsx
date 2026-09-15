import React from 'react';
import { motion } from 'motion/react';

interface TactileDialProps {
  value: number;
  label: string;
  sublabel?: string;
  unit?: string;
  glowColor?: string; // e.g. '#F97316'
  glowSecondary?: string; // e.g. '#FB923C'
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export const TactileDial: React.FC<TactileDialProps> = ({
  value,
  label,
  sublabel,
  unit = '%',
  glowColor = '#F97316',
  glowSecondary = '#FB923C',
  size = 'md',
  onClick,
  className = '',
}) => {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));

  // Sizing configurations - compact and refined
  const sizeConfig = {
    sm: {
      outer: 'w-12 h-12',
      puck: 'w-9 h-9',
      number: 'text-xs',
      unit: 'text-[9px]',
      label: 'text-[11px]',
      sublabel: 'text-[9px]',
      strokeWidth: 2,
      radius: 20,
      center: 24,
      viewBox: '0 0 48 48',
    },
    md: {
      outer: 'w-14 h-14 sm:w-16 sm:h-16',
      puck: 'w-10 h-10 sm:w-12 sm:h-12',
      number: 'text-sm sm:text-base',
      unit: 'text-[10px] sm:text-xs',
      label: 'text-xs',
      sublabel: 'text-[10px]',
      strokeWidth: 2.5,
      radius: 26,
      center: 32,
      viewBox: '0 0 64 64',
    },
    lg: {
      outer: 'w-24 h-24 sm:w-28 sm:h-28',
      puck: 'w-18 h-18 sm:w-22 sm:h-22',
      number: 'text-2xl sm:text-3xl',
      unit: 'text-xs sm:text-sm',
      label: 'text-sm',
      sublabel: 'text-xs',
      strokeWidth: 3,
      radius: 46,
      center: 56,
      viewBox: '0 0 112 112',
    },
  }[size];

  const circumference = 2 * Math.PI * sizeConfig.radius;
  const strokeOffset = circumference - (safeValue / 100) * circumference;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group flex flex-col items-center justify-center select-none text-center cursor-pointer transition-all duration-200 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded-2xl p-2.5 sm:p-3 bg-black/20 hover:bg-black/30 border border-white/10 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.35)] ${className}`}
    >
      {/* Tactile Circular Dial Assembly */}
      <div className={`relative ${sizeConfig.outer} flex items-center justify-center flex-shrink-0`}>
        {/* Layer 1: Outer Glass Ring */}
        <div className="absolute inset-0 rounded-full bg-white/[0.05] border border-white/15 backdrop-blur-md transition-all duration-300 group-hover:bg-white/[0.09] group-hover:border-white/25" />

        {/* Layer 2: Warm Radiant Orange Underglow around bottom perimeter */}
        <div
          className="absolute inset-1 rounded-full pointer-events-none transition-opacity duration-300 blur-[5px] opacity-75 group-hover:opacity-95"
          style={{
            background: `radial-gradient(circle at 50% 90%, ${glowColor} 0%, ${glowSecondary} 35%, transparent 70%)`,
          }}
        />

        {/* SVG Progress Arc */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-10 overflow-visible"
          viewBox={sizeConfig.viewBox}
        >
          <defs>
            <filter id={`glow-${label}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={glowSecondary} stopOpacity="0.9" />
              <stop offset="100%" stopColor={glowColor} stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Background Track Ring */}
          <circle
            cx={sizeConfig.center}
            cy={sizeConfig.center}
            r={sizeConfig.radius}
            fill="none"
            stroke="rgba(249, 115, 22, 0.18)"
            strokeWidth={sizeConfig.strokeWidth}
          />

          {/* Radiant Orange Progress Glow Arc */}
          <circle
            cx={sizeConfig.center}
            cy={sizeConfig.center}
            r={sizeConfig.radius}
            fill="none"
            stroke={`url(#grad-${label})`}
            strokeWidth={sizeConfig.strokeWidth + 0.75}
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            filter={`url(#glow-${label})`}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Layer 3: Inner Frosted Glass Puck with White Text (No center glare) */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`relative z-20 ${sizeConfig.puck} rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.12] border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-colors`}
        >
          {/* Clean White Center Typography */}
          <div className="relative z-10 flex items-baseline justify-center tracking-tight font-sans select-none leading-none">
            <span className={`${sizeConfig.number} font-bold text-white tabular-nums tracking-tighter drop-shadow-xs`}>
              {safeValue}
            </span>
            <span className={`${sizeConfig.unit} font-medium text-white/70 ml-0.5 select-none -translate-y-0.5`}>
              {unit}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Label & Rating */}
      <div className="mt-1.5 space-y-0.5">
        <span className={`${sizeConfig.label} font-semibold text-white tracking-tight block leading-tight`}>
          {label}
        </span>
        {sublabel && (
          <span className={`${sizeConfig.sublabel} font-mono text-zinc-400 block leading-tight truncate max-w-[90px] sm:max-w-none`}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
