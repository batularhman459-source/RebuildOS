import React from 'react';
import { Info, Shield, Zap, Terminal, RefreshCw, Cpu, CheckCircle2 } from 'lucide-react';
import { UserProfile, Mission } from '../types';
import { MissionArchive } from './MissionArchive';

interface AboutTabProps {
  user?: UserProfile;
  missions?: Mission[];
  archivedMissions?: Mission[];
}

export const AboutTab: React.FC<AboutTabProps> = ({
  user,
  missions = [],
  archivedMissions = [],
}) => {
  return (
    <div className="space-y-4 pb-24 text-left text-white">
      {/* Header Banner - Frosted Titanium Glass Card */}
      <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-b from-white/[0.14] via-white/[0.07] to-white/[0.03] border border-white/20 p-6 sm:p-7 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.3),0_15px_35px_rgba(0,0,0,0.35)]">
        {/* Specular Top Highlight */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-10" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 border border-white/20 text-white shadow-inner backdrop-blur-md">
              <Info className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white">
                  Rebuild<span className="text-orange-500 ml-0.5">OS</span>
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wider rounded-full bg-white/10 text-white/90 border border-white/15 backdrop-blur-md">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-white/60 font-sans mt-0.5">
                A personal system for getting your life back under control.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-sans text-white/80 bg-black/40 border border-white/10 px-3.5 py-1.5 rounded-xl backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold tracking-wide">Ready</span>
          </div>
        </div>
      </div>

      {/* Mission Archive Section (Historical Ledger & Compact Filtering) */}
      <MissionArchive
        missions={missions}
        archivedMissions={archivedMissions}
      />

      {/* Core Philosophy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-3.5">
        {/* Pillar 1 */}
        <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-gradient-to-b from-white/[0.12] via-white/[0.06] to-white/[0.02] border border-white/15 hover:border-white/30 p-5 backdrop-blur-xl transition-all group shadow-sm text-left">
          <div className="absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-10" />

          <div className="flex items-center gap-3 mb-2.5 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 text-white/90 flex items-center justify-center backdrop-blur-md shadow-sm">
              <Zap className="w-4 h-4 stroke-[2]" />
            </div>
            <h3 className="text-sm font-bold font-sans text-white tracking-tight">Proof Over Promises</h3>
          </div>
          <p className="text-xs text-white/70 leading-relaxed font-sans relative z-10">
            You don't build self-trust by thinking positively. You build it by doing what you said you would do, day after day.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-gradient-to-b from-white/[0.12] via-white/[0.06] to-white/[0.02] border border-white/15 hover:border-white/30 p-5 backdrop-blur-xl transition-all group shadow-sm text-left">
          <div className="absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-10" />

          <div className="flex items-center gap-3 mb-2.5 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 text-white/90 flex items-center justify-center backdrop-blur-md shadow-sm">
              <RefreshCw className="w-4 h-4 stroke-[2]" />
            </div>
            <h3 className="text-sm font-bold font-sans text-white tracking-tight">Fast Recovery</h3>
          </div>
          <p className="text-xs text-white/70 leading-relaxed font-sans relative z-10">
            Slipping is normal. What matters is how quickly you step back in. Don't turn a bad afternoon into a wasted week.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-gradient-to-b from-white/[0.12] via-white/[0.06] to-white/[0.02] border border-white/15 hover:border-white/30 p-5 backdrop-blur-xl transition-all group shadow-sm text-left">
          <div className="absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-10" />

          <div className="flex items-center gap-3 mb-2.5 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 text-white/90 flex items-center justify-center backdrop-blur-md shadow-sm">
              <Shield className="w-4 h-4 stroke-[2]" />
            </div>
            <h3 className="text-sm font-bold font-sans text-white tracking-tight">Simple and Direct</h3>
          </div>
          <p className="text-xs text-white/70 leading-relaxed font-sans relative z-10">
            No fluff, no fake productivity, no complex setups. Just the actions you need to focus on today.
          </p>
        </div>
      </div>

      {/* Feature & Architecture Overview */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-b from-white/[0.14] via-white/[0.07] to-white/[0.03] border border-white/20 p-6 backdrop-blur-2xl space-y-4 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.3),0_15px_35px_rgba(0,0,0,0.35)] text-left">
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-10" />

        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/90 shadow-sm backdrop-blur-md">
            <Terminal className="w-3.5 h-3.5 stroke-[2]" />
          </div>
          <h2 className="text-sm font-semibold text-white tracking-tight font-sans">
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 relative z-10">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold font-sans text-white">Daily missions</span>
              <p className="text-[11px] text-white/60 font-sans mt-0.5">A short, focused list of tasks that actually matter today.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold font-sans text-white">Quiet coach</span>
              <p className="text-[11px] text-white/60 font-sans mt-0.5">Honest feedback and perspective when you feel stuck or off track.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold font-sans text-white">Evening reflection</span>
              <p className="text-[11px] text-white/60 font-sans mt-0.5">A calm 2-minute check-in before bed to close out the day and set up tomorrow.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold font-sans text-white">Emergency reset</span>
              <p className="text-[11px] text-white/60 font-sans mt-0.5">When you find yourself spiraling or wasting hours, reset in under five minutes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Status & Diagnostics */}
      <div className="rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md p-4 text-xs font-sans text-white/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-white/80" />
          <span>Local Data: <strong className="text-white font-semibold">Saved</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-white/60 text-[11px]">
          <span>RebuildOS</span>
          <span>•</span>
          <span>Private & offline-ready</span>
        </div>
      </div>
    </div>
  );
};
