import React from 'react';
import { X, Fingerprint, Activity, ShieldCheck, Sparkles } from 'lucide-react';

interface ChangelogModalProps {
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-sm sm:max-w-md bg-[#0B0B0E] text-white border border-white/10 rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden text-left max-h-[90vh] flex flex-col backdrop-blur-2xl">
        {/* Soft Ambient Glow */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, #f97316 0%, #fb923c 50%, transparent 80%)',
          }}
        />

        {/* Ambient Top Specular Rim Highlight */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent pointer-events-none" />

        {/* Top Header Row with Close Button */}
        <div className="flex items-center justify-between relative z-10 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
              WHAT'S NEW
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/15 text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto space-y-6 pr-1 custom-scrollbar relative z-10">
          {/* Featured Top Card - AUG 4 / NEW */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-wider">
              <span className="text-zinc-400 uppercase">UPDATE</span>
              <span className="text-orange-400 uppercase font-semibold">• NEW</span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
              Identity Pillars
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Track the 5 core attributes that define who you're becoming: Discipline, Focus, Consistency, Resilience, and Self-Trust.
            </p>

            {/* Graphic Media Box Mockup */}
            <div className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-4 relative overflow-hidden group shadow-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-orange-400" />
                  <span className="text-[11px] font-mono text-white font-bold">Identity</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  Active
                </span>
              </div>

              {/* Graphic Capsules Preview */}
              <div className="grid grid-cols-5 gap-1.5 pt-1 items-end h-24">
                <div className="flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full bg-black/60 rounded-full h-[80%] border border-white/10 relative flex items-end p-0.5">
                    <div className="w-full bg-orange-500 rounded-full h-[82%] shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                  </div>
                  <span className="text-[8px] font-mono text-zinc-400">DISC</span>
                </div>
                <div className="flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full bg-black/60 rounded-full h-[80%] border border-white/10 relative flex items-end p-0.5">
                    <div className="w-full bg-orange-500/80 rounded-full h-[71%]" />
                  </div>
                  <span className="text-[8px] font-mono text-zinc-400">FOC</span>
                </div>
                <div className="flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full bg-black/60 rounded-full h-[80%] border border-white/10 relative flex items-end p-0.5">
                    <div className="w-full bg-orange-500 rounded-full h-[89%] shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                  </div>
                  <span className="text-[8px] font-mono text-zinc-400">CONS</span>
                </div>
                <div className="flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full bg-black/60 rounded-full h-[80%] border border-white/10 relative flex items-end p-0.5">
                    <div className="w-full bg-orange-500 rounded-full h-[91%] shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                  </div>
                  <span className="text-[8px] font-mono text-zinc-400">RES</span>
                </div>
                <div className="flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full bg-black/60 rounded-full h-[80%] border border-white/10 relative flex items-end p-0.5">
                    <div className="w-full bg-orange-500/70 rounded-full h-[67%]" />
                  </div>
                  <span className="text-[8px] font-mono text-zinc-400">TRUST</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Timeline Items */}
          <div className="relative border-l border-white/10 ml-1.5 pl-5 space-y-6">
            {/* Timeline Item 1 */}
            <div className="relative group">
              {/* Timeline Dot */}
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 absolute -left-[25.5px] top-1 ring-4 ring-[#0B0B0E] shadow-[0_0_6px_rgba(249,115,22,0.6)]" />

              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  RECENT
                </span>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Streak & Recovery Tracking
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Clean activity tracking that celebrates quick comebacks just as much as long streaks.
                </p>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative group">
              {/* Timeline Dot */}
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500/50 group-hover:bg-orange-500 transition-colors absolute -left-[25.5px] top-1 ring-4 ring-[#0B0B0E]" />

              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  PROFILE
                </span>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Personal Profile
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  View your level progression, total focus time, and recovery averages.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold font-mono transition-all shadow-[0_4px_14px_rgba(249,115,22,0.4)] active:scale-98 cursor-pointer relative z-10"
        >
          Close
        </button>
      </div>
    </div>
  );
};

